import React from 'react';
import {render} from 'react-dom';

import Sounds from './Game/Objects/Sound'; // preload sound pool
import Sprites from './Game/Objects/Sprite'; // preload sprites
import * as C from './Game/Constants';
import Game from './Game/Game.jsx';
import Menu from './Menu.jsx';
import TitleBanner from './TitleBanner.jsx';

class UI extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isHydrating: true,
      loadingSoundsStatusInfoText: '',
      loadingSpritesStatusInfoText: '',
      GAME_STATE: C.STOP,
      musicState: this.getmusicStateFromStorage(),
      fullscreenState: false
    }

    this.loadingInterval = null;
    this.loadingIntervalCount = 0;
  }

  componentWillMount() {
    let soundAssetsLoadInfo = Sounds.getLoadingStatusInfo();
    let spriteAssetsLoadInfo = Sprites.getLoadingStatusInfo();
    this.setState({
      loadingSoundsStatusInfoText: soundAssetsLoadInfo,
      loadingSpritesStatusInfoText: spriteAssetsLoadInfo
    });
  }

  componentDidMount() {
    this.loadingInterval = setInterval(() => {

      let soundAssetsLoadInfo = Sounds.getLoadingStatusInfo();
      let spriteAssetsLoadInfo = Sprites.getLoadingStatusInfo();

      if ((Sounds.soundsLoaded() === true && Sprites.spritesLoaded() === true && this.loadingIntervalCount >= 2) || this.loadingIntervalCount === 20) {
        this.setState({
          loadingSoundsStatusInfoText: soundAssetsLoadInfo,
          loadingSpritesStatusInfoText: spriteAssetsLoadInfo
        }, () => {
          this.setState({
            isHydrating: false,
            GAME_STATE: C.STOP
          });
          this.loadingIntervalCount = 0;
          clearInterval(this.loadingInterval);
        });
      } else {
        this.setState({
          loadingSoundsStatusInfoText: soundAssetsLoadInfo,
          loadingSpritesStatusInfoText: spriteAssetsLoadInfo
        });
      }
      this.loadingIntervalCount++;
    }, 1000);
  }

  componentDidUpdate() {
    if(this.state.isHydrating === false && this.state.musicState === true) {
      Sounds.playMusic();
    }
  }

  setGameState = (state = C.STOP, info = '') => {
    this.setState({GAME_STATE: state});
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
      localStorage.setItem('playMusic', value);
    }

    this.setState({musicState: value});
  }

  getmusicStateFromStorage = () => {
    let value = true;
    if (window.localStorage) {
      value = localStorage.getItem('playMusic');
    }
    return (value && value !== null ? (value == 'true') : false);
  }

  setExitFullscreenState = (val = false) => {
    this.setState({fullscreenState: val});
  }


  render() {
    return (this.state.isHydrating === true)
              ? <div className={'loading '}>
                  <div className='loading-anim' />
                  <div className='loader_text'>
                    <span>Loading game files...</span>
                    <span className='sounds_loaded'>
                      {this.state.loadingSoundsStatusInfoText}
                    </span>
                    <span className='sprites_loaded'>
                      {this.state.loadingSpritesStatusInfoText}
                    </span>
                  </div>
                </div>
              : <div>
                  <Game
                    gameState={this.state.GAME_STATE}
                    setGameState={this.setGameState} />
                  <Menu
                    visible={(this.state.GAME_STATE !== C.RUN ? true : false)}
                    setGameState={this.setGameState}
                    controlMusic={this.controlMusic}
                    musicState={this.state.musicState}
                    fullscreenState={this.state.fullscreenState}
                    setExitFullscreenState={this.setExitFullscreenState}
                    updateBGCallback={this.updateBGCallback} />
                  <TitleBanner gameState={this.state.GAME_STATE} />
              </div>

  }
}

export default UI;
