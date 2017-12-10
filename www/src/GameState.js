//this game will have only 1 state
var countOfBtnOnBottom = 6;
var chatCountText = null;
var personCountText = null;
var chatDescriptionText = null;
var personDescriptionText = null;


var gameState = null;

var last_message_id = '';
var last_message1 = '';
var last_message2 = '';
var lastChatView = null;

var GameState = {
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

  //executed after everything is loaded
  create: function() {
    this.background = this.game.add.sprite(0, 0, 'main_background');
    this.background.inputEnabled = true;
    this.background.events.onInputDown.add(this.clickedBackground, this);

    gameState = this;
    this.createBottomMenus();
    this.game.global.gameChatTimer = true;
    last_message_id = '';
    this.getChat();
  },

  createBottomMenus: function() {
    this.createMenu(10, 594, 'building', 55.8, 42, 'Building', '', null, this.clickedBuilding, 0, 0, null);
    this.createMenu(66.83, 594, 'quest', 55.8, 42, 'Quest', '', null, this.clickedQuest, 0, 0, null);
    this.createMenu(123.67, 594, 'items', 55.8, 42, 'Items', '', null, this.clickedItems, 0, 0, null);
    this.createMenu(180.5, 594, 'guild', 55.8, 42, 'Guild', '', null, this.clickedGuild, 0, 0, null);
    this.createMenu(237.33, 594, 'mail', 55.8, 42, 'Mail', '', null, this.clickedMail, 0, 0, null);
    this.createMenu(294.17, 594, 'more', 55.8, 42, 'More', '', null, this.clickedMore, 0, 0, null);
    this.createRectangle(10, 593, 340, 45, 2, 0x2b2c2e, 1);

    var graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.moveTo(6, 555);
    graphics.lineTo(354, 555);
    this.createRectangle(6, 560, 348, 30, 2, 0xa5b0ec, 1);

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
    }

    return button;
  },

  destroyMenu: function(name) {
    this['profile' + name + 'Button'].destroy();
    this['profile' + name + 'Text'].destroy();
  },

  createRectangle: function (x, y, w, h, lineWidth, color, alpha) {
    var sprite = gameState.game.add.graphics(x, y);
    sprite.lineStyle(lineWidth, color, alpha);
    sprite.drawRect(0, 0, w, h);
    return sprite;
  },

  clickedBackground: function() {
    gameState.game.global.gameChatTimer = false;
    last_message_id = '';
    this.game.state.start('ChatState');
  },

  clickedChatDescription: function (sprite) {
    gameState.game.global.gameChatTimer = false;
    last_message_id = '';
    this.game.state.start('ChatState');
  },

  clickedBuilding: function() {
    alert('Building is clicked.');
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
    alert('Crown is clicked');
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
      url: server_addr + '/get_messages/',
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
        if (gameState.game.global.gameChatTimer && result.status == 'Success') {
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
          }
          setTimeout(gameState.getChat, 5000);
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
  }

};