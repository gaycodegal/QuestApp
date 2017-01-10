/*
CORES(core, monster) : call proper monster 'core' on 'monster' object

giveItemToMonster(inv, position, monster) : give an item at a 'pos'ition within an 'inv'entory to another 'monster'

losClear(s, x, y) : does a line of sight check between global monsters held in losM1 and losM2, used by lineOfSight()

MONSTER_CORES holds the cores by monster.type

listTargets (m, closestOnly): lists all targets of monster 'm' with the option of only choosing the closest one

pathing(m) : continues to the next tile in the monster's path

pathTo(mf, mt) : returns the A* path found between monster from 'mf' to monster to 'mt'

lineOfSight(m1, m2) : returns true if the two monsters have line of sight clear

_Monster
.update (ticks): updates the monster for a tick
	draw (ctx, x, y) : draws the monster on a canvas contex
	canPass (monster, x, y) : tells if a monster can move onto the same space
	willPass (monster, x, y) : to be called if a monster will move on to the same space
	shouldTarget (monster, x, y) : tells if this monster should be targeted by another monster
	attack (monster) : attack another 'monster'
	defend (hit, monster) : defend against a hit from another 'monster
	losThru (m1, m2, x, y) : can you see through this monster
	valueOf () : returns the true value of this object for saving

function Monster(x, y, width, height, sprite, inventory, atk, def, hp, moveSpeed, actionSpeed, baseSpeed, type, good, xp)
	this.x = x location;
	this.y = y location;
	this.dx = delta movement;
	this.dy = delta movement;
	this.width = width;
	this.height = height;
	this.s = sprite;
	this.inv = inventory;
	this.path = current path;
	this.l = virtual layer to be drawn on;
	this.moveSpeed = moves to be done each turn;
	this.actionSpeed = actions (attacks) to be done each turn;
	this.baseSpeed = general purpose things to be done each turn (attack or move);
	this.atk = attack points;
	this.def = defense points;
	this.hp = health points object;
	this.parent = parent tile of the object;
	this.target = target to be moved to or attacked;
	this.range = 5 sight range;
	this.atkR = 1 attack range;
	this.type = type (ai core);
	this.good = good is the monster on the side of the player, to be redone;
	this.xp = xp object;
*/


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

var CORES = function (core, monster) {
	if (MONSTER_CORES[monster.type][core])
		return MONSTER_CORES[monster.type][core](monster);
};

var ATTENTION = "attention",
	MOVEMENT = "movement",
	ACTION = "action";
var losM1, losM2;
var TYPE_BASIC = "basic";

function giveItemToMonster(inv, position, monster) {
	var item = inv.splice(position, 1)[0];
	if (item && item.count != undefined) {
		for (var i = 0; i < monster.inv.length && item; i++) {
			if (monster.inv[i].toString() == item.toString()) {
				monster.inv[i].count += item.count;
				item = null;
			}
		}
	}
	if (item) {
		monster.inv.push(item);
		item.parent = monster.inv;
	}
}

function losClear(s, x, y) {
	return losCheck(s, x, Math.round(y));
}

function losCheck(s, x, y) {
	return tiles[land.objs[s ? x : y][s ? y : x].s].losThru(losM1, losM2, s ? y : x, s ? x : y);
}
var MONSTER_CORES = {
	basic: {
		attention: function (monster) {
			//check surroundings for actionable objects
			//if within range, action
			//else movement
			var cores = [];
			var movement = monster.cMoveSpeed,
				action = monster.cActionSpeed,
				base = monster.cBaseSpeed;

			if (!monster.target) {
				var targets = listTargets(monster, true);
				monster.target = targets[Math.floor(Math.random() * targets.length / 2) * 2];
			}

			if (monster.target && (base > 0 || action > 0)) {
				monster.tarDist = Math.abs(monster.x - monster.target.x) + Math.abs(monster.y - monster.target.y);
				if (monster.tarDist <= monster.atkR) {
					cores.push(ACTION);
					if (action) {
						action--;
					} else {
						base--;
					}
					if (base > 0 || action > 0 || movement > 0)
						cores.push(ATTENTION);
				}
			}
			if (movement > 0 || base > 0 && cores.length < 1) {
				cores.push(MOVEMENT);
				if (movement) {
					movement--;
				} else {
					base--;
				}
				if (base > 0 || action > 0 || movement > 0)
					cores.push(ATTENTION);
			}
			monster.cMoveSpeed = movement;
			monster.cActionSpeed = action;
			monster.cBaseSpeed = base;
			return cores;
		},
		movement: function (monster) {
			if (monster.target) {
				pathTo(monster, monster.target);
				if (monster.path.length > 0) {
					pathing(monster);
				}
			} else {
				if (monster.path.length > 0) {
					pathing(monster);
				} else {
					var xy = Math.random() < .5,
						ud = Math.random() < .5 ? 1 : -1;

					monster.path.push({
						pos: {
							y: (xy ? ud : 0) + monster.x,
							x: (xy ? 0 : ud) + monster.y
						}
					});
					pathing(monster);
				}
			}
		},
		action: function (monster) {
			monster.attack(monster.target);
		}
	},
	player: {
		attention: function (monster) {
			//check surroundings for actionable objects
			//if within range, action
			//else movement
			monster.target = null;
			var cores = [];
			var movement = monster.cMoveSpeed,
				action = monster.cActionSpeed,
				base = monster.cBaseSpeed;
			if (monster.path.length > 0) {
				var node = monster.path[0];
				monster.dx = node.pos.y - monster.x;
				monster.dy = node.pos.x - monster.y;

				var cpy = monster.y + monster.dy,
					cpx = monster.x + monster.dx;
				var til;
				if (land.objs[cpy])
					til = land.objs[cpy][cpx];
				if (til && til.i) {
					for (var i = 0; i < til.i.length; i++) {
						if (til.i[i].interact || (til.i[i].shouldTarget && til.i[i].shouldTarget(monster))) {
							monster.target = til.i[i];
							i = til.i.length;
							GameEngine.updatesLeft = 0;
						}
					}
				}
			}

			if (monster.target && (base > 0 || action > 0)) {
				monster.tarDist = manhatten(monster, monster.target);
				if (monster.tarDist <= monster.range) {
					cores.push(ACTION);
					if (action) {
						action--;
					} else {
						base--;
					}
					if (base > 0 || action > 0 || movement > 0)
						cores.push(ATTENTION);
				}
			}

			if (movement > 0 || base > 0 && cores.length < 1) {
				cores.push(MOVEMENT);
				if (movement) {
					movement--;
				} else {
					base--;
				}
				if (base > 0 || action > 0 || movement > 0)
					cores.push(ATTENTION);
			}
			monster.cMoveSpeed = movement;
			monster.cActionSpeed = action;
			monster.cBaseSpeed = base;
			return cores;
		},
		movement: function (monster) {
			if (monster.target) {
				pathTo(monster, monster.target);
				pathing(monster);
			} else {
				if (monster.path.length > 0) {
					pathing(monster);
				}
			}
		},
		action: function (monster) {
			if (monster.target.interact) {
				monster.path.splice(0, 1);
				monster.target.interact(monster, monster.x, monster.y);
			} else {
				monster.attack(monster.target);
			}
		}
	}
};


function listTargets(m, closestOnly) {
	var targets = [];
	for (var y = m.y - m.range, maxy = m.y + m.range + 1; y < maxy; y++) {
		for (var x = m.x - m.range, maxx = m.x + m.range + 1; x < maxx; x++) {
			if (land.objs[y]) {
				var o = land.objs[y][x];
				if (o && o.i) {
					for (var i = 0; i < o.i.length; i++) {
						if (o.i[i].shouldTarget && o.i[i].shouldTarget(m)) {
							var h = manhatten(m, o.i[i]);
							if (!closestOnly || (targets.length > 1 && targets[2] == h) || targets.length == 0) {
								targets.push(o.i[i]);
								targets.push(h);
							} else if (targets.length > 1 && targets[2] < h) {
								targets = [o.i[i], h];
							}

						}
					}
				}
			}
		}
	}
	return targets;
}

function pathing(m) {
	var node = m.path.splice(0, 1)[0];
	//unfortunately astar.js functions on [x][y] instead of [y][x],
	//so it's cheaper to do x to y here
	m.dx = node.pos.y - m.x;
	m.dy = node.pos.x - m.y;

	var cpy = m.y + m.dy,
		cpx = m.x + m.dx;
	var til = tiles[land.objs[cpy][cpx].s];
	if (til.canPass(m, cpx, cpy) && til.willPass(m, cpx, cpy)) {
		m.x += m.dx;
		m.y += m.dy;
		if (m == player) {
			GameEngine.x -= m.dx;
			GameEngine.y -= m.dy;
		}
	} else {
		m.path = [];
	}
}

function pathTo(mf, mt) {
	mf.path = astar.search(land.objs, {
		x: mf.x,
		y: mf.y
	}, {
		x: mt.x,
		y: mt.y
	}, mf);
}

function lineOfSight(m1, m2) {
	losM1 = m1;
	losM2 = m2;
	var swapXY = Math.abs(m1.x - m2.x) < Math.abs(m1.y - m2.y);
	var refs = [m1.x, m1.y, m2.x, m2.y];
	if (swapXY) {
		Swap(refs, 0, 1);
		Swap(refs, 2, 3);
	}
	var swapX = refs[0] > refs[2];
	if (swapX) {
		Swap(refs, 0, 2);
		Swap(refs, 1, 3);
	}
	var x0 = refs[0],
		x1 = refs[2],
		y0 = refs[1],
		y1 = refs[3],
		dX = x1 - x0,
		dY = y1 - y0,
		m = dY / dX,
		los = true;

	for (var x = x0; x <= x0 + dX && los; x++) {
		var y = m * (x - x0) + y0;
		los = losClear(swapXY, x, y);
	}

	return los;
}
/*

[
[1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1]
]

*/


var _Monster = {

	update: function (ticks) {

		if (this.hp.get() <= 0) return;

		if (GameEngine.isActionTurn) {
			if (!land.objs[this.y][this.x].d) {
				this.cMoveSpeed = this.moveSpeed;
				this.cActionSpeed = this.actionSpeed;
				this.cBaseSpeed = this.baseSpeed;
				var coreList = CORES(ATTENTION, this);
				var act = 0;
				while (act < coreList.length) {
					var response = CORES(coreList[act], this);
					if (response) {
						for (var i = 0; i < response.length; i++) {
							coreList.push(response[i]);
						}
					}
					coreList.splice(0, 1);
				}
			}
		}

	},
	draw: function (ctx, x, y) {

		var w = this.width * SW;
		var h = this.height * SH;

		ctx.drawImage(land.sprites[this.s], x, y, w, h);
	},
	canPass: function (monster, x, y) {
		if (monster === this)
			return true;
		return false;
	},
	willPass: function (monster, x, y) {
		if (monster === this)
			return true;
		return false;
	},
	shouldTarget: function (monster, x, y) {
		return (this.good != monster.good) && monster !== this && lineOfSight(this, monster);
	},
	attack: function (monster) {
		var atk = rollCombatDice(this.atk, DIE_SKULL);
		monster.defend(atk, this);
		if (monster.hp.get() <= 0 && this.xp.toLevel !== undefined) {
			this.xp.add(monster.xp.get());
		}
	},
	defend: function (hit, monster) {
		if (this.hp.get() <= 0) {
			monster.target = null;
			return;
		}
		var dam = hit - rollCombatDice(this.atk, (this.good ? DIE_SHIELD_G : DIE_SHIELD_E));
		if (dam > 0) {
			this.hp.add(-dam);
			if (this.hp.get() == 0) {
				gameTextDisp(this.type + " was killed");
				if (this.parent)
					this.parent.i.splice(this.parent.i.indexOf(this));
				remove(this);
				monster.target = null;
			} else {
				gameTextDisp(this.type + " took " + dam + " damage. Hp now " + this.hp.get());
			}
		} else {
			gameTextDisp(this.type + " took no damage");
		}

	},
	losThru: function (m1, m2, x, y) {
		return true;
	},
	valueOf: function () {

		return ["Monster",
				this.x,
				this.y,
				this.width,
				this.height,
				this.s,
				valueOfInv(this.inv),
				this.atk,
				this.def,
				this.hp.valueOf(),
				this.moveSpeed,
				this.actionSpeed,
				this.baseSpeed,
				this.type,
				this.good,
				this.xp.valueOf()
			   ];
	}
};

function Monster(x, y, width, height, sprite, inventory, atk, def, hp, moveSpeed, actionSpeed, baseSpeed, type, good, xp) {
	if (hp.constructor == Array) hp = restoreObject(hp);
	if (xp.constructor == Array) xp = restoreObject(xp);
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
	this.width = width;
	this.height = height;
	this.s = sprite;
	this.inv = inventory;
	setUpInv(this.inv);
	this.path = [];
	this.l = 0;
	this.moveSpeed = 0;
	this.actionSpeed = 0;
	this.baseSpeed = 1;
	this.atk = atk;
	this.def = def;
	this.hp = hp;
	this.parent = null;
	this.target = null;
	this.range = 5;
	this.atkR = 1;
	this.type = type;
	this.good = good;

	this.xp = xp;
	this.xp.owner = this;

	for (var i in _Monster) {
		this[i] = _Monster[i];
	}
}