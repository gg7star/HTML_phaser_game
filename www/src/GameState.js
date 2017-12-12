var chatCountText;
var personCountText;
var chatDescriptionText;
var personDescriptionText;

var gameState;

var last_message_id;
var last_message1;
var last_message2;
var lastChatView;

var common;


var GameState = {
  
  chatTimerEnable: false,

  init: function() {
    
    gameState = this;
    common = this.game.global;
    this.initialize();

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.kineticScrolling.configure({
      verticalScroll: true,
      horizontalScroll: true
    });

    chatCountText = null;
    personCountText = null;
    chatDescriptionText = null;
    personDescriptionText = null;

    last_message_id = null;
    last_message1 = null;
    last_message2 = null;
    lastChatView = null;

  },

  preload: function() {
    
    this.game.load.nineSlice('building', 'assets/images/game/building.png', 0, 0, 0, 0);
    this.game.load.nineSlice('quest', 'assets/images/game/quest.png', 0, 0, 0, 0);
    this.game.load.nineSlice('items', 'assets/images/game/items.png', 0, 0, 0, 0);
    this.game.load.nineSlice('guild', 'assets/images/game/guild.png', 0, 0, 0, 0);
    this.game.load.nineSlice('mail', 'assets/images/game/mail.png', 0, 0, 0, 0);
    this.game.load.nineSlice('more', 'assets/images/game/more.png', 0, 0, 0, 0);
    this.game.load.nineSlice('person', 'assets/images/game/person.png', 0, 0, 0, 0);
    this.game.load.nineSlice('chat', 'assets/images/game/chat.png', 0, 0, 0, 0);
    this.game.load.nineSlice('crown', 'assets/images/game/crown.png', 0, 0, 0, 0);

    this.game.load.nineSlice('chat_description_background', 'assets/images/menu/menubar_background.png', 0);

  },

  create: function() {
    this.background = this.game.add.sprite(0, 0, 'main_background');
    this.background.inputEnabled = true;
    this.background.events.onInputDown.add(this.clickedBackground, this);

    this.game.stage.backgroundColor = "#FFFFFF";

    // Set screen scrolling
    this.game.kineticScrolling.start();

    //If you want change the default configuration after start the plugin
    this.game.world.setBounds(0, 0, this.game.width, this.game.height);

    this.createBottomMenus();
    this.chatTimerEnable = this.game.global.gameChatTimer.enable;
    this.getChat();
  },

  createBottomMenus: function() {
    this.createMenu(10, 594, 'building', 55.8, 42, 'Building', '', null, this.clickedBuilding, 0, 0, null);
    this.createMenu(66.83, 594, 'quest', 55.8, 42, 'Quest', '', null, this.clickedQuest, 0, 0, null);
    this.createMenu(123.67, 594, 'items', 55.8, 42, 'Items', '', null, this.clickedItems, 0, 0, null);
    this.createMenu(180.5, 594, 'guild', 55.8, 42, 'Guild', '', null, this.clickedGuild, 0, 0, null);
    this.createMenu(237.33, 594, 'mail', 55.8, 42, 'Mail', '', null, this.clickedMail, 0, 0, null);
    this.createMenu(294.17, 594, 'more', 55.8, 42, 'More', '', null, this.clickedMore, 0, 0, null);
    this.createRectangle('Bottom', 10, 593, 340, 45, 2, 0x2b2c2e, 1);

    var graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.moveTo(6, 555);
    graphics.lineTo(354, 555);
    this['bottomLine'] = graphics;
    this['bottomLine'].fixedToCamera = true;
    this.createRectangle('ChatDescription', 6, 560, 348, 30, 2, 0xa5b0ec, 1);

    this.createMenu(320, 562, 'crown', 30, 30, 'Crown', '', null, this.clickedCrown, 0, 0, null);
  },

  createMenu: function(x, y, imageName, width, height, name, title, color, callback, offsetX, offsetY, fontSize) {
    var button = gameState.game.add.nineSlice(x, y, imageName, null, width, height);
    if (callback !== null) {
      button.inputEnabled = true;
      button.input.priorityID = 1;
      button.input.useHandCursor = true;
      button.events.onInputDown.add(callback, this);
    }
    this['game' + name + 'Button'] = button;
    this['game' + name + 'Button'].fixedToCamera = true;

    if (title !== null && title !== '') {
      var buttonTitle = this.game.add.text(0, 0, title, {
        font: fontSize === null ? '13px Arial Bold' : fontSize + 'px Courier',
        fontWeight: 'bold',
        fill: color === null ? '#fff' : color,
        align: 'center',
        boundsAlignH: 'center',
        boundsAlignV: 'middle',
        stroke: '#000',
        strokeThickness: 4
      });
      buttonTitle.x = button.width / 2 - buttonTitle.texture.width / 2;
      buttonTitle.y = button.height / 2 - buttonTitle.texture.height / 2 + 2;
      buttonTitle.inputEnabled = true;
      button.addChild(buttonTitle);
      this['game' + name + 'Text'] = buttonTitle;
      this['game' + name + 'Text'].fixedToCamera = true;
    }

    return button;
  },

  destroyMenu: function(name) {
    this['game' + name + 'Button'].destroy();
    this['game' + name + 'Text'].destroy();
  },

  createRectangle: function (name, x, y, w, h, lineWidth, color, alpha) {
    var sprite = gameState.game.add.graphics(x, y);
    sprite.lineStyle(lineWidth, color, alpha);
    sprite.drawRect(0, 0, w, h);

    this['game' + name + 'Rectangle'] = sprite;
    this['game' + name + 'Rectangle'].fixedToCamera = true;

    return sprite;
  },

  clickedBackground: function() {
//    gameState.initialize();
//    this.game.state.start('CityState');
  },

  clickedChatDescription: function (sprite) {
    this.initialize();
    this.game.state.start('ChatState');
  },

  clickedBuilding: function() {
    this.initialize();
    this.game.state.start('CityState');
  },

  clickedQuest: function() {
    alert('Quest is clicked')
  },

  clickedItems: function() {
    alert('Items is clicked');
  },

  clickedGuild: function() {
    alert('Guild is clicked');
  },

  clickedMail: function() {
    alert('Mail is clicked');
  },

  clickedMore: function() {
    alert('More is clicked');
  },

  clickedCrown: function() {
    this.initialize();
    this.game.state.start('ChatState');
  },

  setChatCountText: function(x, y, text) {
    if (chatCountText != null && chatCountText.text != '') {
      chatCountText.destroy();
    }
    chatCountText = this.game.add.text(x, y, text, {
      font: '11px Arial'
    });
  },

  setPersonCountText: function(x, y, text) {
    if (personCountText != null && personCountText.text != '') {
      personCountText.destroy();
    }
    personCountText = this.game.add.text(x, y, text, {
      font: '11px Arial'
    });
  },

  setChatDescriptionText: function(x, y, text, width, height) {
    chatDescriptionText = this.game.add.nineSlice(x, y, 'chat_description_background', null, width, height);
    var title = this.game.add.text(x, y, text, {
      font: '11px Arial',
      fill: '#fff',
      boundsAlignH: 'center',
      bunndsAlignV: 'middle'
    });

    return chatDescriptionText;
  },

  setPersonDescriptionText: function(x, y, text, width) {
    if (personDescriptionText != null && personDescriptionText.text != '') {
      personDescriptionText.destroy();
    }
    personDescriptionText = this.game.add.text(x, y, text, {
      font: '11px Arial'
    });
  },

  getChat: function() {
    $.ajax({ // this is a json object inside the function
      type: 'GET',
      url: server_addr + 'get_messages/',
      dataType: "JSON",
        data: { 'session':
        {
          'name': gameState.game.global.username,
          'last_time': Date().toString(),
          'last_id': last_message_id,
          'chat_room_id': 1
        }
      },
      success: function(result) {
        if (gameState.chatTimerEnable && result.status == 'Success') {
          // added new messages from result
          var new_messages = result.new_messages;
          if (new_messages.length > 0) {
            if (new_messages.length >= 2) {
              last_message1 = new_messages[new_messages.length - 2];
            } else if (new_messages.length == 1) {
              last_message1 = last_message2;
            } else if (new_messages.length == 0) {

            }
            last_message2 = new_messages[new_messages.length - 1];
            last_message_id = last_message2.id;

            var new_chat = last_message1.name + ': ' + last_message1.content + '\n' +
              last_message2.name + ': ' + last_message2.content;
            if (lastChatView !== null) {
              lastChatView.destroy();
            }
            var chatViewStyle = {
              font: '11px Courier',
              fontWeight: 'light',
              fill: '#000',
              align: 'left',
              boundsAlignH: 'center',
              boundsAlignV: 'middle'
            };
            lastChatView = gameState.game.add.text(10, 560, new_chat, chatViewStyle);
            this['lastChatView'] = lastChatView;
            this['lastChatView'].fixedToCamera = true;
          }
          setTimeout(gameState.getChat, gameState.game.global.gameChatTimer.interval);
        }
      },
      error: function(xhr) {
        if (xhr.status == 200) {
          alert(xhr.message);
        } else {
          alert(xhr.message);
        }
      }
    });
  },

  initialize: function() {
    gameState.chatTimerEnable = false;
    common.initializeState(gameState);
  }
};