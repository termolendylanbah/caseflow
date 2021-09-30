import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Link from '@department-of-veterans-affairs/caseflow-frontend-toolkit/components/Link';
import { get } from 'lodash';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { taskById } from '../selectors';
import { requestPatch } from '../uiReducer/uiActions';
import { taskActionData } from '../utils';
import TextareaField from '../../components/TextareaField';
import RadioField from '../../components/RadioField';
import COPY from '../../../COPY';
import TASK_STATUSES from '../../../constants/TASK_STATUSES';
import QueueFlowModal from './QueueFlowModal';
import { BOOLEAN_RADIO_OPTIONS } from '../../intake/constants';

/* eslint-disable camelcase */
const CancelTaskModal = (props) => {
  const { task, hearingDay, highlightFormItems } = props;
  const taskData = taskActionData(props);

  const cancelTaskFormSchema = yup.object().shape({
    deathDismissalCancel: yup.boolean().required(),
    taskInstructions: yup.string().required(),
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(cancelTaskFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });

  // Show task instructions by default
  const shouldShowTaskInstructions = get(taskData, 'show_instructions', true);

  const [instructions, setInstructions] = useState('');
  const [deathDismissalCancel, setDeathDismissalCancel] = useState(null);

  const deathDismissalCancelReason = watch('death-dismissal-cancel');

  useEffect(() => {
    if (deathDismissalCancelReason === 'true') {
      setValue('death-dismissal-cancel', COPY.TASK_SNAPSHOT_CANCEL_REASONS.death_dismissal);
    }
  }, [deathDismissalCancelReason]);

  const validateForm = () => {
    if (!shouldShowTaskInstructions) {
      return true;
    }

    return instructions.length > 0;
  };
  const submit = () => {
    const payload = {
      data: {
        task: {
          status: TASK_STATUSES.cancelled,
          instructions,
          ...(taskData?.business_payloads && { business_payloads: taskData?.business_payloads })
        }
      }
    };
    const hearingScheduleLink = taskData?.back_to_hearing_schedule ?
      <p>
        <Link href={`/hearings/schedule/assign?regional_office_key=${hearingDay.regionalOffice}`}>
          Back to Hearing Schedule
        </Link>
      </p> : null;
    const successMsg = {
      title: taskData.message_title,
      detail: (
        <span>
          <span dangerouslySetInnerHTML={{ __html: taskData.message_detail }} />
          {hearingScheduleLink}
        </span>
      )
    };

    return props.requestPatch(`/tasks/${task.taskId}`, payload, successMsg);
  };

  return (
    <QueueFlowModal
      title={taskData?.modal_title ?? ''}
      pathAfterSubmit={taskData?.redirect_after ?? '/queue'}
      submit={submit}
      validateForm={validateForm}
    >
      {taskData?.modal_body &&
        <React.Fragment>
          <div dangerouslySetInnerHTML={{ __html: taskData.modal_body }} />
          <br />
        </React.Fragment>
      }
      <RadioField
        name="death-dismissal-cancel"
        label="Is this task being cancelled due to the Veteran's Death?"
        vertical
        options={BOOLEAN_RADIO_OPTIONS}
        onChange={(value) => setDeathDismissalCancel(value)}
        errorMessage={errors?.['death-dismissal-cancel']?.message}
        value={deathDismissalCancel}
        inputRef={register}
      />
      {get(taskData, 'show_instructions', true) &&
        <TextareaField
          name={COPY.ADD_COLOCATED_TASK_INSTRUCTIONS_LABEL}
          errorMessage={highlightFormItems && instructions.length === 0 ? COPY.FORM_ERROR_FIELD_REQUIRED : null}
          id="taskInstructions"
          onChange={setInstructions}
          value={instructions}
          inputRef={register}
        />
      }
    </QueueFlowModal>
  );
};
/* eslint-enable camelcase */

CancelTaskModal.propTypes = {
  hearingDay: PropTypes.shape({
    regionalOffice: PropTypes.string
  }),
  requestPatch: PropTypes.func,
  task: PropTypes.shape({
    taskId: PropTypes.string
  }),
  highlightFormItems: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
  task: taskById(state, { taskId: ownProps.taskId }),
  hearingDay: state.ui.hearingDay,
  highlightFormItems: state.ui.highlightFormItems
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  requestPatch
}, dispatch);

export default (withRouter(
  connect(mapStateToProps, mapDispatchToProps)(
    CancelTaskModal
  )
));
