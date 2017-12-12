/**
 * Created by leonverspeek on 10/6/17.
 */

var resourceBuildingState = null;

var map;
var layer;
var selectedCityMapPosition;
var resourceBuildings;
var resourceBuildingsUI;

var ResourceBuildingState = {

  chatTimerEnable: false,

  init: function(params) {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.kineticScrolling.configure(
                                          {
                                            verticalScroll: true,
                                            horizontalScroll: true
                                          }
                                        );
    resourceBuildings = null;
    resourceBuildingsUI = null;

    if ((params !== null) && (typeof params !== 'undefined')) {
      console.log('params = ', params);
      selectedCityMapPosition = params;
    }

    common = this.game.global;
    resourceBuildingState = this;   
    this.initialize();

    totalLayoutHeight = 0;

  },

  preload: function() {

    // Load resourceBuildings images
    common.getJsonFromAPI('resource_buildings', this);
    common.getCommonUI('bottomLayout', this);
    var jsonFile = common.getCommonUI('resourceBuildingsUI', this);
    
    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {

      if(cacheKey == 'resource_buildings') {
        resourceBuildings = this.game.cache.getJSON(cacheKey);
        this.preloadResourceBuildings();
      }
      
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = this.game.cache.getJSON(cacheKey);
        this.preloadBottomUIFromJson();
      }

      if(cacheKey == 'resourceBuildingsUI') {
        resourceBuildingsUI = this.game.cache.getJSON(cacheKey);
        this.preloadUIFromJson();
      }

    }, this);

  },

  preloadUIFromJson: function () {

    var ui = resourceBuildingsUI;
    // Load menu images.
    for (var i = 0; i < ui.layouts.length; i ++) {
      common.preloadLayout(ui.layouts[i], this);
    }

  },

  preloadBottomUIFromJson: function() {

    // Load bottom images.
    var bottomLayout = common.getLayoutByID('bottomLayout', bottomLayoutUI);
    common.preloadLayout(bottomLayout, this);

  },

  preloadResourceBuildings: function () {

    var buildingsLayout = common.getLayoutByID("buildingsLayout", resourceBuildingsUI);
    var titleItem = buildingsLayout.items.find(function(item){return item.id == "title";});
    // Load menu images.
    for (var i = 0; i < resourceBuildings.length; i ++) {
      common.loadImage(resourceBuildings[i].building_name, resourceBuildings[i].image, titleItem.padding.text, this);
    }

  },

  create: function() {

    this.game.stage.backgroundColor = "#FFF";
    // Set screen scrolling
    this.game.kineticScrolling.start();
    this.game.world.setBounds(0, 0, this.game.width, this.game.height);

    this.preloadUIFromJson();
    // Create top part.
    this.createTopMenus();

    // Create values.
    this.createResourceBuildings(resourceBuildings);

    // Create bottom part.
    this.createBottomMenus();
    this.chatTimerEnable = common.gameChatTimer.enable;
    common.setChatHander(this, this.setChatDescriptionText);

  },

  createTopMenus: function() {

    // Create top layout.
    totalLayoutHeight += common.createLayoutByID('topLayout', resourceBuildingsUI, this);

    // Add handler for top menu.
    this.addTopMenuHandler();

  },

  addTopMenuHandler: function() {

    // Add handler for title menu.
    common.addHandlerWithText('titleMenu', this.clickedReturn, this);

    // Add handler of return button.
    common.addHandler('returnButton', this.clickedReturn, this);

  },

  addBuildHandler: function() {

    // Add handler of Instant Build button.
    common.addHandlerWithText('instantUpgradeButton', this.clickedInstantBuild, this);

    // Add handler of Build button.
    common.addHandlerWithText('upgradeButton', this.clickedBuild, this);

  },

  createResourceBuildings: function(buildingList) {

    // set building name into top layout title.
    var buildingsLayout = common.getLayoutByID("buildingsLayout", resourceBuildingsUI);
    var titleItem = buildingsLayout.items.find(function(item){return item.id == "title";});
    var descriptionItem = buildingsLayout.items.find(function(item){return item.id == "description";});
    for (var i = 0; i < buildingList.length; i++) {
      var building = buildingList[i];
      var resourceBuilding = {
                               fullName: building.full_name,
                               name: building.building_name,
                               image: building.image,
                               level: 1,
                               col: selectedCityMapPosition.col,
                               row: selectedCityMapPosition.row
                             };

      var buildingTitle = common.createImageWithText(buildingsLayout.padding.left, 
                              buildingsLayout.firstPosition.y + i * (buildingsLayout.padding.top + titleItem.height),
                              titleItem.id, 
                              titleItem.width, titleItem.height,
                              building.building_name + 'Title', '', null,
                              this.clickedBuildingResource,
                              0, 0, null, this);
      buildingTitle.resourceBuilding = resourceBuilding;
      
      var buildingImage = common.createImageWithText(buildingsLayout.padding.left + titleItem.padding.text.left, 
                              buildingsLayout.firstPosition.y + i * (buildingsLayout.padding.top + titleItem.height) + titleItem.padding.text.top,
                              building.building_name, 
                              titleItem.width - titleItem.padding.text.left - titleItem.padding.text.right, 
                              titleItem.height - titleItem.padding.text.top - titleItem.padding.text.bottom,
                              building.building_name, '', null,
                              this.clickedBuildingResource,
                              0, 0, null, this);
      buildingImage.resourceBuilding = resourceBuilding;

      var buildingDescription = common.createImageWithText(buildingsLayout.padding.left + titleItem.width, 
                                          buildingsLayout.firstPosition.y + i * (buildingsLayout.padding.top + titleItem.height),
                                          descriptionItem.id, 
                                          descriptionItem.width, 
                                          descriptionItem.height,
                                          building.building_name + 'Description', 
                                          building.full_name + '\n' + building.description, null,
                                          this.clickedBuildingResource,
                                          descriptionItem.padding.text.left, 
                                          descriptionItem.padding.text.top, 
                                          descriptionItem.fontStyle, this);
      buildingDescription.resourceBuilding = resourceBuilding;
    }

  },

  clickedReturn: function() {
    this.initialize();
    this.game.state.start('CityState');
  },

  clickedBuildingResource: function (sprite) {
    this.initialize();
    this.game.state.start('BuildingBuildState', true, false, {building: sprite.resourceBuilding});
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

    common.setChatDescriptionText(chatText, resourceBuildingState);
    
    common.addHandler('chatDescriptionBackground', resourceBuildingState.clickedChatDescription, resourceBuildingState);
    common.addHandler('crown', resourceBuildingState.clickedCrown, resourceBuildingState);

  },

  initialize: function() {

    resourceBuildingState.chatTimerEnable = false;
    common.initializeState(resourceBuildingState);
    
  }

};