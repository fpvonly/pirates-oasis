import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import SubMenu from './SubMenu.jsx';
import Sounds from './Game/Objects/Sound';

import conf from '../conf.json';
import * as C from './Game/Constants';

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.menuTimer = null;
    this.extraSubMenu = null;
    this.mainMenuBtns = {};
    this.state = {
      extraSubMenuVisible: false,
      mainMenuBtnStateSelectedIndex: null,
      musicState: this.getmusicState(),
      fullscreenState: false,
      nightmode: this.getNightmode(),
      fpsMode: this.getFPSMode(),
      enemySpeedMode: this.getEnemySpeedMode()
    };
  }

  static defaultProps = {
    visible: true,
    setGameState: () => {}
  };

  static propTypes = {
    visible: PropTypes.bool,
    setGameState: PropTypes.func
  };

  componentDidMount = () => {
    if (this.state.musicState === true) {
      Sounds.playMusic().catch((err) => {
        this.controlMusic(false);
      });
    }

    window.addEventListener("keyup", this.handleKeyboard, false);
    document.addEventListener("fullscreenchange", (event) => {
      this.setFullscreenState(!this.state.fullscreenState);
    });
    document.addEventListener("mozfullscreenchange",(event) => {
      this.setFullscreenState(!this.state.fullscreenState);
    });
    document.addEventListener("webkitfullscreenchange", (event) => {
      this.setFullscreenState(!this.state.fullscreenState);
    });
    document.addEventListener("msfullscreenchange", (event) => {
      this.setFullscreenState(!this.state.fullscreenState);
    });
  }

  handleKeyboard = (e) => {
    e.preventDefault();
    let keycode = e.key;
    clearTimeout(this.menuTimer);

    if (this.props.visible === true) {
      if (keycode === 'Enter' && this.state.mainMenuBtnStateSelectedIndex !== null) {
        switch (this.state.mainMenuBtnStateSelectedIndex) {
          case 0:
            this.mainMenuBtns.new_game_btn.click();
            break;
          case 1:
            this.mainMenuBtns.settings_btn.click();
            break;
          case 2:
            this.mainMenuBtns.quit_btn.click();
            break;
        }
      }

      if (keycode === 'ArrowUp') {
        if (this.state.mainMenuBtnStateSelectedIndex === null) {
          this.setState({mainMenuBtnStateSelectedIndex: 2});
        } else {
          if (this.state.mainMenuBtnStateSelectedIndex === 0) {
            this.setState({mainMenuBtnStateSelectedIndex: 2});
          } else {
            this.setState({mainMenuBtnStateSelectedIndex: this.state.mainMenuBtnStateSelectedIndex - 1});
          }
        }
      } else if (keycode === 'ArrowDown') {
        if (this.state.mainMenuBtnStateSelectedIndex === null) {
          this.setState({mainMenuBtnStateSelectedIndex: 0});
        } else {
          if (this.state.mainMenuBtnStateSelectedIndex === 2) {
            this.setState({mainMenuBtnStateSelectedIndex: 0});
          } else {
            this.setState({mainMenuBtnStateSelectedIndex: this.state.mainMenuBtnStateSelectedIndex + 1});
          }
        }
      }
      this.menuTimer = setTimeout(() => {
        this.setState({mainMenuBtnStateSelectedIndex: null});
      }, 2000);
    }
  }

  handleMouseHover = (e) => {
    clearTimeout(this.menuTimer);
    if (this.props.visible === true) {
      if (e.currentTarget.classList.contains('new_game')) {
        this.setState({mainMenuBtnStateSelectedIndex: 0});
      } else if (e.currentTarget.classList.contains('settings')) {
        this.setState({mainMenuBtnStateSelectedIndex: 1});
      } else if (e.currentTarget.classList.contains('quit')) {
        this.setState({mainMenuBtnStateSelectedIndex: 2});
      }
    }
  }

  handleMouseOut = (e) => {
    clearTimeout(this.menuTimer);
    if (this.props.visible === true) {
      this.menuTimer = setTimeout(() => {
        this.setState({mainMenuBtnStateSelectedIndex: null});
      }, 2000);
    }
  }

  handleNewGameClick = (e) => {
    this.setState({extraSubMenuVisible: false}, () => {
      this.props.setGameState(C.RUN, 'MENU_NEW_GAME_CLICK');
    });
  }

  handleShowSettingsClick = () => {
    document.body.style = 'overflow: auto;';
    this.setState({extraSubMenuVisible: !this.state.extraSubMenuVisible});
  }

  handleQuitClick = (e) => {
    window.location.assign('http://' + conf.quit_url);
  }

  handlePlayMusicClick = (e) => {
    this.controlMusic();
  }

  handleFullscreenClick = (e) => {
    let appWrapper = document.getElementsByTagName('body')[0];

    if (this.isFullScreenActive() === false) {
      if (appWrapper.requestFullscreen) {
        appWrapper.requestFullscreen();
      } else if (appWrapper.msRequestFullscreen) {
        appWrapper.msRequestFullscreen();
      } else if (appWrapper.mozRequestFullScreen) {
        appWrapper.mozRequestFullScreen();
      } else if (appWrapper.webkitRequestFullscreen) {
        appWrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }

  isFullScreenActive = () => {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      return false;
    } else {
      return true;
    }
  }

  closeSubMenu = () => {
    window.scrollTo(0, 0);
    document.body.style = 'overflow: none;'
    this.setState({extraSubMenuVisible: false});
  }

  controlMusic = (value) => {
    if (typeof value !== 'undefined') {
      this.playMusic(value);
    } else {
      this.playMusic(!this.state.musicState);
    }
  }

  playMusic = (value = false) => {
    if (value === false) {
      Sounds.pauseMusic();
    } else {
      Sounds.playMusic();
    }

    if (window.localStorage) {
      localStorage.setItem('play_music', value);
    }

    this.setState({musicState: value});
  }

  getmusicState = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('play_music');
    }
    return (value && value !== null ? (value == 'true') : false);
  }

  setFullscreenState = (val = false) => {
    this.setState({fullscreenState: val});
  }

  setNumberOfEnemies = (value) => {
    if (window.localStorage) {
      localStorage.setItem('number_of_enemies', value);
    }
  }

  getNumberOfEnemies = () => {
    let value = 1;
    if (window.localStorage) {
      value = localStorage.getItem('number_of_enemies');
    }
    return (value && value !== null ? value : 1);
  }

  setNightmode = (value) => {
    if (window.localStorage) {
      localStorage.setItem('nightmode', value);
    }
    this.setState({nightmode: value});
  }

  getNightmode = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('nightmode');
    }
    return (value !== null && value == 'true' ? true : false);
  }

  setFPSMode = (value) => {
    if (window.localStorage) {
      localStorage.setItem('fpsmode', value);
    }
    this.setState({fpsMode: value});
  }

  getFPSMode = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('fpsmode');
    }
    return (value !== null && value == 'true' ? true : false);
  }

  setEnemySpeedMode = (value) => {
    if (window.localStorage) {
      localStorage.setItem('enemy_speed_mode', value);
    }
    this.setState({enemySpeedMode: value});
  }

  getEnemySpeedMode = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('enemy_speed_mode');
    }
    return (value !== null && value == 'true' ? true : false);
  }

  render() {
    let menuWrapper = null;
    let mainMenu = null;
    let extraSubMenu = null;

    if (this.props.visible === true) {
      mainMenu = <div className='menu'>
          <div
            ref={(c) => { this.mainMenuBtns['new_game_btn'] = c;}}
            className={'menu_btn new_game' + (this.state.mainMenuBtnStateSelectedIndex === 0 ? ' active' : '')}
            onClick={this.handleNewGameClick}
            onMouseOver={this.handleMouseHover}
            onMouseOut={this.handleMouseOut}>
              <span className='main_btn_text'>New game</span>
          </div>
          <div
            ref={(c) => { this.mainMenuBtns['settings_btn'] = c;}}
            className={'menu_btn settings' + (this.state.mainMenuBtnStateSelectedIndex === 1 ? ' active' : '')}
            onClick={this.handleShowSettingsClick}
            onMouseOver={this.handleMouseHover}
            onMouseOut={this.handleMouseOut}>
              <span className='main_btn_text'>Settings</span>
          </div>
          <div
            ref={(c) => { this.mainMenuBtns['quit_btn'] = c;}}
            className={'menu_btn quit' + (this.state.mainMenuBtnStateSelectedIndex === 2 ? ' active' : '')}
            onClick={this.handleQuitClick}
            onMouseOver={this.handleMouseHover}
            onMouseOut={this.handleMouseOut}>
              <span className='main_btn_text'>Quit</span>
          </div>
          <div className='menu_btn music topmost' onClick={this.handlePlayMusicClick}>
            {(this.state.musicState === true ? 'Pause music' : 'Play music')}
          </div>
          <div className='menu_btn fullscreen topmost' onClick={this.handleFullscreenClick}>
            {(this.state.fullscreenState === true ? 'Normal screen' : 'Fullscreen' )}
          </div>
        </div>;

      if (this.state.extraSubMenuVisible === true) {
        extraSubMenu = <SubMenu
          closeSubMenu={this.closeSubMenu}
          setNumberOfEnemies={this.setNumberOfEnemies}
          getNumberOfEnemies={this.getNumberOfEnemies}
          nightmode={this.state.nightmode}
          setNightmode={this.setNightmode}
          getNightmode={this.getNightmode}
          fpsMode={this.state.fpsMode}
          setFPSMode={this.setFPSMode}
          getFPSMode={this.getFPSMode}
          enemySpeedMode={this.state.enemySpeedMode}
          setEnemySpeedMode={this.setEnemySpeedMode}
          getEnemySpeedMode={this.getEnemySpeedMode} />;
      }

      menuWrapper = <div className='main_menu_wrapper'>
        {mainMenu}
        <ReactCSSTransitionGroup
          transitionName="slide"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>
            {extraSubMenu}
        </ReactCSSTransitionGroup>
      </div>;
    }

    return menuWrapper;
  }
}

export default Menu;
