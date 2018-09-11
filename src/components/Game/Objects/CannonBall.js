import * as C from '../Constants';
import {MapData} from './Map/Map_L1.js';
import Sprites from './Sprite';
import Sounds from './Sound';
import GameObject from './GameObject';
import Explosion from './Explosion';

import {TweenLite, TimelineMax} from '../lib/greensock-js/src/esm/all';

class CannonBall extends GameObject {

  constructor(context, canvas, target, x, y, width = 0, height = 0, getTileCoordinates) {
    super(context, canvas, width, height, x - width/2, y - height/2, 10);

    this.getTileCoordinates = getTileCoordinates;
    this.bg = Sprites.getCannonBall();
    this.cannonBlastPlayed = false;
    this.explosion = new Explosion(this.context, this.canvas, x, y, 40, 40);

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

    TweenLite.ticker.fps(30);
    this.tl = new TimelineMax();
    this.active = true;
  }

  draw = () => {
    if (this.active === true) {
      this.explosion.draw();
      this.playCannonBlastSound();

      let progress = this.tl.progress() || 0;
      this.tl.progress(0)
        .clear()
        .to(this.target, 1, { bezier: this.bezier, ease: "linear", onComplete: () => { this.active = false;}})
        .progress(progress);

      this.context.drawImage(this.bg, this.target.x, this.target.y, this.width, this.height);

      this.context.beginPath();
      this.context.moveTo(this.p1.x, this.p1.y);
      this.context.bezierCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
      this.context.strokeStyle = "#000000";
      this.context.stroke();
    }
  }

  playCannonBlastSound = () => {
    if (this.cannonBlastPlayed !== true) {
      Sounds.playCannonBlastSound();
      this.cannonBlastPlayed = true;
    }
  }

}

export default CannonBall;
