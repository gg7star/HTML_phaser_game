/**
 * Created by leonverspeek on 9/12/17.
 */
//this game will have only 1 state

var chatState = null;
var server_addr;
var ScrollaPagina = ScrollaPagina || {};
var startScrollOffsetY = 90;
var endScrollOffsetY = 60;
var priorityID = 0;
var last_message_id;

var message_index = 0;
var chat_sapce = 10;
var need_recreate = false;

var popup;
var tween = null;
var selectedUserName = '';

var ChatState = {
  preload: function() {
    // load config file
    this.game.load.json('settings', 'config/settings.json');
    // load button images
    this.game.load.nineSlice('menubar_background', 'assets/images/menu/menubar_background.png', 0);
    this.game.load.nineSlice('menu', 'assets/images/menu/menu.png', 20, 23, 27, 28);
    this.game.load.nineSlice('prefix_menu', 'assets/images/menu/prefix_menu.png', 20, 23, 27, 28);
    this.game.load.nineSlice('exit_menu', 'assets/images/menu/exit_menu.png', 20, 23, 27, 28);
    this.game.load.nineSlice('chat_title', 'assets/images/menu/chat_title.png', 20, 23, 27, 28);
    // load chat images
    this.game.load.nineSlice('my_character_border', 'assets/images/chat/my_character_border.png', 0);
    this.game.load.nineSlice('my_character', 'assets/images/chat/my_character.png', 0);
    this.game.load.nineSlice('my_chat_bg', 'assets/images/chat/my_chat_bg.png', 0);
    this.game.load.nineSlice('other_character_border', 'assets/images/chat/other_character_border.png', 0);
    this.game.load.nineSlice('other_character', 'assets/images/chat/other_character.png', 0);
    this.game.load.nineSlice('other_chat_bg', 'assets/images/chat/other_chat_bg.png', 0);
  },

  init: function() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.kineticScrolling.configure({
      verticalScroll: true,
      horizontalScroll: true
    });
  },
  //executed after everything is loaded
  create: function() {
    if (!this.game.device.desktop) {
      PhaserInput.KeyboardOpen = true;
      PhaserInput.onKeyboardOpen.dispatch();
    }

    this.game.config.settings = this.game.cache.getJSON('settings');
    server_addr = this.game.config.settings.server;

    chatState = this;
    this.game.stage.backgroundColor = "#5E6B9B";

    ///////////////////////////////////
    // scrolling
    //Starts the plugin
    this.game.kineticScrolling.start();

    //If you want change the default configuration after start the plugin
    this.game.world.setBounds(0, 0, this.game.width, this.game.height);

    this.messages = new Array(
      {
        userName: '',
        time: '',
        text: '',
        textObject: null,
        background: {
          imageName: '',
          x: 0,
          y: 90,
          width: 0,
          height: 0
        },
        character: {
          imageName: '',
          x: 0,
          y: 90,
          width: 0,
          height: 0
        },
        characterBoder: {
          imageName: '',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          object: null
        }
      }
     );
    message_index = 0;
    //////////////////////////////////////
    // create menus
    this.createTopMenu();
    // create chatting box
    this.createBottom();
    this.last_time = Date().toString();
    last_message_id = null;
    this.game.global.chattimer = true;
    this.getChat();
    // create chatroom management menu
    this.createManagementWindow();
  },

  createTopMenu: function() {
    // create menu.
    this.createMenu(0, 0, 'menubar_background', 360, 45, 'TopBackground', '', null, 20, 20);
    this.createMenu(0, 0, 'prefix_menu', 65, 45, 'Prefix', '', this.clickedPrefixMenu, 20, 20);
    this.createMenu(65, 5, 'menu', 75, 40, 'Realm', 'Realm', this.clickedRealmMenu, 20, 17);
    this.createMenu(145, 5, 'menu', 75, 40, 'Guild', 'Guild', this.clickedGuildMenu, 20, 17);
    this.createMenu(225, 5, 'menu', 75, 40, 'Custom', 'Custom', this.clickedCustomMenu, 20, 17);
    this.createMenu(295, 0, 'exit_menu', 65, 45, 'Exit', '', this.clickedExitMenu, 0, 0);
    // create title.
    this.createMenu(0, 45, 'chat_title', 360, 45, 'Title', this.game.global.username, null, 160, 17);
  },

  reCreateTopMenu: function() {
    this.destroyMenu('TopBackground');
    this.destroyMenu('Prefix');
    this.destroyMenu('Realm');
    this.destroyMenu('Guild');
    this.destroyMenu('Custom');
    this.destroyMenu('Exit');
    this.destroyMenu('Title');

    this.createTopMenu();
  },

  createBottom: function() {
    // create chatting box
    this.createMenu(0, 580, 'menubar_background', 360, 60, 'BottomBackground', '', null, 0, 0);
    this.createChatEdit(10, 590, 'input', 260, 40, 'Input', '', null, 0, 0);

    this.createMenu(280, 590, 'chat_title', 70, 40, 'Enter', 'Enter', this.clickedEnterButton, 20, 15);
  },

  reCreateBottom: function() {
    this.destroyMenu('BottomBackground');
    this.destroyChatEdit('Input');
    this.destroyMenu('Enter');

    this.createBottom();
  },

  createMenu: function(x, y, imageName, width, height, name, text, callback, offsetX, offsetY) {
    var menuBtn = this.game.add.nineSlice(x, y, imageName, null, width, height);
    // set priority
    menuBtn.inputEnabled = true;
    menuBtn.input.priorityID = priorityID + 1;
    if (callback != null) {
      menuBtn.input.useHandCursor = true;
      menuBtn.events.onInputDown.add(callback);
    }
    this['chat' + name + 'Button'] = menuBtn;
    this['chat' + name + 'Button'].fixedToCamera = true;

    var menuTitle = this.game.add.text(x + offsetX, y + offsetY, text, {
      font: '12px Arial',
      fill: '#fff',
      align: 'center',
      boundsAlignH: 'center',
      bunndsAlignV: 'middle'
    });
    menuTitle.inputEnabled = true;
    menuTitle.input.priorityID = priorityID;
    priorityID +=2;
    // menuBtn.addChild(menuTitle);
    this['chat' + name + 'Text'] = menuTitle;
    this['chat' + name + 'Text'].fixedToCamera = true;

    return menuBtn;
  },

  destroyMenu: function(name) {
    this['chat' + name + 'Button'].destroy();
    this['chat' + name + 'Text'].destroy();
  },

  createChatEdit: function(x, y, imageName, width, height, name, placHolder, callback, offsetX, offsetY) {
    var chatBg = this.game.add.nineSlice(x, y, imageName, null, width, height);
    chatBg.inputEnabled = true;
    chatBg.input.priorityID = priorityID + 1;
    this['chat' + name + 'EditBackground'] = chatBg;
    this['chat' + name + 'EditBackground'].fixedToCamera = true;

    var chat = this.game.add.inputField(x + 5, y + 2, {
      font: '16px Arial',
      fill: '#212121',
      fillAlpha: 0,
      fontWeight: 'bold',
      // forceCase: PhaserInput.ForceCase.upper,
      width: 150,
      max: 255,
      padding: 8,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 6,
      placeHolder: placHolder,
      zoom: false
    });
    chat.inputEnabled = true;
    chat.input.priorityID = priorityID;
    chat.blockInput = false;
    chat.fixedToCamera = true;
    priorityID +=2;
    this['chat' + name + 'Edit'] = chat;
    this['chat' + name + 'Edit'].fixedToCamera = true;

    return chat;
  },

  destroyChatEdit: function(name) {
    this['chat' + name + 'EditBackground'].destroy();
    this['chat' + name + 'Edit'].destroy();
  },

  clickedPrefixMenu: function() {
    alert('clicked prefix menu');
  },

  clickedRealmMenu: function() {
    alert('clicked Realm menu');
  },

  clickedGuildMenu: function() {
    alert('clicked Guild menu');
  },

  clickedCustomMenu: function() {
    alert('clicked Custom menu');
  },

  clickedExitMenu: function() {
    chatState.game.global.chattimer = false;
    chatState.game.state.start('GameState');
  },

  clickedOtherPerson: function() {
    selectedUserName = this.userName;
    console.log(selectedUserName);
    chatState.openManagerMenu();
  },

  clickedMe: function() {
    selectedUserName = this.userName;
    console.log(selectedUserName);
    chatState.game.global.chattimer = false;
//    chatState.clickedCloseButton(selectedUserName);
    chatState.game.global.selectedUser = selectedUserName;
    chatState.state.start('ProfileState');
  },

  createManagementWindow: function () {
    // You can drag the pop-up window around
    popup = chatState.game.add.nineSlice(0, 240,
              'menubar_background', null,
              chatState.game.world.width, 400);
    popup.alpha = 1;
    popup.fixedToCamera = true;

    // And click the close button to close it down again
    var viewProfileButton = chatState.createManagementMenu(20, 40, 'chat_title', 'View Profile',
                              chatState.game.world.width - 40, 50, '#fff',
                              chatState.clickedViewProfileButton, {selectedUserName: selectedUserName});
    var blockUserButton = chatState.createManagementMenu(20, 110, 'chat_title', 'Block',
                              chatState.game.world.width - 40, 50, '#fff',
                              chatState.clickedBlockUserButton, null);
    var closeButton = chatState.createManagementMenu(20, 180, 'chat_title', 'Close',
                              chatState.game.world.width - 40, 50, '#f00',
                              chatState.clickedCloseButton, null);

    // Add all buttons to the popup window image
    popup.addChild(viewProfileButton);
    popup.addChild(blockUserButton);
    popup.addChild(closeButton);

    popup.scale.set(0);
  },
  
  createManagementMenu: function (x, y, imageName, title, width, height, color, callback) {
    var button = chatState.game.add.nineSlice(x, y, imageName, null, width, height);
    button.inputEnabled = true;
    button.input.priorityID = 0;
    button.input.useHandCursor = true;
    button.events.onInputDown.add(callback, this);

    var buttonTitle = this.game.add.text(130, 20, title, {
      font: '14px Arial',
      fill: color === null ? '#000000' : color,
      align: 'center',
      boundsAlignH: 'center',
      bunndsAlignV: 'middle'
    });
    button.addChild(buttonTitle);

    return button;
  },
  
  openManagerMenu: function () {
    if ((tween !== null && tween.isRunning) || popup.scale.x === 1) {
      console.log(tween, popup.scale.x);
      return;
    }
    // Create a tween that will pop-open the window, but only if it's not already tweening or open
    tween = chatState.game.add.tween(popup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
  },

  clickedViewProfileButton: function () {
    chatState.game.global.chattimer = false;
    chatState.clickedCloseButton(selectedUserName);
    chatState.game.global.selectedUser = selectedUserName;
    tween.onComplete.add(function() {chatState.state.start('ProfileState');}, this);
  },

  clickedBlockUserButton: function () {
    console.log('selectedUser = ' + selectedUserName);
    $.ajax({
      type: 'POST',
      url: server_addr + '/block_user_from_chatroom',
      dataType: "JSON",
      data: { 'session':
        {
          'owner_name': chatState.game.global.username,
          'block_username': selectedUserName,
          'chat_room_id': 1
        }
      },
      success: function(result) {
        if (result.status == 'Success') {
//          alert(selectedUserName + ' was blocked by you successfully.');
          chatState.sendMessage(selectedUserName + ' was blocked by me.');
        } else {
          alert(result.message);
          console.log(result.message);
        }
      },
      error: function(xhr) {
        if (xhr.status == 200) {
          alert(xhr.message);
          console.log(xhr.message);
        } else {
          alert(xhr.message);
          console.log(xhr.message);
        }
      }
    });
  },

  clickedCloseButton: function () {
    if (tween && tween.isRunning || popup.scale.x === 0) {
      console.log('clicked Close button');
      return;
    }
    // Create a tween that will close the window, but only if it's not already tweening or closed
    tween = chatState.game.add.tween(popup.scale).to( { x: 0, y: 0 }, 1000, Phaser.Easing.Elastic.In, true);
  },

  clickedEnterButton: function() {
    chatState.sendMessage(chatState.chatInputEdit.value);
  },

  sendMessage: function (text) {
    $.ajax({
      type: 'POST',
      url: server_addr + '/send_message/',
      dataType: "JSON",
      data: { 'session':
        {
          'name': chatState.game.global.username,
          'content': text,
          'chat_room_id': 1
        }
      },
      success: function(result) {
        if (result.status == 'Success') {
          chatState.appendChat(text, chatState.game.global.username, Date().toString());
          if (text == chatState.chatInputEdit.value) {
            chatState.chatInputEdit.resetText();
          }
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

  update: function () {
    if (need_recreate) {
      console.log('reCreateBottom');
      var prev_chat = this.chatInputEdit.value;
      this.reCreateBottom();
      this.chatInputEdit.setText(prev_chat);
      need_recreate = false;
    }

//    // If there is a change in position of the camera, then change the position of the scrollbar
//    if ((typeof this.scroll !== "undefined")&&(this.scroll.cameraY != this.game.camera.y)) {
//      this.scroll.fixedToCamera = false;
//      this.scroll.y = startScrollOffsetY + (this.game.camera.y / (this.game.world.bounds.height - (this.game.height - startScrollOffsetY - endScrollOffsetY))) * (this.game.height - startScrollOffsetY - endScrollOffsetY - 50);
//      this.scroll.cameraY = this.game.camera.y;
//      this.scroll.fixedToCamera = true;
//    }
  },

  createRectangle: function (x, y, w, h) {
    var sprite = this.game.add.graphics(x, y);
    sprite.beginFill(Phaser.Color.getRandomColor(50, 255), 1);
    sprite.bounds = new PIXI.Rectangle(0, 0, w, h);
    sprite.drawRect(0, 0, w, h);
    return sprite;
  },

  createNewMessage: function (text, userName, createdTime) {
    var callback = null;
    var last_message = this.messages[message_index - 1];
    var new_message = {
      userName: '',
      time: '',
      text: '',
      textObject: null,
      background: {
        imageName: '',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        object: null
      },
      character: {
        imageName: '',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        object: null
      },
      characterBoder: {
        imageName: '',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        object: null
      }
    };

    new_message.userName = userName;
    new_message.time = createdTime;
    new_message.text = '[' + userName + "]\n" + text;

    if (userName === this.game.global.username) {
      new_message.textObject = this.game.add.text(30, 10, new_message.text, {
        font: '14px Courier',
        fill: '#000000',
        align: 'left',
        fontWeight: '100',
        wordWrap: true,
        wordWrapWidth: 150
      });

      new_message.characterBoder.imageName = 'my_character_border';
      new_message.characterBoder.x = 10;
      new_message.characterBoder.y = message_index == 0 ? 90 : last_message.background.y + last_message.background.height + chat_sapce;
      new_message.characterBoder.width = 50;
      new_message.characterBoder.height = 47;

      new_message.character.imageName = 'my_character';
      new_message.character.x = 15;
      new_message.character.y = message_index == 0 ? 96 : last_message.background.y + last_message.background.height + chat_sapce + 6;
      new_message.character.width = 40;
      new_message.character.height = 35;

      new_message.background.imageName = 'my_chat_bg';
      new_message.background.x = 60;
      new_message.background.y = new_message.characterBoder.y;
      new_message.background.width = 200; // new_message.textObject.texture.width + 50;

      callback = this.clickedMe;
    } else {

      new_message.textObject = this.game.add.text(10, 10, new_message.text, {
        font: '14px Courier',
        fill: '#000000',
        align: 'left',
        fontWeight: '100',
        boundsAlignH: 'right',
        wordWrap: true,
        wordWrapWidth: 150
      });

      new_message.characterBoder.imageName = 'other_character_border';
      new_message.characterBoder.x = 300;

      new_message.characterBoder.y = message_index == 0 ? 90 : last_message.background.y + last_message.background.height + chat_sapce;
      new_message.characterBoder.width = 50;
      new_message.characterBoder.height = 47;

      new_message.character.imageName = 'other_character';
      new_message.character.x = 305;
      new_message.character.y = message_index == 0 ? 103.5 : last_message.background.y + last_message.background.height + chat_sapce + 13.5;
      new_message.character.width = 40;
      new_message.character.height = 23;

      new_message.background.imageName = 'other_chat_bg';
      new_message.background.x = 100;
      new_message.background.y = new_message.characterBoder.y;
      new_message.background.width = 200; // new_message.textObject.texture.width + 50;

      callback = this.clickedOtherPerson;
    }

    new_message.characterBoder.object = this.game.add.nineSlice(new_message.characterBoder.x, new_message.characterBoder.y,
                                      new_message.characterBoder.imageName, null,
                                      new_message.characterBoder.width, new_message.characterBoder.height);
    new_message.character.object = this.game.add.nineSlice(new_message.character.x, new_message.character.y,
                                      new_message.character.imageName, null,
                                      new_message.character.width, new_message.character.height);

    new_message.background.height = new_message.textObject.texture.height + 15;
    new_message.background.object = this.game.add.nineSlice(new_message.background.x, new_message.background.y,
                                      new_message.background.imageName, null,
                                      new_message.background.width, new_message.background.height);

    new_message.background.object.addChild(new_message.textObject);
    new_message.character.object.inputEnabled = true;
    new_message.character.object.input.useHandCursor = true;
    new_message.character.object.events.onInputDown.add(callback, {userName: new_message.userName});

    this.messages[message_index] = new_message;

    message_index ++;

    return new_message;
  },

  appendChat: function(text, userName, createdTime) {
    // create new chat
    var new_message = this.createNewMessage(text, userName, createdTime);
    var total_heights = new_message.background.y + new_message.background.height + chat_sapce;
    if (total_heights > (this.game.world.height - endScrollOffsetY)) {
      //Changing the world width
      this.game.world.setBounds(0, 0,
        this.game.width, total_heights + endScrollOffsetY);
    }
    this.game.camera.y = this.game.world.height - 640;
    need_recreate = true;
  },

  getChat: function() {
    $.ajax({ // this is a json object inside the function
      type: 'GET',
      url: server_addr + '/get_messages/',
      dataType: "JSON",
      data: { 'session':
        {
          'name': chatState.game.global.username,
          'last_time': chatState.last_time,
          'last_id': last_message_id,
          'chat_room_id': 1
        }
      },
      success: function(result) {
        if (chatState.game.global.chattimer && result.status == 'Success') {
          // added new messages from result
          var new_messages = result.new_messages;
          var last_id = last_message_id;
          for (var i = 0; i < new_messages.length; i ++) {
            if (last_id !== null && new_messages[i].name == chatState.game.global.username) {
              last_message_id = new_messages[i].id;
              continue;
            }
            chatState.appendChat(new_messages[i].content, new_messages[i].name, new_messages[i].created_at);
            last_message_id = new_messages[i].id;
          }
          chatState.reCreateTopMenu();
          chatState.last_time = Date().toString();
          setTimeout(chatState.getChat, 5000);
        } else if (result.status == 'Error') {
          console.log(result.message);
          alert(result.message);
          if (result.message === 'You are blocked on this chat room.') {
            chatState.state.start('GameState');
          }
        }
      }
    });
  }

};