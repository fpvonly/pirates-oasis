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
      mainMenuBtnStateSelectedIndex: null
    };
  }

  static defaultProps = {
    visible: true,
    setGameState: () => {},
    controlMusic: () => {},
    musicState: false,
    fullscreenState: false,
    setExitFullscreenState: () => {}
  };

  static propTypes = {
    visible: PropTypes.bool,
    setGameState: PropTypes.func,
    controlMusic: PropTypes.func,
    musicState: PropTypes.bool,
    fullscreenState: PropTypes.bool,
    setExitFullscreenState: PropTypes.func
  };

  componentDidMount = () => {
    if (typeof window.localStorage === 'undefined' || localStorage.getItem('playMusic') === null) {
      try {
        Sounds.playMusic();
      } catch(err) {
        this.props.controlMusic(false);
      }
    }

    window.addEventListener("keyup", this.handleKeyboard, false);
    document.addEventListener("fullscreenchange", (event) => {
      this.props.setExitFullscreenState(!this.props.fullscreenState);
    });
    document.addEventListener("mozfullscreenchange",(event) => {
      this.props.setExitFullscreenState(!this.props.fullscreenState);
    });
    document.addEventListener("webkitfullscreenchange", (event) => {
      this.props.setExitFullscreenState(!this.props.fullscreenState);
    });
    document.addEventListener("msfullscreenchange", (event) => {
      this.props.setExitFullscreenState(!this.props.fullscreenState);
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
    this.setState({extraSubMenuVisible: !this.state.extraSubMenuVisible});
  }

  handleQuitClick = (e) => {
    window.location.assign('http://' + conf.quit_url);
  }

  handlePlayMusicClick = (e) => {
    this.props.controlMusic();
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
    this.setState({extraSubMenuVisible: false});
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
          <div className='menu_btn music' onClick={this.handlePlayMusicClick}>
            {(this.props.musicState === true ? 'Pause music' : 'Play music')}
          </div>
          <div className='menu_btn fullscreen' onClick={this.handleFullscreenClick}>
            {(this.props.fullscreenState === true ? 'Normal screen' : 'Fullscreen' )}
          </div>
        </div>;

      if (this.state.extraSubMenuVisible === true) {
        extraSubMenu = <SubMenu closeSubMenu={this.closeSubMenu} />;
      }

      menuWrapper = <div className='main_menu_wrapper'>
        {mainMenu}
        <ReactCSSTransitionGroup
          transitionName="slide"
          transitionAppear={true}
          transitionAppearTimeout={500}
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
