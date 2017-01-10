/*
valueOfInv(inve) get the value of the inventory for saving
setUpInv(inv) restore the inventory
restoreMonsterObject(a) restores an object and if it's a monster add to monsters
restoreObject(a) restore an object in general
SaveSlot(slot) save the game state to a slot
RestoreSlot(slot) restore the game state from a slot
restoreData(data) restore map's objects
RoomRes(x, y, w, h, d) restore a room
roomsToData() save rooms to data

mapToDataRLE() convert map data to RLE for saving
mapFromRLE(data) restore a map from RLE
RLEArrayCompression(d) more compression, for a single array
RLEArrayDecompression(d) uncompression for a single array
Save() direct object conversion to localStorage
Restore() direct object conversion to localStorage
*/

function valueOfInv(inve) {
	var inv = new Array(inve.length);
	for (var i in inve) {
		inv[i] = inve[i].valueOf();
	};
	return inv;
}

function setUpInv(inv) {
	for (var i in inv) {
		if (inv[i].constructor == Array) inv[i] = restoreObject(inv[i]);
		inv[i].parent = inv;
	}
}

function restoreMonsterObject(a) {
	var m = a[0];
	a = restoreObject(a);
	if (m == "Monster")
		monsters.push(a);
	return a;
}

function restoreObject(a) {
	var o = {},
		k = a.shift();

	this[k].apply(o, a);
	o.constructor = this[k];
	return o;
}

function SaveSlot(slot) {
	var data = {
		land: {
			width: land.width,
			height: land.height,
			RLE: mapToDataRLE()
		},
		rooms: roomsToData(),
		player: player.valueOf()

	};
	Save(slot, data);
	data = undefined;
}

function RestoreSlot(slot) {

	GameEngine.isActionTurn = true;
	GameEngine.updatesLeft = 0;
	for (var m in monsters) {
		remove(monsters[m]);
	}
	monsters = [];
	if (player)
		remove(player);
	remove(playerHPGUI);
	remove(playerXPGUI);
	removeRM();
	var data = Restore(slot);
	restoreData(data.rooms);
	mapFromRLE(data.land);
	player = restoreObject(data.player);
	put(player);
	add(player);
	
	addGUIs(player);

	for (var m in monsters) {
		add(monsters[m]);
	}
	GameEngine.x = Math.floor(GameEngine.width / 2 / SW);
	GameEngine.y = Math.floor(GameEngine.height / 2 / SH);
	GameEngine.x -= player.x;
	GameEngine.y -= player.y;
	GameEngine.isResizing = true;
	GameEngine.update();
	GameEngine.isResizing = false;
	console.log(monsters);
}

function restoreData(data) {
	this[data.vr] = [];
	var c = data.c;
	while (c--) {
		var dta;
		if (data.len) {
			dta = data.data.splice(0, data.len);
			var o = {};
			this[data.kind].apply(o, dta);
			o.constructor = this[data.kind];
			this[data.vr].push(o);
		} else {
			dta = data.data.shift();
			this[data.vr].push(restoreObject(dta));
		}

	}
}

function RoomRes(x, y, w, h, d) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.d = d;
}

function roomsToData() {
	var len = rooms.length * 5,
		rms = new Array(len);
	for (var i = 0, b = 0; i < len; i += 5, b++) {
		rms[i] = rooms[b].x;
		rms[i + 1] = rooms[b].y;
		rms[i + 2] = rooms[b].width;
		rms[i + 3] = rooms[b].height;
		rms[i + 4] = rooms[b].d;
	}
	return {
		vr: "rooms",
		c: rooms.length,
		len: 5,
		kind: "RoomRes",
		data: rms
	};
}

function mapToDataRLE() {
	var size = land.width * land.height,
		i = 0;
	var ary = new Array(size),
		chars = [];
	for (var y = 0; y < land.height; y++) {
		for (var x = 0; x < land.width; x++, i++) {
			var o = land.objs[y][x];
			ary[i] = o.s;
			if (o.i && o.i.length > 0) {
				var chr = [];
				for (var ob in o.i) {
					if (o.i[ob] != player)
						chr.push(o.i[ob].valueOf());
				}
				chars.push(i);
				chars.push(chr);
			}
		}
	}
	var d = RLEArrayCompression(ary);
	d.c = chars;
	return d;
}

function mapFromRLE(data) {
	land.height = data.height;
	land.width = data.width;
	var ary = RLEArrayDecompression(data.RLE);
	var objs = new Array(data.height),
		i = 0;
	for (var y = 0; y < data.height; y++) {
		objs[y] = new Array(data.width);
		for (var x = 0; x < data.width; x++, i++) {
			objs[y][x] = ary[i];
		}
	}
	makeMapObjects(objs);
	for (var y = 0, i = 0; y < land.height; y++) {
		for (var x = 0; x < land.width; x++, i++) {
			if (data.RLE.c[0] == i) {
				var chr = data.RLE.c.splice(0, 2)[1];
				var ch = new Array(chr.length);
				for (var c in chr) {
					ch[c] = restoreMonsterObject(chr[c]);
					ch[c].parent = objs[y][x];
				}
				objs[y][x].i = ch;
			}
		}
	}
	for (var i in rooms) {
		if (rooms[i].d != 1) {
			console.log(i + ":" + rooms[i].d);
			var s = rooms[i].d - 1,
				x = rooms[i].x,
				y = rooms[i].y,
				w = rooms[i].width,
				h = rooms[i].height;
			for (var y1 = y; y1 < y + h; y1++) {
				for (var x1 = x; x1 < x + w; x1++) {
					objs[y1][x1].d = 0;
				}
			}
			if (s >= 0) {
				x += s;
				y += s;
				w -= s;
				h -= s;
				for (var y1 = y; y1 < y + h; y1++) {
					for (var x1 = x; x1 < x + w; x1++) {
						objs[y1][x1].d = 1;
					}
				}
			}
		}
	}

	land.objs = objs;
}

function RLEArrayCompression(d) {
	var u = undefined;
	var ary = [],
		odd = [];
	for (var i = 0; i < d.length; i++) {
		var cont = i + 1 < d.length,
			c = 1,
			t = d[i];
		if (t === u)
			t = 0;
		while (cont)
			if (d[i] == d[i + 1]) {
				c++;
				i++;
			} else if (i + 2 < d.length && d[i + 2] == d[i]) {
			i++;
			if (d[i] === u)
				d[i] = 0;
			odd.push(i);
			odd.push(d[i]);
			c++;
			i++;
		} else {
			cont = false;
		}

		ary.push(c);
		ary.push(t);
	}

	return {
		a: ary,
		o: odd
	};
}

function RLEArrayDecompression(d) {
	var u = undefined;
	var size = 0;

	for (var i = 0; i < d.a.length; i += 2)
		size += d.a[i];

	size += d.o.length / 2;

	var ary = new Array(size);

	for (var i = 0; i < d.o.length; i += 2)
		ary[d.o[i]] = d.o[i + 1];

	var s = 0,
		i = 0;

	while (i < size) {
		var t = d.a[s + 1],
			c = d.a[s];
		while (c--)
			if (ary[i] === u) {
				ary[i] = t;
				i++;
			} else {
				i++;
				c++;
			}

		s += 2;
	}

	return ary;
}

function Save(slot, data) {
	localStorage.setItem("slot" + slot, JSON.stringify(data));
}

function Restore(slot) {
	return JSON.parse(localStorage.getItem("slot" + slot));
}