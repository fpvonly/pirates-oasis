import PF from 'pathfinding';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import GameObject from './GameObject';
import * as C from '../Constants';

class EnemyShip extends GameObject {

  constructor(context, canvas, width, height, xI, yI, matrixOfMapForWater, getTileCoordinates) {
    let sourceTileCoords = getTileCoordinates(xI, yI);
    super(context, canvas, width, height, sourceTileCoords.tileX - width/2, sourceTileCoords.tileY - height/2, 5);

    this.getTileCoordinates = getTileCoordinates;
    this.targetXScreen = null;
    this.targetYScreen = null;
    this.bg = Sprites.getEnemyShip();
    this.xI = xI;
    this.yI = yI;

    this.matrixOfMapForWater = matrixOfMapForWater;
    this.finder = new PF.AStarFinder({allowDiagonal: true});
    let grid = new PF.Grid(this.matrixOfMapForWater);
// TODO randomize
    this.path = this.finder.findPath(xI, yI, 18, 14, grid);

    this.active = true;
    this.timeout = null;
  }

  draw = () => {

    if (this.destroyed === false) {
      this.steer();
    }

    let shipSprite = this.getEnemyShipSprite();
    this.updateDimensions(shipSprite);
    this.context.drawImage(shipSprite, this.x, this.y, this.width, this.height);
  }

  steer = () => {
    if (Array.isArray(this.path) === true && this.path.length > 0) {

      let tileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
      this.targetXScreen = tileCoords.tileX + MapData.tileDiagonalWidth/2;
      this.targetYScreen = tileCoords.tileY + MapData.tileDiagonalHeight/2;

      if (this.targetXScreen !== null && this.targetYScreen !== null) {

        this.calculateDirectionAngle();

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
          if (Array.isArray(this.path) === true && this.path.length > 0) {
            this.xI = this.path[0][0];
            this.yI = this.path[0][1];
            this.path.shift();
          }
        }
      }
    }

    return true;
  }

  updateDimensions = (shipSprite) => {
    this.width = shipSprite.width;
    this.height = shipSprite.height;
    return this;
  }

  getEnemyShipSprite = () => {
    let angleSprite = this.bg[0];

    if (this.angle >= -42.5 && this.angle <= 42.5) {
      angleSprite = this.bg[0];
    } else if (this.angle > 42.5 && this.angle <= 67.5) {
      angleSprite = this.bg[1];
    } else if (this.angle > 67.5 && this.angle <= 112.5) {
      angleSprite = this.bg[2];
    } else if (this.angle > 112.5 && this.angle <= 157.5) {
      angleSprite = this.bg[3];
    } else if ((this.angle > 157.5 && this.angle <= 180) || (this.angle > -180 && this.angle <= -157.5)) {
      angleSprite = this.bg[4];
    } else if (this.angle > -157.5 && this.angle <= -112.5) {
      angleSprite = this.bg[5];
    } else if (this.angle > -112.5 && this.angle <= -67.5) {
      angleSprite = this.bg[6];
    } else if (this.angle > -67.5 && this.angle <= -42.5) {
      angleSprite = this.bg[7];
    }
    return angleSprite;
  }

  calculateDirectionAngle = () => {
    let wrapperCenter = [this.x + this.width/2, this.y + this.height/2];
    this.angle = Math.atan2(this.targetXScreen - wrapperCenter[0], - (this.targetYScreen - wrapperCenter[1])) * (180/Math.PI);
  }

}

export default EnemyShip;
