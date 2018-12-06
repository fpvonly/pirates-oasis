import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import GameObject from './GameObject';

class Parrot extends GameObject {

  constructor(context, canvas, width, height, xI, yI, getTileCoordinates) {
    let sourceTileCoords = getTileCoordinates(xI, yI);
    super(context, canvas, width, height, sourceTileCoords.tileX - width/2, sourceTileCoords.tileY - height/2, 4);

    this.getTileCoordinates = getTileCoordinates;
    this.targetXScreen = null;
    this.targetYScreen = null;
    this.bg = Sprites.getParrotFlying();
    this.targetTileCoords = getTileCoordinates(23, yI + 5);
    this.toLeftOrRight = 1;
    this.active = true;
    this.timeout = null;
  }

  draw = () => {
    this.targetXScreen = this.targetTileCoords.tileX + MapData.tileDiagonalWidth*2;
    this.targetYScreen = this.targetTileCoords.tileY + MapData.tileDiagonalHeight/2;
    let tx = this.targetXScreen - this.x - this.width/2 - (this.toLeftOrRight === -1 ? 400 : 0);
    let ty = this.targetYScreen - this.y - this.height/2;
    let dist = Math.sqrt(tx * tx + ty * ty);

    if (dist >= this.speed && this.active === true) {

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
      this.context.drawImage(this.bg, this.x, this.y, this.width, this.height);
    } else {
      this.active = (this.active === true) ? false : true;
      if (this.active === false && this.timeout === null) {
        this.timeout = setTimeout(() => {
          this.toLeftOrRight = -1 * this.toLeftOrRight;

          if (this.toLeftOrRight === -1) { // fly to left
            let sx = Math.floor(Math.random()*15);
            let sourceTileCoords = this.getTileCoordinates(sx, 23);
            this.targetTileCoords = this.getTileCoordinates((sx >= 5 ? sx - 5 : 5), 0);
            this.moveToX(sourceTileCoords.tileX);
            this.moveToY(sourceTileCoords.tileY);
            this.bg = Sprites.getparrotFlyingLeft();
          } else { // fly to right
            let sy = Math.floor(Math.random()*15);
            let sourceTileCoords = this.getTileCoordinates(0, sy);
            this.targetTileCoords = this.getTileCoordinates(23, (sy >= 5 ? sy - 5 : sy));
            this.moveToX(sourceTileCoords.tileX);
            this.moveToY(sourceTileCoords.tileY);
            this.bg = Sprites.getParrotFlying();
          }
          this.active = true;
          this.timeout = null;

        }, 3000);
      }
    }

    return true;
  }

}

export default Parrot;
