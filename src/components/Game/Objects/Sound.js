class Sound {

  static cannonSounds = [];
  static explosionSounds = [];
  static music = [];

  static cannonLoaded = [];
  static musicLoaded = false;
  static blastsLoaded = [];
  static gunBlastsLoaded = [];

  static initializeStaticClass() {

    for (let i = 0; i < 3; i++) { // some extra sound objects to create buffer for quick events that require sounds at 60fps
      let blast = new Audio("assets/sounds/mortar-cannon-explosion.mp3");
      blast.oncanplaythrough = () => {
        Sound.cannonLoaded.push(true);
      };
      blast.volume = 1;
      blast.preload = 'auto';
      blast.addEventListener("ended", function() {
        blast.currentTime = 0;
      });
      Sound.cannonSounds.push(blast);
    }

    // explosion sounds
    for (let i = 0; i < 30; i++) { // some extra sound objects to create buffer for quick events that require sounds at 60fps
      let blast = new Audio("assets/sounds/cc0_explosion_large_gas_001.mp3");
      blast.oncanplaythrough = () => {
        Sound.blastsLoaded.push(true);
      };
      blast.volume = 0.2;
      blast.preload = 'auto';
      blast.addEventListener("ended", function() {
        blast.currentTime = 0;
      });
      Sound.explosionSounds.push(blast);
    }

    // game music
    Sound.music = new Audio('assets/sounds/slackbaba_drink_more_tea.mp3');
    Sound.music.oncanplay = () => {
      Sound.musicLoaded = true;
    };
    Sound.music.loop = true;
    Sound.music.volume = 0.3;

  }

  static getLoadingStatusInfo = () => {
    return 'Sounds: ' + Math.floor(((((Sound.musicLoaded === true ? 1 : 0) + Sound.blastsLoaded.length + Sound.gunBlastsLoaded.length)/81)*100)) + '%';
  }

  static soundsLoaded = () => {
    return (Sound.musicLoaded === true && Sound.blastsLoaded.length === 30 && Sound.gunBlastsLoaded.length === 50);
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

  static playMusic = () => {
    Sound.music.play();
  }

  static pauseMusic = () => {
    Sound.music.pause();
  }

}
Sound.initializeStaticClass();

export default Sound;
