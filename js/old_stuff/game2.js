var fg,vis,floor,player;
function start(){
    console.log("READY");
     fg = new CanvasLayer(GameEngine,{});
fg.drawList.expand();
    
     floor = new Floor("#FFF", 25, 0);
	 add(floor);
        floor.tween.push(update);
    var aw = 30;
        var ah = 30;
    player = new RectEntity(GameEngine.width+aw, GameEngine.height-floor.height-80, aw, ah, 0, "#F00", 1, 0, 0, 0);
    var pup = function(o,t){
                      o.x-=t*3;
                      };
    GameEngine.tween.push(pup);
    add(player);
}
var gt = 0
function remove(o){
    fg.drawList.remove(o);
}
function removeOff(o){
     var x = Math.floor(GameEngine.x+this.x);
        var y = Math.floor(GameEngine.y+this.y);
    if(x > -this.width && x < GameEngine.width + this.width && y > -this.height && y < GameEngine.height + this.height) {
            var travelDist = this.x+this.width*2;
			wticks(o,travelDist/3,removeOff);
    }else{
        remove(o)
    }
	
}
function add(o){
    fg.drawList.add(o);
}
var obsHeightCompl = 5;
var obsSpacingVert = 25;
var tks = 0;
var lastH = 0;
function update(o,ticks){
    tks+=ticks;
    if(tks > 40){
        tks = 0;
    var rand = Math.random();
     var height = Math.floor(Math.random()*obsHeightCompl+1)*obsSpacingVert;
    /*var height = (rand < .666 ? (rand < .333 ? lastH-1 : lastH) : lastH +1);//
        if(height < 0) height = 0;
        else if(height > obsHeightCompl) height = obsHeightCompl;
        lastH = height;
        height *=obsSpacingVert;*/
    var aw = 30;
        var ah = 30;
    var obs = new RectEntity(-GameEngine.x+GameEngine.width+aw, -GameEngine.y+GameEngine.height-floor.height-height, aw, ah, 0, "#FFF", 1, 0, 0, 0);
    var travelDist = GameEngine.width+aw*2;
        obs.istarget = true;
                add(obs);
        			wticks(obs,travelDist/3,removeOff)

	//tveen(obs,"x",-travelDist,-3,remove);
	//tween(obs,"x", travelDist*6, -travelDist ,1 ,false,remove);
    }
    
}
GameEngine.launch({complete:start});
