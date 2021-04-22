import moment from 'moment-timezone';
import _ from 'lodash';

// Get the possible times like "['2021-04-22T08:30:00-04:00', '2021-04-22T09:30:00-04:00', ... ]"
const getPossibleSlotTimes = ({ beginsAt, slotLengthMinutes, numberOfSlots }) => {
  const slotTimeReducer = (accumulator, index) => accumulator.concat(index * slotLengthMinutes);

  const minutesAfterBeginsAt = _.times(numberOfSlots).reduce(slotTimeReducer, []);

  const possibleSlotTimes = minutesAfterBeginsAt.map((minutesAfter) => {
    return beginsAt.clone().add(minutesAfter, 'minutes');
  });

  return possibleSlotTimes;
};

// Extract the hearing times, interpret them as in the roTimezone
const extractMomentHearingTimes = ({ hearings, roTimezone }) => {
  return hearings.map((hearing) =>
    moment.tz(hearing.hearingTime, 'HH:mm', roTimezone)
  );
};

// Filter slots based on the various rules about which ones should appear
const removeUnavailableSlots = ({ hearingTimes, possibleSlotTimes, roTimezone }) => {

  const availableSlotsReducer = (accumulator, momentPossibleTime) => {
    // A 10:45 appointment will:
    // - Hide a 10:30 slot (it's full, so we return null)
    // - Hide a 11:30 slot (it's full, so we return null)
    const hearingWithinHourOfSlot = hearingTimes.some((scheduledHearingTime) =>
      (Math.abs(momentPossibleTime.diff(scheduledHearingTime, 'minutes')) < 60)
    );

    // Don't show slots that are before 8:30am in RO time.
    const eightThirtyAmRoZone = moment.tz('08:30', 'HH:mm', roTimezone);
    const slotBeforeEightThirtyAmRoTime = momentPossibleTime.isBefore(eightThirtyAmRoZone);

    // Don't show slots that are after 4:30pm in RO time.
    const fourThirtyPmRoTime = moment.tz('16:30', 'HH:mm', roTimezone);
    const slotAfterFourThirtyPmRoTime = momentPossibleTime.isAfter(fourThirtyPmRoTime);

    // Check if any of conditions make the slot unavailable
    const slotIsUnavailable =
          hearingWithinHourOfSlot ||
          slotBeforeEightThirtyAmRoTime ||
          slotAfterFourThirtyPmRoTime;

    return slotIsUnavailable ? accumulator : accumulator.concat({
      slotId: momentPossibleTime.format('HH:mm'),
      time: momentPossibleTime,
    });
  };

  // For each possible time, discard if it does not meet our criteria
  const availableSlots = possibleSlotTimes.reduce(availableSlotsReducer, []);

  return availableSlots;
};

/**
 * Method to calculate an array of available time slots, no filled timeslots or hearings are included
 * @param {string} numberOfSlots  -- Max number of slots to generate
 * @param {integer} slotLengthMinutes -- The length of each slot in minutes
 * @param {string} beginsAt  -- Time of first possible slot in "America/New_York" timezone
 * @param {string} roTimezone -- Timezone like 'America/Los_Angeles' of the ro
 * @param {array} hearings    -- List of hearings scheduled for a specific date
 **/
const calculateAvailableTimeslots = ({ numberOfSlots, slotLengthMinutes, beginsAt, roTimezone, hearings }) => {
  // Get an array of all the possible times
  const possibleSlotTimes = getPossibleSlotTimes({ beginsAt, slotLengthMinutes, numberOfSlots });
  // Extract the hearing times, interpret them as in the roTimezone
  const hearingTimes = extractMomentHearingTimes({ hearings, roTimezone });
  // Remove the slots that are full
  const availableSlots = removeUnavailableSlots({ hearingTimes, possibleSlotTimes, roTimezone });

  return availableSlots;
};

/**
 * Method to convert all timezones to 'America/New_York, add an id for React, and
 * combine the available slots and hearings
 * @param {string} roTimezone        -- Like "America/Los_Angeles"
 * @param {string} availableSlots    -- Array of unfilled slots
 * @param {string} scheduledHearings -- Array of hearings
 **/
const combineSlotsAndHearings = ({ roTimezone, availableSlots, hearings }) => {
  const slots = availableSlots.map((slot) => ({
    ...slot,
    key: `${slot?.slotId}-${slot?.time_string}`,
    full: false,
    // This is a moment object, always in "America/New_York" as returned by calculateAvailableTimeslots
    hearingTime: slot.time.format('HH:mm')
  }));

  const formattedHearings = hearings.map((hearing) => ({
    ...hearing,
    key: hearing?.externalId,
    full: true,
    // The hearingTime is in roTimezone, but it looks like "09:30", this takes that "09:30"
    // in roTimezone, and converts it to Eastern zone because slots are always in eastern.
    hearingTime: moment.tz(hearing?.hearingTime, 'HH:mm', roTimezone).clone().
      tz('America/New_York').
      format('HH:mm')
  }));

  const slotsAndHearings = slots.concat(formattedHearings);

  return _.sortBy(slotsAndHearings, 'hearingTime');

};

/**
 * Method to set the available time slots based on the hearings scheduled
 * @param {array} hearings    -- List of hearings scheduled for a specific date
 * @param {string} ro         -- The ro id, can be RXX, C, or V
 * @param {string} roTimezone -- Like "America/Los_Angeles"
 *
 * The 'hearingTime' in the returned array is always in 'America/New_York' timezone.
 *
 * Each hearing passed in has a hearingTime property:
 * - This time is in the timezone of the ro that this individual hearing has in the db.
 * - hearingTime is a string like '09:45'
 * - It is generated by HearingTimeService::scheduled_time_string
 */
export const setTimeSlots = ({ scheduledHearingsList, ro, roTimezone = 'America/New_York', beginsAt }) => {
  // Safe assign the hearings array in case there are no scheduled hearings
  const hearings = scheduledHearingsList || [];

  const numberOfSlots = 8;
  // TODO this default determination should be removed and provided by the db
  const defaultBeginsAt = ro === 'C' ? '09:00' : '08:30';
  const momentDefaultBeginsAt = moment.tz(defaultBeginsAt, 'HH:mm', 'America/New_York');
  const slotLengthMinutes = 60;
  //
  const availableSlots = calculateAvailableTimeslots({
    numberOfSlots,
    slotLengthMinutes,
    beginsAt: beginsAt ? beginsAt : momentDefaultBeginsAt,
    roTimezone,
    hearings
  });

  /*
    console.log('availableSlots.length', availableSlots.length);
    console.log('availableSlots', availableSlots.map((slot) => {
      return { time: slot.time.format('LLL'), id: slot.slotId };
    }));
    */

  return combineSlotsAndHearings({
    roTimezone,
    availableSlots,
    hearings
  });

};

