import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js'

class Sprite {

  static explosionSpriteAnimFrames = [];
  static playercannon = null;
  static tiles = [];

  static initializeStaticClass() {
    // explosion animation frames
    /*for (let i = 1; i <= 13; i++) {
      let explosionBg = new Image();
      explosionBg.src = 'assets/images/explosions/' + i + '.png';
      Sprite.explosionSpriteAnimFrames.push(explosionBg);
    }*/

    for (let tile of MapData.tiles) {
      let tileBg = new Image();
      tileBg.src = tile.src;
      tileBg.width = tile.width;
      tileBg.height = tile.height;      
      Sprite.tiles.push(tileBg);
    }

    // player cannon sprite
    let cannon = new Image();
    cannon.src = 'assets/images/player/cannon/cannonMobile_NE.png';
    Sprite.playercannon = cannon;
  }

  static getLoadingStatusInfo = () => {
    let all = 0;
    let loaded = 0;

    /*for (let frame of Sprite.explosionSpriteAnimFrames) {
      all++;
      if (frame.complete === true) {
        loaded++;
      }
    }*/


    return 'Images: ' + Math.floor((loaded/all)*100) + '%';
  }

  static spritesLoaded = () => {
    let loaded = true;

    /*for (let frame of Sprite.explosionSpriteAnimFrames) {
      if (frame.complete === false) {
        loaded = false;
      }
    }*/
    if (Sprite.playercannon.complete === false) {
      loaded = false;
    }

    return loaded;
  }

  static getTile = (index) => {
    return Sprite.tiles[index];
  }

  static getPlayerCannon = () => {
    return Sprite.playercannon;
  }

}
Sprite.initializeStaticClass();

export default Sprite;
