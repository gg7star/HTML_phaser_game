var figure;
var user;
var testHolder;
var password;
var error_title = null;
var error_content = null;
var server_addr;
var loginState;

var LoginState = {
  preload: function() {
    this.game.load.image('bg', 'assets/images/splash/background.jpg');
    this.game.load.nineSlice('input', 'assets/images/button/inputfield.png', 15);
    this.game.load.nineSlice('btn', 'assets/images/button/btn_clean.png', 20, 23, 27, 28);
    this.game.load.json('settings', 'config/settings.json');
  },
  create: function() {
    if (!this.game.device.desktop) {
      PhaserInput.KeyboardOpen = true;
      PhaserInput.onKeyboardOpen.dispatch();
    }

    this.game.config.settings = this.game.cache.getJSON('settings');
    server_addr = this.game.config.settings.server;

    var background = this.game.add.sprite(0,0,'background');
    this.setStatusText('', '');
    //Here's the input field for the user's name
    var userBg = this.game.add.nineSlice(this.game.width / 2 + 5, 180, 'input', null, 200, 50);
    userBg.anchor.set(0.5);
    user = this.game.add.inputField(this.game.width / 2 - 85, 180 - 17, {
      font: '18px Arial',
      fill: '#212121',
      fillAlpha: 0,
      fontWeight: 'bold',
      // forceCase: PhaserInput.ForceCase.upper,
      width: 150,
      max: 20,
      padding: 8,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 6,
      placeHolder: 'Username',
      zoom: false
    });
    user.blockInput = false;
    user.inputEnabled = true;

    //We'd need a password too
    var passBg = this.game.add.nineSlice(this.game.width / 2 + 5, 250, 'input', null, 200, 50);
    passBg.anchor.set(0.5);
    password = this.game.add.inputField(this.game.width / 2 - 85, 250 - 17, {
      font: '18px Arial',
      fill: '#212121',
      fillAlpha: 0,
      fontWeight: 'bold',
      width: 150,
      padding: 8,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 6,
      placeHolder: 'Password',
      type: PhaserInput.InputType.password,
      zoom: false
    });
    password.blockInput = false;
    password.focusOutOnEnter = false;
    testHolder = password;

    var submitBtn = this.game.add.nineSlice(this.game.width / 2 - 100, 360, 'btn', null, 100, 70);
    var submit = this.game.add.text(this.game.width / 2 - 80, 380, 'Submit', {
      font: '18px Arial'
    });
    submitBtn.inputEnabled = true;
    submitBtn.input.useHandCursor = true;
    loginState = this;
    submitBtn.events.onInputDown.add(function() {
      loginState.setStatusText('Progress:', 'Connecting to server...');

      $.ajax({
        type: 'POST',
        url: server_addr + '/login_user/',
        dataType: "JSON",
        data: { 'session':
          {
            'name': user.value,
            'password': password.value
          }
        },
        success: function(result) {
          loginState.setStatusText(result.status, result.message);
          if (result.status == 'Success') {
            loginState.game.global.username = user.value;
            loginState.game.state.start('GameState');
          }
        },
        error: function(xhr) {
          if (xhr.status == 200) {
            user.destroy();
            password.destroy();
            submit.destroy();
            loginState.game.global = {
              username : user.value
            };
            console.log(loginState.game.global);
            loginState.game.state.start('GameState');
          } else {
            loginState.setStatusText('Error:', xhr.message);
          }
        }
      });
    });

    var resetBtn = this.game.add.nineSlice(this.game.width / 2 + 10, 360, 'btn', null, 100, 70);
    var reset = this.game.add.text(this.game.width / 2 + 35, 380, 'Reset', {
      font: '18px Arial'
    });
    resetBtn.inputEnabled = true;
    resetBtn.input.useHandCursor = true;
    resetBtn.events.onInputDown.add(function() {
      user.resetText();
      password.resetText();
    });

    PhaserInput.onKeyboardOpen.add(function () {
      console.error("keyboard open", PhaserInput.KeyboardOpen)
    });

    PhaserInput.onKeyboardClose.add(function () {
      console.error("keyboard close", PhaserInput.KeyboardOpen)
    });
  },
  setStatusText: function(title, content) {
    if (error_title != null && error_title.text != '') {
      error_title.destroy();
    }
    if (error_content != null && error_content.text != '') {
      error_content.destroy();
    }
    error_title = this.game.add.text(10, 10, title, {
        font: '18px Arial'
      });
    error_content = this.game.add.text(10, 50, content, {
        font: '14px Arial'
      });
  }
};
