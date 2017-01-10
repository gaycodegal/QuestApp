var LSA;
LSA = localStorage || sessionStorage || LSA;
try { LSA.setItem("2","2"); } catch (e) {
  LSA = {getItem:function(key){
	return LS[key];
},setItem:function(key,value){
	LS[key]=value;
}};
	alert("this may not work with your browser. if you are in private browsing, switch out of this mode to play");
}
var fg, vis, floor, player, noC = 12, noD = 14;
var SCORE, COIN, vis, scaleFactor, cscaleFactor, cthit, thit, mtns, platforms = [],
	clouds = [],
    coins = [],
    CLO_L = 0,
    PLA_L = 1,
    POW_L = 2,
    COI_L = 3,
    OBS_L1 = 4,
    OBS_L2 = 5,
	coi_mult = 1;
var pow_countdown_time = 0,
    pow_countdown_magnet = 0,
    pow_countdown_speed = 0,
    pow_countdown_multi = 0,
    pow_countdown_balloon = 0;
var slowGT = .9,
    regGT = 1.4,
    time_dur = 200,
    magWidth = 100,
    magnet_dur = 500,
	multi_x = 2,
    multi_dur = 600,
    noG = 0,
    balloonLift = -2,
    balloon_dur = 200,
    regSP = 3,
    fastSP = 4.5,
    speed_dur = 200;
var POW_COIN_1 = 1;
var POW_TIME = 6,
    POW_SPEED = 7,
    POW_BALLOON = 8,
    POW_MAGNET = 9,
    POW_MULTI = 10;
var coins_earned = 0;
var builderTime, builderSpeed, builderBalloon, builderSingBalloon, builderMagnet, builderMulti;

function start() {
    vis = GameEngine.archetypes.types.vis;
    var builder = vis.builders[vis.keys.indexOf("archie")];
    for(var i = 1; i < noC; i++){
    clouds.push(vis.builders[vis.keys.indexOf("cloud"+i)]);
	}
	for(var i = 1; i < noD; i++){
    platforms.push(vis.builders[vis.keys.indexOf("dirt"+i)]);
	}
    coins.push(vis.builders[vis.keys.indexOf("coins")]);
    coins.push(vis.builders[vis.keys.indexOf("coin2")]);
    coins.push(vis.builders[vis.keys.indexOf("coin3")]);
    coins.push(vis.builders[vis.keys.indexOf("coin4")]);
    coins.push(vis.builders[vis.keys.indexOf("coin5")]);
    builderTime = vis.builders[vis.keys.indexOf("time")];
    builderBalloon = vis.builders[vis.keys.indexOf("balloon")];
    builderSingBalloon = vis.builders[vis.keys.indexOf("singBal")];
    builderSpeed = vis.builders[vis.keys.indexOf("speed")];
    builderMulti = vis.builders[vis.keys.indexOf("multi")];
    builderMagnet = vis.builders[vis.keys.indexOf("magnet")];
    var builderTrs = vis.builders[vis.keys.indexOf("trs")];
    var builderMtns = vis.builders[vis.keys.indexOf("mtns")];
    scaleFactor = (1 / GameEngine.width) * 936;
    cscaleFactor = (1 / GameEngine.width) * 936 * 1200 / 30;
    thit = 30 * (1 / GameEngine.height) * 320;
    cthit = 1200 * (1 / GameEngine.height) * 320;
	
    SCORE = document.createElement("DIV");
    SCORE.innerHTML = "Score:" + 0 + "m";
    new GameEngine.prompt(SCORE,"SCORE");
    COIN = document.createElement("DIV");
    COIN.innerHTML = "Coins:" + 0;
    new GameEngine.prompt(COIN,"COIN");
    obsHeightCompl = GameEngine.height / obsSpacingVert;
    GameEngine.top = GameEngine.height - obsSpacingVert * 2;
    GameEngine.ctop = GameEngine.height - obsSpacingVert * 2;
    fg = new CanvasLayer(GameEngine, {});
    fg.drawList.expand(); //clouds
    fg.drawList.expand(); //player and mountains
    fg.drawList.expand(); //coins
    fg.drawList.expand(); //powerups
    fg.drawList.expand(); //obstacles
    fg.drawList.expand(); //non horizon org obstacles


    mtns = new BG(builderMtns.img, bg1, GameEngine.height - 220, builderMtns.width, builderMtns.height, PLA_L, 20);
    add(mtns);
    var trs = new BG(builderTrs.img, bg2, GameEngine.height - 200, builderTrs.width, builderTrs.height, PLA_L, 10);
    add(trs);
    //var hils = new BG(builderHils.img,"#19542A",builderHils.height-20,builderHils.width,builderHils.height,0,4);
    //add(hils);

    floor = new Floor(vis.builders[vis.keys.indexOf("platform")].img , 26, PLA_L);
    add(floor);
   // floor.tween.push(update);



    var aw = 20;
    var ah = 10;
    player = new AnEn(aw * 4, GameEngine.height - floor.height - ah - GameEngine.y, aw, ah, builder.img, PLA_L, 58, 58, -24, -24);
    GameEngine.dx = 3;
    var pup = function(o, t) {
        o.x -= t * o.dx;
    };
    GameEngine.tween.push(pup);
    GameEngine.tween.push(update);
    add(player);
    player.score = 0;
    player.dy = 0;
    player.G = .125;
    player.g = player.G;

    player.tween.push(function(o, t) {

        o.y += o.dy * t;
        
        if (o.dy < -6) {
            o.ax = 2;
        } else if (o.dy < -1) {
            o.ax = 3;
        } else if (o.dy < 1) {
            o.ax = 1;
        } else {
            o.ax = 0;
        }
        o.dy += o.g * t;
        if (o.dy > 10) {
            o.dy = 15;
        }
        if (GameEngine.height - player.y > player.score) {
            player.score = GameEngine.height - player.y;
        }
        o.x += t * GameEngine.dx;

        if (-GameEngine.y > o.y - 100) {
            GameEngine.y = -(o.y - 100);
			while (-GameEngine.ctop < GameEngine.y + obsSpacingVert) {
        		spawnCloudHoriz(-1);
        		GameEngine.ctop -= obsSpacingVert * cscaleFactor;
    		}
            while (-GameEngine.top < GameEngine.y + obsSpacingVert) {
                spawnSomethingHoriz(GameEngine.top);
                GameEngine.top -= obsSpacingVert * scaleFactor;

            }
        }else if(o.x < 1000 && o.y + o.height > floor.y - floor.height){
			o.y = floor.y - floor.height - o.height;
				o.g = o.G;
				o.dy = -7.5;
		}else if(o.y + GameEngine.y - o.height > GameEngine.height){
            	GameEngine.youLose(player.score);
        }
        return false;
    });
    player.tween.push(collide);
    player.tween.push(collide2);
    var scT = 0,
        os;
    player.tween.push(function(o, t) {
        scT += t;
        if (scT > 3) {
            var sco = Math.floor(player.score / 8)
            if (os != sco) {
                os = sco;
                SCORE.innerHTML = "Score:" + sco + "m";
            }
            scT = 0;
        }
    });
	
	while (-GameEngine.ctop < GameEngine.y + obsSpacingVert) {
        spawnCloudHoriz(GameEngine.ctop);
        GameEngine.ctop -= obsSpacingVert * scaleFactor;

    }
    while (-GameEngine.top < GameEngine.y + obsSpacingVert) {
        spawnSomethingHoriz(GameEngine.top);
        GameEngine.top -= obsSpacingVert * scaleFactor;

    }
GameEngine.paused = 1;
	for (var c in GameEngine.canvases) {
                var canvas = GameEngine.canvases[c];
                canvas.ctx.clearRect(0, 0, GameEngine.width, GameEngine.height);
                canvas.drawList.draw(canvas.ctx);
            }
window.addEventListener("load",function(){
	
	var hiderHide = function(){
		hiderOP -=.01;
		if(hiderOP < 0){
			hiderOP=0;
		}
		hider.style.opacity = hiderOP;
		if(hiderOP == 0){
			document.body.removeChild(hider);
			clearInterval(hiderInt);
			GameEngine.paused = false;
		}
	};
	hiderInt = setInterval(hiderHide,.016);
});
}
var gt = 0;

function remove(o) {
    fg.drawList.remove(o);
}

function coin_1_pow() {
    coins_earned += 1*coi_mult;
    COIN.innerHTML = "Coins:" + coins_earned;

}

function coin_2_pow() {
    coins_earned += 2*coi_mult;
    COIN.innerHTML = "Coins:" + coins_earned;

}

function coin_3_pow() {
    coins_earned += 3*coi_mult;
    COIN.innerHTML = "Coins:" + coins_earned;

}

function coin_4_pow() {
    coins_earned += 4*coi_mult;
    COIN.innerHTML = "Coins:" + coins_earned;

}

function coin_5_pow() {
    coins_earned += 5*coi_mult;
    COIN.innerHTML = "Coins:" + coins_earned;

}

function time_pow() {
    if (pow_countdown_time == 0) {
        GT = slowGT;
        player.tween.push(function(o, t) {
            pow_countdown_time -= t;
            if (pow_countdown_time <= 0) {
                pow_countdown_time = 0;
                GT = regGT;
                return true;
            } else {
                return false;
            }
        });
    }
    pow_countdown_time = time_dur;

}

function multi_pow() {
    if (pow_countdown_multi == 0) {
        coi_mult = multi_x;
        player.tween.push(function(o, t) {
            pow_countdown_multi -= t;
            if (pow_countdown_multi <= 0) {
                pow_countdown_multi = 0;
				coi_mult = 1;
                return true;
            } else {
                return false;
            }
        });
    }
    pow_countdown_multi = multi_dur;

}

function speed_pow() {
    if (pow_countdown_speed == 0) {
        GameEngine.dx = fastSP;
        player.tween.push(function(o, t) {
            pow_countdown_speed -= t;
            if (pow_countdown_speed <= 0) {
                pow_countdown_speed = 0;
                GameEngine.dx = regSP;
                return true;
            } else {
                return false;
            }
        });
    }
    pow_countdown_speed = speed_dur;
	mtks=0;

}

function magnet_pow() {
    if (pow_countdown_magnet == 0) {
        player.tween.push(function(o, t) {
            pow_countdown_magnet -= t;

            var cls = fg.drawList.l[COI_L];

            var l = o.x + o.width / 2 - magWidth / 2;
            var r = l + magWidth;
            var t = o.y + o.height / 2 - magWidth / 2;
            var b = t + magWidth;
			
			var l1 = o.x;
            var r1 = l1 + o.width;
            var t1 = o.y;
            var b1 = t1 + o.height;

            for (var i = 0; i < cls.length; i++) {
                if (intersectRect(l, r, t, b, cls[i])) {
                	if (intersectRect(l1, r1, t1, b1, cls[i])) {
                    	colTypes[cls[i].type]();
                    	remove(cls[i]);
                    	cls[i].par.pow = null;
                    	cls[i].par = null;
					}else{
						cls[i].x = (l1 + cls[i].x)/2;
						cls[i].y = (t1 + cls[i].y)/2;
					}
                }
            }

            if (pow_countdown_magnet <= 0) {
				pow_countdown_magnet = 0;
                return true;
            } else {
                return false;
            }
        });
    }
    pow_countdown_magnet = magnet_dur;

}

function balloon_pow() {
    if (pow_countdown_balloon == 0) {
        player.g = noG;
        player.dy = balloonLift;
        var balloon = new ENT(player.x, player.y, 10, 18, 4, -22, builderSingBalloon.img, POW_L);
        add(balloon);
        player.tween.push(function(o, t) {
            pow_countdown_balloon -= t;
            balloon.y = player.y;
            balloon.x = player.x;
            if (pow_countdown_balloon <= 0) {
                remove(balloon);
                pow_countdown_balloon = 0;
                player.g = player.G;
                player.dy = -7.5;
                return true;
            } else {
                return false;
            }
        });
    }
    pow_countdown_balloon = balloon_dur;

}
var colTypes = [0, coin_1_pow, coin_2_pow, coin_3_pow, coin_4_pow, coin_5_pow, time_pow, speed_pow, balloon_pow, magnet_pow, multi_pow];

function didCollide(o) {
    player.y = o.y - player.height;
    player.g = player.G;
    player.dy = -7.5;
    if (o.pow) {
        remove(o.pow);
        o.pow.par = null;
        colTypes[o.pow.type]();
        o.pow = null;
    }
}

function collide(o) {

    var cls = fg.drawList.l[OBS_L1];

    var l = o.x;
    var r = o.x + o.width;
    var t = o.y;
    var b = o.y + o.height;

    for (var i = 0; i < cls.length && cls[i].x < r; i++) {
        if (intersectRect(l, r, t, b, cls[i])) {
            if (o.y - o.dy < cls[i].y && o.dy >= 0) {
                didCollide(cls[i]);
            }
        }
    }
    return false;
}

function collide2(o) {
    var cls = fg.drawList.l[OBS_L2];

    var l = o.x;
    var r = o.x + o.width;
    var t = o.y;
    var b = o.y + o.height;

    for (var i = 0; i < cls.length; i++) {
        if (intersectRect(l, r, t, b, cls[i])) {
            if (o.y - o.dy < cls[i].y && o.dy >= 0) {
                didCollide(cls[i]);
            }
        }
    }
    return false;
}

function intersectRect(l, r, t, b, r2) {
    var r2r = r2.x + r2.width;
    var r2b = r2.y + r2.height;
    return !(r2.x > r ||
        r2r < l ||
        r2.y > b ||
        r2b < t);
}

function removeOff(o) {
    var x = Math.floor(GameEngine.x+o.x);
    if (x > -o.width/2) {

        var travelDist = o.x + o.width * 2;
        wticks(o, travelDist / 3, removeOff);
    } else {

        remove(o);
    }
}

function add(o) {
    fg.drawList.add(o);
}
var obsSpacingVert = 26;
var obsHeightCompl;
var tks = 0, ctks = 0;
var lastH = 0;
var mtks = 40, mctks = 100;

function whatToSpawn(x, y, l, noooo) {
    var builderDirt1 = platforms[Math.floor(platforms.length * Math.random())];
    var obs = new ENT(x, y, obsSpacingVert, obsSpacingVert, 0, 0, builderDirt1.img, l);
    var travelDist = GameEngine.width + obsSpacingVert * 2;
    add(obs);
    wticks(obs, travelDist / 3, removeOff);
    if (Math.random() < .3 && !noooo) {
        spawnPow(x, y, travelDist, obs);

    }
}

function cloudToSpawn(x, y) {
	var cloudLen = Math.random() < .5 ? clouds.length : 3;
    var builderCloud = clouds[Math.floor(cloudLen * Math.random())];
	if(y == -1){
		y = -builderCloud.height;
	}
	var speedx = 35,
		speedy = 25;
    var obs = new CLOUD(-GameEngine.x + (x + builderCloud.width) * speedx, -GameEngine.y + y * speedy, builderCloud.width, builderCloud.height, speedx, speedy, builderCloud.img, CLO_L);
    var travelDist = GameEngine.width + builderCloud.width * 2;
    add(obs);
    wticks(obs, travelDist / 3 * speedx, removeOff);
   
}

function spawnCoin(x, y, travelDist, obs) {
    var len = coins.length - 1;
    if (GameEngine.y < 32000) {
        len = Math.floor(GameEngine.y / 32000 * len) + 1;
    } else {
        len++;
    }
    var coinType = Math.floor(Math.random() * len);
    var builderCoin = coins[coinType];
    var powerup = new AnEn(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, builderCoin.img, COI_L, 12, 12, 7, 16);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);
    var ti = 0;
    powerup.tween.push(function(o, t) {
        ti += t;
        if (ti > 10) {
            ti = 0;
            o.ax++;
            if (o.ax > 5) {
                o.ax = 0;
            }
        }
    });
    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_COIN_1 + coinType;
}

function spawnTime(x, y, travelDist, obs) {
    var powerup = new ENT(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, 4, 10, builderTime.img, POW_L);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);

    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_TIME;
}

function spawnSpeed(x, y, travelDist, obs) {
    var powerup = new ENT(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, 2, 18, builderSpeed.img, POW_L);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);

    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_SPEED;
}

function spawnMagnet(x, y, travelDist, obs) {
    var powerup = new ENT(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, 2, 12, builderMagnet.img, POW_L);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);
    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_MAGNET;
}

function spawnMulti(x, y, travelDist, obs) {
    var powerup = new ENT(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, 4, 10, builderMulti.img, POW_L);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);
    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_MULTI;
}

function spawnBalloon(x, y, travelDist, obs) {
    var powerup = new AnEn(x, y - obsSpacingVert, obsSpacingVert, obsSpacingVert, builderBalloon.img, POW_L, 10, 36, 9, -8);
    add(powerup);
    wticks(powerup, travelDist / 3, removeOff);
    var ti = 0;
    powerup.tween.push(function(o, t) {
        ti += t;
        if (ti > 10) {
            ti = 0;
            o.ax++;
            if (o.ax > 5) {
                o.ax = 0;
            }
        }
    });
    obs.pow = powerup;
    powerup.par = obs;
    powerup.type = POW_BALLOON;
}
var powuplist = [spawnTime,spawnBalloon,spawnSpeed,spawnMagnet,spawnMulti];


function spawnPowerUp(x, y, travelDist, obs) {
    var powType = Math.floor(Math.random() * powuplist.length);
    powuplist[powType](x, y, travelDist, obs);

}
var spawns = [spawnCoin, .9, spawnPowerUp, .1];

function spawnPow(x, y, travelDist, obs) {
    var rand = Math.random();
    var chose = 0;
    for (var i = 0; i < spawns.length && !chose; i += 2) {
        if (rand <= spawns[i + 1]) {
            spawns[i](x, y, travelDist, obs);
            chose = 1;
        } else {
            rand -= spawns[i + 1];
        }
    }
    if (!chose) {
        spawns[0](x, y, travelDist, obs);
    }
}
function spawnCloud() {
	
		gY = GameEngine.height;
	

    cloudToSpawn(GameEngine.width, Math.floor(gY * Math.random()));
} 
function spawnCloudHoriz(a) {
	//var gY = mtns.gY();
	///if(a < gY){
		cloudToSpawn(Math.floor(GameEngine.width * Math.random()), a);
	//}
} 
function spawnSomething() {
    var height = Math.floor(Math.random() * obsHeightCompl + 1) * obsSpacingVert;



    whatToSpawn(-GameEngine.x + GameEngine.width + obsSpacingVert, -GameEngine.y + GameEngine.height - floor.height - height, OBS_L1);


}

function spawnSomethingHoriz(a) {


    whatToSpawn(-GameEngine.x + Math.floor(GameEngine.width * Math.random()) + obsSpacingVert, a, OBS_L2);

}

function update(o, ticks) {
    tks += ticks;
    ctks += ticks;
    if (ctks > mctks) {
		ctks = 0;
		spawnCloud();
		mctks = Math.random() * cthit;

	}
    if (tks > mtks) {
        tks = 0;
        //var rand = Math.random();
        spawnSomething();
        mtks = Math.random() * thit * 3 / GameEngine.dx;
        //tveen(obs,"x",-travelDist,-3,remove);
        //tween(obs,"x", travelDist*6, -travelDist ,1 ,false,remove);
    }

}
function getItem(item, callback) {
    var object = {};
    if (LSA) {
        if (typeof item == "string") {
            object[item] = JSON.parse(LSA.getItem(item));
        } else {
            for (var i in item) {
                object[item[i]] = JSON.parse(LSA.getItem(item[i]));
            }
        }
    }
    if (callback)
        callback(object);
}

function setItem(item, value, callback) {
    if (LSA) {
        LSA.setItem(item, JSON.stringify(value));
    }
    if (callback)
        callback();
}
GameEngine.setuplose = function(span, ok) {
    var Mscore = Math.floor(player.score / 8);
	getItem("OBSHIGH",function(o){
		var high = o.OBSHIGH || -1;
    	if (Mscore > high) {
        	high = "New High";
        	setItem("OBSHIGH", Mscore);
    	} else {
        	high = "High:" + high;
    	}
		getItem("OBSCOINS",function(o){
			var coin = o.OBSCOINS || 0;
    		coin += coins_earned;
    		setItem("OBSCOINS", coin);
    		span.innerHTML = "Score:" + Mscore + "m<br>" + high + "<br> Coins:" + coins_earned + "<br>";
    		ok.innerHTML = "Play Again";
		});
	});
   
    
};
GameEngine.resizeA = function(){
	console.log(GameEngine.height);
	scaleFactor = (1 / GameEngine.width) * 936;
    cscaleFactor = (1 / GameEngine.width) * 936 * 1200 / 30;
    thit = 30 * (1 / GameEngine.height) * 320;
    cthit = 1200 * (1 / GameEngine.height) * 320;
	obsHeightCompl = GameEngine.height / obsSpacingVert;

            while (-GameEngine.top < GameEngine.y + obsSpacingVert) {
                spawnSomethingHoriz(GameEngine.top);
                GameEngine.top -= obsSpacingVert * scaleFactor;

            }
	GameEngine.top = -GameEngine.y - obsSpacingVert;
}
GameEngine.reset = function() {
	floor.x = 0;
    pow_countdown_time = 0;
    pow_countdown_speed = 0;
	pow_countdown_multi = 0;
    pow_countdown_magnet = 0;
    pow_countdown_balloon = 0;
    GameEngine.top = GameEngine.height - obsSpacingVert * 2;
	GameEngine.ctop = GameEngine.height - obsSpacingVert * 2;
    SCORE.innerHTML = "Score:" + 0 + "m";
    coins_earned = 0;
    GameEngine.x = 0;
    COIN.innerHTML = "Coins:" + coins_earned;

    player.score = 0;
    GameEngine.y = 0;// GameEngine.height - GameEngine.oh;
    for (var ll = POW_L; ll < POW_L+4; ll++) {
        var cls = fg.drawList.l[ll];
        for (var i = 0; i < cls.length; i++) {
            remove(cls[i]);
        }
    }
	var cls = fg.drawList.l[CLO_L];
    for (var i = 0; i < cls.length; i++) {
        remove(cls[i]);
    }
	floor.y = GameEngine.height;
    player.y = GameEngine.height - floor.height - player.height*3;
    player.x = player.width * 4;
	while (-GameEngine.ctop < GameEngine.y + obsSpacingVert) {
        spawnCloudHoriz(GameEngine.ctop);
        GameEngine.ctop -= obsSpacingVert * scaleFactor;
    }
    while (-GameEngine.top < GameEngine.y + obsSpacingVert) {
        spawnSomethingHoriz(GameEngine.top);
        GameEngine.top -= obsSpacingVert * scaleFactor;

    }

};

var using = "archie";
var bg1 = "#0B4300";
var bg2 = "#005518";
var ENGINE_LAUNCH = {
        types: ["vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis", "vis"],
        keys: ["archie", "singBal", "time", "magnet", "balloon", "speed", "multi", "coins", "coin2", "coin3", "coin4", "coin5", "mtns", "trs", "platform"],
        urls: ["./imgs/archie.png", "./imgs/singBalloon.png", "./imgs/clock.png", "./imgs/magnet.png", "./imgs/balloon.png", "./imgs/speed.png", "./imgs/multi.png", "./imgs/coins.png", "./imgs/coin2.png", "./imgs/coin3.png", "./imgs/coin4.png", "./imgs/coin5.png", "./imgs/mtns.png", "./imgs/trs.png", "./imgs/platform.png"],
        bgColor: "#D9EEFC",
        complete: start
    };

//FFEAEA 
var isMusicPlaying = true, musDiv = document.getElementById("mus"),backgroundMusic ;
getItem(["slowGT","timeDur","magWidth","magDur","multiX","multiDur","balLift","balDur","fastSP","speedDur","multImg","archiI","bgColor","mtns","trs","dirt","cloud","platform","using","mtnsCLR","trsCLR","song","musicplay"],function(o){
		o.archiI = (o.archiI || using);

	slowGT = o.slowGT || slowGT;
	time_dur = o.timeDur || time_dur;
	magWidth = (o.magWidth) || magWidth;
	magnet_dur = (o.magDur) || magnet_dur;
	multi_x = (o.multiX) || multi_x;
	multi_dur = (o.multiDur) || multi_dur;
	balloonLift = (o.balLift) || balloonLift;
	balloon_dur = (o.balDur) || balloon_dur;
	fastSP = (o.fastSP) || fastSP;
	speed_dur = (o.speedDur) || speed_dur;
		ENGINE_LAUNCH.urls.splice(ENGINE_LAUNCH.urls.indexOf("./imgs/multi.png"),1,"./imgs/multi"+(multi_x>2?multi_x:"")+".png");
	bg1 = (o.mtnsCLR || bg1);
	bg2 = (o.trsCLR || bg2);
	if(o.archiI){
		ENGINE_LAUNCH.urls.splice(ENGINE_LAUNCH.urls.indexOf("./imgs/archie.png"),1,"./imgs/"+o.archiI+".png");
	}
	if(o.mtns){
		ENGINE_LAUNCH.urls.splice(ENGINE_LAUNCH.urls.indexOf("./imgs/mtns.png"),1,"./imgs/"+(o.mtns)+".png");
	}
	if(o.trs){
		ENGINE_LAUNCH.urls.splice(ENGINE_LAUNCH.urls.indexOf("./imgs/trs.png"),1,"./imgs/"+(o.trs)+".png");
	}
	if(o.platform){
		ENGINE_LAUNCH.urls.splice(ENGINE_LAUNCH.urls.indexOf("./imgs/platform.png"),1,"./imgs/"+(o.platform)+".png");
	}
	if(o.bgColor){
		ENGINE_LAUNCH.bgColor = (o.bgColor);
	}
	var dirt = (o.dirt) || "dirt";
	var cloud = (o.cloud) || "cloud";
	
	for(var i = 1; i < noC; i++){
	ENGINE_LAUNCH.urls.push("./imgs/"+cloud+i+".png");
	ENGINE_LAUNCH.keys.push(cloud+i);
	ENGINE_LAUNCH.types.push("vis");
}
for(var i = 1; i < noD; i++){
	ENGINE_LAUNCH.urls.push("./imgs/"+dirt+i+".png");
	ENGINE_LAUNCH.keys.push("dirt"+i);
	ENGINE_LAUNCH.types.push("vis");
}
	
	GameEngine.launch(ENGINE_LAUNCH);
	var song = o.song || "Dubakupado";
	backgroundMusic = new buzz.sound( "./resource/"+song, {
    formats: [ "mp3" ]
});
if(o.musicplay != undefined)
	isMusicPlaying = o.musicplay;
backgroundMusic.loop();
		if(isMusicPlaying){
			backgroundMusic.play();
		}else{
			isMusicPlaying = false;
			musDiv.classList.remove("musin");
			musDiv.classList.add("musof");
		}
});





