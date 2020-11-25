import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';

import reducer from '../../reducers';
import { detailsStore, initialState } from '../../../../test/data/stores/hearingsStore';
import DailyDocketRow from './DailyDocketRow';
import ReduxBase from '../../../components/ReduxBase';
import { amaHearing } from '../../../../test/data/hearings';
import { userWithHearingCoordinatorRole, userWithJudgeRole, userWithVsoRole } from '../../../../test/data/user';

export default {
  title: 'Hearings/Components/Daily Docket/DailyDocketRow',
  component: DailyDocketRow,
};

const defaultArgs = {
  index: 0, // First row

  hearingId: amaHearing.id,
  regionalOffice: "RO01",
  user: {}, // Default user that doesn't have any permissions

  // Flags
  hidePreviouslyScheduled: true,
  readOnly: false,

  // Event Handlers
  update: action('update'),
  saveHearing: action('saveHearing'),
  openDispositionModal: action('openDispositionModal'),
  onReceiveAlerts: action('onReceiveAlerts'),
  onReceiveTransitioningAlert: action('onReceiveTransitioningAlert'),
  transitionAlert: action('transitionAlert')
}; 

const Template = (args) => {
  const { componentArgs } = args;

  return (
    <BrowserRouter basename="/hearings">
      <ReduxBase initialState={initialState} store={detailsStore} reducer={reducer}>
        <DailyDocketRow
          {...defaultArgs}
          {...componentArgs}
        />
      </ReduxBase>
    </BrowserRouter>
  );
};

export const ForHearingCoordinator = Template.bind({});
ForHearingCoordinator.args = {
  componentArgs: {
    user: userWithHearingCoordinatorRole
  }
};

export const ForJudge = Template.bind({});
ForJudge.args = {
  componentArgs: {
    user: userWithJudgeRole
  }
};

export const ForVso = Template.bind({});
ForVso.args = {
  componentArgs: {
    user: userWithVsoRole
  }
};
