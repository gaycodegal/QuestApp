var fg,vis,floor,player;
function start(){
    console.log("READY");
     fg = new CanvasLayer(GameEngine,{});
	fg.drawList.expand();
    var vis = GameEngine.archetypes.types.vis;
var builder = vis.builders[vis.keys.indexOf("teacher")]; 

    /*for(var i = 0; i < 900; i++){
        var entity = new Entity(GameEngine.width/2,GameEngine.height/2,builder.width,builder.height,0,builder.img,1,0,100,100);
		fg.drawList.add(entity);
    }*/
    for(var i = 0; i < 900; i++){
        for(var x = 0; x < 4; x++){
        for(var y = 0; y < 3; y++){
 		var entity = new RectEntity(GameEngine.width/2 - x*20,GameEngine.height/2 - y * 10, 2, 2, 0, "#fff", 1, 0, 0);
		fg.drawList.add(entity);
        }
        }
    }
}
var gt = 0
function remove(o){
    fg.drawList.remove(o);
}

function add(o){
    fg.drawList.add(o);
}

GameEngine.launch({types:["vis"],keys:["teacher"],urls:["http://stephenoro.com/teachercast.png"],complete:start});
