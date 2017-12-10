var PreloadState = {
  //load the game assets before the game starts
  preload: function() {
    this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadBar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);

    this.load.image('background', 'assets/images/splash/background.jpg');
    this.load.image('main_background', 'assets/images/game/main_background.jpg')
    this.load.image('login', 'assets/images/button/login.png');
    this.load.image('signup', 'assets/images/button/signup.png');

    this.load.audio('m1', 'assets/audio/bodenstaendig_2000_in_rock_4bit.mp3');
    this.load.audio('m2', 'assets/audio/goaman_intro.mp3');
    this.load.audio('m3', 'assets/audio/oedipus_wizball_highscore.mp3');
    this.load.audio('m4', 'assets/audio/bodenstaendig_2000_in_rock_4bit.mp3');
    this.load.audio('m5', 'assets/audio/time.mp3');
  },
  create: function() {
    this.state.start('HomeState');
  }
};