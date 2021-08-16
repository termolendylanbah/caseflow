# frozen_string_literal: true

class PreDocketTasksFactory
  def initialize(appeal)
    @appeal = appeal
    @root_task = RootTask.find_or_create_by!(appeal: appeal)
  end

  def create_pre_docket_task!
    pre_docket_task = PreDocketTask.create!(
      appeal: @appeal,
      assigned_to: BvaIntake.singleton,
      parent: @root_task
    )
    pre_docket_task.put_on_hold_due_to_new_child_task
  end
end
PreDocketTask.create!(
  appeal: Appeal.last,
  assigned_to: BvaIntake.singleton,
  parent: Appeal.last.root_task
)
