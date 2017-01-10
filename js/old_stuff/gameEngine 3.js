//Nothing too interesting here, just a preloader for images you can
//Collapse chunks in edity with Alt + L
//Launch At: https://www.googledrive.com/host/0B3xd8PRkAtfqfmFWUUlMOUpuWGZmeGpRcVMwbFdvMGZTekpLM0hCSFhlSWtlQ1JvUjhGUDA

/*

GameEngine.launch({types:["vis"],keys:["teacher"],urls:["http://stephenoro.com/teachercast.png"]});


var fg = new CanvasLayer(GameEngine,{});
fg.drawList.expand();
var vis = GameEngine.archetypes.types.vis;
var builder = vis.builders[vis.keys.indexOf("teacher")]; 
var entity = new Entity(GameEngine.width/2,GameEngine.height/2,builder.width,builder.height,0.1,builder.img,1,0,100,100);
fg.drawList.add(entity);

 
var entity2 = new Entity(GameEngine.width/2-200,GameEngine.height/2,builder.width,builder.height,0.1,builder.img,1,0,100,100);
fg.drawList.add(entity2);

entity.vL = 0;
entity.target = entity2;
entity.tween.push(entity.sight);
entity.tween.push(entity.targetTween);

entity2.vL = 0;
entity2.target = entity;
entity2.tween.push(entity2.sight);
entity2.tween.push(entity2.targetTween);

tween2(entity,"x", 1000, -500 ,2 ,false);

tween2(entity,"x", 1000, 1000 ,2 ,false);

tween2(entity,"x", 1000, -1000 ,2 ,false);

*/


var GT = 1.4, SW = 32, SH = 32;
var gameDiv = document.getElementById("game");


function splice(where, what) {
    var ind = where.indexOf(what);
    if (ind != -1)
        where.splice(ind, 1);
}

//the distance formula, send in (x1-x2,y1-y2) kthanks

function distance(x, y) {
    return Math.sqrt(x * x + y * y);
}

var ImagePreloader = function(engine) {
    var self = this;
    this.urls = {};
    this.imgs = {};
    this.toRemove = [];
    this.add = function(key, url) {
        this.urls[key] = url;
        this.toLoadCount++;
    };
    this.hider = null;
    this.screen = null;
    this.margin = 100;
    this.loadWidth = engine.width - this.margin * 4;
    this.loadbar = null;
    this.loadHolder = null;
    this.loadText = null;
    this.waitText = null;
    this.setUpLikeCanvas = function(div) {
        div.style.width = engine.width;
        div.style.height = engine.height;
        div.style.position = "absolute";
        div.style.top = 0;
        div.style.left = 0;
    };
    this.setUpLikeScreen = function(div) {
        div.style.overflow = "hidden";
    };
    this.setUpLikeHider = function(div) {
        div.style.backgroundColor = "#445673";
        div.style.textAlign = "center";
    };
    this.setUpLikeLoadHolder = function(div) {
        var borW = 1;
        var MRL = this.margin;
        var PD = 3;
        var H = 20;
        var W = engine.width - MRL * 2 - PD * 2 - borW * 2;
        var MRT = (engine.height - H) / 2;
        H -= PD * 2 + borW * 2;
        div.style.border = borW + "px solid";
        div.style.borderColor = "#8093b0";
        div.style.backgroundColor = "#445673";
        div.style.marginLeft = MRL;
        div.style.marginTop = MRT;
        div.style.width = W;
        div.style.height = H;
        div.style.position = "absolute";
        div.style.top = 0;
        div.style.left = 0;
        div.style.padding = PD;
    };
    this.setUpLikeLoadBar = function(div) {
        div.style.backgroundColor = "#8093b0";
        div.style.width = "0%";
        div.style.height = "100%";
    };
    this.setUpLikeLoadText = function(div) {
        div.style.color = "#8093b0";
        div.textContent = "0%";
    };
    this.setUpLikeWaitText = function(div) {
        div.style.color = "#8093b0";
        div.textContent = "We don't actually have any hints yet :P";
    };
    this.imgLoad = function() {
        self.loadedCount++;
        var per = Math.round((self.loadedCount / self.toLoadCount) * 100) + "%";
        self.loadbar.style.width = per;
        self.loadText.textContent = per;
        self.toRemove.push(this);
        if (self.progress)
            self.progress();
        if (self.complete && self.loadedCount == self.toLoadCount) {
            self.complete();
            for (var removable in self.toRemove) {
                self.screen.removeChild(self.toRemove[removable]);
            }
            gameDiv.removeChild(self.screen);
            gameDiv.removeChild(self.hider);
        }

    };
    this.load = function() {
        if (!this.hider) {
            this.hider = document.createElement("DIV");
            this.screen = document.createElement("DIV");
            this.loadbar = document.createElement("DIV");
            this.loadHolder = document.createElement("DIV");
            this.loadText = document.createElement("DIV");
            this.waitText = document.createElement("DIV");
            this.hider.appendChild(this.loadHolder);
            this.loadHolder.appendChild(this.loadbar);
            this.loadHolder.appendChild(document.createElement("BR"));
            this.loadHolder.appendChild(this.loadText);
            this.loadHolder.appendChild(this.waitText);
        }
        gameDiv.appendChild(this.screen);
        gameDiv.appendChild(this.hider);
        this.setUpLikeCanvas(this.hider);
        this.setUpLikeCanvas(this.screen);
        this.setUpLikeHider(this.hider);
        this.setUpLikeScreen(this.screen);
        this.setUpLikeLoadHolder(this.loadHolder);
        this.setUpLikeLoadBar(this.loadbar);
        this.setUpLikeLoadText(this.loadText);
        this.setUpLikeWaitText(this.waitText);


        for (var i in this.urls) {
            this.imgs[i] = document.createElement("IMG");
            this.imgs[i].onload = this.imgLoad;
            this.imgs[i].src = this.urls[i];
            self.screen.appendChild(this.imgs[i]);
        }
    };
    this.complete = null;
    this.progress = null;
    this.toLoadCount = 0;
    this.loadedCount = 0;
};

var GameEngine = {
	ow:0,
	oh:0,
    launch: function(opts) {
        var options = {
            bgColor: "black",
            types: [],
            keys: [],
            urls: [],
			smooth:false
        };
        handler.merge(options, opts);
        if (options.bgColor) {
            gameDiv.style.backgroundColor = options.bgColor;
        }
        this.width = window.innerWidth;
        this.height = window.innerHeight;
		this.ow=this.width;
		this.oh=this.height;
        for (var k in options.keys) {
            this.archetypes.push(options.types[k], options.keys[k], options.urls[k]);
        }

        var toLoadList = this.archetypes.getToLoad();
		this.options = options;
        if (options.keys.length > 0) {
            var preloader = new ImagePreloader(this);

            for (var build in toLoadList) {
                var building = toLoadList[build];
                preloader.add(building.type, building.toLoad.src);
            }
            preloader.complete = function() {

                for (var build in toLoadList) {
                    var building = toLoadList[build];
                    building.toLoad.img = preloader.imgs[building.type];
                    building.toLoad.width = preloader.imgs[building.type].clientWidth;
                    building.toLoad.height = preloader.imgs[building.type].clientHeight;
                }

                GameEngine.update();
                if (options.complete)
                    options.complete();
            };

            preloader.load();
        } else {
            GameEngine.update();
            if (options.complete)
                options.complete();
        }
    },
    resize:function(){
        GameEngine.paused=true;
        var ow = GameEngine.width;
        var oh = GameEngine.height;
        GameEngine.width=window.innerWidth;
    	GameEngine.height=window.innerHeight;
        GameEngine.x += GameEngine.width - ow;
        GameEngine.y += GameEngine.height - oh;
        for(var c in GameEngine.canvases){
            GameEngine.canvases[c].canvas.width = "" + GameEngine.width;
            GameEngine.canvases[c].canvas.height = "" + GameEngine.height;
        }
        for (var c in GameEngine.canvases) {
                var canvas = GameEngine.canvases[c];
                canvas.ctx.clearRect(0, 0, GameEngine.width, GameEngine.height);
                canvas.drawList.draw(canvas.ctx);
        }
    },
    canvases: [],
    lastInterval: 0,
    tween: [],
    x:0,
    y:0,
    update: function() {
            if(GameEngine.paused)
                return false;

        var ticks = 1;
        var curInterval = Date.now();
        if (GameEngine.lastInterval) {
            ticks = (curInterval - GameEngine.lastInterval) * 60 / 1000;
        }
		ticks *= GT;
        GameEngine.lastInterval = curInterval;
        if (ticks < 10) {
            var tween = 0,
                max = GameEngine.tween.length;
            while (tween < max) {
                if (GameEngine.tween[tween](GameEngine, ticks)) {
                    GameEngine.tween.splice(tween, 1);
                    max--;
                } else {
                    tween++;
                }
            }

            for (var c in GameEngine.canvases) {
                var canvas = GameEngine.canvases[c];
                canvas.ctx.clearRect(0, 0, GameEngine.width, GameEngine.height);
                canvas.drawList.update(ticks);
                canvas.drawList.draw(canvas.ctx);
            }
            requestAnimationFrame(GameEngine.update);
        } else {
            GameEngine.paused = true;
            console.log("WHOAAAA WE MISSED SOME TICKS (" + ticks + ") PAUSING!!");
        }
    },

    //This is the list of possible images to load
    //used during mouse events and map loading
    archetypes: {
        types: {},
        push: function(type, key, source) {
            var oType = this.types[type];
            if (!oType) {
                this.types[type] = {};
                oType = this.types[type];
                oType.builders = [];
                oType.keys = [];
                oType.min = -1;
                oType.max = -1;
            }
            oType.builders.push({
                    src: source
                });
            oType.keys.push(key);
        },
        getBuilder: function(type, index) {
            var oType = this.types[type];
            if (typeof index == "string") {
                index = oType.keys.indexOf(index);
            }
            return oType.builders[index];
        },
        getToLoad: function() {
            var loadList = [];
            for (var type in this.types) {
                var oType = this.types[type];
                for (var builder in oType.builders) {
                    var oBuild = oType.builders[builder];
                    var oKey = oType.keys[builder];
                    if (!oBuild.img) {
                        loadList.push({
                                type: oKey,
                                builder: builder,
                                toLoad: oBuild
                            });
                    }
                }
            }
            return loadList;
        },
        setLoaded: function(type, builder, oBuild) {
            this.types[type].builders[builder] = oBuild;
        },
        find: function(type, index) {
            var oType = this.types[type];
            if (oType) {
                if (index >= oType.min && index <= oType.max) {
                    return oType.locate.indexOf(index);
                }
            }
            return -1;
        }
    },
    _paused: false,
    set paused(x) {
        if(x != this._paused){
        this._paused = x;
        if (x == false) {
            GameEngine.update();
        } else if(x===true){
            GameEngine.lastInterval = 0;
            GameEngine.getReady();
		}else{
			GameEngine.lastInterval = 0;
		}
        }
    },
    get paused() {
        return this._paused;
    },
    getReady: function() {
        var ready = document.createElement("DIV");
        ready.classList.add("ready");
        ready.innerHTML = "<br>Get ready!<br><br>";
        var ok = document.createElement("DIV");
        ok.classList.add("ok");
        ok.innerHTML = "Ok";
        ready.appendChild(ok);
        gameDiv.appendChild(ready);
        ok.addEventListener("click", function() {
            gameDiv.removeChild(ready);
            GameEngine.paused = false;
        });
    },
	youLose: function(x) {
		if(!GameEngine.lost){
			GameEngine.lost=true;
		GameEngine.paused = 1;
        var ready = document.createElement("DIV");
        ready.classList.add("ready");
        var span = document.createElement("SPAN");
        var ok = document.createElement("DIV");
        ok.classList.add("ok");
        ready.appendChild(span);
        ready.appendChild(ok);
		if(GameEngine.setuplose)
			GameEngine.setuplose(span,ok);
		
        gameDiv.appendChild(ready);
        ok.addEventListener("click", function() {
						GameEngine.lost=false;

            gameDiv.removeChild(ready);
			if(GameEngine.reset)
			GameEngine.reset();
            GameEngine.paused = false;
			
        });
		}
    },
	setuplose:null,
	reset:null



};

var PathEngine = function(x,y,dx,dy){
	if(Math.abs(dx-x)+Math.abs(dy-y) <= 1){
		return {x:dx-x,y:dy-y};
	}
}

//ATTENTION CORE SHOULD MOVE OR ACTION FIRST, RETRIEVE CORE LIST ORDER
			//CALL APPROPRIATE CORES
			/*
			CALL
			var coreList = CORES[ATTENTION](MONSTER_TYPE);
			var act = 0;
			while(act < coreList.length){
				var response = CORES[coreList](MONSTER_TYPE);
				if(response){
					for(var i = 0; i < response.length; i++){
						coreList.push(response[i]);
					}
				}
				coreList.splice(0,1);
			}
			CoreLists:
			MOVEMENT  : moves and requests path to target before moving. 
						If no target, monster specific movement pattern,
						usually will wander room or a small area around the monster.
			ACTION    : determines and executes monster specific fight or enviornmental interaction.
			ATTENTION : determines what the monster wants to do. 
						if the monster likes a certain style of attack/action
						and has the moves to do it, it will attempt to attack
						in that manner. if it has a secondary skill that is
						usable, that will be used. Depending on the intelligence
						of a monster, it may be able to use protection items
						monsters will also track first or fight first depending
						on their preference, and if they have the ability to do so
			*/


var _Land = {

    update: function(ticks) {

        var tween = 0,
            max = this.tween.length;

        while (tween < max) {

            if (this.tween[tween](this, ticks)) {
                this.tween.splice(tween, 1);
                max--;
            } else {
                tween++;
            }
        }


    },
    draw: function(ctx) {
        var x = Math.floor(GameEngine.x+this.x)*SW;
        var y = Math.floor(GameEngine.y+this.y)*SH;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.vr);
            if (this.a < 1) {
                ctx.globalAlpha = this.a;
                if (this.a < 0)
                    this.a = 0;
            }
				var w = SW;
                var h = SH;
		//ctx.fillStyle = "#F00";
		           // ctx.fillRect(0, 0, this.width, this.height);
		for(var j = y; j < this.height; j++){
			for(var i = x; i < this.width; i++){
				if(this.data[j][i] !== undefined)
                	ctx.drawImage(this.sprites[this.data[j][i]], i*w, j*h, w, h);
			}
		}
            ctx.restore();
    }
};
Land = function(x, y, width, height, sprites, data, layer) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprites = sprites;
	this.data = data;
    this.l = layer || 0;
    this.tween = [];
    for (var func in _Land)
        this[func] = _Land[func];

};


var CORES = function(core,monster){
	if(MONSTER_CORES[monster][core])
		return MONSTER_CORES[monster][core]();
};
var MONSTER_CORES = {basic:{
	attention:function(){
		//check surroundings for actionable objects
		//if within range, action
		//else movement
	},
	movement:function(){
		
	},
	action:function(){
		
	}
}};
var ATTENTION = "attention",
	MOVEMENT = "movement",
	ACTION = "action";

var _Monster = {

    update: function(ticks) {

        var tween = 0,
            max = this.tween.length;

        while (tween < max) {
            if (this.tween[tween](this, ticks)) {
                this.tween.splice(tween, 1);
                max--;
            } else {
                tween++;
            }
        }
		if(GameEngine.isActionTurn){
			var coreList = CORES[ATTENTION](MONSTER_TYPE);
			var act = 0;
			while(act < coreList.length){
				var response = CORES[coreList](MONSTER_TYPE);
				if(response){
					for(var i = 0; i < response.length; i++){
						coreList.push(response[i]);
					}
				}
				coreList.splice(0,1);
			}
			
		}

    },
    draw: function(ctx) {
        var x = Math.floor(GameEngine.x+this.x)*SW;
        var y = Math.floor(GameEngine.y+this.y)*SH;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.vr);
            if (this.a < 1) {
                ctx.globalAlpha = this.a;
                if (this.a < 0)
                    this.a = 0;
            }
				var w = this.width;
                var h = this.height;
		//ctx.fillStyle = "#F00";
		           // ctx.fillRect(0, 0, this.width, this.height);
		
                	ctx.drawImage(this.sprite, 0, 0, w, h);
			
		
            ctx.restore();
    }
};
Monster = function(x, y, width, height, sprite, inventory, moveSpeed, actionSpeed, baseSpeed, layer) {
    this.x = x;
    this.y = y;
    this.width = width*SW;
    this.height = height*SH;
    this.sprite = sprite;
	this.inv = inventory;
	this.path = [];
    this.l = layer || 0;
    this.tween = [];
	this.path = [];
	this.moveSpeed = 0;
	this.actionSpeed = 0;
	this.baseSpeed = 1;
    for (var func in _Monster)
        this[func] = _Monster[func];

};



var handler = {
    merge: function(obj, objM) {
        for (var key in objM) {
            obj[key] = objM[key];
        }
        return obj;
    }
};
function CanvasLayer(engine, opts) {
    var canvas = document.createElement("CANVAS");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.width = "" + engine.width;
    canvas.height = "" + engine.height;
    this.ctx = canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = GameEngine.options.smooth;

    gameDiv.appendChild(canvas);


    this.drawList = {
        //list of objects to draw
        l: [],
        remL: [],
        //add an object to be drawn,
        //every drawable object has a property "l" that
        //identifies it's draw index for better rendering.
        add: function(o) {
            this.l[o.l].push(o);
            o.vis = true;
        },
        //remove an object to be drawn
        remove: function(o) {
            this.remL.push(o);
            o.vis = false;
        },
        removeA: function(o) {
            splice(this.l[o.l], o);
        },
        //add a class of objects to be drawn
        expand: function() {
            this.l.push([]);
        },
        //wipes list
        reset: function() {
            this.l = [];
        },
        //draw the items to the context
        draw: function(ctx) {
            for (var l = 0; l < this.l.length; l++) {
                for (var i = 0; i < this.l[l].length; i++) {
                    this.l[l][i].draw(ctx);
                }
            }
        },
        update: function(ticks) {


            for (var l = 0; l < this.l.length; l++) {
                for (var i = 0; i < this.l[l].length; i++) {
                    this.l[l][i].update(ticks);
                }
            }
            if (this.remL.length > 0) {
                for (var r in this.remL) {
                    this.removeA(this.remL[r]);
                }
                this.remL = [];
            }

        },
        //get index of object in drawlist
        ind: function(o) {
            return this.l[o.l].indexOf(o);
        },
        findClick: function(x, y) {
            for (var l = this.l.length - 1; l > -1; l--) {
                for (var i = 0; i < this.l[l].length; i++) {
                    var o = this.l[l][i];
                    var padding = 10;
                    var ow = o.width+padding;
                    var oh = o.height+padding;
                    if (x > o.x - ow / 2 && x < o.x + ow / 2 && y > o.y - oh / 2 && y < o.y + oh / 2) {
                        return o;
                    }
                }
            }
            return false;
        }
    };


    this.canvas = canvas;

    engine.canvases.push(this);


}

function tween2(obj, prop, ticks, value, x, neg, comp) {
    tween(obj, prop, ticks / 2, value / 2, x, neg, function() {
        tween(obj, prop, ticks / 2, value / 2, x, !neg, comp);
    });
}

function tween(obj, prop, ticks, value, x, neg, comp) {
    var tick = 0;
    var oldVal = 0;
    ticks *= 60 / 1000;
    var func = function(o, t) {
        tick += t;
        var val;
        if (neg) {
            val = 1 - tick / ticks;
            if (val <= 0) {
                val = 0;
            }
        } else {
            val = tick / ticks;
            if (val >= 1) {
                val = 1;
            }
        }

        var m = 1;
        for (var p = 0; p < x; p++) {
            m *= val;
        }


        obj[prop] -= oldVal;
        oldVal = Math.floor(10000 * (neg ? value - value * m : value * m)) / 10000;
        obj[prop] += oldVal;
        if ((val == 1 && !neg) || (val == 0 && neg)) {
            if (comp)
                comp(obj);
            return true;
        } else {
            return false;
        }
    };
    obj.tween.push(func);
}
function wticks(obj, ticks, comp) {
    var func = function(o, t) {
		ticks-=t;
        
        if (ticks <= 0) {
            if (comp)
                comp(obj);
            return true;
        } else {
            return false;
        }
    };
    obj.tween.push(func);
}
function tveen(obj, prop, value, dx, comp) {
    var neg = Math.max(value - dx) < value;
    var func = function(o, t) {

        var x = t * dx;
        value -= x;
        obj[prop] += x;
        if ((!neg && value >= 0) || (neg && value <= 0)) {
            if (comp)
                comp(obj);
            return true;
        } else {
            return false;
        }
    };
    obj.tween.push(func);
}