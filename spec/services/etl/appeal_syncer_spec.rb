# frozen_string_literal: true

describe ETL::AppealSyncer, :etl, :all_dbs do
  include SQLHelpers

  include_context "AMA Tableau SQL"

  let(:etl_build) { ETL::Build.create }

  describe "#origin_class" do
    subject { described_class.new(etl_build: etl_build).origin_class }

    it { is_expected.to eq Appeal }
  end

  describe "#target_class" do
    subject { described_class.new(etl_build: etl_build).target_class }

    it { is_expected.to eq ETL::Appeal }
  end

  describe "#call" do
    subject { described_class.new(etl_build: etl_build).call }

    before do
      expect(ETL::Appeal.count).to eq(0)
    end

    context "BVA status distribution" do
      it "has expected distribution" do
        subject

        expect(ETL::Appeal.count).to eq(14)
      end

      it "populates person attributes" do
        subject

        appeal = ETL::Appeal.first
        expect(appeal.veteran_dob).to_not be_nil
        expect(appeal.claimant_dob).to_not be_nil
        expect(appeal.aod_due_to_dob).to_not be_nil
      end
    end

    context "sync tomorrow" do
      subject { described_class.new(since: Time.zone.now + 1.day, etl_build: etl_build).call }

      it "does not sync" do
        subject

        expect(ETL::Appeal.count).to eq(0)
      end
    end

    context "Appeal is not yet established" do
      let!(:appeal) { create(:appeal, established_at: nil) }
      let(:etl_build_table) { ETL::BuildTable.where(table_name: "appeals").last }

      it "skips non-established Appeals" do
        subject

        expect(ETL::Appeal.count).to eq(14)
        expect(etl_build_table.rows_rejected).to eq(0) # not part of .filter so we can't know about it.
        expect(etl_build_table.rows_inserted).to eq(14)
      end
    end

    context "Appeal has no claimant" do
      let!(:appeal) do
        # no factory because we do not want claimant
        Appeal.create!(
          receipt_date: Time.zone.yesterday,
          established_at: Time.zone.now,
          docket_type: Constants.AMA_DOCKETS.evidence_submission,
          veteran_file_number: create(:veteran).file_number
        )
      end

      it "syncs" do
        expect { subject }.to_not raise_error

        expect(ETL::Appeal.count).to eq(15)
      end
    end

    context "decision issue is deleted" do
      let(:appeal) { Appeal.last }
      let!(:decision_issue) { create(:decision_issue, decision_review: appeal) }
      subject { described_class.new(since: 2.days.ago, etl_build: etl_build).call }

      it "updates attributes" do
        described_class.new(etl_build: etl_build).call
        etl_build_table = ETL::BuildTable.where(table_name: "appeals").last
        expect(etl_build_table.rows_inserted).to eq(14)
        expect(ETL::Appeal.count).to eq(Appeal.count)
        expect(ETL::Appeal.find_by(appeal_id: appeal.id).updated_at).to be_within(1.minute).of(Time.zone.now)

        Timecop.travel(5.days.from_now)
        decision_issue.soft_delete
        expect(decision_issue.deleted_at).not_to eq nil

        subject
        etl_build_table = ETL::BuildTable.where(table_name: "appeals").last
        expect(etl_build_table.rows_inserted).to eq(0)
        # The data in appeal record didn't change but it was considered for update
        # because an associated record (i.e., decision_issue) was updated (i.e., soft-deleted).
        expect(etl_build_table.rows_updated).to eq(1)
        expect(ETL::Appeal.count).to eq(Appeal.count)
      end
    end
  end
end
