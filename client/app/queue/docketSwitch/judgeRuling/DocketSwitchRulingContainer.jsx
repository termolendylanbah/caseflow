import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { taskById, appealWithDetailSelector } from 'app/queue/selectors';
import { taskActionData } from 'app/queue/utils';
import DISPOSITIONS from 'constants/DOCKET_SWITCH_DISPOSITIONS';
import { createDocketSwitchGrantedTask, createDocketSwitchDeniedTask } from './docketSwitchRulingSlice';
import { DocketSwitchRulingForm } from './DocketSwitchRulingForm';
import {
  DOCKET_SWITCH_RULING_SUCCESS_TITLE,
  DOCKET_SWITCH_RULING_SUCCESS_MESSAGE,
} from '../../../../COPY';

import { sprintf } from 'sprintf-js';
import { showSuccessMessage } from '../../uiReducer/uiActions';

export const formatDocketSwitchRuling = ({
  disposition,
  hyperlink,
  context,
}) => {
  const parts = [];

  parts.push(`I am proceeding with a ${DISPOSITIONS[disposition].judgeRulingText}.`);
  parts.push(`Signed ruling letter:  \n${hyperlink}`);
  parts.push(context);

  return parts.join('  \n  \n');
};

export const DocketSwitchRulingContainer = () => {
  const { appealId, taskId } = useParams();
  const { goBack, push } = useHistory();
  const dispatch = useDispatch();
  const task = useSelector((state) => taskById(state, { taskId }));
  const appeal = useSelector((state) =>
    appealWithDetailSelector(state, { appealId })
  );
  const match = useRouteMatch();
  const { selected, options } = taskActionData({ task, match });

  // eslint-disable-next-line no-console
  const handleSubmit = async (formData) => {
    const instructions = formatDocketSwitchRuling({ ...formData });
    const { disposition } = formData;
    const dispositionType = DISPOSITIONS[disposition].dispositionType;
    const taskType = `DocketSwitch${dispositionType}Task`;

    const newTask = {
      parent_id: taskId,
      type: taskType,
      external_id: appeal.externalId,
      instructions,
      assigned_to_id: formData.attorney.value,
      assigned_to_type: 'User',
    };

    const data = {
      tasks: [newTask],
    };

    const successMessage = {
      title: sprintf(DOCKET_SWITCH_RULING_SUCCESS_TITLE, dispositionType.toLowerCase(), appeal.appellantFullName),
      detail: DOCKET_SWITCH_RULING_SUCCESS_MESSAGE,
    };

    try {
      if (dispositionType === 'Granted') {
        await dispatch(createDocketSwitchGrantedTask(data));
      } else if (dispositionType === 'Denied') {
        await dispatch(createDocketSwitchDeniedTask(data));
      }

      dispatch(showSuccessMessage(successMessage));
      push('/queue');
    } catch (error) {
      // Perhaps show an alert that indicates error, advise trying again...?
      console.error('Error saving task', error);
    }
  };

  return (
    <DocketSwitchRulingForm
      onCancel={goBack}
      onSubmit={handleSubmit}
      clerkOfTheBoardAttorneys={options}
      defaultAttorneyId={selected}
      appellantName={appeal.appellantFullName}
      instructions={task.instructions}
    />
  );
};
