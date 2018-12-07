import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import NumericInput from 'react-numeric-input';
import Toggle from 'react-toggle';

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
    getNumberOfEnemies: () => {},
    nightmode: false,
    setNightmode: () => {},
    getNightmode: () => {},
    fpsMode: false,
    setFPSMode: () => {},
    getFPSMode: () => {},
    enemySpeedMode: false,
    setEnemySpeedMode: () => {},
    getEnemySpeedMode: () => {}
  };

  static propTypes = {
    visible: PropTypes.bool,
    closeSubMenu: PropTypes.func,
    setNumberOfEnemies: PropTypes.func,
    getNumberOfEnemies: PropTypes.func,
    nightmode: PropTypes.bool,
    setNightmode: PropTypes.func,
    getNightmode: PropTypes.func,
    fpsMode: PropTypes.bool,
    setFPSMode: PropTypes.func,
    getFPSMode: PropTypes.func,
    enemySpeedMode: PropTypes.bool,
    setEnemySpeedMode: PropTypes.func,
    getEnemySpeedMode: PropTypes.func
  };

  componentDidMount = () => {
    window.addEventListener('keyup', this.close, false);
  }

  componentWillUnmount = () => {
    window.removeEventListener('keyup', this.close, false);
  }

  close = (e) => {
    if (typeof e.persist === 'function') {
      e.persist();
    }
    if (e.key === 'Escape' || e.keyCode === 27 || e.type === 'click') {
      this.props.closeSubMenu();
    }
  }

  getInfo = () => {
    return <div className='extra_info'>
      <div>
        <p>
          Pirate's Oasis is a  mouse controlled isometric pirate-themed game.
          The goal of the game is to prevent enemy ghost pirate ships from reaching any of the three towers on the island
          and stealing your treasure, hidden in the skull cave.
          The game uses React framework as a base for the app and HTML5 Canvas API for the game itself.
          The game is designed for desktop browsers and FullHD resolution. Works best with the newest Chrome and Firefox browsers.
        </p>
          <a href={conf.git_url} target='_blank'>Link to GitHub</a>
        <p>
          &copy; {new Date().getFullYear()} Ari Petäjäjärvi
        </p>
      </div>
    </div>;
  }

  handleEnemiesInput = (value) => {
    if (Number.isInteger(value) && value > 0 && value <= 4) {
      this.props.setNumberOfEnemies(value);
    }
  }

  handleNightmodeClick = (e) => {
    this.props.setNightmode(e.target.checked);
  }


  handleEnemySpeedClick = (e) => {
    this.props.setEnemySpeedMode(e.target.checked);
  }

  handleFPSModeClick = (e) => {
    this.props.setFPSMode(e.target.checked);
  }

  render() {
    return <div ref={(c) => {this.extraSubMenu = c;}} className='extra_sub_menu_wrapper topmost'>
      <div className='overlay' />
      <div className='sub_menu'>
        <div className='setting_wrapper'>
          <span className='settings_title'>Settings:</span>
          <hr />
          <div className='sub_title'>Max number of enemies on screen</div>
          <NumericInput min={1} max={4} value={1} value={this.props.getNumberOfEnemies()} onChange={this.handleEnemiesInput} />
        </div>

        <div className='setting_wrapper'>
          <div className='sub_title'>Enemy speed</div>
          <Toggle checked={this.props.enemySpeedMode} onChange={this.handleEnemySpeedClick} />
          <span className='toggle_label'>{(this.props.enemySpeedMode ? 'Fast enemies ON' : 'Fast enemies OFF')}</span>
        </div>

        <div className='setting_wrapper'>
          <div className='sub_title'>Nightmode of the game (experimental)</div>
          <Toggle checked={this.props.nightmode} onChange={this.handleNightmodeClick} />
          <span className='toggle_label'>{(this.props.nightmode ? 'Nightmode ON' : 'Nightmode OFF')}</span>
        </div>
        <div className='setting_wrapper'>
          <div className='sub_title'>Performance counter (max. 30fps)</div>
          <Toggle checked={this.props.fpsMode} onChange={this.handleFPSModeClick} />
          <span className='toggle_label'>{(this.props.fpsMode ? 'Show FPS ON' : 'Show FPS OFF')}</span>
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
