/*
start() - starts the program after dungeon art is loaded
*/

var fg, vis, floor, player, land, rooms;
var vis, scaleFactor, tiles,
  dungeonKey = "blue",
  currentArt,
  POW_L = 1,
  COI_L = 2,
  OBS_L1 = 3,
  OBS_L2 = 4,
  coi_mult = 1;
var pow_countdown_time = 0,
  pow_countdown_magnet = 0,
  pow_countdown_speed = 0,
  pow_countdown_multi = 0,
  pow_countdown_balloon = 0;

var gameTexts = [];

var dungeonLevel = 0,
  monsters = [];
var DATA;
var builderTime, builderSpeed, builderBalloon, builderSingBalloon, builderMagnet, builderMulti;
/*
features roughly 5/25
water roughly 2/25

cheats AllOW_INFINITE_PATHING //no matter the distance, your player will always find a path (if possible) 
	   INVULNERABLILITY //health cannot drop
	   DEMI-GOD //health cannot drop below 1
	   INSTAKILL //all damage dealt by the player is fatal
	   INFINITE_POWER //Special Stat never drains

*/

var playerHPGUI, playerXPGUI;


function start() {
  dungeonLevel += currentArt.direction;



  monsters = [];
  vis = GameEngine.archetypes.types.vis;


  var artSet = dungeonArt[dungeonKey];
  var art = currentArt;

  if (!artSet.isLoaded) {
    for (var k in art.keys) {
      var work = artSet.art[art.keys[k]];
      if (work) {
        artSet.imgs[art.keys[k]] = vis.builders[vis.keys.indexOf(art.keys[k])].img;
      } else {
        dungeonArt.generalArt.imgs[art.keys[k]] = vis.builders[vis.keys.indexOf(art.keys[k])].img;
      }
    }
    artSet.isLoaded = true;
  }
  if (!GameEngine.alreadyLaunched) {
    fg = new CanvasLayer(GameEngine, {});
    fg.drawList.expand(); //land
    fg.drawList.expand(); //player
    fg.drawList.expand(); //Buttons

    for (var i = 0; i < 4; i++) {
      y = i * 16;
      gameTexts.push({
        visible: false,
        div: createDiv(gameDiv, "gametext", "", undefined, y)
      });
    }
  }
  INV.sqr = dungeonArt.generalArt.imgs.invSquare;

  GameEngine.x = Math.floor(GameEngine.width / 2 / SW);
  GameEngine.y = Math.floor(GameEngine.height / 2 / SH);

  tiles = [];
  var sprites = [];
  tiles.push(new ZeroSpace());
  sprites.push(0);

  var doorClosed = tiles.length;
  var doorOpen = tiles.length + 1;
  tiles.push(new Door(doorClosed, doorOpen));
  tiles.push(new Tile());
  sprites.push(artSet.imgs.door);
  sprites.push(artSet.imgs.doorOpen);

  var chestOpen = tiles.length;
  var chestClosed = tiles.length + 1;
  tiles.push(chestOpen);
  tiles.push(chestClosed);
  sprites.push(dungeonArt.generalArt.imgs.chest);
  sprites.push(dungeonArt.generalArt.imgs.chestOpen);

  var potionRed = tiles.length;
  tiles.push(potionRed);
  sprites.push(dungeonArt.generalArt.imgs.potionRed);

  var playerSprite = tiles.length;
  tiles.push(playerSprite);
  sprites.push(dungeonArt.generalArt.imgs.player);

  var enemySprite = tiles.length;
  tiles.push(enemySprite);
  sprites.push(dungeonArt.generalArt.imgs.monsterMage);

  var floor = tiles.length;
  tiles.push(new Tile());
  sprites.push(artSet.imgs.floor);

  var wall = tiles.length;
  tiles.push(new Wall());
  sprites.push(artSet.imgs.wall);

  var water = tiles.length;
  tiles.push(new Water());
  sprites.push(artSet.imgs.water);

  var wallBase = tiles.length;
  tiles.push(new Wall());
  sprites.push(artSet.imgs.wallBase);

  var stairsUp = tiles.length;
  tiles.push(stairsUp);
  sprites.push(artSet.imgs.stairsUp);

  var stairsDown = tiles.length;
  tiles.push(stairsDown);
  sprites.push(artSet.imgs.stairsDown);



  //new ZeroSpace(), new Wall(), new Wall(), new Tile(), new Door(4, 5), new Tile(), new ZeroSpace(), new Stair(1), new Stair(-1)

  //0, artSet.imgs.wall, artSet.imgs.wallBase, artSet.imgs.floor, artSet.imgs.door, artSet.imgs.doorOpen, artSet.imgs.water, artSet.imgs.stairsUp, artSet.imgs.stairsDown

  //var hils = new BG(builderHils.img,"#19542A",builderHils.height-20,builderHils.width,builderHils.height,0,4);
  //add(hils);
  var objs = [];
  rooms = [];
  var bigRooms = [];
  var numRooms = 25;
  for (var i = 1; i <= numRooms; i++) {

    var room = new Room(10, 10, wall, floor);
    rooms.push(room);
    if (room.width >= 7 && room.height >= 7)
      bigRooms.push(room);
    objs = addRoomToMap(objs, room, wall);
    room.data = undefined;
  }


  makeMapObjects(objs);

  addDoors(objs,
    wall,
    floor,
    doorOpen,
    doorClosed
  );

  addWallFeatures(objs,
    wall,
    floor,
    wallBase
  );

  addRoomFeatures(objs, chestClosed, chestOpen, potionRed);

  if (!GameEngine.alreadyLaunched) {
    land = new Land(0, 0, objs[0].length, objs.length, sprites, objs, 1);
    add(land);
    player = new Monster(0, 0, 1, 1, playerSprite, [], 3, 2, new HP(20), 0, 0, 1, "player", true, new XP(0, 1, true));
    player.xp.owner = player;
    add(player);
    INV.focusMonster = player;
    addGUIs(player);
    insertConsoleButton();
	addSkipButton();
    addShowInvButton();
	addLoadButton();
	addSaveButton();

  } else {
    land.x = 0;
    land.y = 0;
    land.width = objs[0].length;
    land.height = objs.length;
    land.sprites = sprites;
    land.objs = objs;

  }

  var startRoom = 0;
  var endRoom = rooms.length - 1;

  startRoom = rooms[startRoom];
  endRoom = rooms[endRoom];
  GameEngine.isActionTurn = true;



  /*var startX = startRoom.x + Math.floor(startRoom.width / 2);
  var startY = startRoom.y + Math.floor(startRoom.height / 2);
  var endX = endRoom.x + Math.floor(endRoom.width / 2);
  var endY = endRoom.y + Math.floor(endRoom.height / 2);
  objs[startY][startX].s = stairsUp;
  objs[endY][endX].s = stairsDown;*/



  var sP = addCenterFeature(startRoom, objs, new Stair(stairsUp, 1));
  var eP = addCenterFeature(endRoom, objs, new Stair(stairsDown, -1));
  var pos = (art.direction == -1 ? sP : eP);
  GameEngine.x -= pos.x;
  GameEngine.y -= pos.y;
  player.x = pos.x;
  player.y = pos.y;
  put(player);

  var numWater = bigRooms.length * Math.random();

  for (var i = 0; i < numWater; i++) {
    var room = bigRooms.splice(Math.floor(Math.random() * bigRooms.length), 1)[0];
    addWaterToRoom(room, objs, water, floor);
  }


  var xp = monsterXpForLevel(player.xp.level());
  var level = player.level;

  for (var i = 1; i < rooms.length; i++) {
    var room = rooms[i];

    var x = room.x + Math.floor((room.width - 2) * Math.random()) + 1,
      y = room.y + Math.floor((room.height - 2) * Math.random()) + 1;
    var monster = new Monster(x, y, 1, 1, enemySprite, [], 2, 1, new HP(4), 0, 0, 1, "basic", false, new XP(xp));
    var mPut = put(monster),
      mTr = 0;
    while (!mPut && mTr++ < 10) {
      monster.x++;
      mPut = put(monster);
    }
    if (mPut) {
      monsters.push(monster);
      add(monster);
    }
  }
  lightRoom(player.x, player.y);
  gameTextDisp("Entering dungeon level: " + dungeonLevel);

  GameEngine.update();

}

//creates random rewards to put in a chest. returns 'ret' the inventory of the chest
function chestRewards(sprite) {
  var ret = [];
  ret.push(new Potion(10, "hp", 1, sprite, ret));
  return ret;
}

//adds a room to a map using the room appenders.
function addRoomToMap(data, room, wall) {
  if (!data || data.length == 0) {
    for (var y = 0; y < room.data.length; y++) {
      data.push([]);
      for (var x = 0; x < room.data[0].length; x++) {
        data[y][x] = room.data[y][x];
      }
    }
    return data;
  }
  return roomAppenders[Math.floor(Math.random() * roomAppenders.length)](data, room, wall);
}



var gt = 0;


var obsSpacingVert = 26;
var obsHeightCompl;
var tks = 0;
var lastH = 0;
var mtks = 40;

function update(o, ticks) {

}

//load the next dungeon with art and all
function loadADungeon(direction) {
  var launchData = getDungeonArt();
  addPlayerToArt(launchData);
  addGUItoArt(launchData);
  addItemstoArt(launchData);
  launchData.complete = start;
  launchData.direction = direction;
  currentArt = launchData;
  if (!launchData.isLoaded) {

    GameEngine.launch(launchData);
  } else {
    launchData.complete();
  }
}