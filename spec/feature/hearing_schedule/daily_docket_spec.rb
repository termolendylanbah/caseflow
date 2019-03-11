# frozen_string_literal: true

require "rails_helper"

RSpec.feature "Hearing Schedule Daily Docket" do
  context "Daily docket with one legacy hearing" do
    let!(:current_user) { User.authenticate!(css_id: "BVATWARNER", roles: ["Build HearSched"]) }
    let!(:hearing_day) do
      create(:hearing_day,
             request_type: HearingDay::REQUEST_TYPES[:video],
             regional_office: "RO18",
             scheduled_for: Date.new(2019, 4, 15))
    end
    let!(:hearing_day_two) do
      create(:hearing_day,
             request_type: HearingDay::REQUEST_TYPES[:video],
             regional_office: "RO18",
             scheduled_for: hearing_day.scheduled_for + 10.days)
    end

    let!(:veteran) { create(:veteran, file_number: "123456789") }
    let!(:vacols_case) { create(:case, bfcorlid: "123456789S") }
    let!(:legacy_appeal) { create(:legacy_appeal, vacols_case: vacols_case) }
    let!(:hearing_location) do
      create(:available_hearing_locations,
             appeal_id: legacy_appeal.id,
             appeal_type: "LegacyAppeal",
             city: "Holdrege",
             state: "NE",
             distance: 0,
             facility_type: "va_health_facility")
    end

    let!(:case_hearing) { create(:case_hearing, vdkey: hearing_day.id, folder_nr: legacy_appeal.vacols_id) }
    let!(:legacy_hearing) { create(:legacy_hearing, vacols_id: case_hearing.hearing_pkseq, appeal: legacy_appeal) }
    let!(:staff) { create(:staff, stafkey: "RO18", stc2: 2, stc3: 3, stc4: 4) }

    scenario "User can update fields" do
      visit "hearings/schedule/docket/" + hearing_day.id.to_s
      find(".dropdown-Disposition").click
      find("#react-select-2--option-1").click
      click_dropdown(name: "appealHearingLocation", text: "Holdrege, NE (VHA) 0 miles away", wait: 30)
      fill_in "Notes", with: "This is a note about the hearing!"
      find("label", text: "8:30").click
      find("label", text: "Transcript Requested").click
      click_button("Save")

      expect(page).to have_content("You have successfully updated")
      expect(page).to have_content("No Show")
      expect(page).to have_content("This is a note about the hearing!")
      expect(find_field("Transcript Requested", visible: false)).to be_checked
      expect(find_field("8:30", visible: false)).to be_checked
    end

    scenario "User can postpone a hearing", skip: "Flaky test" do
      visit "hearings/schedule/docket/" + hearing_day.id.to_s
      click_dropdown(name: "appealHearingLocation", text: "Holdrege, NE (VHA) 0 miles away", wait: 30)
      click_dropdown(name: "Disposition", text: "Postponed")
      click_dropdown(name: "HearingDay", text: hearing_day_two.scheduled_for.strftime("%m/%d/%Y"))
      click_button("Save")
      expect(page).to have_content("You have successfully updated")
      expect(page).to have_content("No Veterans are scheduled for this hearing day.")
      expect(page).to have_content("Previously Scheduled")
      new_hearing = VACOLS::CaseHearing.find_by(vdkey: hearing_day_two.id)
      expect(new_hearing.folder_nr).to eql(case_hearing.folder_nr)
    end
  end

  context "Daily docket with one AMA hearing" do
    let!(:current_user) { User.authenticate!(css_id: "BVATWARNER", roles: ["Build HearSched"]) }
    let!(:hearing) { create(:hearing, :with_tasks) }
    let!(:postponed_hearing_day) { create(:hearing_day, scheduled_for: Date.new(2019, 3, 3)) }

    scenario "User can update fields" do
      visit "hearings/schedule/docket/" + hearing.hearing_day.id.to_s
      find(".dropdown-Disposition").click
      find("#react-select-2--option-1").click
      fill_in "Notes", with: "This is a note about the hearing!"
      find("label", text: "9:00").click
      find("label", text: "Transcript Requested").click
      click_button("Save")

      expect(page).to have_content("You have successfully updated")
      expect(page).to have_content("No Show")
      expect(page).to have_content("This is a note about the hearing!")
      expect(find_field("Transcript Requested", visible: false)).to be_checked
      expect(find_field("9:00", visible: false)).to be_checked
    end
  end

  context "Daily docket with an uneditable dispositon" do
    let!(:current_user) { User.authenticate!(css_id: "BVATWARNER", roles: ["Build HearSched"]) }
    let!(:hearing) { create(:hearing) }
    let!(:hearing_task_association) do
      create(:hearing_task_association, hearing: hearing, hearing_task: create(:hearing_task, appeal: hearing.appeal))
    end
    let!(:disposition_task) do
      create(:disposition_task,
             parent: hearing_task_association.hearing_task,
             appeal: hearing.appeal,
             status: Constants.TASK_STATUSES.completed)
    end

    scenario "User cannot update disposition" do
      visit "hearings/schedule/docket/" + hearing.hearing_day.id.to_s
      find(".dropdown-Disposition").find(".is-disabled")
    end
  end

  context "Daily docket for RO view user" do
    let!(:current_user) { User.authenticate!(css_id: "BVATWARNER", roles: ["RO ViewHearSched"]) }
    let!(:hearing) { create(:hearing, :with_tasks) }

    scenario "User can only update notes" do
      visit "hearings/schedule/docket/" + hearing.hearing_day.id.to_s
      expect(page).to have_field("Transcript Requested", disabled: true, visible: false)
      find(".dropdown-Disposition").find(".is-disabled")
      fill_in "Notes", with: "This is a note about the hearing!"
      click_button("Save")
      expect(page).to have_content("This is a note about the hearing!")
    end
  end
end
