import GameObject from './GameObject';
import Sounds from './Sound';
import Sprites from './Sprite';

class Splash extends GameObject {

  constructor(context, canvas, x, y, width, height) {
    // context, canvas, width, height, x, y
    super(context, canvas, width, height, x - width/2, y - height + 10); // + 10 pixels fine tuning

    this.then = Date.now(); // previous explosion time frame, for throttling the animation
    this.splashFPS = 15;
    this.splashSoundPlayed = false;
    this.splashFrames = [];
    this.resetFrames();
  }

  draw = () => {
    if (this.isSplashAnimationComplete() === false) {
      this.context.drawImage(this.splashFrames[0], this.x, this.y, this.width, this.height);
      this.now = Date.now();
      this.delta = this.now - this.then;
      if (this.delta > 1000/this.splashFPS) {
        this.then = this.now - (this.delta % 1000/this.splashFPS);
        this.splashFrames.shift();
      }
      this.playSplashSound();
    }
    return true;
  }

  isSplashAnimationComplete = () => {
    if (this.splashFrames.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  resetFrames = () => {
    this.splashFrames = Sprites.getSplashSpriteAnimFrames();
    this.splashSoundPlayed = false;
  }

  playSplashSound = () => {
    if (this.splashSoundPlayed === false) {
      Sounds.playSplashSound();
      this.splashSoundPlayed = true;
    }
  }

}

export default Splash;
