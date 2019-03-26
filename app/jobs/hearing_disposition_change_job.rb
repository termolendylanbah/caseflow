# frozen_string_literal: true

require "action_view"

class HearingDispositionChangeJob < CaseflowJob
  # For time_ago_in_words()
  include ActionView::Helpers::DateHelper
  queue_as :low_priority

  def perform
    start_time = Time.zone.now
    error_count = 0
    task_count_keys = Constants.HEARING_DISPOSITION_TYPES.to_h.values.map(&:to_sym) +
                      [:between_one_and_two_days_old, :stale, :unknown_disposition]
    task_count_for = Hash[task_count_keys.map { |key| [key, 0] }]

    # Set user to system_user to avoid sensitivity errors
    RequestStore.store[:current_user] = User.system_user

    tasks = DispositionTask.ready_for_action
    hearing_ids = tasks.map { |task| task.hearing.id }

    tasks.each do |task|
      label = update_task_by_hearing_disposition(task)
      task_count_for[label.to_sym] += 1
    rescue StandardError => error
      # Rescue from errors so we attempt to change disposition even if we hit individual errors.
      Raven.capture_exception(error, extra: { task_id: task.id })
      error_count += 1
    end

    log_info(start_time, task_count_for, error_count, hearing_ids)
  rescue StandardError => error
    log_info(start_time, task_count_for, error_count, hearing_ids, error)
  end

  # rubocop:disable Metrics/CyclomaticComplexity
  def update_task_by_hearing_disposition(task)
    hearing = task.hearing
    label = hearing.disposition

    # rubocop:disable Lint/EmptyWhen
    case hearing.disposition
    when Constants.HEARING_DISPOSITION_TYPES.held
      task.hold!
    when Constants.HEARING_DISPOSITION_TYPES.cancelled
      task.cancel!
    when Constants.HEARING_DISPOSITION_TYPES.postponed
      # Postponed hearings should be acted on immediately and the related tasks should be closed. Do not take any
      # action here.
    when Constants.HEARING_DISPOSITION_TYPES.no_show
      task.no_show!
    when nil
      # We allow judges and hearings staff 2 days to make changes to the hearing's disposition. If it has been more
      # than 2 days since the hearing was held and there is no disposition then remind the hearings staff.
      label = if hearing.scheduled_for < 48.hours.ago
                # Logic will be added as part of #9833.
                :stale
              else
                :between_one_and_two_days_old
              end
    else
      # Expect to never reach this block since all dispositions should be accounted for above. If we run into this
      # case we ignore it and will investigate and potentially incorporate that fix here. Until then we're fine.
      label = :unknown_disposition
    end
    # rubocop:enable Lint/EmptyWhen

    label
  end
  # rubocop:enable Metrics/CyclomaticComplexity

  def log_info(start_time, task_count_for, error_count, hearing_ids, err = nil)
    duration = time_ago_in_words(start_time)
    result = err ? "failed" : "completed"

    msg = "#{self.class.name} #{result} after running for #{duration}."
    task_count_for.each do |label, task_count|
      msg += " Processed #{task_count} #{label.to_s.humanize} hearings."
    end
    msg += " Encountered errors for #{error_count} hearings."
    msg += " Fatal error: #{err.message}" if err

    Rails.logger.info(msg)
    Rails.logger.info(hearing_ids)
    Rails.logger.info(err.backtrace.join("\n")) if err

    slack_service.send_notification(msg)
  end
end
