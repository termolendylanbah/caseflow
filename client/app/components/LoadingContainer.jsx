import React from 'react';
import PropTypes from 'prop-types';

import { LoadingSymbol } from './RenderFunctions';
export default class LoadingContainer extends React.Component {
  render() {
    let {
      color
    } = this.props;

    return <div className="loadingContainer-container">
      <div className="loadingContainer-positioning">
        <div className="loadingContainer-table">
          <div className="loadingContainer-table-cell">
            <LoadingSymbol
              text=""
              size="150px"
              color={color}
            />
          </div>
        </div>
      </div>
      <div className="loadingContainer-content">
        <div>
          {this.props.children}
        </div>
      </div>
    </div>;
  }
}

LoadingContainer.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string
};
