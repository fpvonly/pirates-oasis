class Sound {

  static cannonSounds = [];
  static crashSounds = [];
  static explosionSounds = [];
  static splashSounds = [];
  static music = null;
  static waveSound = null;

  static waterSplashLoaded = [];
  static musicLoaded = false;
  static cannonSoundsLoaded = [];
  static crashSoundsLoaded = [];
  static waveSoundLoaded = false;

  static initializeStaticClass() {

    for (let i = 0; i < 4; i++) {
      let blast = new Audio("assets/sounds/mortar-cannon-explosion.mp3");
      blast.oncanplaythrough = () => {
        Sound.cannonSoundsLoaded.push(true);
      };
      blast.volume = 0.2;
      blast.preload = 'auto';
      blast.addEventListener("ended", function() {
        blast.currentTime = 0;
      });
      Sound.cannonSounds.push(blast);
    }

    for (let i = 0; i < 4; i++) {
      let blast = new Audio("assets/sounds/crash-wood_GkuoMh4d.mp3");
      blast.oncanplaythrough = () => {
        Sound.crashSoundsLoaded.push(true);
      };
      blast.volume = 0.1;
      blast.preload = 'auto';
      blast.addEventListener("ended", function() {
        blast.currentTime = 0;
      });
      Sound.crashSounds.push(blast);
    }

    for (let i = 0; i < 4; i++) { // some extra sound objects to create buffer for quick events
      let splash = new Audio("assets/sounds/water-splash.mp3");
      splash.oncanplaythrough = () => {
        Sound.waterSplashLoaded.push(true);
      };
      splash.volume = 0.3;
      splash.preload = 'auto';
      splash.addEventListener("ended", function() {
        splash.currentTime = 0;
      });
      Sound.splashSounds.push(splash);
    }

    // game music
    Sound.music = new Audio('assets/sounds/tropical-island-full-03_GkhZ9IN_.mp3');
    Sound.music.oncanplay = () => {
      Sound.musicLoaded = true;
    };
    Sound.music.loop = true;
    Sound.music.volume = 0.2;

    // sea wave sound
    Sound.waveSound = new Audio('assets/sounds/beach-waves.mp3');
    Sound.waveSound.oncanplay = () => {
      Sound.waveSoundLoaded = true;
    };
    Sound.waveSound.loop = true;
    Sound.waveSound.volume = 0.3;
  }

  static getLoadingStatusInfo = () => {
    return 'Sounds: '
      + Math.floor((((
        (Sound.musicLoaded === true ? 1 : 0)
        + (Sound.waveSoundLoaded === true ? 1 : 0)
        + Sound.cannonSoundsLoaded.length
        + Sound.crashSoundsLoaded.length
        + Sound.waterSplashLoaded.length)/14)*100)) + '%';
  }

  static soundsLoaded = () => {
    return (
      Sound.musicLoaded === true &&
      Sound.waveSoundLoaded === true &&
      Sound.crashSoundsLoaded.length === 4 &&
      Sound.cannonSoundsLoaded.length === 4 &&
      Sound.waterSplashLoaded.length === 4);
  }

  static playCannonBlastSound = () => {
    let playSound = null;
    for (let sound of Sound.cannonSounds) {
      if (sound.currentTime === 0) {
        playSound = sound;
        break;
      }
    }
    if (playSound !== null) {
      playSound.play();
    }
  }

  static playCrashSound = () => {
    let playSound = null;
    for (let sound of Sound.crashSounds) {
      if (sound.currentTime === 0) {
        playSound = sound;
        break;
      }
    }
    if (playSound !== null) {
      playSound.play();
    }
  }

  static playSplashSound = () => {
    let playSound = null;
    for (let sound of Sound.splashSounds) {
      if (sound.currentTime === 0) {
        playSound = sound;
        break;
      }
    }
    if (playSound !== null) {
      playSound.play();
    }
  }

  static playExplosionSound = () => {
    let playSound = null;
    for (let sound of Sound.explosionSounds) {
      if (sound.currentTime === 0) {
        playSound = sound;
        break;
      }
    }
    if (playSound !== null) {
      playSound.play();
    }
  }

  static playSeaWaveSound = () => {
    Sound.waveSound.play();
  }

  static stopSeaWaveSound = () => {
    Sound.waveSound.pause();
    Sound.waveSound.currentTime = 0;
  }

  static playMusic = () => {
    return Sound.music.play();
  }

  static pauseMusic = () => {
    Sound.music.pause();
  }

}
Sound.initializeStaticClass();

export default Sound;
