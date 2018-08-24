import PF from 'pathfinding';

import {MapData} from './Map/Map_L1.js';
import GameObject from './GameObject';
import Sprites from './Sprite';
//import Bullet from './Bullet';
//import Explosion from './Explosion';
import * as C from '../Constants';

class Player extends GameObject {

  constructor(context, canvas, width, height, x, y, getOriginX, getOriginY, allowedTilesOnLandMap, getTargetTileCoordinates) {

    super(context, canvas, width, height, x, y);

    this.getOriginX = getOriginX;
    this.getOriginY = getOriginY;

    this.bg = Sprites.getPlayerCannon();

    //this.shipBg = Sprites.getPlayerShipSprite();
  /*  this.explosions = [
      new Explosion(this.context, this.canvas),
      new Explosion(this.context, this.canvas),
      new Explosion(this.context, this.canvas),
    ];*/
    this.bullets = [];
    this.then = Date.now(); // previous shoot time frame, for throttling the shooting
    this.shootFPS = 12; // shoot approx 12 shots/second at approx 60fps of the game
    this.allowPlayerMovement = false;

    this.targetXScreen = null;
    this.targetYScreen = null;

    this.allowedTilesOnLandMap = allowedTilesOnLandMap;
    this.getTargetTileCoordinates = getTargetTileCoordinates;

    this.path = [];

    window.addEventListener('mousedown', this.handleMouseDown, false);
    window.addEventListener('mouseup', this.handleMouseUp, false);

  }

  shoot = () => {
    /*this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > 1000/this.shootFPS) {
      this.then = this.now - (this.delta % 1000/this.shootFPS);
      let bulletX = this.x;
      let bulletY = this.y;
      let bullet = new Bullet(this.context, this.canvas, (bulletX + this.width/2 - 5), bulletY);
      this.bullets.push(bullet);
    }*/
  }

  steer = () => {
    if (Array.isArray(this.path) === true && this.path.length > 0) {
      let tileCoords = this.getTargetTileCoordinates(this.path[0][0], this.path[0][1]);
  // TODO: movement logic and path updating works but wrong coordinates...
  console.log('tileCoords', tileCoords);

      this.targetXScreen = tileCoords.tileX;
      this.targetYScreen = tileCoords.tileY;

      if (this.targetXScreen !== null && this.targetYScreen !== null) {
        let dist = 0;

        if (this.targetXScreen < this.x) {
          dist = (this.x - this.targetXScreen < 10 ? this.x - this.targetXScreen : 10);
          this.moveLeft(dist);
        } else {
          dist = (this.targetXScreen - this.x < 10 ? this.targetXScreen - this.x : 10);
          this.moveRight(dist);
        }

        if (this.targetYScreen < this.y) {
          dist = (this.y - this.targetYScreen < 10 ? this.y - this.targetYScreen : 10);
          this.moveUp(dist);
        } else {
          dist = (this.targetYScreen - this.y < 10 ? this.targetYScreen - this.y : 10);
          this.moveDown(dist);
        }
      }

      if (this.targetXScreen === this.x && this.targetYScreen === this.y) {
        this.path.shift();
      }
      console.log('this.path', this.path);
      console.log('this.targetXScreen', this.targetXScreen);
    }

    return true;
  }

  handleMouseDown = (e) => {

    // global screen coordinates and angle on the map
    this.targetXScreen = Math.floor(e.pageX - this.canvas.getBoundingClientRect().left - this.getOriginX());
    this.targetYScreen = Math.floor(e.pageY - this.canvas.getBoundingClientRect().top - this.getOriginY());
    let wrapperCenter = [this.x + this.width/2, this.y + this.height/2];
    this.angle = Math.atan2(this.targetXScreen - wrapperCenter[0], - (this.targetYScreen - wrapperCenter[1])) * (180/Math.PI);

    // The actual x,y coordinates (i.e. order numbers) of the map tile (not screen coordinates)
    let selectedXScreen = e.pageX;
    let selectedYScreen = e.pageY;
    selectedXScreen = selectedXScreen - this.getOriginX() - MapData.tileDiagonalWidth/2 - this.canvas.getBoundingClientRect().left;
    selectedYScreen = selectedYScreen - this.getOriginY() - MapData.tileDiagonalHeight/2 -  this.canvas.getBoundingClientRect().top;
    let selectedXTile = Math.round(selectedXScreen / MapData.tileDiagonalWidth - selectedYScreen / MapData.tileDiagonalHeight);
    let selectedYTile = Math.round(selectedXScreen / MapData.tileDiagonalWidth + selectedYScreen / MapData.tileDiagonalHeight);

    let matrixOfMap = this.allowedTilesOnLandMap;
    let grid = new PF.Grid(matrixOfMap);
    let finder = new PF.AStarFinder({allowDiagonal: true});
    this.path = finder.findPath(8, 7, selectedXTile, selectedYTile, grid);

    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log('coord', selectedXTile, ', ', selectedYTile);
      console.log('grid', grid);
      //console.log('path', this.path);
      //console.log('targetX', this.targetXScreen, 'centerx', this.x + this.width/2);
      //console.log('angle', this.angle);
    }

  }

  handleMouseUp = (e) => {

  }

  getPlayerCannonSprite = () => {
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

  draw = () => {
    // move pixels and shoot new ammo per this current frame
    if (this.destroyed === false) {
      this.steer();
    }
    // draw old and newly shot ammo
  /*for (let bullet of this.bullets) {
      if (bullet.active === true) {
        bullet.draw();
      }
    }*/
    // draw ship bg
    this.context.drawImage(this.getPlayerCannonSprite(), this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    // if ship was destroyed, play three complete explosion animations
    /*if (this.destroyed === true && this.explosions.length > 0) {
      this.explosions[0].moveToX(this.x + (this.explosions.length === 2 ? 30 : (this.explosions.length * 15)));
      this.explosions[0].moveToY(this.y + this.height/2 - (this.explosions.length === 2 ? -50 : (this.explosions.length * 15)));
      this.explosions[0].draw();
      this.explosions[0].playSound();
      if (this.explosions[0].isExplosionAnimationComplete() === true) {
        this.explosions.shift();
      }
    }*/
    return true;
  }

  getActiveBullets = () => {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].active === false) {
        this.bullets.splice(i, 1);
      }
    }
    return this.bullets;
  }

  isExplosionAnimationComplete = () => {
    //return (this.explosions.length > 0 ? false : true);
  }

}

export default Player;
