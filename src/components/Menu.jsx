import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Toggle from 'react-toggle'

import conf from '../conf.json';
import * as C from './Game/Constants';

class Menu extends React.Component {

  constructor(props) {
    super(props);

    this.extraSubMenu = null;
    this.state = {
      extraSubMenuVisible: false
    };
  }

  static defaultProps = {
    visible: true,
    setGameState: () => {},
    controlMusic: () => {},
    musicState: false
  };

  static propTypes = {
    visible: PropTypes.bool,
    setGameState: PropTypes.func,
    controlMusic: PropTypes.func,
    musicState: PropTypes.bool
  };

  handleNewGameClick = (e) => {
    this.setState({extraSubMenuVisible: false}, () => {
      this.props.setGameState(C.RUN, 'MENU_NEW_GAME_CLICK');
    });
  }

  handleShowExtraClick = () => {
    this.setState({extraSubMenuVisible: !this.state.extraSubMenuVisible});
  }

  handleQuitClick = (e) => {
    window.location.assign('http://' + conf.quit_url);
  }

  handlePlayMusicClick = (e) => {
    this.props.controlMusic();
  }

  handleFullscreenClick = (e) => {
    let appWrapper = document.getElementById('app');
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

  getInfo = () => {
    return <div className='extra_info'>
      <span className='info_title'>Info:</span>
      <div>
        <p>
          e.spaceX is a 2D space shooter. It uses React framework as a base for the app and HTML5 Canvas API for the game itself.
          The game is designed for FullHD-resolution and desktop browsers but it is still responsive for adjusting the game area size.
          The game should work on the newest desktop versions of the modern browsers of major vendors. See more info and project code on GitHub:
        </p>
          <a href={conf.git_url} target='_blank'>Link to GitHub</a>
        <p>
          &copy; {new Date().getFullYear()} Ari Petäjäjärvi
        </p>
      </div>
    </div>;
  }

  render() {
    let mainMenu = null;
    let extraSubMenu = null;

    if (this.props.visible === true) {
      mainMenu = <div className='menu'>
          <div className='menu_btn new_game' onClick={this.handleNewGameClick}><div className='circle'><span>New game</span></div></div>
          <div className='menu_btn extra'><div className='circle' onClick={this.handleShowExtraClick}><span>Extra</span></div></div>
          <div className='menu_btn quit' onClick={this.handleQuitClick}><div className='circle'><span>Quit</span></div></div>
          <div className='menu_btn music' onClick={this.handlePlayMusicClick}>
            {(this.props.musicState === true ? 'Stop music' : 'Play music')}
          </div>
          <div className='menu_btn fullscreen' onClick={this.handleFullscreenClick}>
            {(this.isFullScreenActive() ? 'Normal screen' : 'Full screen' )}
          </div>
        </div>;

      if (this.state.extraSubMenuVisible === true) {
        extraSubMenu = <div ref={(c) => {this.extraSubMenu = c;}} className='extra_sub_menu'>
          <div className='bg' />
          <div className='padding'>
            {this.getInfo()}
          </div>
          <div className='extra_close_btn' onClick={this.handleShowExtraClick}>Close</div>
        </div>;
      }
    }

    return <div className='main_menu_wrapper'>
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
}

export default Menu;
