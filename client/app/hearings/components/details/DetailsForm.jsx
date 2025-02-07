import PropTypes from 'prop-types';
import React from 'react';

import { ContentSection } from '../../../components/ContentSection';
import { EmailNotificationHistory } from './EmailNotificationHistory';
import {
  JudgeDropdown,
  HearingCoordinatorDropdown,
  HearingRoomDropdown,
} from '../../../components/DataDropdowns/index';
import { TranscriptionFormSection } from './TranscriptionFormSection';
import { VirtualHearingForm } from './VirtualHearingForm';
import { columnThird, maxWidthFormInput, rowThirds } from './style';
import Checkbox from '../../../components/Checkbox';
import HearingTypeDropdown from './HearingTypeDropdown';
import TextareaField from '../../../components/TextareaField';

const DetailsForm = (props) => {
  const {
    hearing,
    initialHearing,
    update,
    isLegacy,
    readOnly,
    errors,
    hearingRequestTypeDropdownOptions,
    hearingRequestTypeDropdownCurrentOption,
    hearingRequestTypeDropdownOnchange
  } = props;

  return (
    <React.Fragment>
      <ContentSection header="Hearing Details">
        <div {...rowThirds}>
          <JudgeDropdown
            name="judgeDropdown"
            value={hearing?.judgeId}
            readOnly={readOnly}
            onChange={(judgeId) => update('hearing', { judgeId })}
          />
          <HearingCoordinatorDropdown
            name="hearingCoordinatorDropdown"
            value={hearing?.bvaPoc}
            readOnly={readOnly}
            onChange={(bvaPoc) => update('hearing', { bvaPoc })}
          />
          <HearingRoomDropdown
            name="hearingRoomDropdown"
            value={hearing?.room}
            readOnly={readOnly}
            onChange={(room) => update('hearing', { room })}
          />
        </div>
        <div {...rowThirds}>
          <HearingTypeDropdown
            styling={columnThird}
            dropdownOptions={hearingRequestTypeDropdownOptions}
            currentOption={hearingRequestTypeDropdownCurrentOption}
            readOnly={
                hearing?.scheduledForIsPast ||
                ((hearing?.isVirtual || hearing?.wasVirtual) &&
                  !hearing?.virtualHearing?.jobCompleted)
            }
            onChange={hearingRequestTypeDropdownOnchange}
          />

          <div>
            {!isLegacy && (
              <React.Fragment>
                <strong>Waive 90 Day Evidence Hold</strong>
                <Checkbox
                  label="Yes, Waive 90 Day Evidence Hold"
                  name="evidenceWindowWaived"
                  disabled={readOnly}
                  value={hearing?.evidenceWindowWaived || false}
                  onChange={(evidenceWindowWaived) =>
                    update('hearing', { evidenceWindowWaived })
                  }
                />
              </React.Fragment>
            )}
          </div>
          <div />
        </div>
        <div>
          <TextareaField
            name="Notes"
            strongLabel
            styling={maxWidthFormInput}
            disabled={readOnly}
            value={hearing?.notes || ''}
            onChange={(notes) => update('hearing', { notes })}
            maxlength={1000}
          />
        </div>
      </ContentSection>

      <VirtualHearingForm
        errors={errors}
        hearing={hearing}
        initialHearing={initialHearing}
        readOnly={readOnly}
        virtualHearing={hearing?.virtualHearing}
        update={update}
      />

      {hearing?.emailEvents?.length > 0 && (
        <EmailNotificationHistory rows={hearing?.emailEvents} />
      )}

      {!isLegacy && (
        <TranscriptionFormSection
          hearing={hearing}
          readOnly={readOnly}
          transcription={hearing.transcription}
          update={update}
        />
      )}
    </React.Fragment>
  );
};

DetailsForm.propTypes = {
  errors: PropTypes.shape({
    appellantEmail: PropTypes.string,
    representativeEmail: PropTypes.string,
  }),
  hearing: PropTypes.shape({
    virtualHearing: PropTypes.object,
    transcription: PropTypes.object,
    wasVirtual: PropTypes.bool,
    isVirtual: PropTypes.bool,
  }),
  initialHearing: PropTypes.shape({
    virtualHearing: PropTypes.object
  }),
  isLegacy: PropTypes.bool,
  readOnly: PropTypes.bool,
  update: PropTypes.func,
  hearingRequestTypeDropdownOptions: PropTypes.array,
  hearingRequestTypeDropdownCurrentOption: PropTypes.object,
  hearingRequestTypeDropdownOnchange: PropTypes.func,
};

export default DetailsForm;
