import PF from 'pathfinding';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import Sounds from './Sound';
import GameObject from './GameObject';
import * as C from '../Constants';

class EnemyShip extends GameObject {

  constructor(context, canvas, width, height, matrixOfMapForWater, matrixOfMapForWaterXY, getTileCoordinates, gameOver) {

    super(context, canvas, width, height, 0, 0, 5);

    this.getTileCoordinates = getTileCoordinates;
    this.gameOver = gameOver;
    this.bg = Sprites.getEnemyShip();
    this.matrixOfMapForWater = matrixOfMapForWater;
    this.reset();

    this.active = true;
    this.timeout = null;
  }

  draw = () => {
    if (this.destroyed === false) {
      let shipSprite = this.getEnemyShipSprite();
      let done = this.steer();
      this.context.drawImage(shipSprite, this.x, this.y, this.width, this.height);
    } else {
      this.playDestructionAnim();
    }
  }

  playDestructionAnim = () => {
    let shipSprite = this.getEnemyShipSprite();
    let hIncrement = this.height/30;
    this.context.drawImage(shipSprite, 0, 0, this.width, hIncrement*(30 - this.destructionAnimFrame), this.x, this.y + (hIncrement*this.destructionAnimFrame), this.width, hIncrement*(30 - this.destructionAnimFrame));

    if (this.destructionAnimFrame === 1) {
      Sounds.playCrashSound();
    }
    this.destructionAnimFrame++;
    if (this.destructionAnimFrame > 30 && this.active === true) {
      this.reset();
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
            } else {
              this.gameOver(); // enemy reached the target tower destination
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

  reset = () => {
    let mapSide = this.getRndMapSide();
    this.removeEnemyWarnings();

    if (mapSide === 'top') {
      this.xI = this.getRndInteger(0, 18);
      this.yI = 0;
      if (this.xI <= 12) {
        this.canvas.classList.add('warning_shadow_left');
      } else {
        this.canvas.classList.add('warning_shadow_top');
      }
    } else if (mapSide === 'bottom') {
      this.xI = this.getRndInteger(0, 16);
      this.yI = 23;
      if (this.xI <= 12) {
        this.canvas.classList.add('warning_shadow_bottom');
      } else {
        this.canvas.classList.add('warning_shadow_right');
      }
    } else if (mapSide === 'left') {
      this.xI = 0;
      this.yI = this.getRndInteger(0, 23);
      if (this.yI <= 12) {
        this.canvas.classList.add('warning_shadow_left');
      } else {
        this.canvas.classList.add('warning_shadow_bottom');
      }
    } else if (mapSide === 'right') {
      this.xI = 23;
      this.yI = this.getRndInteger(5, 23);
      if (this.yI <= 12) {
        this.canvas.classList.add('warning_shadow_top');
      } else {
        this.canvas.classList.add('warning_shadow_right');
      }
    }
    this.warningTimeout = setTimeout(() => {
      this.removeEnemyWarnings();
    }, 3000);


    let sourceTileCoords =this. getTileCoordinates(this.xI, this.yI);
    this.x = sourceTileCoords.tileX - this.width/2;
    this.y = sourceTileCoords.tileY - this.height/2;

    this.finder = new PF.AStarFinder({allowDiagonal: false, dontCrossCorners: true});
    let grid = new PF.Grid(this.matrixOfMapForWater);
    let target = MapData.enemyWinTargetPositions[this.getRndInteger(0, 2)];
    this.path = this.finder.findPath(this.xI, this.yI, target[0], target[1], grid);
    this.targetTileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
    this.targetXScreen = this.targetTileCoords.tileX + MapData.tileDiagonalWidth/2;
    this.targetYScreen = this.targetTileCoords.tileY + MapData.tileDiagonalHeight/2;
    this.angle = this.calculateDirectionAngle();
    this.newAngleSpriteIndex = 0;

    this.destroyed = false;
    this.destructionAnimFrame = 1;
  }

  removeEnemyWarnings = () => {
    this.canvas.classList.remove('warning_shadow_right');
    this.canvas.classList.remove('warning_shadow_left');
    this.canvas.classList.remove('warning_shadow_bottom');
    this.canvas.classList.remove('warning_shadow_top');
  }

  getRndMapSide = () => {
    let rnd = this.getRndInteger(1, 4);
    let mapSide = 'top';

    switch (rnd) {
      case 1:
        mapSide = 'top';
        break;
      case 2:
        mapSide = 'right';
        break;
      case 3:
        mapSide = 'bottom';
        break;
      case 4:
        mapSide = 'left';
        break;
    }

    return mapSide;
  }

}

export default EnemyShip;
