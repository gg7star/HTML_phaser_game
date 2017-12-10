var login_button;
var signup_button;
var HomeState = {
  init: function(message) {
    this.message = message;
  },
  create: function() {
    var background = this.game.add.sprite(0,0,'background');
    background.inputEnabled = true;

    // login button
    login_button = this.game.add.button(50, 550, 'login', login, this, 2, 1, 0);
    signup_button = this.game.add.button(180, 550, 'signup', signup, this, 2, 1, 0);

    if(this.message) {
      this.game.add.text(60, this.game.world.centerY - 200, this.message, style);
    }
  }
};

function login() {
  this.state.start('LoginState');
}

function signup() {
  this.state.start('SignupState');
}