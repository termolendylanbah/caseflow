# frozen_string_literal: true

describe OpenTasksWithClosedAtChecker, :postgres do
  before do
    seven_am_random_date = Time.new(2019, 3, 29, 7, 0, 0).in_time_zone
    Timecop.freeze(seven_am_random_date)
  end

  let!(:task) do
    task = create(:task, :assigned, appeal: create(:appeal))
    task.update!(closed_at: Time.zone.now)
    task
  end

  let!(:open_task_with_closed_parent) do
    appeal = create(:appeal)
    parent = create(:task, appeal: appeal)
    task = create(:task, :assigned, parent: parent)
    parent.update!(closed_at: Time.zone.now, status: :completed)
    task
  end

  let!(:open_hearing_task_with_closed_parent) do
    appeal = create(:appeal)
    parent = create(:assign_hearing_disposition_task, appeal: appeal)
    task = create(:no_show_hearing_task, :assigned, parent: parent, closed_at: nil, status: :assigned)
    parent.update!(closed_at: Time.zone.now, status: :completed)
    Task.find(task.id).update!(status: Constants.TASK_STATUSES.on_hold, closed_at: nil)
    appeal.reload
    task
    binding.pry
  end

  describe "#call" do
    it "reports one Task in bad state" do
      subject.call

      expect(subject.report?).to eq(true)
      expect(subject.report).to match(/1 open Task with a closed_at value/)
      expect(subject.report).to match(/1 open Task with a closed parent Task/)
      expect(subject.report).to match(/1 open Hearing Task with a closed parent Task/)
      expect(subject.report).to match(/AppealsWithClosedRootTaskOpenChildrenQuery: 1/)
    end
  end
end
