/*

Tonna shit here
*/

var autocontinue = true;

/*
used with communications with the Objective-C shell
*/
function out(url) {
  var iframe = document.createElement("IFRAME");
  iframe.setAttribute("src", "js:cmd}:" + url);
  document.documentElement.appendChild(iframe);
  iframe.parentNode.removeChild(iframe);
  iframe = null;
}
out("checkos");

/*
with and heights related to tile size.
*/
var SW = 32,
  SH = 32,
  EW,
  EH;

var gameDiv = document.getElementById("game");

/*
removes something from a list by splicing
*/
function splice(where, what) {
  var ind = where.indexOf(what);
  if (ind != -1)
    where.splice(ind, 1);
}

//the distance formula, send in (x1-x2,y1-y2) kthanks
function distance(x, y) {
  return Math.sqrt(x * x + y * y);
}

/*
a function factored out for tiles to check if their
children have anything that will obstruct movement.
*/
function canPassObjs(monster, x, y) {
  var o = land.objs[y][x].i;
  if (o && o.length > 0) {
    for (var i = 0; i < o.length; i++) {
      if (!o[i].canPass(monster, x, y)) {
        return false;
      }
    }
  }
  return true;
}

/*
a function factored out for tiles to check if their
children have anything that will obstruct line of sight.
*/
function losThruObjs(m1, m2, x, y) {
  var o = land.objs[y][x].i;
  if (o && o.length > 0) {
    for (var i = 0; i < o.length; i++) {
      if (!o[i].losThru(m1, m2, x, y)) {
        return false;
      }
    }
  }
  return true;
}

/*
a function factored out for tiles to check if their
children have anything that will happen on willpass event.
*/
function willPassObjs(monster, x, y) {
  if (land.objs[y][x].i && land.objs[y][x].i.length > 0) {
    for (var i = 0; i < land.objs[y][x].i.length; i++) {
      if (!land.objs[y][x].i[i].willPass(monster, x, y)) {
        return false;
      }
    }
  }
  if (monster.parent) {
    monster.parent.i.splice(monster.parent.i.indexOf(monster));
  }
  if (!land.objs[y][x].i)
    land.objs[y][x].i = [];
  monster.parent = land.objs[y][x];
  monster.parent.i.push(monster);

  return true;
}

/*
a tile that 'does not exist' (zerotype) follows this prototype
*/
function ZeroSpace() {
  this.canPass = function (monster, x, y) {
    return false;
  };
  this.willPass = function (monster, x, y) {
    return false;
  };
  this.losThru = function (m1, m2, x, y) {
    return false;
  };
}

/*
prepares to load a new level
*/
function prepareLoad() {
  player.path = [];
  player.dx = 0;
  player.dy = 0;
  GameEngine.isActionTurn = false;
  GameEngine.updatesLeft = 0;
  for (var m in monsters) {
    remove(monsters[m]);
  }
}
/*
function Stair(Up) {
    this.canPass = function(monster, x, y) {
        return canPassObjs(monster, x, y);
    };
    this.willPass = function(monster, x, y) {
		var willPass = willPassObjs(monster, x, y);
		if (monster.path.length == 0 && monster === player && willPass && confirm((Up == -1?"Descend":"Ascend")+" a level?")) {
			prepareLoad();
			GameEngine.toLoad = function(){
            	loadADungeon(Up);
			};
        }
        return willPass;
    };
	this.losThru = function(m1, m2, x, y){
		return losThruObjs(m1, m2, x, y);
	};
}
*/
function Tile() {
  this.canPass = function (monster, x, y) {
    return canPassObjs(monster, x, y);
  };
  this.willPass = function (monster, x, y) {
    return willPassObjs(monster, x, y);
  };
  this.losThru = function (m1, m2, x, y) {
    return losThruObjs(m1, m2, x, y);
  };
}


function Wall() {
  this.canPass = function (monster, x, y) {
    return false;
  };
  this.willPass = function (monster, x, y) {
    return false;
  };
  this.losThru = function (m1, m2, x, y) {
    return false;
  };
}

function Water() {
  this.canPass = function (monster, x, y) {
    return false;
  };
  this.willPass = function (monster, x, y) {
    return false;
  };
  this.losThru = function (m1, m2, x, y) {
    return true;
  };
}


var _Door = {
  draw: function (ctx, x, y) {
    var w = SW;
    var h = SH;
    ctx.drawImage(land.sprites[this.state], x, y, w, h);
  },
  canPass: function (monster, x, y) {
    if (this.state == this.open) {
      return true;
    }
    if (monster === player) {
      if (this.requiredItem) {
        if (player.inv.indexOf(this.requiredItem) != -1) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  },
  willPass: function (monster, x, y) {
    if (this.state == this.open) {
      return true;
    }
    var ret = true;
    if (monster === player) {
      if (this.requiredItem) {
        if (player.inv.indexOf(this.requiredItem) != -1) {

        } else {
          ret = false;
        }
      }
    } else if (this.requiredItem) {
      ret = false;
    }
    if (ret) {
      this.state = this.open;
      lightRoom(x, y);
    }
    return ret;
  },
  losThru: function (m1, m2, x, y) {
    return this.state == this.open;
  },
  valueOf: function () {
    var ret = ["Door",
				this.open,
				this.closed,
				this.state
				];
    if (this.requiredItem !== undefined) {
      ret.push(this.requiredItem);
      ret.push(this.consumesItem);
    }
    return ret;
  }
};
Door = function (open, closed, state, requiredItem, consumesItem) {
  this.open = open;
  this.closed = closed;
  this.state = (state === undefined) ? closed : state;
  this.requiredItem = requiredItem;
  this.consumesItem = consumesItem;
  for (var func in _Door)
    this[func] = _Door[func];

};
var _Chest = {
  draw: function (ctx, x, y) {
    var w = SW;
    var h = SH;
    ctx.drawImage(land.sprites[this.state], x, y, w, h);
  },
  canPass: function (monster, x, y) {
    return false;
  },
  willPass: function (monster, x, y) {
    this.interact(monster, x, y);
    return false;
  },
  losThru: function (m1, m2, x, y) {
    return true;
  },
  interact: function (monster, x, y) {
    this.state = this.open;
    GameEngine.toLoad = showInventory;
    GameEngine.toLoadData = {
      m1: this,
      m2: monster
    };
    return true;
  },
  valueOf: function () {
    return ["Chest",
				this.x,
				this.y,
				this.open,
				this.closed,
				valueOfInv(this.inv),
				this.state
			   ];
  }
};
Chest = function (x, y, open, closed, inv, state) {
  this.open = open;
  this.closed = closed;
  this.state = (state === undefined) ? closed : state;
  this.inv = inv;
  setUpInv(this.inv);
  this.x = x;
  this.y = y;
  for (var func in _Chest)
    this[func] = _Chest[func];

};
var _Potion = {
  draw: function (ctx, x, y) {
    var w = SW;
    var h = SH;
    ctx.drawImage(land.sprites[this.sprite], x, y, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px monospace";
    ctx.fillText("" + this.count, x, y + 12);
  },
  use: function (monster, x, y) {
    if (this.parent && this.count <= 1) {
      this.parent.splice(this.parent.indexOf(this), 1);
    } else {
      this.count--;
    }
    if (monster[this.type].add)
      monster[this.type].add(this.value);
    else
      monster[this.type] += this.value;
    gameTextDisp(monster.type + " " + this.type + " now " + (monster[this.type].get ? monster[this.type].get() : monster[this.type]));
  },
  toString: function () {
    return "potion v:" + this.value + " t:" + this.type + " s:" + this.sprite;
  },
  valueOf: function () {
    return ["Potion",
				this.value,
				this.type,
				this.count,
				this.sprite
				];
  }
};

Potion = function (value, type, count, sprite, parent) {
  this.value = value;
  this.type = type;
  this.sprite = sprite;
  this.count = count;
  this.parent = parent;
  for (var func in _Potion)
    this[func] = _Potion[func];

};

var _Stair = {
  draw: function (ctx, x, y) {
    var w = SW;
    var h = SH;
    ctx.drawImage(land.sprites[this.s], x, y, w, h);
  },
  canPass: function (monster, x, y) {
    return true;
  },
  willPass: function (monster, x, y) {
    var dir = this.dir
    if (monster.path.length == 0 && monster === player && confirm((dir == -1 ? "Descend" : "Ascend") + " a level?")) {
      prepareLoad();
      GameEngine.toLoad = function () {
        loadADungeon(dir);
      };
    }
    return true;
  },
  losThru: function (m1, m2, x, y) {
    return true;
  },
  valueOf: function () {
    return ["Stair",
				this.s,
				this.dir,
				];
  }
};
Stair = function (s, dir) {
  this.s = s;
  this.dir = dir;
  for (var func in _Stair)
    this[func] = _Stair[func];

};
var ImagePreloader = function (engine) {
  var self = this;
  this.urls = {};
  this.imgs = {};
  this.toRemove = [];
  this.add = function (key, url) {
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
  this.setUpLikeCanvas = function (div) {
    div.style.width = engine.width;
    div.style.height = engine.height;
    div.style.position = "absolute";
    div.style.top = 0;
    div.style.left = 0;
  };
  this.setUpLikeScreen = function (div) {
    div.style.overflow = "hidden";
  };
  this.setUpLikeHider = function (div) {
    div.style.backgroundColor = "#000000";
    div.style.textAlign = "center";
  };
  this.setUpLikeLoadHolder = function (div) {
    var borW = 1;
    var MRL = this.margin;
    var PD = 3;
    var H = 20;
    var W = engine.width - MRL * 2 - PD * 2 - borW * 2;
    var MRT = (engine.height - H) / 2;
    H -= PD * 2 + borW * 2;
    div.style.border = borW + "px solid";
    div.style.borderColor = "#ffffff";
    div.style.backgroundColor = "#000000";
    div.style.marginLeft = MRL;
    div.style.marginTop = MRT;
    div.style.width = W;
    div.style.height = H;
    div.style.position = "absolute";
    div.style.top = 0;
    div.style.left = 0;
    div.style.padding = PD;
  };
  this.setUpLikeLoadBar = function (div) {
    div.style.backgroundColor = "#ffffff";
    div.style.width = "0%";
    div.style.height = "100%";
  };
  this.setUpLikeLoadText = function (div) {
    div.style.color = "#000000";
    div.textContent = "0%";
  };
  this.setUpLikeWaitText = function (div) {
    div.style.color = "#000000";
    div.textContent = "Lizard Up!";
  };
  this.imgLoad = function () {
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
  this.load = function () {
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
  ow: 0,
  oh: 0,
  ox: 0,
  oy: 0,
  alreadyLaunched: false,
  launch: function (opts) {
    var options = {
      bgColor: "black",
      types: [],
      keys: [],
      urls: [],
      smooth: false,
      bannerHeight: 0
    };
    handler.merge(options, opts);
    GameEngine.bannerHeight = options.bannerHeight;
    if (options.bgColor) {
      document.body.style.backgroundColor = options.bgColor;
    }
    if (!GameEngine.alreadyLaunched) {
      this.width = window.innerWidth;
      this.height = window.innerHeight - GameEngine.bannerHeight;
      EW = Math.ceil(GameEngine.width / SW);
      EH = Math.ceil(GameEngine.height / SH);
      this.ow = this.width;
      this.oh = this.height;
    }
    for (var k in options.keys) {
      this.archetypes.push("vis", options.keys[k], options.urls[k]);
    }

    var toLoadList = this.archetypes.getToLoad();
    this.options = options;
    if (options.keys.length > 0) {
      var preloader = new ImagePreloader(this);

      for (var build in toLoadList) {
        var building = toLoadList[build];
        preloader.add(building.type, building.toLoad.src);
      }
      preloader.complete = function () {

        for (var build in toLoadList) {
          var building = toLoadList[build];
          building.toLoad.img = preloader.imgs[building.type];
          building.toLoad.width = preloader.imgs[building.type].clientWidth;
          building.toLoad.height = preloader.imgs[building.type].clientHeight;
        }

        if (options.complete)
          options.complete();
        GameEngine.alreadyLaunched = true;
      };

      preloader.load();
    } else {
      if (options.complete)
        options.complete();
      GameEngine.alreadyLaunched = true;
    }
  },
  resize: function () {
    var ow = GameEngine.width;
    var oh = GameEngine.height;
    GameEngine.width = window.innerWidth;
    GameEngine.height = window.innerHeight - GameEngine.bannerHeight;
    EW = Math.ceil(GameEngine.width / SW);
    EH = Math.ceil(GameEngine.height / SH);
    var ox = (GameEngine.width - ow) / 2 + GameEngine.ox,
      oy = (GameEngine.height - oh) / 2 + GameEngine.oy,
      fox = Math.floor(ox / SW) * SW,
      foy = Math.floor(oy / SH) * SH;
    GameEngine.ox = ox - fox;
    GameEngine.oy = oy - foy;
    GameEngine.x += fox / SW;
    GameEngine.y += foy / SH;


    for (var c in GameEngine.canvases) {
      var mt = 1;
      if (GameEngine.IS_HIGH_DEF) mt = 2;
      GameEngine.canvases[c].canvas.width = "" + GameEngine.width * mt;
      GameEngine.canvases[c].canvas.height = "" + GameEngine.height * mt;
      GameEngine.canvases[c].canvas.style.width = GameEngine.width
      GameEngine.canvases[c].canvas.style.height = GameEngine.height
      if (GameEngine.IS_HIGH_DEF) GameEngine.canvases[c].ctx.scale(2, 2);
      GameEngine.canvases[c].ctx.imageSmoothingEnabled = GameEngine.options.smooth;
      GameEngine.canvases[c].ctx.mozImageSmoothingEnabled = GameEngine.options.smooth;
      GameEngine.canvases[c].ctx.webkitImageSmoothingEnabled = GameEngine.options.smooth;
    }
    GameEngine.isResizing = true;
    GameEngine.update();
    GameEngine.isResizing = false;
  },
  canvases: [],
  lastInterval: 0,
  tween: [],
  x: 0,
  y: 0,
  modeFns: [0],
  isResizing: false,
  isFirstTurn: false,
  fastestTurns: 1,
  curTurn: 1,
  update: function (isFirstTurn) {
    //stand to take it all in
    var interrupted = false,
      btnInt = 0;
    for (var b = 0; b < Buttons.length && !interrupted; b++) {
      var btn = Buttons[b];

      var but = ButtonTypes[Buttons[b].type] || btn;
      if (but.update) {
        interrupted = but.update(btn.data);
      }

      btnInt = b;
    }
    if (!interrupted) {
      if (isFirstTurn || GameEngine.isFirstTurn) {
        GameEngine.isFirstTurn = true;
        GameEngine.curTurn = 1;
      }
      GameEngine.isUpdating = true;

      var ticks = 1;



      for (var c in GameEngine.canvases) {
        var canvas = GameEngine.canvases[c];
        canvas.ctx.clearRect(0, 0, GameEngine.width, GameEngine.height);
        if (!GameEngine.isResizing)
          canvas.drawList.update(ticks);
        canvas.drawList.draw(canvas.ctx);
      }

      if (!GameEngine.isResizing) {
        if (GameEngine.updatesLeft > 0 || GameEngine.curTurn < GameEngine.fastestTurns) {
          var cur = Date.now();
          if (GameEngine.curTurn >= GameEngine.fastestTurns)
            GameEngine.updatesLeft--;
          var time = GameEngine.updateTime - (GameEngine.lastInterval ? cur - GameEngine.lastInterval - GameEngine.updateTime : 0);
          GameEngine.lastInterval = cur;

          if (time > GameEngine.updateTime) time = GameEngine.updateTime;
          setTimeout(GameEngine.update, time);

        } else {
          GameEngine.isUpdating = false;
          GameEngine.lastInterval = 0;
          var temp = GameEngine.toLoad;
          var data = GameEngine.toLoadData;
          if (temp) {
            GameEngine.toLoadData = undefined;
            GameEngine.toLoad = undefined;
            temp(data);
          }

        }
      } else {
        GameEngine.isUpdating = false;
      }
    } else {
      var canvas = GameEngine.canvases[0];
      for (var b = 0; b <= btnInt; b++) {
        var btn = Buttons[b];
        var but = ButtonTypes[Buttons[b].type] || btn;
        if (but.draw) {
          interrupted = but.draw(canvas.ctx, btn.data);
        }
      }
    }
  },
  updatesLeft: 0,
  isUpdating: false,
  updateTime: 100,
  //This is the list of possible images to load
  //used during mouse events and map loading
  archetypes: {
    types: {},
    push: function (type, key, source) {
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
    getBuilder: function (type, index) {
      var oType = this.types[type];
      if (typeof index == "string") {
        index = oType.keys.indexOf(index);
      }
      return oType.builders[index];
    },

    getToLoad: function () {
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
    setLoaded: function (type, builder, oBuild) {
      this.types[type].builders[builder] = oBuild;
    },
    find: function (type, index) {
      var oType = this.types[type];
      if (oType) {
        if (index >= oType.min && index <= oType.max) {
          return oType.locate.indexOf(index);
        }
      }
      return -1;
    }
  },
  reset: null



};

var PathEngine = function (x, y, dx, dy) {
  if (Math.abs(dx - x) + Math.abs(dy - y) <= 1) {
    return {
      x: dx - x,
      y: dy - y
    };
  }
}


/**

*/
var _Land = {

  update: function (ticks) {

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
  draw: function (ctx) {
    var x = Math.floor(GameEngine.x + this.x);
    var y = Math.floor(GameEngine.y + this.y);
    ctx.save();
    ctx.translate(x * SW, y * SH);
    ctx.rotate(this.vr);
    if (this.a < 1) {
      ctx.globalAlpha = this.a;
      if (this.a < 0)
        this.a = 0;
    }
    var w = SW;
    var h = SH;


    x = x > 0 ? 0 : -x;
    y = y > 0 ? 0 : -y;
    var width = Math.min(x + EW, this.width),
      height = Math.min(y + EH, this.height);


    for (var j = y - 1; j < height; j++) {
      for (var i = x - 1; i < width; i++) {
        if (this.objs[j]) {
          var o = this.objs[j][i];
          if (o && !o.d) {
            var dx = Math.floor(i * w + GameEngine.ox),
              dy = Math.floor(j * h + GameEngine.oy);
            ctx.drawImage(this.sprites[o.s], dx, dy, w, h);
            if (o.i) {
              for (var k = 0; k < o.i.length; k++) {
                if (o.i[k].draw)
                  o.i[k].draw(ctx, dx, dy);

              }
            }
          }
        }
      }
    }
    ctx.restore();
  }
};
Land = function (x, y, width, height, sprites, objs, layer) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.sprites = sprites;
  this.objs = objs;
  this.l = layer || 0;
  this.tween = [];
  for (var func in _Land)
    this[func] = _Land[func];

};






function Button(x, y, width, height, img, funcs, data, l) {
  this.update = funcs.update;
  funcs.update = undefined;
  this.controls = funcs;
  this.l = l || 0;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.img = img;
  this.type = 0;
  this.data = data || {};
  this.draw = function (ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  };
}





function CanvasLayer(engine, opts) {
  var canvas = document.createElement("CANVAS");
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  var mt = 1;
  if (engine.IS_HIGH_DEF) mt = 2;
  canvas.width = "" + engine.width * mt;
  canvas.height = "" + engine.height * mt;
  canvas.style.width = engine.width;
  canvas.style.height = engine.height;
  this.ctx = canvas.getContext("2d");
  if (engine.IS_HIGH_DEF) this.ctx.scale(2, 2);
  this.ctx.imageSmoothingEnabled = GameEngine.options.smooth;
  this.ctx.mozImageSmoothingEnabled = GameEngine.options.smooth;
  this.ctx.webkitImageSmoothingEnabled = GameEngine.options.smooth;
  gameDiv.appendChild(canvas);


  this.drawList = {
    //list of objects to draw
    //layer zero does not draw
    l: [],
    remL: [],
    //add an object to be drawn,
    //every drawable object has a property "l" that
    //identifies it's draw index for better rendering.
    add: function (o) {
      this.l[o.l].push(o);
      o.vis = true;
    },
    //remove an object to be drawn
    remove: function (o) {
      this.remL.push(o);
      o.vis = false;
    },
    removeA: function (o) {
      splice(this.l[o.l], o);
    },
    //add a class of objects to be drawn
    expand: function () {
      this.l.push([]);
    },
    //wipes list
    reset: function () {
      this.l = [];
    },
    //draw the items to the context
    draw: function (ctx) {
      for (var l = 1; l < this.l.length; l++) {
        for (var i = 0; i < this.l[l].length; i++) {
          this.l[l][i].draw(ctx);
        }
      }
    },
    update: function (ticks) {


      for (var l = 0; l < this.l.length; l++) {
        for (var i = 0; i < this.l[l].length; i++) {
          this.l[l][i].update(ticks);
        }
      }
      this.removeRM();

    },
    removeRM: function () {
      if (this.remL.length > 0) {
        for (var r in this.remL) {
          this.removeA(this.remL[r]);
        }
        this.remL = [];
      }
    },
    //get index of object in drawlist
    ind: function (o) {
      return this.l[o.l].indexOf(o);
    },
    findClick: function (x, y) {
      for (var l = this.l.length - 1; l > -1; l--) {
        for (var i = 0; i < this.l[l].length; i++) {
          var o = this.l[l][i];
          var padding = 10;
          var ow = o.width + padding;
          var oh = o.height + padding;
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


GameEngine.prompt = function (child, cls, apndTo) {

};

GameEngine.continue = function () {

};



GameEngine.IS_HIGH_DEF = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));


var mySound = new buzz.sound("./DesertLoop.m4a");
mySound.play();
mySound.loop();