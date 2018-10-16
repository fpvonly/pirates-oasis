import PF from 'pathfinding';
import {MapData} from './Map/Map_L1.js';
import GameObject from './GameObject';
import Sprites from './Sprite';
import CannonBall from './CannonBall';
import Explosion from './Explosion';
import * as C from '../Constants';



class Player extends GameObject {

  constructor(context, canvas, width, height, x, y, getOriginX, getOriginY, allowedLandMap, getTileCoordinates, getFPS) {

    super(context, canvas, width, height, x - width/2, y - height/2, 5);

    this.getOriginX = getOriginX;
    this.getOriginY = getOriginY;
    this.getFPS = getFPS;

    this.bg = Sprites.getPlayerCannon();
    this.lineWidth = 1;

    this.bullets = [];
    this.then = Date.now(); // previous shoot time frame, for throttling the shooting
    this.thenOutline = Date.now(); // for outline animation
    this.shootFPS = 0.5; // shoot frequency approx 0.5 shots/second at approx 30fps of the game
    this.outlineFPS = 0.5;
    this.allowPlayerMovement = false;

    // current tile indexes
    this.xI = 12;
    this.yI = 11;

    this.targetXScreen = null;
    this.targetYScreen = null;
    this.targetXScreenFinalPos = null;
    this.targetYScreenFinalPos = null;
    this.getTileCoordinates = getTileCoordinates;
    this.shootingStartPoint = {x: this.x, y: this.y};
    this.explosion = null;

    this.angle = null;
    this.path = [];
    this.matrixOfMap = allowedLandMap;
    this.finder = new PF.AStarFinder({allowDiagonal: true});

    this.justFired = false;
    this.cannonBalls = [];

    this.canvas.addEventListener('mousedown', this.handleMouseDown, false);
    window.addEventListener('mouseup', this.handleMouseUp, false);
  }

  steer = () => {
    if (Array.isArray(this.path) === true && this.path.length > 0) {

      let tileCoords = this.getTileCoordinates(this.path[0][0], this.path[0][1]);
      // if there's only one end point of the path left, use the actual coordinates of the clicked map area, instead of general tile position coordinate
      if (this.path.length === 1) {
        this.targetXScreen = this.targetXScreenFinalPos;
        this.targetYScreen = this.targetYScreenFinalPos;
      } else {
        this.targetXScreen = tileCoords.tileX + MapData.tileDiagonalWidth/2;
        this.targetYScreen = tileCoords.tileY + MapData.tileDiagonalHeight/2;
      }

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

  shoot = () => {
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > 1000/this.shootFPS) {
      this.then = this.now - (this.delta % 1000/this.shootFPS);
      this.justFired = true;
      let startPoint = this.calculateShootingStartPoint();
      this.cannonBalls.push(
        new CannonBall(
          this.context,
          this.canvas,
          {x: this.targetXScreenFinalPos, y: this.targetYScreenFinalPos},
          startPoint.x,
          startPoint.y,
          10,
          10,
          this.angle,
          this.getTileCoordinates)
        );
      this.explosion = new Explosion(this.context, this.canvas, startPoint.x, startPoint.y, 40, 40);
    }
    return false;
  }

  handleMouseDown = (e) => {
    // global screen coordinates on the map
    this.targetXScreen = Math.floor(e.pageX - this.canvas.getBoundingClientRect().left - this.getOriginX());
    this.targetYScreen = Math.floor(e.pageY - this.canvas.getBoundingClientRect().top - this.getOriginY());
    this.targetXScreenFinalPos = this.targetXScreen;
    this.targetYScreenFinalPos = this.targetYScreen;

    // The actual x,y coordinates (i.e. order numbers) of the map tile (not screen coordinates)
    let selectedXScreen = e.pageX;
    let selectedYScreen = e.pageY;
    selectedXScreen = selectedXScreen - this.getOriginX() - MapData.tileDiagonalWidth/2 - this.canvas.getBoundingClientRect().left;
    selectedYScreen = selectedYScreen - this.getOriginY() - MapData.tileDiagonalHeight/2 -  this.canvas.getBoundingClientRect().top;
    let selectedXTileI = Math.round(selectedXScreen / MapData.tileDiagonalWidth - selectedYScreen / MapData.tileDiagonalHeight);
    let selectedYTileI = Math.round(selectedXScreen / MapData.tileDiagonalWidth + selectedYScreen / MapData.tileDiagonalHeight);

    // if clicked area is within the actual maptiles
    if (selectedXTileI >= 0 && selectedXTileI < MapData.cols && selectedYTileI >= 0 && selectedYTileI < MapData.rows) {
      //  if clicked tile was water -> shoot cannon
      if (MapData.allowedTilesOnWater.indexOf(MapData.map[selectedXTileI][selectedYTileI]) !== -1 && this.justFired === false) {
        this.calculateDirectionAngle();
        this.justFired = this.shoot();
      }

      // find out the route path to clicked location
      let grid = new PF.Grid(this.matrixOfMap);
      this.path = this.finder.findPath(this.xI, this.yI, selectedXTileI, selectedYTileI, grid);
      // remove the first index because it's the current tile the player in on already
      // is only one tile is on the path ie. the current position tile, allow it be for more accurate placement of player cannon on the same tile
      if (this.path.length > 1) {
        this.path.shift();
      }
    }
  }

  handleMouseUp = (e) => {

  }

  draw = () => {
    // move pixels and shoot new ammo per this current frame
    if (this.destroyed === false && isNaN(this.x) === false && isNaN(this.y) === false) {
      this.steer();
    }

    // draw ship bg
    this.context.drawImage(this.getPlayerCannonSprite(), this.x, this.y, this.width, this.height);

    // draw outline
    let color = '#fff';
    let h = 50;
    let w = 100;
    let x = this.x - w/2 + this.width/2;
    let y = this.y - h/2 + this.height/2;
    this.nowOutline = Date.now();
    this.deltaOutline = this.nowOutline - this.thenOutline;
    if (this.deltaOutline > 1000/this.outlineFPS) {
      this.thenOutline = this.nowOutline - (this.nowOutline % 1000/this.outlineFPS);
      this.lineWidth = (this.lineWidth < 2 ? this.lineWidth + 1 : 1);
    }
    this.drawOutline(x , y + h / 2, x + w / 2, y, color, this.lineWidth);
    this.drawOutline(x + w / 2, y, x + w, y + h / 2, color, this.lineWidth);
    this.drawOutline(x + w, y + h / 2, x + w / 2, y + h, color, this.lineWidth);
    this.drawOutline(x + w / 2, y + h, x, y + h / 2, color, this.lineWidth);

    // draw cannon shooting explosion
    if (this.explosion !== null) {
      this.explosion.draw(); // explosion must be drawn here, outside of CannonBall object, because of drawing order (z-layers)
    }

    return true;
  }

  drawOutline = (x1, y1, x2, y2, color, lineWidth = 1) => {
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.lineWidth = lineWidth;
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
    this.context.closePath();
  }

  drawCannonBalls = () => {
    // draw old and newly shot ammo
    this.cannonBalls = this.getActiveCannonBalls();
    for (let cannonBall of this.cannonBalls) {
      let done = cannonBall.draw();
    }

    return true;
  }

  getActiveCannonBalls = () => {
    for (let i = this.cannonBalls.length - 1; i >= 0; i--) {
      if (this.cannonBalls[i].active === false) {
        this.cannonBalls.splice(i, 1);
      }
    }
    return this.cannonBalls;
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

  calculateDirectionAngle = () => {
    let wrapperCenter = [this.x + this.width/2, this.y + this.height/2];
    this.angle = Math.atan2(this.targetXScreen - wrapperCenter[0], - (this.targetYScreen - wrapperCenter[1])) * (180/Math.PI);
  }

  calculateShootingStartPoint = () => {
    if (this.angle >= -42.5 && this.angle <= 42.5) {
      this.shootingStartPoint = {x: this.x + this.width/2, y: this.y};
    } else if (this.angle > 42.5 && this.angle <= 67.5) {
      this.shootingStartPoint = {x: this.x + this.width, y: this.y};
    } else if (this.angle > 67.5 && this.angle <= 112.5) {
      this.shootingStartPoint = {x: this.x + this.width, y: this.y + this.height/2};
    } else if (this.angle > 112.5 && this.angle <= 157.5) {
      this.shootingStartPoint = {x: this.x + this.width, y: this.y + this.height};
    } else if ((this.angle > 157.5 && this.angle <= 180) || (this.angle > -180 && this.angle <= -157.5)) {
      this.shootingStartPoint = {x: this.x + this.width/2, y: this.y + this.height};
    } else if (this.angle > -157.5 && this.angle <= -112.5) {
      this.shootingStartPoint = {x: this.x, y: this.y + this.height};
    } else if (this.angle > -112.5 && this.angle <= -67.5) {
      this.shootingStartPoint = {x: this.x, y: this.y + this.height/2};
    } else if (this.angle > -67.5 && this.angle <= -42.5) {
      this.shootingStartPoint = {x: this.x, y: this.y};
    }

    return this.shootingStartPoint;
  }

}

export default Player;
