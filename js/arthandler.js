
//Art sets for the dungeon
var dungeonArt = {
    blue: {
        art: {
            wall: "wallbase",
            wallBase: "wallbot",
            floor: "floors",
            door: "doorcl",
            doorOpen: "door",
            water: "water",
            stairsUp: "stairs",
            stairsDown: "stairs"
        },
        imgs: {},
        isLoaded: false
    },
    generalArt: {
        art: {
			chest: "chest",
			chestOpen: "chestOpen",
			water: "water",
            player: "player",
			invSquare: "invSquare",
			potionRed: "potionRed",
			monsterMage: "monsterMage",
			skipBtn: "skip"
        },
        imgs: {},
        isLoaded: false
    }
};
//add the art for the player and monster to an artset
function addPlayerToArt(art) {
    art.keys.push("player");
    art.urls.push("./imgs/player.png");
	art.keys.push("monsterMage");
    art.urls.push("./imgs/pinkGiantMage.png");
}
//add gui art to artset
function addGUItoArt(art){
	art.keys.push("invSquare");
    art.urls.push("./imgs/inventorySquare.png");
	art.keys.push("save");
    art.urls.push("./imgs/save.png");
	art.keys.push("console");
    art.urls.push("./imgs/console.png");
	art.keys.push("load");
    art.urls.push("./imgs/load.png");
	art.keys.push("invChest");
    art.urls.push("./imgs/inv.png");
	art.keys.push("skipBtn");
    art.urls.push("./imgs/skip.png");
}
//add item art to artset
function addItemstoArt(art) {
    art.keys.push("potionRed");
    art.urls.push("./imgs/potionRed.png");
}
//load the art for the dungeon
function getDungeonArt() {
    var art = {
        keys: ["wall", "wallBase", "floor", "chest", "chestOpen", "door", "doorOpen", "water", "stairsUp", "stairsDown"],
        urls: []
    };
    var artSet = dungeonArt[dungeonKey].art;
    for (var k in art.keys) {
        var work = artSet[art.keys[k]];
        if (work) {
            art.urls.push("./imgs/" + work + ".png");
        }else{
			work = dungeonArt.generalArt.art[art.keys[k]];
			if(work)
            	art.urls.push("./imgs/" + work + ".png");
		}
    }
    art.isLoaded = dungeonArt[dungeonKey].isLoaded;
    return art;
}