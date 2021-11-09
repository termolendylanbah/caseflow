import React from 'react';
import PropTypes from 'prop-types';

export const GreenCheckmark = (props) => {
  const { size, color, cname, strokeColor } = props;

  return <svg height={size} viewBox="0 0 40 40" version="1.1">
    <g className={cname} stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="750-copy-12" transform="translate(-120.000000, -725.000000)">
        <g id="Group-11" transform="translate(124.000000, 729.000000)">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 870ec5de027253473c4873180244e197b1cf661c
          <rect id="Background" stroke={strokeColor} strokeWidth="4" fill={color} x="-2" y="-2"
            width="36" height="36" rx="20"></rect>
          <path d="M25,11.7340067 C25,11.4393939 24.883871,11.1447811 24.6748387,10.9326599 L23.0954839,9.32996633
          C22.8864516,9.11784512 22.596129,9 22.3058065,9 C22.0154839,9 21.7251613,9.11784512 21.516129,9.32996633
          L13.8980645,17.0723906 L10.483871,13.5959596 C10.2748387,13.3838384 9.98451613,13.2659933
          9.69419355,13.2659933 C9.40387097,13.2659933 9.11354839,13.3838384 8.90451613,13.5959596
          L7.32516129,15.1986532 C7.11612903,15.4107744 7,15.7053872 7,16 C7,16.2946128 7.11612903,16.5892256
          7.32516129,16.8013468 L13.1083871,22.6700337 C13.3174194,22.8821549 13.6077419,23 13.8980645,23
          C14.1883871,23 14.4787097,22.8821549 14.6877419,22.6700337 L24.6748387,12.5353535
          C24.883871,12.3232323 25,12.0286195 25,11.7340067 Z" id="Check"
          fillOpacity="0.91" fill="#FFFFFF"></path>
<<<<<<< HEAD
=======
=======
          <rect id="Background" stroke={strokeColor} strokeWidth="4" fill={color} x="-2" y="-2" width="36" height="36" rx="20"></rect>
          <path d="M25,11.7340067 C25,11.4393939 24.883871,11.1447811 24.6748387,10.9326599 L23.0954839,9.32996633 C22.8864516,9.11784512 22.596129,9 22.3058065,9 C22.0154839,9 21.7251613,9.11784512 21.516129,9.32996633 L13.8980645,17.0723906 L10.483871,13.5959596 C10.2748387,13.3838384 9.98451613,13.2659933 9.69419355,13.2659933 C9.40387097,13.2659933 9.11354839,13.3838384 8.90451613,13.5959596 L7.32516129,15.1986532 C7.11612903,15.4107744 7,15.7053872 7,16 C7,16.2946128 7.11612903,16.5892256 7.32516129,16.8013468 L13.1083871,22.6700337 C13.3174194,22.8821549 13.6077419,23 13.8980645,23 C14.1883871,23 14.4787097,22.8821549 14.6877419,22.6700337 L24.6748387,12.5353535 C24.883871,12.3232323 25,12.0286195 25,11.7340067 Z" id="Check" fillOpacity="0.91" fill="#FFFFFF"></path>
>>>>>>> da6bfd9a1 (create stories for and reorganize all icons.)
>>>>>>> 870ec5de027253473c4873180244e197b1cf661c
        </g>
      </g>
    </g>
  </svg>;
};
GreenCheckmark.propTypes = {

  /**
   * Sets height of the component, width is set automatically by the svg viewbox property. Default height is '24px'.
   */
  size: PropTypes.number,

  /**
   * sets color of the component. Default value is '#2E8540'.
   */
  color: PropTypes.string,

  /**
   * sets stroke color of the component. Default value is '#ffffff'.
   */
  strokeColor: PropTypes.string,

  /**
   * Adds class to the component. Default value is 'green-checkmark'.
   */
  cname: PropTypes.string
};
GreenCheckmark.defaultProps = {
  size: 40,
  strokeColor: '#ffffff',
  color: '#2E8540',
  cname: 'green-checkmark'
};
