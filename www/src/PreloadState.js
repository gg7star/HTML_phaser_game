var PreloadState = {
  //load the game assets before the game starts
  preload: function() {
    this.game.config.settings = this.game.cache.getJSON('settings');
    this.game.load.baseURL = this.game.config.settings.server;
    getJsonFromAPI('timers', this);

    this.game.load.crossOrigin = 'anonymous';

    this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadBar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);

    this.load.image('background', 'assets/images/splash/background.png');
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

    this.game.config.settings = this.game.cache.getJSON('settings');

    // Global functions to get JSON
    this.game.global.getCommonUI = getCommonUI;
    this.game.global.getPersonalUI = getPersonalUI;
    this.game.global.getResourceValue = getResourceValue;
    this.game.global.getJsonFromAPI = getJsonFromAPI;
    this.game.global.getJsonFromAPIWithParam = getJsonFromAPIWithParam;
    this.game.global.getTileMapAndImage = getTileMapAndImage;
    this.game.global.getResourceImagePath = getResourceImagePath;
    this.game.global.loadImage = loadImage;

    // Global functions to create component
    this.game.global.createBuildings = createBuildings;
    this.game.global.createImageWithText = createImageWithText;
    this.game.global.createInputField = createInputField;
    this.game.global.createRectangle = createRectangle;
    this.game.global.createLine = createLine;
    this.game.global.createTextOnly = createTextOnly;

    // Global functions to create/preload layout UI
    this.game.global.createLayoutByID = createLayoutByID;
    this.game.global.createBottomLayout = createBottomLayout;
    this.game.global.preloadBuildings = preloadBuildings;
    this.game.global.preloadLayout = preloadLayout;
    this.game.global.getLayoutByID = getLayoutByID;

    // Global functions to destroy a UI component and update property of it.
    this.game.global.destroyUIComponent = destroyUIComponent;

    this.game.global.setTextIntoComponent = setTextIntoComponent;
    this.game.global.updateTextIntoComponent = updateTextIntoComponent;
    this.game.global.updateResourceText = updateResourceText;

    // Global functions to add handler into component
    this.game.global.addHandler = addHandler;
    this.game.global.addHandlerWithParameter = addHandlerWithParameter;
    this.game.global.addHandlerWithText = addHandlerWithText;
    this.game.global.addHandlerWithTextAndParameter = addHandlerWithTextAndParameter;

    // Global functions for common chatting
    this.game.global.setChatDescriptionText = setChatDescriptionText;
    this.game.global.getChatPeriodically = getChatPeriodically;
    this.game.global.setChatHander = setChatHander;

    // Global functions to initialize
    this.game.global.initializeState = initializeState;

    // Global variables
    this.game.global.message =  {
                                  last_message_id: null,
                                  last_message1: null,
                                  last_message2: null,
                                  current_state: null,
                                  current_handler: null
                                };
    this.game.global.timers = this.game.cache.getJSON('timers');
    this.game.global.gameChatTimer = this.game.global.timers.find(function(timer){return timer.name === 'chat'});
    this.game.global.gameResourceTimer = this.game.global.timers.find(function(timer){return timer.name === 'resource'});
    this.game.global.resources = null;
    // Go to HomeState
    this.state.start('HomeState');

  }
};


function getCommonUI(uiName, state) {

  return state.load.json(uiName, 'config/commonUI/' + uiName + '.json');

}

function getPersonalUI(uiName, state) {

  return state.load.json(uiName, uiName + '.json?session%5Buser_name%5D=' + state.game.global.username);

}

function getTileMapAndImage(mapName, imageResourceName, imagePath, state) {

  var tileMap = state.game.load.tilemap(mapName, 'config/commonUI/' + mapName + '.json', 
                                        null, Phaser.Tilemap.TILED_JSON);
  state.game.load.image(imageResourceName, imagePath);
  return tileMap;
}

function getResourceValue(valueName, state) {

  return state.load.json(valueName, 'config/commonUI/' + valueName + '.json');

}

function getJsonFromAPI(fileName, state) {

  return state.load.json(fileName, fileName + '.json?session[user_name]=' + state.game.global.username);

}

function getJsonFromAPIWithParam(fileName, parameter, state) {
  return state.load.json(fileName, fileName + '.json?session[user_name]=' + state.game.global.username + 
                         '&' + parameter);
}

function getResourceImagePath(resourceName) {
  return 'assets/images/resource/' + resourceName + '.png';
}

function loadImage(assetName, imagePath, padding, state) {
  if (imagePath === null || assetName === null) {
    return null;
  }

  return state.game.load.nineSlice(assetName, imagePath,
                                   padding.top, padding.left, padding.right, padding.bottom);
}

function createImageWithText(x, y, imageName, width, height, name, title, color, callback, offsetX, offsetY, fontStyle, state) {

  var button = state.game.add.nineSlice(x, y, imageName, null, width, height);
  if (callback !== null) {
    button.inputEnabled = true;
    button.input.priorityID = 1;
    button.input.useHandCursor = true;
    button.events.onInputDown.add(callback, state);
  }
  state[state.key + name + 'Button'] = button;
  state[state.key + name + 'Button'].fixedToCamera = true;

  if (title !== null && title !== '') {
    var style = fontStyle === null ? {
                                        font: '13px sans-serif',
                                        fontWeight: 'bold',
                                        fill: 0x000000,
                                        align: 'center',
                                        boundsAlignH: 'center',
                                        boundsAlignV: 'middle'
                                      }
                                    : fontStyle;
    var buttonTitle = state.game.add.text(offsetX, offsetY, title, style);
    if (style.align === 'center') {
      buttonTitle.x = button.width / 2 - buttonTitle.texture.width / 2;
    }
    buttonTitle.y = button.height / 2 - buttonTitle.texture.height / 2 + 2;
    button.addChild(buttonTitle);
    state[state.key + name + 'Text'] = buttonTitle;
  }

  return button;

}

function createTextOnly(x, y, id, text, fontStyle, callback, state) {

  var textObject = state.game.add.text(x, y, text, fontStyle);
  textObject.inputEnabled = true;
  state[state.key + id + 'Text'] = textObject;
  state[state.key + id + 'Text'].fixedToCamera = true;
  if (callback !== null) {
    textObject.input.useHandCursor = true;
    textObject.events.onInputDown.add(callback, state);
  }

  return textObject;

}

function createInputField(x, y, width, height, style, componentName, imageName, state) {
  var bg = state.game.add.nineSlice(x, y, imageName, null, width, height);
  bg.inputEnabled = true;
  state[state.key + componentName + 'EditBackground'] = bg;
  state[state.key + componentName + 'EditBackground'].fixedToCamera = true;

  var inputField = state.game.add.inputField(x + 18, y + 7, style);
  inputField.inputEnabled = true;
  inputField.blockInput = false;
  inputField.fixedToCamera = true;
  state[state.key + componentName + 'Edit'] = inputField;
  state[state.key + componentName + 'Edit'].fixedToCamera = true;
}
// Example of parameter of createRectangle function
//   style = {
//              x: 0,
//              y: 0,
//              width: 10,
//              height: 10,
//              lineWidth: 1,
//              color: '#ffffff',
//              alpha: 0.8,
//              fixedToCamera: false
//           };
function createRectangle(id, style, state) {

  var sprite = state.game.add.graphics(style.x, style.y);
  sprite.lineStyle(style.lineWidth, style.color, style.alpha);
  if (style.fillColor) {
    sprite.beginFill(style.fillColor, style.fillAlpha);
  }
  sprite.drawRect(0, 0, style.width, style.height);
  if (style.fillColor) {
    sprite.endFill();
  }
  state[state.key + id + 'Rectangle'] = sprite;
  state[state.key + id + 'Rectangle'].fixedToCamera = style.fixedToCamera;

  return sprite;

}

// Example of parameter of createLine function
//   style = {
//              left: 0,
//              top: 0,
//              right: 10,
//              bottom: 10,
//              lineWidth: 1,
//              color: '0x000000',
//              alpha: 0.8,
//              fixedToCamera: false
//           };
function createLine(id, style, state) {
  var graphics = state.game.add.graphics(0, 0);
  graphics.lineStyle(style.lineWidth, style.color, style.alpha);
  graphics.moveTo(style.left, style.top);
  graphics.lineTo(style.right, style.bottom);
  state[state.key + id + 'Line'] = graphics;
  state[state.key + id + 'Line'].fixedToCamera = style.fixedToCamera;

  return graphics;

}

function createBottomLayout(bottomLayoutUI, state) {

  var height = common.createLayoutByID('bottomLayout', bottomLayoutUI, state);

  state.game.global.createRectangle('ChatDescription',
                          {
                            x: 10,
                            y: 593,
                            width: 340,
                            height: 45,
                            lineWidth: 2,
                            color: 0x2b2c2e,
                            alpha: 1,
                            fixedToCamera: true
                          }, 
                          state);

  state.game.global.createLine('ChatDescriptionSeparator',
                          {
                            left: 6,
                            top: 555,
                            right: 354,
                            bottom: 555,
                            lineWidth: 2,
                            color: 0x000000,
                            alpha: 0.8,
                            fixedToCamera: true
                          }, 
                          state);

  state.game.global.createRectangle('ChatDescription',
                          {
                            x: 6,
                            y: 560,
                            width: 348,
                            height: 30,
                            lineWidth: 2,
                            color: 0xa5b0ec,
                            alpha: 1,
                            fixedToCamera: true
                          }, 
                          state);

  // common.createImageWithText(320, 562, 'crown', 30, 30, 'Crown', '', null, state.clickedCrown, 0, 0, null, this);
  return height;
}

function getLayoutByID(id, jsonUI) {

  return jsonUI.layouts.find(function(layout){return layout.id == id;});

}

function createLayoutByID(id, jsonUI, state) {

  var layout = state.game.global.getLayoutByID(id, jsonUI);
  for (var i = 0; i < layout.items.length; i ++) {
    var item = layout.items[i];
    if(typeof item.type !== 'undefined') {
      switch (item.type) {
        case 'inputbox':
          state.game.global.createInputField(item.x, item.y, 
                                             item.width, item.height,
                                             item.fontStyle, 
                                             item.id, item.id, 
                                             state);       
          break;

        case 'label':
          state.game.global.createTextOnly(item.x, item.y, 
                                           item.id, item.text,
                                           item.fontStyle, 
                                           null, state);       
          break;
          
        default:
          break;
      }
    } else {
      state.game.global.createImageWithText(item.x, item.y, item.id,
                                            item.width, item.height,
                                            item.id, item.text, null,
                                            null,
                                            item.padding.text.left, item.padding.text.top,
                                            item.fontStyle, state);      
    }
  }

  return layout.height;

}

function createBuildings(jsonUI, state) {
  var buildings = jsonUI.buildings;
  for (var i = 0; i < buildings.length; i ++) {
    var building = buildings[i];
    state.game.global.createImageWithText(building.x, building.y, building.id,
                                          building.width, building.height,
                                          building.id, building.text, null,
                                          null,
                                          0, 0,
                                          null, state);
  }
}

function preloadLayout(layout, state) {

  var padding = {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                };

  for (var j = 0; j < layout.items.length; j ++ ) {
    var item = layout.items[j];
    if (item.image) {
      if (typeof item.type !== 'undefined' && item.type === 'inputbox') {
        state.game.load.nineSlice(item.id, item.image, 15);
      } else {
        common.loadImage(item.id, item.image, padding, state);
      }
      
    }
  }

}

function preloadBuildings(buildingList, state) {

  var padding = {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                };
  for (var i = 0; i < buildingList.buildings.length; i ++ ) {
    var building = buildingList.buildings[i];
    if (building.image) {
      common.loadImage(building.name, building.image, padding, state);
    }
  }

}

function destroyUIComponent(name, state) {

  if ((typeof state[state.key + name + 'Button'] === 'undefined') || (state[state.key + name + 'Button'] === null)) {
    console.log('Warning: tried to destroy nothing component(' + state.key + name + 'Button' + ') on ' + state.key);
  } else {
    state[state.key + name + 'Button'].destroy();
  }

  if ((typeof state[state.key + name + 'Text'] === 'undefined') || (state[state.key + name + 'Text'] === null)) {
    console.log('Warning: tried to destroy nothing component(' + state.key + name + 'Text' + ') on ' + state.key);
  } else {
    state[state.key + name + 'Text'].destroy();
  }

}

function setTextIntoComponent(componentName, text, callback, state) {
  var imageName = state.key + componentName + 'Button';
  var textName =  state.key + componentName + 'Text';
  var property =  {
                    x: state[imageName].x,
                    y: state[imageName].y,
                    width: state[imageName].width,
                    height: state[imageName].height,
                    offsetX: state[textName].x,
                    offsetY: state[textName].y,
                    fontStyle:  state[textName].style
                  };
  state.game.global.destroyUIComponent(componentName, state);
  state.game.global.createImageWithText(property.x, property.y, 
                        componentName,
                        property.width, property.height, 
                        componentName, text,
                        null, callback, 
                        property.offsetX, property.offsetY, 
                        property.fontStyle, state);
}

function updateTextIntoComponent(componentName, text, callback, state) {
  
  state[state.key + componentName + 'Text'].text = text;

}

function updateResourceText(resourcesParam, state) {

    common.updateTextIntoComponent('resourceWoodValue', '' + resourcesParam.wood, null, state);
    common.updateTextIntoComponent('resourceStoneValue', '' + resourcesParam.stone, null, state);
    common.updateTextIntoComponent('resourceFoodValue', '' + resourcesParam.food, null, state);
    common.updateTextIntoComponent('resourceIronValue', '' + resourcesParam.iron, null, state);
    common.updateTextIntoComponent('resourceMoneyValue', '' + resourcesParam.money, null, state);
    common.updateTextIntoComponent('resourceVIP', '' + resourcesParam.vip + '\n' + 'VIP', null, state);
    common.updateTextIntoComponent('resourcePower', 'Power' + '\n' + resourcesParam.power, null, state);
    common.updateTextIntoComponent('resourceGold', 'Gold' + '\n' + resourcesParam.gold, null, state);
  
  }

function setChatDescriptionText(chatText, state) {

  console.log(chatText);
  console.log(state);
  console.log(state['CityStatechatDescriptionBackgroundText']);
  state.game.global.destroyUIComponent('chatDescriptionBackground', state);
  state.game.global.destroyUIComponent('crown', state);

  var chatViewStyle = {
                        font: '11px Courier',
                        fontWeight: 'light',
                        fill: 0x000000,
                        align: 'left',
                        boundsAlignH: 'center',
                        boundsAlignV: 'middle'
                      };
  state.game.global.createImageWithText(6, 560, 'chatDescriptionBackground',
                        348, 30, 'chatDescriptionBackground', chatText,
                        null, null,
                        4, 0, chatViewStyle, state);

  state.game.global.createImageWithText(320, 562, 'crown',
                        30, 30, 'crown', '',
                        null, null,
                        0, 0, null, state);

}

function addHandler(componentName, handler, state) {
    
  state[state.key + componentName + 'Button'].inputEnabled = true;
  state[state.key + componentName + 'Button'].input.useHandCursor = true;
  state[state.key + componentName + 'Button'].events.onInputDown.add(handler, state);

}

function addHandlerWithParameter(componentName, parameterName, parameterValue, handler, state) {
  state.game.global.addHandler(componentName, handler, state);
  state[state.key + componentName + 'Button'][parameterName] = parameterValue;
}

function addHandlerWithText(componentName, handler, state) {
  state.game.global.addHandler(componentName, handler, state);

  // if (typeof state[state.key + componentName + 'Text'] === 'undefined') {
  //   return;
  // }
  state[state.key + componentName + 'Text'].inputEnabled = true;
  state[state.key + componentName + 'Text'].input.useHandCursor = true;
  state[state.key + componentName + 'Text'].events.onInputDown.add(handler, state);

}

function addHandlerWithTextAndParameter(componentName, parameterName, parameterValue, handler, state) {

  state.game.global.addHandlerWithText(componentName, handler, state);

  state[state.key + componentName + 'Text'][parameterName] = parameterValue;
  state[state.key + componentName + 'Button'][parameterName] = parameterValue;
}

function initializeState(state) {

  state.game.global.message.last_message_id = '';
  state.game.global.message.last_message1 = '';
  state.game.global.message.last_message2 = '';

}

// var is_switch_state = false;
function setChatHander(state, handler) {
  state.game.global.message.current_state = state;
  state.game.global.message.current_handler = handler;
}

function getChatPeriodically(state, handler) {

  var common = state.game.global;

  $.ajax({ // this is a json object inside the function

    type: 'GET',

    url: server_addr + 'get_messages/',

    dataType: "JSON",

    data: { 'session':
            {
              'name': common.username,
              'last_time': Date().toString(),
              'last_id': common.message.last_message_id,
              'chat_room_id': 1
            }
          },

    success: function(result) {

      if (state.chatTimerEnable && result.status == 'Success') {
        
        // added new messages from result
        var new_messages = result.new_messages;
        if (new_messages.length > 0) {

          if (new_messages.length >= 2) {
            common.message.last_message1 = new_messages[new_messages.length - 2];
          } else if (new_messages.length == 1) {
            common.message.last_message1 = common.message.last_message2;
          } else if (new_messages.length == 0) {

          }

          common.message.last_message2 = new_messages[new_messages.length - 1];
          common.message.last_message_id = common.message.last_message2.id;

          var new_chat = common.message.last_message1.name + ': ' + common.message.last_message1.content + '\n' +
                         common.message.last_message2.name + ': ' + common.message.last_message2.content;
          
          if (common.message.current_state != null && common.message.current_handler != null) {
            console.log("===== call hanlder ====");
            common.message.current_state[common.message.current_handler.name](new_chat);  
          }

        }
        
        setTimeout( function() {
            common.getChatPeriodically(common.message.current_state, common.message.current_handler);
          }, 
          common.gameChatTimer.interval
        );
        
      }

    },

    error: function(xhr) {

      if (xhr.status == 200) {
        console.log(xhr.message);
      } else {
        console.log(xhr.message);
      }

    }

  });

}
