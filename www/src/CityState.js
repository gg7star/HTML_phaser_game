var cityState;
var common;
var totalLayoutHeight;

// var last_message_id;
// var last_message1;
// var last_message2;

var map;
var layer;
var marker;
var currentTile;
var cursors;
var selectedBuilding;
var topLayoutUI;
var bottomLayoutUI;
var queuesLayoutUI;
var personalUI;
var allBuildingsInfo;

var queues_height;

var queueTitleFlag;

var CityState = {

  chatTimerEnable: false,
  resourceTimerEnable: false,
  resources: null,

  init: function(params) {

    this.scale.fullScreenScaleMode = Phaser.ScaleManager.ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.kineticScrolling.configure({ verticalScroll: true,
                                           horizontalScroll: true
                                        });
    selectedBuilding = null;
    if ((params !== null) && (typeof params !== 'undefined')) {
      console.log('params = ', params);
      selectedBuilding = params;
    }

    cityState = this;
    common = this.game.global;
    this.initialize();

    totalLayoutHeight = 0;
    personalUI = null;
    bottomLayoutUI = null;
    topLayoutUI = null;
    lastChatView = null;

    this.resources = null;
    
    queues_height = 0;
    queueTitleFlag = false;

    currentTile = null;

  },

  preload: function() {

    // Load city tiled map and building images.
    common.getTileMapAndImage('cityTileMap', 'tiles', 'assets/images/city/CityTileSet.png', this);
    // Load bottom part images.
    common.getCommonUI('cityTopLayout', this);
    // Load bottom part images.
    common.getCommonUI('queuesLayoutUI', this);
    // Load bottom part images.
    common.getCommonUI('bottomLayout', this);
    // Load user resources
    common.getJsonFromAPI('user_private_resources', this);
    // Get all buildings info
    common.getJsonFromAPI('buildings', this);
    // Load buildings json file
    var jsonFile = common.getPersonalUI('get_city_map_buildings', this);

    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {
      if(cacheKey == 'cityTopLayout') {
        topLayoutUI = cityState.game.cache.getJSON(cacheKey);
        cityState.preloadTopUIFromJson();
      }
      if(cacheKey == 'queuesLayoutUI') {
        queuesLayoutUI = cityState.game.cache.getJSON(cacheKey);
        // cityState.preloadQueuesLayoutUIFromJson();
      }
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = cityState.game.cache.getJSON(cacheKey);
        cityState.preloadBottomUIFromJson();
      }

      if(cacheKey == 'get_city_map_buildings') {
        personalUI = cityState.game.cache.getJSON(cacheKey);
        console.log("=== personalUI: ", personalUI);
        // Added already this building in BuildingBuidState
        // if (selectedBuilding !== null && typeof selectedBuilding !== 'undefined') {
        //   personalUI.buildings.push({
        //       col: selectedBuilding.building.col,
        //       row: selectedBuilding.building.row,
        //       name: selectedBuilding.building.name,
        //       image: selectedBuilding.building.image,
        //       level: selectedBuilding.building.level,
        //       fullName: selectedBuilding.building.fullName
        //     });
        // }
        cityState.preloadBuildings();
      }

      if(cacheKey == 'user_private_resources') {
        cityState.resources = cityState.game.cache.getJSON(cacheKey);
      }

      if(cacheKey == 'buildings') {
        allBuildingsInfo = cityState.game.cache.getJSON(cacheKey);
      }

    }, this);

  },

  create: function() {

    this.game.stage.backgroundColor = "#FFFFFF";

    // Add city map as background
    this.createCityMap();

    // Add buildings of user
    this.createBuildings();

    // Create top part.
    this.createTopMenus();
    // Refresh resources
    this.getResource();
    resourceTimerEnable = common.gameResourceTimer.enable;

    // Create bottom part.
    this.createBottomMenus();
    // Chat
    this.chatTimerEnable = common.gameChatTimer.enable;
    this.resourceTimerEnable = common.gameResourceTimer.enable;
    // Check duplication 
    if (common.message.current_state == null) {
      common.getChatPeriodically(this, null);
    }
    common.setChatHander(this, this.setChatDescriptionText);

  },

  preloadTopUIFromJson: function() {

    // Load bottom images.
    var topLayout = common.getLayoutByID('topLayout', topLayoutUI);
    common.preloadLayout(topLayout, this);

  },

  preloadBottomUIFromJson: function() {

    // Load bottom images.
    var bottomLayout = common.getLayoutByID('bottomLayout', bottomLayoutUI);
    common.preloadLayout(bottomLayout, this);

  },

  preloadBuildings: function() {
    
    common.preloadBuildings(personalUI, cityState);

  },

  createCityMap: function() {

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // Set screen scrolling
    this.game.kineticScrolling.start();

    cursors = this.game.input.keyboard.createCursorKeys();
    map = this.add.tilemap('cityTileMap');
    map.addTilesetImage('CityTileSet', 'tiles');
    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    // Revise for height declination
    this.game.world.setBounds(0, 0, 
                              this.game.world.width + 4, 
                              this.game.world.height + bottomLayoutUI.layouts[0].height + 4);

    //  Create our tile selector at the top of the screen
    this.createTileSelector();
    this.game.input.addMoveCallback(this.updateMarker, this);

  },

  createBuildings: function() {

    personalUI = this.createBuildingsFromJsonUI(personalUI, this);

  },

  createBuildingsFromJsonUI: function (jsonUI, state) {

    var buildings = jsonUI.buildings;
    for (var i = 0; i < buildings.length; i ++) {
      var building = buildings[i];
      var sprite = state.game.add.sprite(building.col * map.tileWidth, building.row * map.tileHeight, building.name);
      state.game.physics.enable(sprite);
    }
    return jsonUI;

  },

  createTopMenus: function() {

    // Create top layout.
    var topLayoutHeight = common.createLayoutByID('topLayout', topLayoutUI, this); 
    totalLayoutHeight += topLayoutHeight;
    // Add reosurce value
    this.setResourceText(cityState.resources);
    // Add handler for top menu.
    this.addTopMenuHandler();

    this.game.world.setBounds(0, -1 * topLayoutHeight - 4, 
                          this.game.world.width, 
                          this.game.world.height + topLayoutHeight + 4);

  },

  setResourceText: function(resourcesParam) {

    common.setTextIntoComponent('resourceWoodValue', '' + resourcesParam.wood, null, cityState);
    common.setTextIntoComponent('resourceStoneValue', '' + resourcesParam.stone, null, cityState);
    common.setTextIntoComponent('resourceFoodValue', '' + resourcesParam.food, null, cityState);
    common.setTextIntoComponent('resourceIronValue', '' + resourcesParam.iron, null, cityState);
    common.setTextIntoComponent('resourceMoneyValue', '' + resourcesParam.money, null, cityState);
    common.setTextIntoComponent('resourceVIP', '' + resourcesParam.vip + '\n' + 'VIP', null, cityState);
    common.setTextIntoComponent('resourcePower', 'Power' + '\n' + resourcesParam.power, null, cityState);
    common.setTextIntoComponent('resourceGold', 'Gold' + '\n' + resourcesParam.gold, null, cityState);

  },

  updateResourceText: function(resourcesParam) {

    cityState.resources = resourcesParam;
    common.updateResourceText(resourcesParam, cityState);

  },

  destroyQueueItem: function(queueItem) {
    if (cityState[cityState.key + queueItem.id + 'BackgroundRectangle'] && 
      typeof cityState[cityState.key + queueItem.id + 'BackgroundRectangle'] !== 'undefined') {
      cityState[cityState.key + queueItem.id + 'BackgroundRectangle'].destroy();
    }
    if (cityState[cityState.key + queueItem.id + 'ProgressRectangle'] && 
      typeof cityState[cityState.key + queueItem.id + 'ProgressRectangle'] != 'undefined') {
      cityState[cityState.key + queueItem.id + 'ProgressRectangle'].destroy();
    }
    if (cityState[cityState.key + queueItem.id + 'TitleText'] && 
      typeof cityState[cityState.key + queueItem.id + 'TitleText'] != 'undefined') {
      cityState[cityState.key + queueItem.id + 'TitleText'].destroy();
    }
    if (cityState[cityState.key + queueItem.id + 'RemainingTimeText'] && 
      typeof cityState[cityState.key + queueItem.id + 'RemainingTimeText'] != 'undefined') {
      cityState[cityState.key + queueItem.id + 'RemainingTimeText'].destroy();
    }
  },

  convertTimeToString: function(remainingTimeParam) {
    console.log('=== remainingTime: ', remainingTimeParam);
    var minimumTime = new Date('2000-01-01 00:00:00 UTC');
    var remainingTime = new Date(remainingTimeParam);
    // get total seconds between the times
    var delta = Math.abs(remainingTime - minimumTime) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = delta % 60;  // in theory the modulus is not required

    var strMinutes = '' + (minutes < 10 ? '0' + minutes : minutes);
    var strSeconds = '' + (seconds < 10 ? '0' + seconds : seconds);
    var strHours = '' + (hours < 10 ? '0' + hours : hours);
    var res = (hours > 0 ? strHours : '00') + ':' + 
              (minutes > 0 ? strMinutes : '00') + ':' +
              (seconds > 0 ? strSeconds : '00');
    res = (days > 0 ? days + 'd ' : '') + res;
    console.log('=== res:', res);
    return res;
  },

  createQueueItem: function(queueItem, text, remainingTime, progressValue) {
    // Create item
    queues_height += queueItem.padding.top;
    // Background bar
    common.createRectangle(queueItem.id + 'Background',
                          {
                            x: queueItem.x,
                            y: queues_height,
                            width: queueItem.width,
                            height: queueItem.height,
                            lineWidth: queueItem.border.lineWidth,
                            color: queueItem.border.color,
                            fillColor: 0x9E9E9E,
                            fillAlpha: 0.7,
                            alpha: 1,
                            fixedToCamera: true
                          }, 
                          cityState);

    // Progress bar
    common.createRectangle(queueItem.id + 'Progress',
                    {
                      x: queueItem.x,
                      y: queues_height,
                      width: queueItem.width - (progressValue * queueItem.width),
                      height: queueItem.height,
                      lineWidth: queueItem.border.lineWidth,
                      color: queueItem.border.color,
                      fillColor: 0x111111,
                      fillAlpha: 0.9,
                      alpha: 1,
                      fixedToCamera: true
                    }, 
                    cityState);

    common.createTextOnly(queueItem.x + queueItem.padding.text.left, queues_height + queueItem.padding.text.top, 
                          queueItem.id + 'Title', text, 
                          queueItem.fontStyle, 
                          null, cityState);

    // Create remaining time.
    console.log('=== queueItem: ', queueItem);
    console.log('=== remaining_time: ', remainingTime);
    var timeTexture = common.createTextOnly(queueItem.x + queueItem.padding.text.left, queues_height + queueItem.padding.text.top, 
                          queueItem.id + 'RemainingTime', cityState.convertTimeToString(remainingTime), 
                          queueItem.fontStyle, 
                          null, cityState);
    timeTexture.cameraOffset.x = queueItem.x + queueItem.width - timeTexture.width - queueItem.padding.text.right;
        
    queues_height += queueItem.height;
  },

  calculateProgress: function(queueItem) {
    minimum_time = new Date('2000-01-01 00:00:00 UTC');
    total_time = new Date(queueItem.total_time);
    remaining_time = new Date(queueItem.remaining_time);
    console.log((remaining_time -  minimum_time) / (total_time - minimum_time));
    return (remaining_time -  minimum_time) / (total_time - minimum_time);
  },

  createQueues: function(queueParams) {
    var queuesLayout = queuesLayoutUI.layouts[0];
     
    queues_height = queuesLayout.top + queuesLayout.padding.top;

    if (common.resources.queues.building_queue) {
      cityState.createQueueItem(queuesLayout.items[0], 
        queueTitleFlag ? queuesLayout.items[0].text : common.resources.queues.building_queue.building_level_name,
        common.resources.queues.building_queue.remaining_time,
        cityState.calculateProgress(common.resources.queues.building_queue));
    }
    
    if (common.resources.queues.defense_queue) {
      cityState.createQueueItem(queuesLayout.items[1], 
        queueTitleFlag ? queuesLayout.items[1].text : common.resources.queues.defense_queue.defense_name,
        common.resources.queues.defense_queue.remaining_time,
        cityState.calculateProgress(common.resources.queues.defense_queue));
    }

    if (common.resources.queues.troop_queue) {
      cityState.createQueueItem(queuesLayout.items[2], 
        queueTitleFlag ? queuesLayout.items[2].text : common.resources.queues.troop_queue.troop_name,
        common.resources.queues.troop_queue.remaining_time,
        cityState.calculateProgress(common.resources.queues.troop_queue));
    }
    queueTitleFlag = queueTitleFlag ? false : true;
  },

  updateQueues: function(queuesParams) {
    var queuesLayout = queuesLayoutUI.layouts[0];
     
    for (var i = 0; i < queuesLayout.items.length; i++) {
      cityState.destroyQueueItem(queuesLayout.items[i]);
    }

    cityState.createQueues(queuesParams);
  },

  createBottomMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createBottomLayout(bottomLayoutUI, this);
    // Add handler for top menu.
    this.addBottomMenuHandler();

  },

  addTopMenuHandler: function() {
    common.addHandler('resourcePower', this.clickedPower, this);
  },

  addBottomMenuHandler: function() {

    // Add handler of Instant Build button.
    common.addHandler('building', this.clickedBuilding, this);
    common.addHandler('quest', this.clickedQuest, this);
    common.addHandler('items', this.clickedItems, this);
    common.addHandler('guild', this.clickedGuild, this);
    common.addHandler('mail', this.clickedMail, this);
    common.addHandler('more', this.clickedMore, this);

    common.addHandler('chatDescriptionBackground', cityState.clickedChatDescription, cityState);
    common.addHandler('crown', cityState.clickedCrown, cityState);
  },

  clickedPower: function() {
    cityState.initialize();
    cityState.game.state.start('ProfileState', true, false, {previousState: cityState.key});
  },

  clickedBackground: function() {

    // cityState.initialize();
    // cityState.game.state.start('BuildingState');
    
  },

  clickedChatDescription: function (sprite) {

    cityState.initialize();
    this.game.state.start('ChatState');

  },

  clickedBuilding: function() {

    cityState.initialize();
    this.game.state.start('GameState');

  },

  clickedQuest: function() {

    alert('Quest is clicked');

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

    cityState.initialize();
    this.game.state.start('ChatState');

  },

  setChatDescriptionText: function(chatText) {

    common.setChatDescriptionText(chatText, cityState);
   
    common.addHandler('chatDescriptionBackground', cityState.clickedChatDescription, cityState);
    common.addHandler('crown', cityState.clickedCrown, cityState);

  },

  getResource: function() {

    $.ajax({

      type: 'GET',
      url: server_addr + 'user_private_resources',
      data: { 'session':
              {
                'user_name': common.username
              }
            },
      success: function(result) {
        if (cityState.resourceTimerEnable && result !== null) {
          common.resources = result;
          cityState.updateResourceText(result);
          // Create queues
          console.log("cityState: ", cityState);
          cityState.updateQueues(result.queues);
          console.log("=== common.resources: ", common.resources);
          setTimeout(cityState.getResource, common.gameResourceTimer.interval);
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

  },

  pickTile: function(sprite, pointer) {

    currentTile = cityState.game.math.snapToFloor(pointer.x, map.tileWidth) / map.tileWidth;

  },

  updateMarker: function() {

    if (cityState.game.input.activePointer.worldY >= (cityState.game.world.height - bottomLayoutUI.layouts[0].height) - 4) {
      return;
    }

    marker.x = layer.getTileX(cityState.game.input.activePointer.worldX) * map.tileWidth;
    marker.y = layer.getTileY(cityState.game.input.activePointer.worldY) * map.tileHeight;

    if (cityState.game.input.mousePointer.isDown) {
      if (cityState.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
          currentTile = map.getTile(layer.getTileX(marker.x), layer.getTileY(marker.y));
      } else {
          // map.putTile(currentTile, layer.getTileX(marker.x), layer.getTileY(marker.y), layer);
      }
    } else if (cityState.game.input.mousePointer.isUp && currentTile != null) {
      var tile = map.getTile(layer.getTileX(marker.x), layer.getTileY(marker.y));
      if (tile !== null && currentTile !== null && typeof currentTile !== 'undefined' && tile.index == currentTile.index) {
        if (currentTile.properties.buildingType == 'treeBlocker') {
          console.log('Skip treeBlocker.');
          return;
        }
        cityState.initialize();
        var currentBuildingName = currentTile.properties.buildingType;
        console.log("=== currentTile: ", currentTile);
        if (currentBuildingName === 'cityPlot' || currentBuildingName === 'resourcePlot') {
          // find custome buildings json file.
          var building = personalUI.buildings.find(function(building){
                                                      return (building.col == currentTile.x) && 
                                                             (building.row == currentTile.y);
                                                    });
          if (building === null || typeof building === 'undefined') {
            var baseType;
            if (layer.getTileY(marker.y) <= 3) {
              // Go to CityBuildingState.
              console.log('Go to CityBuildingState');
              baseType = 'cityPlot';
              cityState.game.state.start('CityBuildingState', true, false, 
                                          {
                                            col: layer.getTileX(marker.x), 
                                            row: layer.getTileY(marker.y), 
                                            baseType: baseType
                                          }
                                        );
            } else {
              // Go to ResourceBuildingState.
              console.log('Go to ResourceBuildingState');
              baseType = 'resourcePlot';
              cityState.game.state.start('ResourceBuildingState', true, false, 
                                          {
                                            col: layer.getTileX(marker.x), 
                                            row: layer.getTileY(marker.y), 
                                            baseType: baseType
                                          }
                                        );
            }
          } else {
            // Go to BuildingProductingState
            console.log('Go to BuildingProducingState: ', building);
            building.fullName = building.full_name;
            cityState.game.state.start('BuildingProducingState', true, false, {building: building});
            switch (building.name) {
              case 'camp':
                console.log('Go to CampState with tile.', building);
                // checked level of registered wall building
                // var userCampBuilding = personalUI.buildings.find(function(buildingInfo){return buildingInfo.name === 'camp'});
                // if (typeof userCampBuilding === 'undefined') {
                //   building.level = 1;
                // } else {
                //   building.level = userCampBuilding.level;
                // }
                cityState.game.state.start('CampState', true, false, {building: building});
                break;

              case 'barracks':
                console.log('Go to BarracksState with tile.', building);
                // checked level of registered wall building
                // var userBarracksBuilding = personalUI.buildings.find(function(buildingInfo){return buildingInfo.name === 'barracks'});
                // if (typeof userBarracksBuilding === 'undefined') {
                //   building.level = 1;
                // } else {
                //   building.level = userBarracksBuilding.level;
                // }
                cityState.game.state.start('BarracksState', true, false, {building: building});
                break;

              default:
                console.log('Go to BuildingUpgradeState with tile.', building);
                cityState.game.state.start('BuildingProducingState', true, false, {building: building});            
                break;

            }
          }
        } else {
          // Go to BuildingBuildState
          var buildingBasicInfo = allBuildingsInfo.find(function(buildingInfo){return buildingInfo.name === currentBuildingName});
          console.log(buildingBasicInfo);
          var building =  {
                            fullName: buildingBasicInfo.full_name,
                            name: currentTile.properties.buildingType,
                            image: buildingBasicInfo.image,
                            level: 2,
                            col: currentTile.x,
                            row: currentTile.y
                          };
          console.log(currentTile);
          console.log(building);
          switch (building.name) {

            case 'wallEntry':
            case 'wall':
              console.log('Go to WallProductionState with tile.', building);
              // checked level of registered wall building
              console.log('========= personalUI: ', personalUI);
              var userWallBuilding = personalUI.buildings.find(function(buildingInfo){return buildingInfo.name === 'wall' || buildingInfo.name === 'wallEntry'});
              building.level = userWallBuilding.level
              cityState.game.state.start('WallProductionState', true, false, {building: building});
              break;

            case 'camp':
              console.log('Go to CampState with tile.', building);
              // checked level of registered wall building
              // var userCampBuilding = personalUI.buildings.find(function(buildingInfo){return buildingInfo.name === 'camp'});
              // if (typeof userCampBuilding === 'undefined') {
              //   building.level = 1;
              // } else {
              //   building.level = userCampBuilding.level;
              // }
              cityState.game.state.start('CampState', true, false, {building: building});
              break;

            case 'barracks':
              console.log('Go to BarracksState with tile.', building);
              // checked level of registered wall building
              // var userBarracksBuilding = personalUI.buildings.find(function(buildingInfo){return buildingInfo.name === 'barracks'});
              // if (typeof userBarracksBuilding === 'undefined') {
              //   building.level = 1;
              // } else {
              //   building.level = userBarracksBuilding.level;
              // }
              cityState.game.state.start('BarracksState', true, false, {building: building});
              break;

            default:
              console.log('Go to BuildingProducingState with tile.', building);
              cityState.game.state.start('BuildingProducingState', true, false, {building: building});            
              break;

          }
        }
        // cityState.game.state.start('ResourceBuildingState', true, false, {col: layer.getTileX(marker.x), row: layer.getTileY(marker.y)});
      }
    }

  },

  update: function() {

    if (cursors.left.isDown) {
      cityState.game.camera.x -= 4;
    } else if (cursors.right.isDown) {
      cityState.game.camera.x += 4;
    }

    if (cursors.up.isDown) {
      cityState.game.camera.y -= 4;
    } else if (cursors.down.isDown) {
      cityState.game.camera.y += 4;
    }

  },

  createTileSelector: function() {

    //  Our painting marker
    marker = cityState.game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, map.tileWidth, map.tileHeight);

  },

  initialize: function() {
    cityState.chatTimerEnable = false;
    cityState.resourceTimerEnable = false;
    common.initializeState(cityState);
  }

};
