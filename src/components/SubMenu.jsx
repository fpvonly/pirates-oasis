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
      <div>
        <p>
          Pirate's Oasis is a  mouse controlled isometric pirate-themed game.
          The goal of the game is to prevent enemy ghost pirate ships from reaching the three towers on the island
          and stealing your treasure, hidden in the skull cave.
          The game uses React framework as a base for the app and HTML5 Canvas API for the game itself.
          It is designed for desktop browsers.
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

  handleEnemiesInput = (value) => {
    if (Number.isInteger(value) && value > 0 && value <= 4) {
      this.props.setNumberOfEnemies(value);
    }
  }

  render() {
    return <div ref={(c) => {this.extraSubMenu = c;}} className='extra_sub_menu_wrapper'>
      <div className='sub_menu'>
        <div className='setting_wrapper'>
          <span className='settings_title'>Settings:</span>
          <hr />
          <div className='enemies_amount_title'>Max amount of enemies on screen</div>
          <NumericInput min={1} max={4} value={1} value={this.props.getNumberOfEnemiesFromStorage()} onChange={this.handleEnemiesInput} />
        </div>
        <div className='setting_wrapper'>
          <span className='settings_title'>Info:</span>
          <hr />
          {this.getInfo()}
        </div>
        <div className='settings_close_btn' onClick={this.close}>Close</div>
      </div>
    </div>;
  }

}

export default SubMenu;
