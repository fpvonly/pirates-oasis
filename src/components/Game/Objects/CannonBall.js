import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import Splash from './Splash';
import GameObject from './GameObject';

import {TweenLite, TimelineMax} from '../lib/greensock-js/src/esm/all';

class CannonBall extends GameObject {

  constructor(context, canvas, target, x, y, width = 0, height = 0, getTileCoordinates) {
    super(context, canvas, width, height, x - width/2, y - height/2, 10);

    this.getTileCoordinates = getTileCoordinates;
    this.bg = Sprites.getCannonBall();
    this.splash = new Splash(context, canvas, target.x, target.y, 40, 40);
    this.playSplash = false;


    this.target = {x: target.x - width/2, y: target.y - height/2};
    this.p0 = {
      x: this.x,
      y: this.y
    };
    this.p1 = {
      x: this.target.x - (this.target.x - this.x) * 0.66,
      y: this.y - Math.abs(this.x - this.target.x)/2
    };
    this.p2 = {
      x: this.target.x - (this.target.x - this.x) * 0.33,
      y: this.y - Math.abs(this.x - this.target.x)/2
    };
    this.p3 = {
      x: this.target.x,
      y: this.target.y
    };
    this.bezier = { values: [this.p0, this.p1, this.p2, this.p3], type: "cubic" };
    let targetDist = this.calculateBallDistance(this.target.x, this.target.y);
    this.animationSeconds = targetDist/250; // 250pxs per second

    TweenLite.ticker.fps(30);
    this.tl = new TimelineMax();
    this.active = true;
  }

  draw = () => {
    if (this.active === true) {

      let progress = this.tl.progress() || 0;
      this.tl.progress(0)
        .clear()
        .to(this.target, this.animationSeconds, { bezier: this.bezier, ease: "linear", onComplete: () => { this.playSplash = true; }})
        .progress(progress);

      if (progress > 0 && this.playSplash === false) {
        this.context.drawImage(this.bg, this.target.x, this.target.y, this.width, this.height);
      }

      if (this.playSplash === true) {
        this.splash.draw();
        if (this.splash.isSplashAnimationComplete() === true) {
          this.active = false;
        }
      }


      /*this.context.beginPath();
      this.context.moveTo(this.p1.x, this.p1.y);
      this.context.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
      this.context.strokeStyle = "#000000";
      this.context.stroke();*/
    }
    return true;
  }

  calculateBallDistance = (tx, ty) => {
    tx = tx - this.x - this.width/2;
    ty = ty - this.y - this.height/2;
    let dist = Math.sqrt(tx * tx + ty * ty);

    return dist;
  }

}

export default CannonBall;
