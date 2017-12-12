/**
 * Created by leonverspeek on 10/6/17.
 */

var defenseBuildState;
var common;

var totalLayoutHeight;
var selectedDefense;
var bottomLayoutUI;
var defenseBuildUI;
var defenseBuildValues;
var max_defenses;

var DefenseBuildState = {
  
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
      selectedDefense = params.defense;
      console.log("=== selectedDefense: ", selectedDefense);
    }

    defenseBuildState = this;
    common = this.game.global;
    this.initialize();

    totalLayoutHeight = 0;

  },

  preload: function() {

    // Load json file for defense images.
    var paramString = 'session[defense][name]=' + selectedDefense.id;
    common.getCommonUI('bottomLayout', this);
    common.getCommonUI('defenseBuildUI', this);
    var jsonFile = common.getJsonFromAPIWithParam('defense_info', paramString, this);
    
    jsonFile.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles) {

      if(cacheKey == 'defense_info') {
        defenseBuildValues = this.game.cache.getJSON(cacheKey);
        console.log("=== defenseBuildValues: ", defenseBuildValues);
      }
      
      if(cacheKey == 'bottomLayout') {
        bottomLayoutUI = this.game.cache.getJSON(cacheKey);
        this.preloadBottomUIFromJson();
      }

      if(cacheKey == 'defenseBuildUI') {
        defenseBuildUI = this.game.cache.getJSON(cacheKey);
        console.log("=== defenseBuildUI: ", defenseBuildUI);
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

    // Create defense inputbox.
    this.createDefensesInput();

    // Create values.
    this.createValues();

    // Create bottom part.
    this.createBottomMenus();
    this.chatTimerEnable = common.gameChatTimer.enable;
    common.setChatHander(this, this.setChatDescriptionText);

  },

  preloadUIFromJson: function () {

    var buildingName = selectedDefense.text;
    // var buildingLevel = selectedDefense.building.level;
    var ui = defenseBuildUI;

    // set building name into top layout title.
    var topLayout = common.getLayoutByID("topLayout", defenseBuildUI);
    var titleMenuItem = topLayout.items.find(function(item){return item.id == "titleMenu";});
    titleMenuItem.text = buildingName;

    // Set building image and name into middle layout
    var middleLayout = common.getLayoutByID('middleLayout', defenseBuildUI);

    var buidlingImageItem = middleLayout.items.find(function(item){return item.id == 'buildingImage';});
    buidlingImageItem.image = selectedDefense.image;

    var descriptionItem = middleLayout.items.find(function(item){return item.id == 'description';});
    descriptionItem.text = buildingName;

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
    var valueLayout = common.getLayoutByID("valueLayout", defenseBuildUI);
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
    totalLayoutHeight += common.createLayoutByID('topLayout', defenseBuildUI, this);

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
    totalLayoutHeight += common.createLayoutByID('middleLayout', defenseBuildUI, this);

    // Add handler for building details.
    this.addBuildHandler();

  },

  addBuildHandler: function() {

    // Add handler of Instant Build button.
    common.addHandlerWithText('instantBuildButton', this.clickedInstantBuild, this);

    // Add handler of Build button.
    common.addHandlerWithText('buildButton', this.clickedBuild, this);

  },

  createDefensesInput: function() {

    // Initialize 
    // Calculate maximum defenses
    var last_index = defenseBuildValues.requirements.length - 1;
    max_defenses = defenseBuildValues.requirements[last_index].current_value / defenseBuildValues.requirements[last_index].value;
    for (var i = 0; i < defenseBuildValues.requirements.length - 1; i++) {
      var req = defenseBuildValues.requirements[i];
      if (req.type !== 'resource') {
        continue;
      }
      var estimated_defenses = req.current_value / req.value;
      if (estimated_defenses < max_defenses) {
        max_defenses = estimated_defenses;
      }
    }
    var topLayout = common.getLayoutByID("defensesInputLayout", defenseBuildUI);
    var defensesLabelItem = topLayout.items.find(function(item){return item.id == "defenseLabel";});
    defensesLabelItem.text = "Maximum: " + Math.floor(max_defenses);

    // Create defensesInput layout.
    totalLayoutHeight += common.createLayoutByID('defensesInputLayout', defenseBuildUI, this);
    console.log("======= ", selectedDefense.value);
    this["DefenseBuildStatedefenseInputboxEdit"].value = selectedDefense.value;

    defenseBuildState["DefenseBuildStatedefenseLabelText"].cameraOffset.x = defenseBuildState.game.width / 2  - defenseBuildState["DefenseBuildStatedefenseLabelText"].texture.width / 2;
    // Add handler for building details.
    // this.addBuildHandler();

  },

  createValues: function() {

    var valueLayout = common.getLayoutByID('valueLayout', defenseBuildUI);
    for (var i = 0; i < valueLayout.items.length; i ++) {
      var itemUI = valueLayout.items[i];
      // Skip if nothing value
      var values = defenseBuildValues[itemUI.title.id];
      console.log("=== itemUI.title.id: ", itemUI.title.id);
      console.log("=== defenseBuildValues[itemUI.title.id]: ", values);
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
          text = text + ': ' + value.value;
        }
        totalLayoutHeight += itemUI.value.padding.text.top;
        var valueTexture = common.createTextOnly(itemUI.value.x + itemUI.value.padding.text.left, totalLayoutHeight,
                                                 value.id, text,
                                                 itemUI.value.fontStyle, null, this);

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

        // Create value
        valueTexture = common.createTextOnly(possibleImageItem.x, totalLayoutHeight,
                                             value.id + 'Value', value.current_value + '/' + value.value,
                                             itemUI.value.fontStyle, null, this);
        valueTexture.cameraOffset.x = possibleImageItem.x - valueTexture.width - itemUI.value.padding.text.left;

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
    this.game.state.start('WallProductionState');

  },

  clickedInstantBuild: function (sprite) {

    this.GotoWallProductionState();

  },

  clickedBuild: function (sprite) {

    this.GotoWallProductionState();

  },

  GotoWallProductionState: function() {
    
    if (defenseBuildState["DefenseBuildStatedefenseInputboxEdit"].value === null && defenseBuildState["DefenseBuildStatedefenseInputboxEdit"].value === '') {
      alert('Please input defense amount');
      return;
    }

    if (parseInt(defenseBuildState["DefenseBuildStatedefenseInputboxEdit"].value) > Math.floor(max_defenses)) {
      alert('Please input defense amount less than maximum defenses.');
      return;
    }

    $.ajax({
      type: 'POST',
      url: defenseBuildState.game.config.settings.server + 'add_user_private_defense',
      dataType: "JSON",
      data: { 'session':
        {
          'user_name': defenseBuildState.game.global.username,
          'defense': selectedDefense,
          'amount': defenseBuildState["DefenseBuildStatedefenseInputboxEdit"].value
        }
      },

      success: function(result) {
        defenseBuildState.initialize();
        defenseBuildState.game.state.start('WallProductionState');
      },

      error: function(xhr) {
        if (xhr.status == 200) {
          alert('Failed to add defense.\n' + xhr.message);
        } else {
          alert('Failed to add defense.\n' + xhr.message);
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

    common.setChatDescriptionText(chatText, defenseBuildState);
    
    common.addHandler('chatDescriptionBackground', defenseBuildState.clickedChatDescription, defenseBuildState);
    common.addHandler('crown', defenseBuildState.clickedCrown, defenseBuildState);

  },

  initialize: function() {

    defenseBuildState.chatTimerEnable = false;
    common.initializeState(defenseBuildState);

  }

};
