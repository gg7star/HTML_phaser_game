/**
 * Created by leonverspeek on 10/6/17.
 */

var wallProductionState;
var common;

var totalLayoutHeight;
var selectedBuilding;
var bottomLayoutUI;
var wallProductionUI;
var wallProductionValues;
var resourceImageName;
var wasLoadedValue;
var wasLoadedUI;

var WallProductionState = {

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

    wasLoadedValue = false;
    wasLoadedUI = false;

    wallProductionState = this;
    common = this.game.global;
    this.initialize();

    totalLayoutHeight = 0;

  },

  preload: function() {

    // Load json file for wallProduction images.
    common.getCommonUI('bottomLayout', this);
    common.getCommonUI('wallProductionUI', this);
    // Make parameter
    var paramString = 'session[building][name]=' + selectedBuilding.building.name + 
                      '&session[building][level]=' + selectedBuilding.building.level;
    var jsonFile = common.getJsonFromAPIWithParam('user_private_defenses', paramString, this);

    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {

      if(cacheKey == 'user_private_defenses') {
        wallProductionValues = this.game.cache.getJSON(cacheKey);
        wasLoadedValue = true;
        if (wasLoadedUI === true) {
          console.log("wallProductionValues");
          console.log(wallProductionValues);
          this.preloadUIFromJson();
        }
      }
      
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = this.game.cache.getJSON(cacheKey);
        this.preloadBottomUIFromJson();
      }

      if(cacheKey == 'wallProductionUI') {
        wallProductionUI = this.game.cache.getJSON(cacheKey);
        console.log("wallProductionUI");
        console.log(wallProductionUI);
        wasLoadedUI = true;
      }

    }, this);

  },

  create: function() {

    wallProductionState = this;
    this.game.stage.backgroundColor = "#FFF";
    // Set screen scrolling
    this.game.kineticScrolling.start();
    this.game.world.setBounds(0, 0, this.game.width, this.game.height);

    // Create top part.
    this.createTopMenus();

    // Create building details.
    this.createBuildingDetails();
    
    // // Create total producing details.
    // this.createTotalProducing();

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

    var ui = wallProductionUI;

    // set building name into top layout title.
    var topLayout = common.getLayoutByID("topLayout", wallProductionUI);
    var titleMenuItem = topLayout.items.find(function(item){return item.id == "titleMenu";});
    titleMenuItem.text = buildingName;
    // Set building image and name into middle layout
    var middleLayout = common.getLayoutByID('middleLayout', wallProductionUI);

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
    var valueLayout = common.getLayoutByID("valueLayout", wallProductionUI);
    for (var i = 0; i < valueLayout.images.length; i ++) {
      var imageItem = valueLayout.images[i];
      console.log("=== valueImageItem", imageItem);
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
    totalLayoutHeight += common.createLayoutByID('topLayout', wallProductionUI, this);

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
    totalLayoutHeight += common.createLayoutByID('middleLayout', wallProductionUI, this);

    // Add handler for building details.
    this.addBuildHandler();

  },

  addBuildHandler: function() {

    // Add handler of Build button.
    common.addHandlerWithTextAndParameter('upgradeButton', 'selectedBuilding', selectedBuilding, 
              this.clickedUpgradeBuild, wallProductionState);

  },

  createValues: function() {

    var valueLayout = common.getLayoutByID('valueLayout', wallProductionUI);
    for (var i = 0; i < valueLayout.items.length; i ++) {
      var itemUI = valueLayout.items[i];
      totalLayoutHeight += itemUI.title.padding.text.top;
      var titleText = itemUI.title.text + '\n' + 
                      wallProductionValues.amount.max_amount + '/' + 
                      wallProductionValues.amount.total_amount + '\n' +
                      'Select a Trap to Build' 

      var itemTitle = common.createTextOnly(itemUI.title.x, totalLayoutHeight,
                                          itemUI.title.id, titleText,
                                          itemUI.title.fontStyle, null, this);
      totalLayoutHeight += itemTitle.texture.height;

      console.log("itemUI.title.id = " + itemUI.title.id);
      console.log("=== wallProductionValues: ", wallProductionValues);
      console.log(itemUI.title.id);
      if (wallProductionValues === null) {
        continue;
      }
      var values = wallProductionValues[itemUI.title.id];
      if (values === null) {
        continue;
      }
      console.log(values);
      for (var j = 0; j < values.length; j ++) {
        var value = values[j];
        totalLayoutHeight += itemUI.value.padding.text.top;
        // Create production image
        var resourceImage = common.createImageWithText(itemUI.image.x, totalLayoutHeight, value.id,
                                   itemUI.image.width, itemUI.image.height,
                                   value.id + 'Image', '', null,
                                   null, 0, 0, null, wallProductionState);
         // Create production name
        var productionTexture = common.createTextOnly(
                                          itemUI.productionName.x + itemUI.productionName.padding.text.left, totalLayoutHeight,
                                          value.id + 'Text', value.text,
                                          itemUI.productionName.fontStyle, null, this);
        // Create value text
        var valueTexture = common.createTextOnly(
                                    itemUI.value.x + itemUI.value.padding.text.left, totalLayoutHeight,
                                    value.id + 'Value', value.value,
                                    itemUI.value.fontStyle, null, this);
        valueTexture.cameraOffset.x = wallProductionState.game.width - itemUI.value.padding.text.right - valueTexture.width;
        // Draw border
        if (itemUI.value.border == 'rectangle') {
          
          var style = {
                        x: itemUI.value.x,
                        y: totalLayoutHeight - itemUI.value.padding.text.top / 2 - 3,
                        width: itemUI.title.width,
                        height: productionTexture.texture.height + itemUI.value.padding.text.top,
                        lineWidth: 1,
                        color: 0x000000,
                        alpha: 1,
                        fixedToCamera: false
                      };
          common.createRectangle(value.id, style, this);

        } else if (itemUI.value.border == 'underline') {

          var style = {
                        left: itemUI.title.x,
                        top: totalLayoutHeight + productionTexture.texture.height - 3,
                        right: itemUI.title.padding.text.left + itemUI.title.width,
                        bottom: totalLayoutHeight + productionTexture.texture.height - 3,
                        lineWidth: 1,
                        color: 0x000000,
                        alpha: 1,
                        fixedToCamera: false
                      };
          common.createLine(value.id, style, this);

        }

        totalLayoutHeight += productionTexture.texture.height;
      }
    }

    // Add handler
    this.addDefenseBuildHandler();
  },

  addDefenseBuildHandler: function() {
    var defenses = wallProductionValues.defenses;
    for (var i = 0; i < defenses.length; i++ ) {
      // Add handler of Instant Build button.
      common.addHandlerWithParameter(defenses[i].id + 'Image', 'defense', defenses[i], 
                                   this.clickedUpgradeDefense, this);
    }
  },

  clickedUpgradeDefense: function(sprite) {

    this.initialize();
    this.game.state.start('DefenseBuildState', true, false, {defense: sprite.defense});
    
  },

  clickedReturn: function() {

    this.initialize();
    this.game.state.start('CityState');

  },

  clickedUpgradeBuild: function (sprite) {
    this.initialize();
    this.game.state.start('BuildingUpgradeState', true, false, {building: sprite.selectedBuilding.building});
  },

  createBottomMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createBottomLayout(bottomLayoutUI, this);
    // // Add handler for top menu.
    this.addBottomMenuHandler();

  },

  addBottomMenuHandler: function() {

    // Add handler of Instant Build button.
    common.addHandler('building', this.clickedUpgradeBuilding, this);
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

  clickedUpgradeBuilding: function() {

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

    common.setChatDescriptionText(chatText, wallProductionState);
    
    common.addHandler('chatDescriptionBackground', wallProductionState.clickedChatDescription, wallProductionState);
    common.addHandler('crown', wallProductionState.clickedCrown, wallProductionState);

  },

  initialize: function() {

    wallProductionState.chatTimerEnable = false;
    common.initializeState(wallProductionState);

  }

};
