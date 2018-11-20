import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import conf from '../conf.json';

class SubMenu extends React.Component {

  constructor(props) {
    super(props);

    this.extraSubMenu = null;

  }

  static defaultProps = {
    visible: true
  };

  static propTypes = {
    visible: PropTypes.bool

  };

  componentDidMount = () => {

  }

  getInfo = () => {
    return <div className='extra_info'>
      <span className='info_title'>Info:</span>
      <div>
        <p>
          Lorem
        </p>
          <a href={conf.git_url} target='_blank'>Link to GitHub</a>
        <p>
          &copy; {new Date().getFullYear()} Ari Petäjäjärvi
        </p>
      </div>
    </div>;
  }

  close = (e) => {

  }

  render() {

    return <div ref={(c) => {this.extraSubMenu = c;}} className='extra_sub_menu_wapper'>
      <div className='sub_menu'>
        <div className='bg' />
        <div className='padding'>
          {'this.getInfo()'}
        </div>
        <div className='extra_close_btn' onClick={this.close}>Close</div>
      </div>
    </div>;
  }

}

export default SubMenu;
