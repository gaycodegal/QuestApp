var Buttons = [],
	ButtonTypes = {};

var DIE_SKULL = 1,
	DIE_SHIELD_G = 2,
	DIE_SHIELD_E = 3;
var dieFace = [DIE_SKULL, DIE_SKULL, DIE_SKULL, DIE_SHIELD_G, DIE_SHIELD_E, DIE_SHIELD_E];

var EMPTY_FUNC = function (){};


//returns manhatten distance between objects
function manhatten(a, b, c, d) {
	if (arguments.length == 2)
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	else
		return Math.abs(a - b) + Math.abs(c - d)
}

//swap two things
function Swap(refs, a, b) {
	var c = refs[a];
	refs[a] = refs[b];
	refs[b] = c;
}

//remove object from drawlist
function remove(o) {
	fg.drawList.remove(o);
}

//do two rects intersect
function intersectRect(l, r, t, b, r2) {
	var r2r = r2.x + r2.width;
	var r2b = r2.y + r2.height;
	return !(r2.x > r ||
		r2r < l ||
		r2.y > b ||
		r2b < t);
}


//this button will interrupt handler
function buttonInterrupts() {
	return true; //does interrupt
}

//button will not interrupt handler
function buttonNotInterrupts() {
	return false; //does not interrupt
}

//create a div
function createDiv(apndTo, classes, text, x, y, w, h) {
	apndTo = apndTo || document.body;
	var div = document.createElement("DIV"); //our main canvas elem
	if (x !== undefined || y !== undefined) {
		div.style.position = "absolute";
		if (y != undefined)
			div.style.top = y + "px";
		if (x != undefined)
			div.style.left = x + "px";
	}
	if (w !== undefined)
		div.style.width = w + "px";
	if (h !== undefined)
		div.style.height = h + "px";
	if (text) {
		div.innerHTML = text;
	}
	if (classes) {
		classes = classes.split(" ");
		for (var c in classes) {
			div.classList.add(classes[c]);
		}
	}
	apndTo.appendChild(div);

	return div;
}

//a general handler. only can merge things
var handler = {
	merge: function (obj, objM) {
		for (var key in objM) {
			obj[key] = objM[key];
		}
		return obj;
	}
};

//add something to a drawlist
function add(o) {
	fg.drawList.add(o);
}

//actually remove stuff
function removeRM() {
	fg.drawList.removeRM();
}

//make the objects out of a map's data
function makeMapObjects(objs) {
	for (var y = 0; y < objs.length; y++) {
		for (var x = 0, l = objs[y].length; x < l; x++) {
			objs[y][x] = {
				x: x,
				y: y,
				s: objs[y][x],
				d: 1
			};
		}
	}
}


// roll a combat die
function rollCombatDie() {
	return dieFace[Math.floor(Math.random() * dieFace.length)];
}
//roll however many dice wanted
function rollCombatDice(num, desired) {
	if (num < 0) return 0;
	var val = 0;
	while (num--) {
		if (rollCombatDie() == desired)
			val++;
	}
	return val;
}




//get the xp needed to get to the next level for a level
function xpToLevelForLevel(x) {
	var lvl = x;
	if (x > 70) x = 70;
	x /= 4.45;
	var x2 = x * x,
		x3 = x2 * x;
	return Math.floor(13 + 3 * (x - 1) + 3 * x2 - 0.0417 * x3) * monsterXpForLevel(lvl);
}

//get the average xp of a monster for a level.
function monsterXpForLevel(x) {
	return Math.floor(135 + 13 * (x - 1));
}

//get the first y indexes of wall in data
function firstYIndexesOf(data, wall) {
	var indexes = [];
	for (var x = 0; x < data[0].length; x++) {
		var index = -1;
		for (var y = 0; y < data.length && index == -1; y++) {
			if (data[y][x] == wall) {
				index = y;
			}
		}
		indexes.push(index);
		indexes.push(x);
	}
	return indexes;
}

//get the last y indexes of wall in data
function lastYIndexesOf(data, wall) {
	var indexes = [];
	for (var x = 0; x < data[0].length; x++) {
		var index = -1;
		var y = data.length;
		while (y-- && index == -1) {
			if (data[y][x] == wall) {
				index = y;
			}
		}
		indexes.push(index);
		indexes.push(x);
	}
	return indexes;
}

//fill an array with zeros
function fill(len) {
	var ary = new Array(len);
	while (len--) {
		ary[len] = 0;
	}
	return ary;
}

//put an item on the map
function put(item) {
	if (land.objs[item.y] && land.objs[item.y][item.x]) {
		var par = land.objs[item.y][item.x];
		if (tiles[par.s].canPass(item, item.x, item.y)) {
			if (!par.i) par.i = [];
			par.i.push(item);
			item.parent = par;
			return true;
		}
	}
}