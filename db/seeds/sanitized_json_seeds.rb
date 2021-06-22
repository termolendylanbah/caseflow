# frozen_string_literal: true

require "helpers/sanitized_json_configuration.rb"
require "helpers/sanitized_json_importer.rb"

# Import from sanitized_json/ directory.
# Based on the SanitizedJsonExporter:
#  https://github.com/department-of-veterans-affairs/caseflow/wiki/Exporting-and-Importing-Appeals
# This allows us to import realistic appeal trees.
# Note that these files contain *fictional* but realistic-looking PII/PHI, generated by Faker.

module Seeds
  class SanitizedJsonSeeds
    def seed!
      import_json_seed_data
    end

    private

    def import_json_seed_data
      # appeal_ready_for_substitution_3.json requires this to exist
      FactoryBot.create(:higher_level_review, id: 2_000_050_893)

      Dir.glob("db/seeds/sanitized_json/*.json").each do |json_seed|
        sji = SanitizedJsonImporter.from_file(json_seed, verbosity: 0)
        sji.import
      end
    end
  end
end
