var _HP = {
	add: function (v) {
		this.val += v;
		if (this.val > this.max) {
			this.val = this.max;
		} else if (this.val <= 0) {
			this.val = 0;
		}
	},
	set: function (v) {
		this.val = v;
	},
	get: function () {
		return this.val;
	},
	lvlUp: function () {
		this.max -= this.forLvl;
		this.forLvl += this.orig / 10;
		this.forLvl = Math.floor(this.forLvl);
		this.max += this.forLvl;
		this.val = this.max;
		gameTextDisp("Hp now " + this.val);
	},
	valueOf: function () {
		return ["HP",
				this.val,
				this.max,
				this.orig
			   ];
	}
};

function HP(hp, max, forLvl, orig) {
	this.val = hp;
	this.max = max || hp;
	this.forLvl = forLvl || hp;
	this.orig = orig || hp;

	for (var i in _HP) {
		this[i] = _HP[i];
	}
}

function HPGUI(target, x, y, l) {
	this.target = target;
	this.x = x || 0;
	this.y = y || 0;
	this.l = l || 0;
	this.draw = function (ctx) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(this.x-4, this.y-4, 44, 72);
		ctx.fillStyle = "#808080";
		ctx.fillRect(this.x, this.y, 16, 64);
		ctx.fillStyle = "#ff0000";
		ctx.fillRect(this.x, this.y + 64, 16, -Math.floor(64 * this.target.hp.val / this.target.hp.max));
	}
	this.update = EMPTY_FUNC;
}

function XPGUI(target, x, y, l) {
	console.log(this.target);
	this.target = target;
	this.x = x || 0;
	this.y = y || 0;
	this.l = l || 0;
	this.draw = function (ctx) {
		ctx.fillStyle = "#808080";
		ctx.fillRect(this.x, this.y, 16, 64);
		ctx.fillStyle = "#00dd00";
		ctx.fillRect(this.x, this.y + 64, 16, -Math.floor(64 * (this.target.xp.totalLevel - this.target.xp.toLevel) / this.target.xp.totalLevel));
	}
	this.update = EMPTY_FUNC;
}

var _XP = {
	add: function (v) {
		this.val += v;
		this.toLevel -= v;
		gameTextDisp(this.owner.type + " gained " + v + " xp");
		while (this.toLevel <= 0) {
			var holder = this.toLevel;
			this.lvl++;
			this.toLevel = xpToLevelForLevel(this.lvl);
			this.totalLevel = this.toLevel
			this.toLevel += holder;

			this.owner.hp.lvlUp();
			gameTextDisp("Leveled Up! Now " + this.lvl);
			gameTextDisp("Xp to Go" + this.toLevel);
		}
	},
	set: function (v) {
		this.hp = v;
	},
	get: function () {
		return this.val;
	},
	level: function () {
		return this.lvl;
	},
	valueOf: function () {
		return ["XP",
				this.val,
				this.lvl,
				this.toLevel
			   ];
	}
};

function XP(xp, level, toLevel) {
	this.val = xp;
	this.toLevel = toLevel;
	if (toLevel === true && level) {
		this.toLevel = xpToLevelForLevel(level);
		this.totalLevel = this.toLevel
	} else {
		if (typeof toLevel !== "number")
			this.level = this.toLevel = undefined;
		else
			this.totalLevel = xpToLevelForLevel(level);
	}
	this.lvl = level;
	this.owner;

	for (var i in _XP) {
		this[i] = _XP[i];
	}
}