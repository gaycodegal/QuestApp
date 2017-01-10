var roomAppenders = [];

function Room(maxWidth, maxHeight, wall, empty) {
    var min = 5;
    maxWidth -= min;
    maxHeight -= min;
    var width = min + Math.floor(Math.random() * maxWidth);
    var height = min + Math.floor(Math.random() * maxHeight);
    var room = [];
    for (var y = 0; y < height; y++) {
        var row = [];
        for (var x = 0; x < width; x++) {
            if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                row.push(wall);
            } else
                row.push(empty);
        }
        room.push(row);
    }
    this.data = room;
    this.x = 0;
    this.d = 1;
    this.y = 0;
    this.width = width;
    this.height = height;
}

//add the various things that set a room apart
function addRoomFeatures(objs, chestClosed, chestOpen,reward){
	for(var r = 1; r < rooms.length -1; r++){
		var room = rooms[r];
		if(Math.random()<.2)
			addCenterFeature(room, objs, new Chest(0, 0, chestClosed, chestOpen, chestRewards(reward)), true);
	}
}

//place something in the center of the room
function addCenterFeature(room, objs, feature, setXY){
	var x = room.x + Math.floor(room.width / 2),
		y = room.y + Math.floor(room.height / 2);
	var o = objs[y][x];
	if(o){
		if(!o.i) o.i = [];
		o.i.push(feature);
		if(setXY){
			feature.x = x;
			feature.y = y;
		}
		return {x:x, y:y};
	}
}

//add water to a room, make a path to anything in the center
function addWaterToRoom(room, objs, water, floors){
	var paths = [];
	for(var y = 2 + room.y; y < room.height + room.y - 2; y++){
		for(var x = 2 + room.x; x < room.width + room.x - 2; x++){
			if(!objs[y][x].i){
				objs[y][x].s = water;
			}else{
				paths.push(x);
				paths.push(y);
			}
		}
	}
	for(var p = 0; p < paths.length; p+=2){
		var x = paths[p],
			y = paths[p + 1]+1;
		for(var j = y; j < room.height + room.y - 2; j++){
			objs[j][x].s = floors;
		}
	}
}

//find the room at x, y and fill it with light
function lightRoom(x,y){
	var roomsToLight = [];
	for(var i = 0; i < rooms.length; i++){
		if(x >= rooms[i].x && x < rooms[i].x + rooms[i].width && y >= rooms[i].y && y < rooms[i].y + rooms[i].height){
			if(rooms[i].d){
				roomsToLight.push(rooms[i]);
				rooms[i].d = 0;
			}
		}
	}
	for(var i = 0; i < roomsToLight.length; i++){
		var room = roomsToLight[i];
		for(var y = 0; y < room.height; y++){
			for(var x = 0; x < room.width; x++){
				land.objs[room.y + y][room.x + x].d = 0;
			}
		}
	}
}

//add doors (door items) to a room where applicable
function addDoors(data, wall, floor, open, closed) {
    for (var y = 1; y < data.length - 1; y++) {
        var possibles = [],
            wasPossible = false;
        for (var x = 1; x < data[0].length - 1; x++) {

            if (data[y][x].s == wall && (data[y + 1] && data[y + 1][x] && !data[y + 1][x].i && data[y + 1][x].s == floor) && (data[y - 1] && data[y - 1][x] && !data[y - 1][x].i && data[y - 1][x].s == floor)) {
                wasPossible = true;
                possibles.push(x);
            } else {
                if (wasPossible) {
					var pos = data[y][possibles[Math.floor(Math.random() * possibles.length)]];
                    pos.s = floor;
					if(!pos.i)
                    	pos.i = [];
                    pos.i.push(new Door(open, closed));
					
                    possibles = [];
                }
                wasPossible = false;
            }
        }
        if (wasPossible) {
            var pos = data[y][possibles[Math.floor(Math.random() * possibles.length)]];
			pos.s = floor;
			if(!pos.i)
				pos.i = [];
			pos.i.push(new Door(open, closed));
        }
    }
    for (var x = 1; x < data[0].length - 1; x++) {
        var possibles = [],
            wasPossible = false;
        for (var y = 1; y < data.length - 1; y++) {
            if (data[y][x].s == wall && (data[y] && data[y][x + 1] && !data[y][x + 1].i && data[y][x + 1].s == floor) && (data[y] && data[y][x - 1] && !data[y][x - 1].i && data[y][x - 1].s == floor)) {
                wasPossible = true;
                possibles.push(y);
            } else {
                if (wasPossible) {
                    var pos = data[possibles[Math.floor(Math.random() * possibles.length)]][x];
                    pos.s = floor;
					if(!pos.i)
                    	pos.i = [];
                    pos.i.push(new Door(open, closed));
                    possibles = [];
                }
                wasPossible = false;
            }
        }
        if (wasPossible) {
            var pos = data[possibles[Math.floor(Math.random() * possibles.length)]][x];
			pos.s = floor;
			if(!pos.i)
				pos.i = [];
			pos.i.push(new Door(open, closed));
        }
    }
}

//add wall features, currently making it look more 3d
function addWallFeatures(data, wall, floor, wallBase) {
    for (var y = 0; y < data.length; y++) {
        for (var x = 0; x < data[0].length; x++) {
            if (data[y][x].s == wall && (!data[y + 1] || !data[y + 1][x] || !data[y + 1][x].s || (data[y + 1] && data[y + 1][x] && (data[y + 1][x].s == floor && !data[y + 1][x].i) ))) {
                data[y][x].s = wallBase;
            }
        }
    }
}