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
  },

  combatBoost: {
    troopDefenseHPBonus: null,
    troopAttackBonus: null
  },

  powers: {
    buildPower: null,
    troopPower: null,
    trapPower: null,
    researchPower: null,
    heroPower: null,
    questPower: null
  }
};
var new_profile = {
  // userName: this.game.global.selectedUser,
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
  },

  combatBoost: {
    troopDefenseHPBonus: '+10',
    troopAttackBonus: '+9'
  },

  powers: {
    buildPower: 10,
    troopPower: 20,
    trapPower: 15,
    researchPower: 17,
    heroPower: 20,
    questPower: 30
  }
};

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

var goldTitleStyle = {
  font: '11px Courier',
  fontWeight: 'bold',
  fill: '#000',
  align: 'center',
  boundsAlignH: 'center',
  boundsAlignV: 'middle'
};

var goldValueStyle = {
  font: '11px Courier',
  fontWeight: 'Bold',
  fill: '#000',
  align: 'center',
  boundsAlignH: 'center',
  boundsAlignV: 'middle'
};

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

var chatViewStyle = {
  font: '11px Courier',
  fontWeight: 'light',
  fill: '#000',
  align: 'left',
  boundsAlignH: 'center',
  boundsAlignV: 'middle'
};

var lastChatView = null;

var previousState;

var ProfileState = {

  init: function(params) {
    previousState = '';
    if ((params !== null) && (typeof params !== 'undefined')) {
      previousState = params.previousState;
      console.log(previousState, params);
    }
  },

  preload: function() {
    // this.load.image('background', 'assets/images/profile/background.png');

    this.game.load.nineSlice('profile_button', 'assets/images/profile/profile_button.png', 10, 100, 0, 0);
    this.game.load.nineSlice('profile_button_space', 'assets/images/profile/profile_button_space.png', 0, 0, 0, 0);
    this.game.load.nineSlice('gold_value_button', 'assets/images/profile/gold_value_button2.png', 0, 0, 0, 0);

    this.game.load.nineSlice('my_character_border', 'assets/images/chat/my_character_border.png', 0);
    this.game.load.nineSlice('my_character', 'assets/images/chat/my_character.png', 0);
    this.game.load.nineSlice('other_character_border', 'assets/images/chat/other_character_border.png', 0);
    this.game.load.nineSlice('other_character', 'assets/images/chat/other_character.png', 0);
    this.game.load.nineSlice('my_profile_character', 'assets/images/avatar/default.png', 0);

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

    this.game.load.nineSlice('white', 'assets/images/building/whiteBackground.png', 0, 0, 0, 0);
  },

  //executed after everything is loaded
  create: function() {
    profileState = this;
//    this.background = this.game.add.sprite(0, 0, 'background');
    this.game.stage.backgroundColor = "#fff";
    this.createProfileOverview();
    this.getProfile();

    this.createProfileTopMenus();
    this.createProfileCharacter();
    this.createProfileMiddleMenus();

    this.createProfileBottomMenus();
    this.createRectangle(2, 60, 356, 578, 2, 0x2b2c2e, 0.7);

    this.getChat();

    // Set screen scrolling
    this.game.kineticScrolling.start();
    this.game.world.setBounds(0, 0, this.game.width, 872);
  },

  createProfileTopMenus: function () {
    this.createMenu(2, 0, 'profile_button', 220, 50, 'profile', 'Profile', '#fff', this.clickedProfileMenu, 115, 16, 14);
    this.createMenu(220, 0, 'profile_button_space', 30, 50, 'profile_space', '', null, null, 0, 0);
    this.createMenu(250, 0, 'gold_value_button', 108, 50, 'gold_value', '', null, null, 0, 0);
  },

  createProfileCharacter: function () {
    var profileBackground = this.createMenu(0, 50, 'white', 360, 180, 'profileBackground', null, null, null, null, null);
    var textObject = this.game.add.text(this.game.width / 2 - 30, 150, '[Tag]' + this.game.global.username, {
      font: '16px Courier',
      fontWeight: 'bold',
      fill: '#000',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'

    });
    textObject.inputEnabled = true;
    profileState['UserNameText'] = textObject;
    textObject.cameraOffset.x = this.game.width / 2 - textObject.texture.width / 2;
    textObject.fixedToCamera = true;
    profile.userName = textObject;

    if (this.game.global.selectedUser === this.game.global.username) {
      profile.character_border = this.createMenu(140, 70, 'my_character_border', 80, 75, 'character_border', '', null, null, 0, 0, null);
      profile.character = this.createMenu(150, 81, 'my_character', 60, 53, 'character', '', null, null, 0, 0, null);
    } if ( previousState !== 'ChatState') {
      profile.character_border = this.createMenu(140, 70, 'my_character_border', 80, 75, 'character_border', '', null, null, 0, 0, null);
      profile.character = this.createMenu(150, 77.5, 'my_profile_character', 60, 60, 'character', this.game.global.username, null, null, 0, 0, null);      
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
    button.fixedToCamera = true;

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
    sprite.fixedToCamera = true;
    return sprite;
  },

  createProfileOverview: function() {
    this.createProfileGoldOverviewTitle();
    this.createProfileOverviewTitle();
  },

  createProfileGoldOverviewTitle: function() {
    var goldTexture = this.game.add.text(302, 15, 'GOLD', goldTitleStyle);
    goldTexture.fixedToCamera = true;
  },

  createProfileOverviewTitle: function() {
    this.game.add.text(20, 260, 'Power', middleTitleStyle);
    this.game.add.text(123, 260, 'VIP', middleTitleStyle);
    this.game.add.text(236, 260, 'Kills', middleTitleStyle);
    this.game.add.text(20, 305, 'PowerDestroyed', middleTitleStyle);
    this.game.add.text(123, 305, 'MonstersKilled', middleTitleStyle);
    this.game.add.text(236, 303, 'Win %', middleWinTitleStyle);

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
    var bottomBackground = this.createMenu(0, 554, 'white', 360, 90, 'profileBackground', null, null, null, null, null);
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
    graphics.fixedToCamera = true;
    this.createRectangle(6, 560, 348, 30, 2, 0xa5b0ec, 1);
  },

  clickedProfileMenu: function() {
    profileState.game.state.start(previousState);
  },

  getProfile: function() {
    // polling. we will develop later
    this.resetGoldOverview(new_profile);
    this.resetProfileOverview(new_profile);
    this.resetProfileScore(new_profile);
    this.resetProfileScoreCombatBoosts(new_profile);
    this.resetProfileScorePowers(new_profile);
  },

  resetGoldOverview: function(data) {
    if (profile.gold !== null) {
      profile.gold.destroy();
    }
    console.log(data.gold);
    profile.gold = this.game.add.text(302, 25, data.gold, goldValueStyle);
  },

  resetProfileOverview: function(data) {
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

  drawItemLines: function(lineStartY, count) {
    // var lineStartY = 578;
    var graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x000000, 0.6);
    graphics.moveTo(10,lineStartY);
    var i = 0;
    for (var i = 0; i < count; i ++) {
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

  },

  resetProfileScore: function(data) {
    this.game.add.text(20, 330, 'Combat Stats', middleScoreHeaderStyle);

    this.resetProfileScoreItem(profile.combatState.battles.won, data.combatState.battles.won, 340, 363);
    this.resetProfileScoreItem(profile.combatState.battles.lost, data.combatState.battles.lost, 340, 383);
    this.resetProfileScoreItem(profile.combatState.attacks.won, data.combatState.attacks.won, 340, 402);
    this.resetProfileScoreItem(profile.combatState.attacks.lost, data.combatState.attacks.lost, 340, 422);
    this.resetProfileScoreItem(profile.combatState.defense.won, data.combatState.defense.won, 340, 442);
    this.resetProfileScoreItem(profile.combatState.defense.lost, data.combatState.defense.lost, 340, 462);
    this.resetProfileScoreItem(profile.combatState.battles.ratio, data.combatState.battles.ratio, 340, 482);
    this.resetProfileScoreItem(profile.combatState.playersScouted, data.combatState.playersScouted, 340, 502);
    this.resetProfileScoreItem(profile.combatState.troopsKilled, data.combatState.troopsKilled, 340, 522);

    this.drawItemLines(360, 9);
  },


  resetProfileScoreItem: function(uiItem, dataItem, x, y) {
    if (uiItem != null) {
      uiItem.destroy();
    }
    uiItem = this.game.add.text(x, y, dataItem, middleScoreValueStyle);
    uiItem.x = 345 - uiItem.texture.width;
    uiItem.fixedToCamera = false;
  },

  resetProfileScoreCombatBoosts: function(data) {
    this.game.add.text(20, 552, 'Combat Boosts', middleScoreHeaderStyle);

    this.game.add.text(20, 582, 'Troop Defense HP Bonus:', middleScoreTitleStyle);
    this.game.add.text(20, 602, 'Troop Attack Bonus:', middleScoreTitleStyle);

    this.resetProfileScoreItem(profile.combatBoost.troopDefenseHPBonus, data.combatBoost.troopDefenseHPBonus, 340, 582);
    this.resetProfileScoreItem(profile.combatBoost.troopAttackBonus, data.combatBoost.troopAttackBonus, 340, 602);

    this.drawItemLines(579, 2);
  },

  resetProfileScorePowers: function(data) {
    this.game.add.text(20, 632, 'Powers', middleScoreHeaderStyle);

    this.game.add.text(20, 662, 'Build Power:', middleScoreTitleStyle);
    this.game.add.text(20, 682, 'Troop Power:', middleScoreTitleStyle);
    this.game.add.text(20, 702, 'Trap Power:', middleScoreTitleStyle);
    this.game.add.text(20, 722, 'Research Power:', middleScoreTitleStyle);
    this.game.add.text(20, 742, 'Hero Power:', middleScoreTitleStyle);
    this.game.add.text(20, 762, 'Quest Power:', middleScoreTitleStyle);

    this.resetProfileScoreItem(profile.powers.buildPower, data.powers.buildPower, 340, 662);
    this.resetProfileScoreItem(profile.powers.troopPower, data.powers.troopPower, 340, 682);
    this.resetProfileScoreItem(profile.powers.trapPower, data.powers.trapPower, 340, 702);
    this.resetProfileScoreItem(profile.powers.researchPower, data.powers.researchPower, 340, 722);
    this.resetProfileScoreItem(profile.powers.heroPower, data.powers.heroPower, 340, 742);
    this.resetProfileScoreItem(profile.powers.questPower, data.powers.questPower, 340, 762);

    this.drawItemLines(659, 6);
  },

  getChat: function() {
    $.ajax({ // this is a json object inside the function
      type: 'GET',
      url: server_addr + 'get_messages/',
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

          console.log(new_chat);
          lastChatView = profileState.game.add.text(10, 560, new_chat, chatViewStyle);
          lastChatView.fixedToCamera = true;
        }
      }
    });
  }
};