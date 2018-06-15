import GameObject from './GameObject';
import Sprites from './Sprite';
//import Bullet from './Bullet';
//import Explosion from './Explosion';
import * as C from '../Constants';

class Player extends GameObject {

  constructor(context, canvas, width, height, x, y, getOriginX, getOriginY) {

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


    this.targetX = null;
    this.targetY = null;

    if (!("ontouchstart" in document.documentElement)) {
      this.mouseTimer = null;
      window.addEventListener('mousemove', this.handleMouseMove, false);
      window.addEventListener('mousedown', this.handleMouseDown, false);
      window.addEventListener('mouseup', this.handleMouseUp, false);
    } else {
    //  this.canvas.addEventListener('touchmove', this.handleTouchMove, false);
    //  this.canvas.addEventListener('touchend', this.handleTouchEnd, false);
    }
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
    if (this.targetX !== null && this.targetY !== null) {
      let dist = 0;

      if (this.targetX < this.x) {
        dist = (this.x - this.targetX < 10 ? this.x - this.targetX : 10);
        this.moveLeft(dist);
      } else {
        dist = (this.targetX - this.x < 10 ? this.targetX - this.x : 10);
        this.moveRight(dist);
      }

      if (this.targetY < this.y) {
        dist = (this.y - this.targetY < 10 ? this.y - this.targetY : 10);
        this.moveUp(dist);
      } else {
        dist = (this.targetY - this.y < 10 ? this.targetY - this.y : 10);
        this.moveDown(dist);
      }
    } else {
      this.targetX = null;
      this.targetY = null;
    }

    return true;
  }

  handleMouseMove = (e) => {
    clearTimeout(this.mouseTimer);

  }

  handleMouseStop = (e) => {

  }

  handleMouseDown = (e) => {
    this.targetX = Math.floor(e.pageX - this.canvas.getBoundingClientRect().left - this.getOriginX());
    this.targetY = Math.floor(e.pageY - this.canvas.getBoundingClientRect().top - this.getOriginY());

    let wrapperCenter = [this.x + this.width/2, this.y + this.height/2];
    this.angle = Math.atan2(this.targetX - wrapperCenter[0], - (this.targetY - wrapperCenter[1])) * (180/Math.PI);
    console.log('targetX', this.targetX, 'centerx', this.x + this.width/2);
    console.log('angle', this.angle);

  }

  handleMouseUp = (e) => {

  }

  handleTouchMove = (e) => {
    e.preventDefault();

  }

  handleTouchEnd = (e) => {

  }

  handleTouchShoot = (shoot = false) => {

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
