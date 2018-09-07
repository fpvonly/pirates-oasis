import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import GameObject from './GameObject';

class Parrot extends GameObject {

  constructor(context, canvas, width, height, x, y, getTargetTileCoordinates) {
    super(context, canvas, width, height, x - width/2, y - height/2, 10);
    this.getTargetTileCoordinates = getTargetTileCoordinates;
    this.targetXScreen = null;
    this.targetYScreen = null;
    this.bg = Sprites.getParrotFlying();
  }

  draw = () => {
    // TODO remove hard coding
    let tileCoords = this.getTargetTileCoordinates(23,17);
    this.targetXScreen = tileCoords.tileX + MapData.tileDiagonalWidth*2;
    this.targetYScreen = tileCoords.tileY + MapData.tileDiagonalHeight/2;
    let tx = this.targetXScreen - this.x - this.width/2;
    let ty = this.targetYScreen - this.y - this.height/2;
    let dist = Math.sqrt(tx * tx + ty * ty);

    if (dist >= this.speed) {
      let velX = (tx / dist) * this.speed;
      let velY = (ty / dist) * this.speed;

      if (velX < 0) {
        this.moveLeft(Math.abs(velX));
      } else {
        this.moveRight(Math.abs(velX));
      }

      if (velY < 0) {
        this.moveUp(Math.abs(velY));
      } else {
        this.moveDown(Math.abs(velY));
      }
    } else {
      this.resetXY(); // reset to original
    }

    this.context.drawImage(this.bg, this.x, this.y, this.width, this.height);
  }

}

export default Parrot;
