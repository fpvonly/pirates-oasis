import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import Splash from './Splash';
import GameObject from './GameObject';

import {TweenLite, TimelineMax} from '../lib/greensock-js/src/esm/all';

class CannonBall extends GameObject {

  constructor(context, canvas, target, x, y, width = 0, height = 0, angle, getTileCoordinates) {
    super(context, canvas, width, height, x - width/2, y - height/2, 10);

    this.getTileCoordinates = getTileCoordinates;
    this.bg = Sprites.getCannonBall();
    this.splash = new Splash(context, canvas, target.x, target.y, 40, 40);
    this.playSplash = false;

    this.source = {x: this.x - width/2, y: this.y - height/2};
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
    this.cannonAngle = angle;
    this.bezier = { values: [this.p0, this.p1, this.p2, this.p3], type: "cubic" };
    this.targetDist = this.calculateDistance(this.target.x, this.target.y);
    this.animationSeconds = this.targetDist/250; // 250pxs per second
    this.animationType = this.getAnimationTypeByAngle(this.cannonAngle);

    TweenLite.ticker.fps(30);
    this.tl = new TimelineMax();
    this.active = true;
  }

  draw = () => {
    if (this.active === true) {
      let progress = this.tl.progress() || 0;

      if (this.animationType === 'bezier') {
        this.tl.progress(0)
          .clear()
          .to(this.source,
            this.animationSeconds,
            {
              bezier: this.bezier,
              ease: "linear",
              onComplete: () => {
                this.x = this.target.x;
                this.y = this.target.y;
                this.playSplash = true;
              }
            }
          ).progress(progress);
      } else {
        this.tl.progress(0)
          .clear()
          .to(this.source,
            this.animationSeconds,
            {
              x: this.target.x,
              y: this.target.y,
              ease: "linear",
              onComplete: () => {
                this.x = this.target.x;
                this.y = this.target.y;
                this.playSplash = true;
              }
            }
          ).progress(progress);
      }

      if (progress > 0 && this.playSplash === false) {
        let w = this.width;
        let h = this.height;
        if (this.targetDist > 200) {
          let w0 = this.width * (1 + progress);
          let w1 = this.width * 1.5 * (0.5/progress);
          let h0 = this.height * (1 + progress);
          let h1 = this.height * 1.5 * (0.5/progress);
          w = (progress <= 0.50) ? w0 : (w1 < this.width ? this.width : w1);
          h = (progress <= 0.50) ? h0 : (h1 < this.height ? this.height : h1);
        }

        this.context.drawImage(this.bg, this.source.x, this.source.y, w, h);
      }

      if (this.playSplash === true) {
        this.splash.draw();
        if (this.splash.isSplashAnimationComplete() === true) {
          this.active = false;
        }
      }
    }

    return true;
  }

  getAnimationTypeByAngle = () => {
    let type = 'line';
    if (this.cannonAngle >= -42.5 && this.cannonAngle <= 42.5) {
      type = 'line';
    } else if (this.cannonAngle > 42.5 && this.cannonAngle <= 67.5) {
      type = 'bezier';
    } else if (this.cannonAngle > 67.5 && this.cannonAngle <= 112.5) {
      type = 'bezier';
    } else if (this.cannonAngle > 112.5 && this.cannonAngle <= 157.5) {
      type = 'bezier';
    } else if ((this.cannonAngle > 157.5 && this.cannonAngle <= 180) || (this.cannonAngle > -180 && this.cannonAngle <= -157.5)) {
      type = 'line';
    } else if (this.cannonAngle > -157.5 && this.cannonAngle <= -112.5) {
      type = 'bezier';
    } else if (this.cannonAngle > -112.5 && this.cannonAngle <= -67.5) {
      type = 'bezier';
    } else if (this.cannonAngle > -67.5 && this.cannonAngle <= -42.5) {
      type = 'bezier';
    }

    return type;
  }

}

export default CannonBall;
