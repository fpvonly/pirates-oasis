import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';

import * as C from './Game/Constants';

class TitleBanner extends React.Component {

  constructor(props) {
    super(props);
  }

  static defaultProps = {
    gameState: ''
  };

  static propTypes = {
    gameState: PropTypes.string
  };

  render() {
    let banner = null;
    if (this.props.gameState === C.STOP) {
      banner = <div className='banner'>
        <div className='title'>Pirate's Oasis</div>
      </div>;
    }

    return banner;
  }
}

export default TitleBanner;
