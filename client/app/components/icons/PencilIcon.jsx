import React from 'react';
import PropTypes from 'prop-types';

export const PencilIcon = (props) => {
  const { size, color, cname } = props;

  return <svg height={size} viewBox="0 0 25 25" version="1.1" className={cname}>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g transform="translate(-729.000000, -307.000000)" fill={color} fillRule="nonzero">
        <g transform="translate(6.000000, 253.000000)">
          <g transform="translate(0.000000, 29.000000)">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 870ec5de027253473c4873180244e197b1cf661c
            <path d="M738.522827,27 L736.791876,28.7078716 L740.228508,32.0986824
            L741.959459,30.3908108 L738.522827,27 Z M736.216998,29.2750845 L728.503527,36.8857095
            L731.940159,40.2765203 L739.653631,32.6658953 L736.216998,29.2750845 Z M727.979188,37.5027872
            L727,41.76 L731.314743,40.7938682 L727.979188,37.5027872 Z" id="Shape"></path>
<<<<<<< HEAD
=======
=======
            <path d="M738.522827,27 L736.791876,28.7078716 L740.228508,32.0986824 L741.959459,30.3908108 L738.522827,27 Z M736.216998,29.2750845 L728.503527,36.8857095 L731.940159,40.2765203 L739.653631,32.6658953 L736.216998,29.2750845 Z M727.979188,37.5027872 L727,41.76 L731.314743,40.7938682 L727.979188,37.5027872 Z" id="Shape"></path>
>>>>>>> da6bfd9a1 (create stories for and reorganize all icons.)
>>>>>>> 870ec5de027253473c4873180244e197b1cf661c
          </g>
        </g>
      </g>
    </g>
  </svg>;
};
PencilIcon.propTypes = {

  /**
   * Sets height of the component, width is set automatically by the svg viewbox property. Default height is '25px'.
   */
  size: PropTypes.number,

  /**
   * sets color of the component. Default value is '#0071BC'.
   */
  color: PropTypes.string,

  /**
   * Adds class to the component. Default value is ''.
   */
  cname: PropTypes.string
};
PencilIcon.defaultProps = {
  size: 25,
  color: '#0071BC',
  cname: ''
};
