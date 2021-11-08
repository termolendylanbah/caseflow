import React from 'react';
import PropTypes from 'prop-types';

export const CancelIcon = (props) => {
  const { size, color, cname, bgColor } = props;

  return <svg height={size} viewBox="0 0 40 40" version="1.1" className={cname}>
    <g id="Artboard" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path d="M20,0 C8.9516129,0 0,8.9516129 0,20 C0,31.0483871 8.9516129,40 20,40 C31.0483871,40 40,31.0483871 40,20 C40,8.9516129 31.0483871,0 20,0 Z" id="Path" fill={bgColor} fillRule="nonzero"></path>
      <g id="minus-circle-solid" transform="translate(2.000000, 2.000000)" fill={color} fillRule="nonzero">
        <path d="M18,0 C8.05645161,0 0,8.05645161 0,18 C0,27.9435484 8.05645161,36 18,36 C27.9435484,36 36,27.9435484 36,18 C36,8.05645161 27.9435484,0 18,0 Z M8.41935484,20.9032258 C7.94032258,20.9032258 7.5483871,20.5112903 7.5483871,20.0322581 L7.5483871,15.9677419 C7.5483871,15.4887097 7.94032258,15.0967742 8.41935484,15.0967742 L27.5806452,15.0967742 C28.0596774,15.0967742 28.4516129,15.4887097 28.4516129,15.9677419 L28.4516129,20.0322581 C28.4516129,20.5112903 28.0596774,20.9032258 27.5806452,20.9032258 L8.41935484,20.9032258 Z" id="Shape"></path>
      </g>
    </g>
  </svg>;
};
CancelIcon.propTypes = {

  /**
   * Sets height of the component, width is set automatically by the svg viewbox property. Default height is '40px'.
   */
  size: PropTypes.number,

  /**
   * sets color of the component. Default value is '#E31C3D'.
   */
  color: PropTypes.string,

  /**
   * sets the background color of the component. Default value is '#ffffff'.
   */
  bgColor: PropTypes.string,

  /**
   * Adds class to the component. Default value is ''.
   */
  cname: PropTypes.string
};
CancelIcon.defaultProps = {
  size: 40,
  color: '#E31C3D',
  cname: '',
  bgColor: '#ffffff'
};
