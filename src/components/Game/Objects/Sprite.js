import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js'

class Sprite {

  static explosionSpriteAnimFrames = [];
  static playerCannon = [];
  static tiles = [];
  static parrotFlying = new Image();

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
    let cannonSpriteSources = [
      'assets/images/player/cannon/cannonMobile_N.png',
      'assets/images/player/cannon/cannonMobile_NE.png',
      'assets/images/player/cannon/cannonMobile_E.png',
      'assets/images/player/cannon/cannonMobile_SE.png',
      'assets/images/player/cannon/cannonMobile_S.png',
      'assets/images/player/cannon/cannonMobile_SW.png',
      'assets/images/player/cannon/cannonMobile_W.png',
      'assets/images/player/cannon/cannonMobile_NW.png'
    ];
    for (let src of cannonSpriteSources) {
      let cannon = new Image();
      cannon.src = src;
      Sprite.playerCannon.push(cannon);
    }
    Sprite.parrotFlying.src = 'assets/images/kisspng/parrot-flying-small.png'
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
    }
    if (Sprite.playerCannon.complete === false) {
      loaded = false;
    }*/

    return loaded;
  }

  static getTile = (index) => {
    return Sprite.tiles[index];
  }

  static getPlayerCannon = () => {
    return Sprite.playerCannon;
  }

  static getParrotFlying = () => {
    return Sprite.parrotFlying;
  }

}
Sprite.initializeStaticClass();

export default Sprite;
