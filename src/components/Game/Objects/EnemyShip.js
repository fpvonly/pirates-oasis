import PF from 'pathfinding';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import GameObject from './GameObject';
import * as C from '../Constants';

class EnemyShip extends GameObject {

  constructor(context, canvas, width, height, xI, yI, matrixOfMapForWater, matrixOfMapForWaterXY, getTileCoordinates) {
    let sourceTileCoords = getTileCoordinates(xI, yI);
    super(context, canvas, width, height, sourceTileCoords.tileX - width/2, sourceTileCoords.tileY - height/2, 5);

    this.getTileCoordinates = getTileCoordinates;
    this.bg = Sprites.getEnemyShip();
    this.xI = xI;
    this.yI = yI;

    this.matrixOfMapForWater = matrixOfMapForWater;
    this.finder = new PF.AStarFinder({allowDiagonal: true, dontCrossCorners: true});
    let grid = new PF.Grid(this.matrixOfMapForWater);
    let target = MapData.enemyWinTargetPositions[this.getRndInteger(0, 2)];

console.log('target',target);
    this.path = this.finder.findPath(xI, yI, target[0], target[1], grid);
    console.log('path', this.path);
    this.targetTileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
    this.targetXScreen = this.targetTileCoords.tileX + MapData.tileDiagonalWidth/2;
    this.targetYScreen = this.targetTileCoords.tileY + MapData.tileDiagonalHeight/2;
    this.angle = this.calculateDirectionAngle();
    this.newAngleSpriteIndex = 0;

    this.active = true;
    this.timeout = null;
  }

  draw = () => {
    if (this.destroyed === false) {
      let shipSprite = this.getEnemyShipSprite();
      let done = this.steer();
      this.context.drawImage(shipSprite, this.x, this.y, this.width, this.height);
    }
  }

  steer = () => {
    if (Array.isArray(this.path) === true && this.path.length > 0) {

      this.targetTileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
      this.targetXScreen = this.targetTileCoords.tileX + MapData.tileDiagonalWidth/2;
      this.targetYScreen = this.targetTileCoords.tileY + MapData.tileDiagonalHeight/2;

      if (this.targetXScreen !== null && this.targetYScreen !== null) {
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
            if (this.path.length > 0) {
              this.targetTileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
              this.targetXScreen = this.targetTileCoords.tileX + MapData.tileDiagonalWidth/2;
              this.targetYScreen = this.targetTileCoords.tileY + MapData.tileDiagonalHeight/2;
              let done = this.calculateDirectionAngle();
            }
          }
        }
      }
    }

    return true;
  }

  getEnemyShipSprite = () => {
    let newAngleSprite = this.bg[0];
    let newAngleSpriteIndex = 0;

    if (this.angle >= -42.5 && this.angle <= 42.5) {
      newAngleSprite = this.bg[0];
      newAngleSpriteIndex = 0;
    } else if (this.angle > 42.5 && this.angle <= 67.5) {
      newAngleSprite = this.bg[1];
      newAngleSpriteIndex = 1;
    } else if (this.angle > 67.5 && this.angle <= 112.5) {
      newAngleSprite = this.bg[2];
      newAngleSpriteIndex = 2;
    } else if (this.angle > 112.5 && this.angle <= 157.5) {
      newAngleSprite = this.bg[3];
      newAngleSpriteIndex = 3;
    } else if ((this.angle > 157.5 && this.angle <= 180) || (this.angle > -180 && this.angle <= -157.5)) {
      newAngleSprite = this.bg[4];
      newAngleSpriteIndex = 4;
    } else if (this.angle > -157.5 && this.angle <= -112.5) {
      newAngleSprite = this.bg[5];
      newAngleSpriteIndex = 5;
    } else if (this.angle > -112.5 && this.angle <= -67.5) {
      newAngleSprite = this.bg[6];
      newAngleSpriteIndex = 6;
    } else if (this.angle > -67.5 && this.angle <= -42.5) {
      newAngleSprite = this.bg[7];
      newAngleSpriteIndex = 7;
    }

    if (this.newAngleSpriteIndex !== newAngleSpriteIndex) {
      this.newAngleSpriteIndex = newAngleSpriteIndex;
      this.width = newAngleSprite.width;
      this.height = newAngleSprite.height;
      //  this.x = this.x - newAngleSprite.width/2;
      //  this.y = this.y - newAngleSprite.height/2;

      //console.log('this.angle', this.angle);
    }

    return newAngleSprite;
  }

  calculateDirectionAngle = () => {
    let wrapperCenter = [this.x + this.width/2, this.y + this.height/2];
    this.angle = Math.atan2(this.targetXScreen - wrapperCenter[0], - (this.targetYScreen - wrapperCenter[1])) * (180/Math.PI);

    return this.angle;
  }

}

export default EnemyShip;
