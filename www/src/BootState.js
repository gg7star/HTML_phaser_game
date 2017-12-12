var BootState = {
  init: function() {

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

  },
  
  preload: function() {
  
    this.load.image('preloadBar', 'assets/images/splash/progress_bar.png');
    this.load.image('logo', 'assets/images/splash/splash.png');
    this.game.load.json('settings', 'config/settings.json');
  
  },
  
  create: function() {
  
    this.game.config.settings = this.game.cache.getJSON('settings');
    this.game.stage.backgroundColor = '#000';
    this.state.start('PreloadState');
  
  }
};
