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
      loadingSoundsStatusInfoText: Sounds.getLoadingStatusInfo(),
      loadingSpritesStatusInfoText: Sprites.getLoadingStatusInfo(),
      GAME_STATE: C.STOP
    }

    this.loadingInterval = null;
    this.loadingIntervalCount = 0;
  }

  componentDidMount() {
    this.loadingInterval = setInterval(() => {

      let soundAssetsLoadInfo = Sounds.getLoadingStatusInfo();
      let spriteAssetsLoadInfo = Sprites.getLoadingStatusInfo();

      if ((Sounds.soundsLoaded() === true && Sprites.spritesLoaded() === true && this.loadingIntervalCount >= 3) || this.loadingIntervalCount === 20) {
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

  setGameState = (state = C.STOP, info = '') => {
    this.setState({GAME_STATE: state});
  }

  render() {
    if (window.localStorage) {
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
                : <div className={'container' + (this.state.GAME_STATE === C.RUN ? ' game_is_running' : '')}>
                    <Game
                      gameState={this.state.GAME_STATE}
                      setGameState={this.setGameState} />
                    <TitleBanner gameState={this.state.GAME_STATE} />
                    <Menu
                      visible={(this.state.GAME_STATE !== C.RUN ? true : false)}
                      setGameState={this.setGameState} />
                </div>;
    } else {
      return <div className='update_message'>This game needs LocalStorage functionality to work properly. Please update your browser.</div>
    }
  }
}

export default UI;
