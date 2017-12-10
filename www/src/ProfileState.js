//this game will have only 1 state
var profileState = null;
var profile = {
  userName: null,
  gold: null,
  character: null,
  character_border: null,
  power: null,
  vip: null,
  kills: null,
  powerDestroyed: null,
  monstersKilled: null,
  win: null,
  combatState: {
    battles: {
      won: null,
      lost: null,
      ratio: null
    },
    attacks: {
      won: null,
      lost: null
    },
    defense: {
      won: null,
      lost: null
    },
    playersScouted: null,
    troopsKilled: null
  }
};

var lastChatView = null;



var ProfileState = {
  preload: function() {
    // this.load.image('background', 'assets/images/profile/background.png');

    this.game.load.nineSlice('profile_button', 'assets/images/profile/profile_button.png', 10, 100, 0, 0);
    this.game.load.nineSlice('profile_button_space', 'assets/images/profile/profile_button_space.png', 0, 0, 0, 0);
    this.game.load.nineSlice('gold_value_button', 'assets/images/profile/gold_value_button2.png', 0, 0, 0, 0);

    this.game.load.nineSlice('my_character_border', 'assets/images/chat/my_character_border.png', 0);
    this.game.load.nineSlice('my_character', 'assets/images/chat/my_character.png', 0);
    this.game.load.nineSlice('other_character_border', 'assets/images/chat/other_character_border.png', 0);
    this.game.load.nineSlice('other_character', 'assets/images/chat/other_character.png', 0);

    this.game.load.nineSlice('middle_button', 'assets/images/profile/middle_button.png', 0, 0, 0, 0);

    this.game.load.nineSlice('building', 'assets/images/game/building.png', 0, 0, 0, 0);
    this.game.load.nineSlice('quest', 'assets/images/game/quest.png', 0, 0, 0, 0);
    this.game.load.nineSlice('items', 'assets/images/game/items.png', 0, 0, 0, 0);
    this.game.load.nineSlice('guild', 'assets/images/game/guild.png', 0, 0, 0, 0);
    this.game.load.nineSlice('mail', 'assets/images/game/mail.png', 0, 0, 0, 0);
    this.game.load.nineSlice('more', 'assets/images/game/more.png', 0, 0, 0, 0);
    this.game.load.nineSlice('person', 'assets/images/game/person.png', 0, 0, 0, 0);
    this.game.load.nineSlice('chat', 'assets/images/game/chat.png', 0, 0, 0, 0);
    this.game.load.nineSlice('crown', 'assets/images/game/crown.png', 0, 0, 0, 0);

    this.game.load.nineSlice('chat_description_background', 'assets/images/menu/menubar_background.png', 0, 0, 0, 0);
  },

  //executed after everything is loaded
  create: function() {
    profileState = this;
//    this.background = this.game.add.sprite(0, 0, 'background');
    this.game.stage.backgroundColor = "#fff";
    this.createProfileTopMenus();
    this.createProfileCharacter();
    this.createProfileMiddleMenus();
    this.createProfileOverview();
    this.createProfileBottomMenus();
    this.createRectangle(2, 60, 356, 578, 2, 0x2b2c2e, 0.7);

    this.getProfile();
    this.getChat();
  },

  createProfileTopMenus: function () {
    this.createMenu(2, 0, 'profile_button', 220, 50, 'profile', 'Profile', '#fff', this.clickedProfileMenu, 115, 16, 14);
    this.createMenu(220, 0, 'profile_button_space', 30, 50, 'profile_space', '', null, null, 0, 0);
    this.createMenu(250, 0, 'gold_value_button', 108, 50, 'gold_value', '', null, null, 0, 0);
  },

  createProfileCharacter: function () {
    profile.userName = this.game.add.text(0, 150, '[Tag] ' + this.game.global.selectedUser, {
      font: '16px Courier',
      fontWeight: 'bold',
      fill: '#000',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'

    });
    profile.userName.x = this.game.world.width / 2 - profile.userName.texture.width / 2;

    if (this.game.global.selectedUser === this.game.global.username) {
      profile.character_border = this.createMenu(140, 70, 'my_character_border', 80, 75, 'character_border', '', null, null, 0, 0, null);
      profile.character = this.createMenu(150, 81, 'my_character', 60, 53, 'character', '', null, null, 0, 0, null);
    } else {
      profile.character_border = this.createMenu(140, 70, 'other_character_border', 80, 75, 'character_border', '', null, null, 0, 0, null);
      profile.character = this.createMenu(150, 90, 'other_character', 60, 35, 'character', '', null, null, 0, 0, null);
    }
  },

  createProfileMiddleMenus: function () {
    this.createMenu(10, 190, 'middle_button', 66.4, 30, 'm1', '', null, null, 0, 0, 12);
    this.createMenu(78.4, 190, 'middle_button', 66.4, 30, 'hero', 'Hero', '#fff', null, 17, 7, 12);
    this.createMenu(146.8, 190, 'middle_button', 66.4, 30, 'mail', 'Mail', '#fff', null, 17, 7, 12);
    this.createMenu(215.2, 190, 'middle_button', 66.4, 30, 'm4', '', null, null, 0, 0, 12);
    this.createMenu(283.6, 190, 'middle_button', 66.4, 30, 'manage', 'Manage', '#fff', null, 17, 7, 12);
  },

  createMenu: function(x, y, imageName, width, height, name, title, color, callback, offsetX, offsetY, fontSize) {
    var button = profileState.game.add.nineSlice(x, y, imageName, null, width, height);
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
    var sprite = profileState.game.add.graphics(x, y);
    sprite.lineStyle(lineWidth, color, alpha);
    sprite.drawRect(0, 0, w, h);
    return sprite;
  },

  createProfileOverview: function() {
    var middleValueStyle = {
      font: '18px Courier',
      fontWeight: 'bold',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 3
    };
    this.createProfileGoldOverviewTitle();
    this.createProfileOverviewTitle();
  },

  createProfileGoldOverviewTitle: function() {
    var goldTitleStyle = {
      font: '11px Courier',
      fontWeight: 'bold',
      fill: '#000',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    };
    this.game.add.text(302, 15, 'GOLD', goldTitleStyle);
  },

  createProfileOverviewTitle: function() {
    var middleTitleStyle = {
      font: '11px Courier',
      fontWeight: 'light',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 4
    };
    var middleWinTitleStyle = {
      font: '16px Courier',
      fontWeight: 'Bold',
      fill: '#000',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    };
    var middleScoreHeaderStyle = {
      font: '16px Courier',
      fontWeight: 'Bold',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 5
    };
    var middleScoreTitleStyle = {
      font: '10px Courier',
      fontWeight: 'light',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 4
    };

    this.game.add.text(20, 260, 'Power', middleTitleStyle);
    this.game.add.text(123, 260, 'VIP', middleTitleStyle);
    this.game.add.text(236, 260, 'Kills', middleTitleStyle);
    this.game.add.text(20, 305, 'PowerDestroyed', middleTitleStyle);
    this.game.add.text(123, 305, 'MonstersKilled', middleTitleStyle);
    this.game.add.text(236, 303, 'Win %', middleWinTitleStyle);

    this.game.add.text(20, 330, 'Combat Stats', middleScoreHeaderStyle);

    var lineStartY = 360;
    var graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x000000, 0.6);
    graphics.moveTo(10,lineStartY);
    var i = 0;
    for (var i = 0; i < 9; i ++) {
      graphics.moveTo(10, lineStartY + i * 20);
      graphics.lineTo(350, lineStartY + i * 20);
      if (i % 2 == 0) {
        graphics.lineTo(350, lineStartY + (i + 1) * 20);
      } else {
        graphics.moveTo(10, lineStartY + i * 20);
        graphics.lineTo(10, lineStartY + (i + 1) * 20);
      }
    }
    graphics.moveTo(10, lineStartY + i * 20);
    graphics.lineTo(350, lineStartY + i * 20);

    this.game.add.text(20, 362, 'Battles Won:', middleScoreTitleStyle);
    this.game.add.text(20, 382, 'Battles Lost:', middleScoreTitleStyle);
    this.game.add.text(20, 402, 'Attacks Won:', middleScoreTitleStyle);
    this.game.add.text(20, 422, 'Attacks Lost:', middleScoreTitleStyle);
    this.game.add.text(20, 442, 'Defenses Won:', middleScoreTitleStyle);
    this.game.add.text(20, 462, 'Defenses Lost:', middleScoreTitleStyle);
    this.game.add.text(20, 482, 'Battles Win/Loss Ratio:', middleScoreTitleStyle);
    this.game.add.text(20, 502, 'Players Scouted:', middleScoreTitleStyle);
    this.game.add.text(20, 522, 'Troops Killed:', middleScoreTitleStyle);
  },

  createProfileBottomMenus: function() {
    this.createMenu(10, 594, 'building', 55.8, 42, 'building', '', null, null, 0, 0, null);
    this.createMenu(66.83, 594, 'quest', 55.8, 42, 'quest', '', null, null, 0, 0, null);
    this.createMenu(123.67, 594, 'items', 55.8, 42, 'items', '', null, null, 0, 0, null);
    this.createMenu(180.5, 594, 'guild', 55.8, 42, 'guild', '', null, null, 0, 0, null);
    this.createMenu(237.33, 594, 'mail', 55.8, 42, 'mail', '', null, null, 0, 0, null);
    this.createMenu(294.17, 594, 'more', 55.8, 42, 'more', '', null, null, 0, 0, null);
    this.createRectangle(10, 593, 340, 45, 2, 0x2b2c2e, 1);

    var graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.moveTo(6, 555);
    graphics.lineTo(354, 555);
    this.createRectangle(6, 560, 348, 30, 2, 0xa5b0ec, 1);
  },

  clickedProfileMenu: function() {
    profileState.game.state.start('ChatState');
  },

  getProfile: function() {
    // polling. we will develop later
    var new_profile = {
      userName: this.game.global.selectedUser,
      gold: '32,169',
      character: 'other',
      character_border: 'other',
      power: '70.2K',
      vip: 'INACTIVE',
      kills: '0',
      powerDestroyed: '548',
      monstersKilled: '2',
      win: '0',
      combatState: {
        battles: {
          won: 0,
          lost: '343',
          ratio: '0'
        },
        attacks: {
          won: '0',
          lost: '0'
        },
        defense: {
          won: '0',
          lost: '343'
        },
        playersScouted: '43',
        troopsKilled: '137'
      }
    };

    this.resetGoldOverview(new_profile);
    this.resetProfileOverview(new_profile);
    this.resetProfileScore(new_profile);
  },

  resetGoldOverview: function(data) {
    var goldValueStyle = {
      font: '11px Courier',
      fontWeight: 'Bold',
      fill: '#000',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    };

    if (profile.gold !== null) {
      profile.gold.destroy();
    }
    console.log(data.gold);
    profile.gold = this.game.add.text(302, 25, data.gold, goldValueStyle);
  },

  resetProfileOverview: function(data) {
    var middleOverviewStyle = {
      font: '18px Courier',
      fontWeight: 'Bold',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 4
    };

    if (profile.power !== null) {
      profile.power.destroy();
    }
    profile.power = this.game.add.text(20, 240, data.power, middleOverviewStyle);

    if (profile.vip !== null) {
      profile.vip.destroy();
    }
    profile.vip = this.game.add.text(123, 240, data.vip, middleOverviewStyle);

    if (profile.kills !== null) {
      profile.kills.destroy();
    }
    profile.kills = this.game.add.text(236, 240, data.kills, middleOverviewStyle);

    if (profile.powerDestroyed !== null) {
      profile.powerDestroyed.destroy();
    }
    profile.powerDestroyed = this.game.add.text(20, 285, data.powerDestroyed, middleOverviewStyle);

    if (profile.monstersKilled !== null) {
      profile.monstersKilled.destroy();
    }
    profile.monstersKilled = this.game.add.text(123, 285, data.monstersKilled, middleOverviewStyle);

    if (profile.win !== null) {
      profile.win.destroy();
    }
    profile.win = this.game.add.text(236, 285, data.win, middleOverviewStyle);
  },

  resetProfileScore: function(data) {
    var middleScoreValueStyle = {
      font: '11px Courier',
      fontWeight: 'Bold',
      fill: '#fff',
      align: 'right',
      boundsAlignH: 'right',
      boundsAlignV: 'middle',
      stroke: '#000',
      strokeThickness: 4
    };

    if (profile.combatState.battles.won !== null) {
      profile.combatState.battles.won.destroy();
    }
    profile.combatState.battles.won = this.game.add.text(340, 363, data.combatState.battles.won, middleScoreValueStyle);
    profile.combatState.battles.won.x = 345 - profile.combatState.battles.won.texture.width;

    if (profile.combatState.battles.lost !== null) {
      profile.combatState.battles.lost.destroy();
    }
    profile.combatState.battles.lost = this.game.add.text(340, 382, data.combatState.battles.lost, middleScoreValueStyle);
    profile.combatState.battles.lost.x = 345 - profile.combatState.battles.lost.texture.width;

    if (profile.combatState.attacks.won !== null) {
      profile.combatState.attacks.won.destroy();
    }
    profile.combatState.attacks.won = this.game.add.text(340, 402, data.combatState.attacks.won, middleScoreValueStyle);
    profile.combatState.attacks.won.x = 345 - profile.combatState.attacks.won.texture.width;

    if (profile.combatState.attacks.lost !== null) {
      profile.combatState.attacks.lost.destroy();
    }
    profile.combatState.attacks.lost = this.game.add.text(300, 422, data.combatState.attacks.lost, middleScoreValueStyle);
    profile.combatState.attacks.lost.x = 345 - profile.combatState.attacks.lost.texture.width;

    if (profile.combatState.defense.won !== null) {
      profile.combatState.defense.won.destroy();
    }
    profile.combatState.defense.won = this.game.add.text(340, 442, data.combatState.defense.won, middleScoreValueStyle);
    profile.combatState.defense.won.x = 345 - profile.combatState.defense.won.texture.width;

    if (profile.combatState.defense.lost !== null) {
      profile.combatState.defense.lost.destroy();
    }
    profile.combatState.defense.lost = this.game.add.text(340, 462, data.combatState.defense.lost, middleScoreValueStyle);
    profile.combatState.defense.lost.x = 345 - profile.combatState.defense.lost.texture.width;

    if (profile.combatState.battles.ratio !== null) {
      profile.combatState.battles.ratio.destroy();
    }
    profile.combatState.battles.ratio = this.game.add.text(340, 482, data.combatState.battles.ratio, middleScoreValueStyle);
    profile.combatState.battles.ratio.x = 345 - profile.combatState.battles.ratio.texture.width;

    if (profile.combatState.playersScouted !== null) {
      profile.combatState.playersScouted.destroy();
    }
    profile.combatState.playersScouted = this.game.add.text(340, 502, data.combatState.playersScouted, middleScoreValueStyle);
    profile.combatState.playersScouted.x = 345 - profile.combatState.playersScouted.texture.width;

    if (profile.combatState.troopsKilled !== null) {
      profile.combatState.troopsKilled.destroy();
    }
    profile.combatState.troopsKilled = this.game.add.text(340, 522, data.combatState.troopsKilled, middleScoreValueStyle);
    profile.combatState.troopsKilled.x = 345 - profile.combatState.troopsKilled.texture.width;
  },

  getChat: function() {
    $.ajax({ // this is a json object inside the function
      type: 'GET',
      url: server_addr + '/get_messages/',
      dataType: "JSON",
      data: { 'session':
        {
          'name': profileState.game.global.username,
          'last_time': Date().toString(),
          'last_id': '',
          'chat_room_id': 1
        }
      },
      success: function(result) {
        if (result.status == 'Success') {
          console.log(result.message);
          // added new messages from result
          var new_messages = result.new_messages;
          var last_id = last_message_id;
          var last_message1 = new_messages[new_messages.length - 2];
          var last_message2 = new_messages[new_messages.length - 1];

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
          console.log(new_chat);
          lastChatView = profileState.game.add.text(10, 560, new_chat, chatViewStyle);
        }
      }
    });
  }
};