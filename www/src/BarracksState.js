/**
 * Created by leonverspeek on 10/6/17.
 */

var campState;
var common;

var totalLayoutHeight;
var selectedBuilding;
var bottomLayoutUI;
var barracksUI;
var barracksValues;
var max_troops;
var wasLoadedValue;
var wasLoadedUI;

var BarracksState = {
  
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
      console.log("=== selectedBuilding: ", selectedBuilding);
    }

    wasLoadedValue = false;
    wasLoadedUI = false;

    campState = this;
    common = this.game.global;
    this.initialize();

    totalLayoutHeight = 0;

  },

  preload: function() {

    // Load json file for defense images.
    var paramString = 'session[building][name]=' + selectedBuilding.building.name;
    paramString += '&session[building][level]=' + selectedBuilding.building.level;
    paramString += '&session[building][row]=' + selectedBuilding.building.row;
    paramString += '&session[building][col]=' + selectedBuilding.building.col;

    common.getCommonUI('bottomLayout', this);
    common.getCommonUI('barracksUI', this);
    var jsonFile = common.getJsonFromAPIWithParam('camp_info', paramString, this);
    
    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {
  
      if(cacheKey == 'camp_info') {
        barracksValues = this.game.cache.getJSON(cacheKey);
        wasLoadedValue = true;
        if (wasLoadedUI === true) {
          console.log("=== barracksValues: ", barracksValues);
          this.preloadUIFromJson();
        }
      }
      
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = this.game.cache.getJSON(cacheKey);
        this.preloadBottomUIFromJson();
      }

      if(cacheKey == 'barracksUI') {
        barracksUI = this.game.cache.getJSON(cacheKey);
        wasLoadedUI = true;
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

    // Create totalTroopsLayout layout.
    this.createTotalTroopsLayout();

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
    var ui = barracksUI;

    // set building name into top layout title.
    var topLayout = common.getLayoutByID("topLayout", barracksUI);
    var titleMenuItem = topLayout.items.find(function(item){return item.id == "titleMenu";});
    titleMenuItem.text = buildingName;

    // Set building image and name into middle layout
    var middleLayout = common.getLayoutByID('middleLayout', barracksUI);

    var buidlingImageItem = middleLayout.items.find(function(item){return item.id == 'buildingImage';});
    buidlingImageItem.image = selectedBuilding.building.image;

    var descriptionItem = middleLayout.items.find(function(item){return item.id == 'description';});
    descriptionItem.text = descriptionItem.prefix + ' ' + buildingLevel + ' ' + buildingName;

    // Set building image and name into middle layout
    var totalTroopsLayout = common.getLayoutByID('totalTroopsLayout', barracksUI);
    var totalAvailableTroopsImage = totalTroopsLayout.items.find(function(item){return item.id == 'totalAvailableTroopsImage';});
    totalAvailableTroopsImage.text = totalAvailableTroopsImage.prefix + ' ' + barracksValues.total_amount;

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
    var valueLayout = common.getLayoutByID("valueLayout", barracksUI);
    for (var i = 0; i < barracksValues['troops'].length; i ++) {
      var value = barracksValues['troops'][i];
      common.loadImage(value.id, value.image, padding, this);
    }

  },

  preloadBottomUIFromJson: function() {

    // Load bottom images.
    var bottomLayout = common.getLayoutByID('bottomLayout', bottomLayoutUI);
    common.preloadLayout(bottomLayout, this);

  },

  createTopMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createLayoutByID('topLayout', barracksUI, this);

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
    totalLayoutHeight += common.createLayoutByID('middleLayout', barracksUI, this);

    // Add handler for building details.
    this.addUpgradeHandler();

  },

  addUpgradeHandler: function() {

    // Add handler of Upgrade button.
    common.addHandlerWithTextAndParameter('upgradeButton', 'selectedBuilding', selectedBuilding, 
                                          this.clickedUpgradeBuild, campState);

  },

  createTotalTroopsLayout: function() {

    // Create top layout.

    totalLayoutHeight += common.createLayoutByID('totalTroopsLayout', barracksUI, this);

    // Add handler for building details.
    // this.addBuildHandler();

  },

  createValues: function() {

    var valueLayout = common.getLayoutByID('valueLayout', barracksUI);
    for (var i = 0; i < valueLayout.items.length; i ++) {
      var itemUI = valueLayout.items[i];
      // Skip if nothing value
      var values = barracksValues[itemUI.title.id];
      console.log("=== itemUI.title.id: ", itemUI.title.id, itemUI);
      console.log("=== barracksValues[itemUI.title.id]: ", values);
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
        if (!value.possible) {
          continue;
        }
        // Create image
        var troopPositionX = itemUI.image.x + (j % 4) * (itemUI.image.width + itemUI.interval);
        var troopPositionY = totalLayoutHeight;
        var troopItemHeight = itemUI.image.height;
        var troopImage = common.createImageWithText(troopPositionX, troopPositionY,
                                   value.id, itemUI.image.width, itemUI.image.height,
                                   value.id, '', null, null, 
                                   null, null, null, this);
        // Add handler
        if (value.possible) {
          common.addHandlerWithParameter(value.id, 'troop', value, 
                                         this.clickedTroop, campState);
        }

        // Create value
        var valueTexture = common.createTextOnly(troopPositionX, troopPositionY + itemUI.image.height,
                                                 value.id + 'Value', value.value,
                                                 itemUI.value.fontStyle, null, this);
        valueTexture.cameraOffset.x = troopPositionX + itemUI.image.width - valueTexture.width - itemUI.value.padding.text.right;
        troopItemHeight += valueTexture.height;

        // Create text
        var text = value.text;
        valueTexture = common.createTextOnly(troopPositionX, troopPositionY + itemUI.image.height + valueTexture.height,
                                             value.id, text,
                                             itemUI.value.fontStyle, null, this);
        valueTexture.cameraOffset.x = troopPositionX + (itemUI.image.width / 2 - valueTexture.width / 2);
        
        troopItemHeight += valueTexture.height;
        // Create possible/impossible image.
        if (itemUI.title.id == 'requirements') {
          var possibleImageName = value.possible ? 'possible' : 'impossible';
          var possibleImageItem = valueLayout.images.find(function(image){return image.id == possibleImageName;});
          var possibleImageItemHeight = valueTexture.texture.height / 2;
          var possibleImageItemWidth = possibleImageItemHeight;
          common.createImageWithText(possibleImageItem.x, totalLayoutHeight, possibleImageName,
                                     possibleImageItemWidth, possibleImageItemHeight,
                                     value.id + possibleImageItem.id, '', null,
                                     null, 0, 0, null, this);
        }

        // Draw border
        if (itemUI.value.border == 'rectangle') {
          var style = {
                        x: troopPositionX,
                        y: troopPositionY,
                        width: itemUI.image.width,
                        height: troopItemHeight,
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

        totalLayoutHeight += (j % 4) === 3 ? (itemUI.image.padding.text.bottom + troopItemHeight) : 0;
      }
    }

  },

  clickedTroop: function(sprite) {
    this.initialize();
    this.game.state.start('TroopDismissState', true, false, {troop: sprite.troop});
  },

  clickedReturn: function() {

    this.initialize();
    this.game.state.start('CityState');

  },

  clickedUpgradeBuild: function (sprite) {
    this.initialize();
    this.game.state.start('BuildingUpgradeState', true, false, {building: sprite.selectedBuilding.building});
  },

  GotoCityStateWithBuilding: function() {

    $.ajax({
      type: 'POST',
      url: campState.game.config.settings.server + 'upgrade_city_map_building',
      dataType: "JSON",
      data: { 'session':
        {
          'user_name': campState.game.global.username,
          'building': selectedBuilding.building
        }
      },

      success: function(result) {
        campState.initialize();
        campState.game.state.start('CityState', true, false, selectedBuilding);
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

    common.setChatDescriptionText(chatText, campState);
    
    common.addHandler('chatDescriptionBackground', campState.clickedChatDescription, campState);
    common.addHandler('crown', campState.clickedCrown, campState);

  },

  initialize: function() {

    campState.chatTimerEnable = false;
    common.initializeState(campState);

  }

};
