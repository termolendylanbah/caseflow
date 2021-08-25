# frozen_string_literal: true

##
# Model to track the history of virtual hearing emails sent out hearing
# recipients (judge, representative, appellant).

class SentHearingEmailEvent < CaseflowRecord
  include BelongsToPolymorphicHearingConcern
  belongs_to_polymorphic_hearing(:hearing)

  belongs_to :sent_by, class_name: "User"
  belongs_to :email_recipient, class_name: "HearingEmailRecipient"

  before_create :assign_sent_at_time

  # Allows all keys specified in `MailRecipient::RECIPIENT_TITLES`
  enum recipient_role: HearingEmailRecipient::RECIPIENT_ROLES.keys.map { |key| [key, key.to_s] }.to_h,
       _prefix: :sent_to

  # Overrides the generated method for compatibility with old data prior to:
  #   https://github.com/department-of-veterans-affairs/caseflow/issues/14147
  class << self; undef_method :sent_to_appellant; end
  scope :sent_to_appellant, -> { where(recipient_role: [:veteran, :appellant]) }

  # Email types are specified in `SendEmail#email_for_recipient`
  enum email_type: (
    {
      confirmation: "confirmation",
      cancellation: "cancellation",
      updated_time_confirmation: "updated_time_confirmation",
      reminder: "reminder"
    }
  ), _prefix: :is

  # error to capture any instances where we try to update `sent_status`
  # with an invalid value.
  class InvalidReportedStatus < StandardError; end

  # error to capture any instances we attempt to send email to a coordinator
  # regarding email status but `sent_status_email_external_message_id` exists.
  class SentStatusEmailAlreadySent < StandardError; end

  EMAIL_REPORTED_SENT_STATUSES = %w[
    new sending sent failed inconclusive blacklisted canceled
  ].freeze

  FAILED_EMAIL_REPORTED_SENT_STATUSES = %w[
    failed inconclusive canceled blacklisted
  ].freeze

  def sent_to_role
    case recipient_role
    when "judge"
      "VLJ Email"
    when "appellant"
      "Appellant Email"
    when "veteran"
      "Veteran Email"
    when "representative"
      "POA/Representative Email"
    else
      fail(
        Caseflow::Error::InvalidParameter,
        parameter: "recipient_role",
        message: "recipient_role must be one of #{RECIPIENT_ROLES}, received: #{recipient_role}"
      )
    end
  end

  def handle_reported_status(reported_status)
    return if email_sent

    update!(sent_status_checked_at: Time.zone.now)

    if !reported_status_valid?(reported_status)
      invalid_reported_status_failure(reported_status)
    elsif reported_status_sent?(reported_status)
      update!(email_sent: true)
    elsif reported_status_failed?(reported_status)
      update!(email_sent: false)

      handle_failed_email_status(reported_status)
    else
      update!(email_sent: nil)
    end
  end

  private

  def assign_sent_at_time
    self.sent_at ||= Time.now.utc
  end

  def reported_status_valid?(reported_status)
    EMAIL_REPORTED_SENT_STATUSES.include?(reported_status)
  end

  def reported_status_sent?(reported_status)
    reported_status == "sent"
  end

  def reported_status_sending?(reported_status)
    reported_status == "sending"
  end

  def reported_status_new?(reported_status)
    reported_status == "new"
  end

  def reported_status_failed?(reported_status)
    FAILED_EMAIL_REPORTED_SENT_STATUSES.include?(reported_status)
  end

  def invalid_reported_status_failure(reported_status)
    Raven.capture_exception(
      InvalidReportedStatus.new(
        "Cannot update sent_status with invalid status: (#{reported_status})"
      )
    )
  end

  def email_already_sent_failure
    Raven.capture_exception(
      SentStatusEmailAlreadySent.new(
        "Cannot sent an email to because sent_status_email_external_message_id: " \
          "(#{external_message_id}) already exists."
      )
    )
  end

  def handle_failed_email_status(reported_status)
    if external_message_id.present?
      email_already_sent_failure
    else
      HearingEmailStatusMailer.new(
        sent_event: self, reported_status: reported_status
      ).call
    end
  end
end
