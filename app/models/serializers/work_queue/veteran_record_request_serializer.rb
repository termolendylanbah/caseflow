# frozen_string_literal: true

class WorkQueue::VeteranRecordRequestSerializer < ActiveModel::Serializer
  def task
    object
  end

  def decision_review
    task.appeal
  end

  def claimant_name
    if decision_review.veteran_is_not_claimant
      # TODO: support multiple?
      decision_review.claimants.first.try(:name)
    else
      decision_review.veteran_full_name
    end
  end

  def claimant_relationship
    return "self" unless decision_review.veteran_is_not_claimant

    decision_review.claimants.first.try(:relationship)
  end

  attribute :claimant do
    {
      name: claimant_name,
      relationship: claimant_relationship
    }
  end

  attribute :appeal do
    {
      id: decision_review.external_id,
      isLegacyAppeal: false,
      issueCount: decision_review.open_request_issues.count
    }
  end

  attribute :tasks_url do
    task.assigned_to.tasks_url
  end

  attribute :id

  attribute :created_at

  attribute :veteran_participant_id do
    decision_review.veteran.participant_id
  end

  attribute :assigned_on do
    task.assigned_at
  end

  attribute :closed_at do
    task.closed_at
  end

  attribute :started_at do
    task.started_at
  end

  attribute :type do
    task.label
  end
end
