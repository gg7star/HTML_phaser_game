/**
 * Created by leonverspeek on 10/6/17.
 */

var buildingBuildState;
var common;

var totalLayoutHeight;
var selectedBuilding;
var bottomLayoutUI;
var buildingBuildUI;
var buildingBuildValues;

var BuildingBuildState = {
  
  chatTimerEnable: false,

  init: function(params) {

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.kineticScrolling.configure({
      verticalScroll: true,
      horizontalScroll: true
    });

    if ((params !== null) && (typeof params !== 'undefined')) {
      selectedBuilding = params;
    }

    buildingBuildState = this;
    common = this.game.global;
    this.initialize();

    totalLayoutHeight = 0;

  },

  preload: function() {

    // Load json file for buildingBuild images.
    common.getCommonUI('bottomLayout', this);
    common.getCommonUI('buildingBuildUI', this);
    // Make parameter
    console.log("===== selectedBuilding: ", selectedBuilding);
    var paramString = 'session[building][name]=' + selectedBuilding.building.name + 
                      '&session[building][level]=' + selectedBuilding.building.level;
    var jsonFile = common.getJsonFromAPIWithParam('building_level_requirements', paramString, this);

    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {

      if(cacheKey == 'building_level_requirements') {
        buildingBuildValues = this.game.cache.getJSON(cacheKey);
        console.log("=== buildingBuildValues: ", buildingBuildValues);
      }
      
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = this.game.cache.getJSON(cacheKey);
        this.preloadBottomUIFromJson();
      }

      if(cacheKey == 'buildingBuildUI') {
        buildingBuildUI = this.game.cache.getJSON(cacheKey);
        this.preloadUIFromJson();
      }

    }, this);

  },

  create: function() {

    this.game.stage.backgroundColor = "#FFF";
    // Set screen scrolling
    this.game.kineticScrolling.start();
    this.game.world.setBounds(0, 0, this.game.width, this.game.height);

    this.preloadUIFromJson();
    // Create top part.
    this.createTopMenus();

    // Create building details.
    this.createBuildingDetails();

    // Create values.
    this.createValues();

    // Create bottom part.
    this.createBottomMenus();
    this.chatTimerEnable = common.gameChatTimer.enable;
    common.setChatHander(this, this.setChatDescriptionText);

  },

  preloadUIFromJson: function () {

    var buildingName = selectedBuilding.building.fullName;
    var buildingLevel = selectedBuilding.building.level;

    var ui = buildingBuildUI;

    // set building name into top layout title.
    var topLayout = common.getLayoutByID("topLayout", buildingBuildUI);
    var titleMenuItem = topLayout.items.find(function(item){return item.id == "titleMenu";});
    titleMenuItem.text = buildingName;

    // Set building image and name into middle layout
    var middleLayout = common.getLayoutByID('middleLayout', buildingBuildUI);

    var buidlingImageItem = middleLayout.items.find(function(item){return item.id == 'buildingImage';});
    buidlingImageItem.image = selectedBuilding.building.image;

    var descriptionItem = middleLayout.items.find(function(item){return item.id == 'description';});
    descriptionItem.text = descriptionItem.prefix + ' ' + buildingLevel + ' ' + buildingName;

    // Load menu images.
    for (var i = 0; i < ui.layouts.length - 1; i ++) {
      common.preloadLayout(ui.layouts[i], this);
    }

    var padding = {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                  };
    // Load value images. e.g. possibleImage, impossibleImage, etc.
    var valueLayout = common.getLayoutByID("valueLayout", buildingBuildUI);
    for (var i = 0; i < valueLayout.images.length; i ++) {
      var imageItem = valueLayout.images[i];
      common.loadImage(imageItem.id, imageItem.image, padding, this);
    }

  },

  preloadBottomUIFromJson: function() {

    // Load bottom images.
    var bottomLayout = common.getLayoutByID('bottomLayout', bottomLayoutUI);
    common.preloadLayout(bottomLayout, this);

  },

  createTopMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createLayoutByID('topLayout', buildingBuildUI, this);

    // Add handler for top menu.
    this.addTopMenuHandler();

  },

  addTopMenuHandler: function() {

    // Add handler for title menu.
    common.addHandlerWithText('titleMenu', this.clickedReturn, this);

    // Add handler of return button.
    common.addHandler('returnButton', this.clickedReturn, this);

  },

  createBuildingDetails: function() {

    // Create top layout.
    totalLayoutHeight += common.createLayoutByID('middleLayout', buildingBuildUI, this);

    // Add handler for building details.
    this.addBuildHandler();

  },

  addBuildHandler: function() {

    // Add handler of Instant Build button.
    common.addHandlerWithText('instantBuildButton', this.clickedInstantBuild, this);

    // Add handler of Build button.
    common.addHandlerWithText('buildButton', this.clickedBuild, this);

  },

  createValues: function() {

    var valueLayout = common.getLayoutByID('valueLayout', buildingBuildUI);
    for (var i = 0; i < valueLayout.items.length; i ++) {
      var itemUI = valueLayout.items[i];
      var values = buildingBuildValues[itemUI.title.id];
      console.log("=== itemUI.title.id: ", itemUI.title.id);
      console.log("=== buildingBuildValues[itemUI.title.id]: ", values);
      if (typeof values === 'undefined') {
        continue;
      }
      totalLayoutHeight += itemUI.title.padding.text.top;
      var itemTitle = common.createTextOnly(itemUI.title.x, totalLayoutHeight,
                                          itemUI.title.id, itemUI.title.text,
                                          itemUI.title.fontStyle, null, this);
      totalLayoutHeight += itemTitle.texture.height;

      for (var j = 0; j < values.length; j ++) {
        var value = values[j];
        // Create text
        var text = value.text;
        if (itemUI.title.id == 'rewards') {
          text = text + ': +' + value.value;
        }
        totalLayoutHeight += itemUI.value.padding.text.top;
        var valueTexture = common.createTextOnly(itemUI.value.x + itemUI.value.padding.text.left, totalLayoutHeight,
                                              value.id, text,
                                              itemUI.value.fontStyle, null, this);

        if (itemUI.title.id == 'requirements') {
          // Create possible/impossible image.
          var possibleImageName = value.possible ? 'possible' : 'impossible';
          var possibleImageItem = valueLayout.images.find(function(image){return image.id == possibleImageName;});
          var possibleImageItemHeight = valueTexture.texture.height / 2;
          var possibleImageItemWidth = possibleImageItemHeight;
          common.createImageWithText(possibleImageItem.x, totalLayoutHeight, possibleImageName,
                                   possibleImageItemWidth, possibleImageItemHeight,
                                   value.id + possibleImageItem.id, '', null,
                                   null, 0, 0, null, this);
          // Create value
          valueTexture = common.createTextOnly(possibleImageItem.x, totalLayoutHeight,
                                               value.id + 'Value', value.current_value + '/' + value.value,
                                               itemUI.value.fontStyle, null, this);
          valueTexture.cameraOffset.x = possibleImageItem.x - valueTexture.width - itemUI.value.padding.text.left;
        }

        // Draw border
        if (itemUI.value.border == 'rectangle') {
          var style = {
                        x: itemUI.title.x,
                        y: totalLayoutHeight - itemUI.value.padding.text.top / 2 - 3,
                        width: itemUI.title.width,
                        height: valueTexture.texture.height + itemUI.value.padding.text.top,
                        lineWidth: 1,
                        color: 0x000000,
                        alpha: 1,
                        fixedToCamera: false
                      };
          common.createRectangle(value.id, style, this);

        } else if (itemUI.value.border == 'underline') {
          var style = {
                        left: itemUI.title.x,
                        top: totalLayoutHeight + valueTexture.texture.height - 3,
                        right: itemUI.title.padding.text.left + itemUI.title.width,
                        bottom: totalLayoutHeight + valueTexture.texture.height - 3,
                        lineWidth: 1,
                        color: 0x000000,
                        alpha: 1,
                        fixedToCamera: false
                      };
          common.createLine(value.id, style, this);
        }

        totalLayoutHeight += valueTexture.texture.height;
      }
    }

  },

  clickedReturn: function() {

    this.initialize();
    this.game.state.start('CityState');

  },

  clickedInstantBuild: function (sprite) {

    this.GotoCityStateWithBuilding();

  },

  clickedBuild: function (sprite) {

    this.GotoCityStateWithBuilding();

  },

  GotoCityStateWithBuilding: function() {

    $.ajax({
      type: 'POST',
      url: buildingBuildState.game.config.settings.server + 'add_city_map_building',
      dataType: "JSON",
      data: { 'session':
        {
          'user_name': buildingBuildState.game.global.username,
          'building': selectedBuilding.building
        }
      },

      success: function(result) {
        buildingBuildState.initialize();
        buildingBuildState.game.state.start('CityState', true, false, selectedBuilding);
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

  createBottomMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createBottomLayout(bottomLayoutUI, this);
    // // Add handler for top menu.
    this.addBottomMenuHandler();

  },

  addBottomMenuHandler: function() {

    // Add handler of Instant Build button.
    common.addHandler('building', this.clickedBuilding, this);
    common.addHandler('quest', this.clickedQuest, this);
    common.addHandler('items', this.clickedItems, this);
    common.addHandler('guild', this.clickedGuild, this);
    common.addHandler('mail', this.clickedMail, this);
    common.addHandler('more', this.clickedMore, this);

  },

  clickedChatDescription: function (sprite) {

    this.initialize();
    this.game.state.start('ChatState');

  },

  clickedBuilding: function() {

    this.initialize();
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

    this.initialize();
    this.game.state.start('ChatState');

  },

  setChatDescriptionText: function(chatText) {

    common.setChatDescriptionText(chatText, buildingBuildState);
    
    common.addHandler('chatDescriptionBackground', buildingBuildState.clickedChatDescription, buildingBuildState);
    common.addHandler('crown', buildingBuildState.clickedCrown, buildingBuildState);

  },

  initialize: function() {

    buildingBuildState.chatTimerEnable = false;
    common.initializeState(buildingBuildState);

  }

};
