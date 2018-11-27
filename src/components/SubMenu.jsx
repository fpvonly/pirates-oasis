import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import NumericInput from 'react-numeric-input';

import conf from '../conf.json';

class SubMenu extends React.Component {

  constructor(props) {
    super(props);

    this.extraSubMenu = null;
  }

  static defaultProps = {
    visible: true,
    closeSubMenu: () => {},
    setNumberOfEnemies: () => {},
    getNumberOfEnemiesFromStorage: () => {}
  };

  static propTypes = {
    visible: PropTypes.bool,
    closeSubMenu: PropTypes.func,
    setNumberOfEnemies: PropTypes.func,
    getNumberOfEnemiesFromStorage: PropTypes.func
  };

  componentDidMount = () => {
    window.addEventListener('keyup', this.close, false);
  }

  componentWillUnmount = () => {
    window.removeEventListener('keyup', this.close, false);
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
    if (typeof e.persist === 'function') {
      e.persist();
    }
    if (e.key === 'Escape' || e.keyCode === 27 || e.type === 'click') {
      this.props.closeSubMenu();
    }
  }

  render() {
    return <div ref={(c) => {this.extraSubMenu = c;}} className='extra_sub_menu_wrapper'>
      <div className='sub_menu'>
        <div className='setting_wrapper'>
          <span className='settings_title'>Settings:</span>
          <hr />
          <div className='enemies_amount_title'>Max amount of enemies on screen</div>
          <NumericInput min={1} max={4} value={1} />
        </div>
        <div className='setting_wrapper'>
          <span className='settings_title'>Info:</span>
          <hr />
          <div className='enemies_amount_title'>TODO---</div>
        </div>
        <div className='settings_close_btn' onClick={this.close}>Close</div>
      </div>
    </div>;
  }

}

export default SubMenu;
