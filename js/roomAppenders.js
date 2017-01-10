roomAppenders[0] = function(data, roomO, wall) {
    var room = roomO.data;
    var roomWidth = room[0].length;
    var roomHeight = room.length;

    var yList = [];
    yList = lastYIndexesOf(data, wall);

    var yPos, xPos, appendSuccess, xRoom, yRoom;
    do {
        do {
            xPos = Math.floor(Math.random() * yList.length / 2) * 2;
            yPos = yList.splice(xPos, 2);
            xPos = yPos[1];
            yPos = yPos[0];
        } while (yPos == -1 || (data[yPos - 1] && data[yPos - 1][xPos] && data[yPos - 1][xPos] == wall));
        //the minus 2 and plus one is to make sure that the player
        //can pass through a door
        var roomXs = [],
            tempW = roomWidth - 2;
        while (tempW--) {
            roomXs.push(tempW + 1);
        }
        do {
            yRoom = Math.floor(Math.random() * roomXs.length);
            xRoom = roomXs.splice(yRoom, 1)[0];
            yRoom = 0;
            appendSuccess = true;
            for (var y = yPos; y < yPos + roomHeight && appendSuccess; y++) {
                for (var x = xPos - roomWidth + 1 + xRoom; x <= xPos + xRoom && appendSuccess; x++) {
                    if (y > 0 && x > 0 && data[y] && data[y][x] && data[y][x] != wall) {
                        appendSuccess = false;

                    }
                }
            }
        } while (!appendSuccess && roomXs.length > 0);

    } while (yList.length > 0 && !appendSuccess);
    if (appendSuccess) {
        if (xPos - roomWidth + 1 + xRoom < 0) {
            for (var r in rooms) {
                rooms[r].x -= xPos - roomWidth + 1 + xRoom;
            }
        }
        if (yPos - yRoom < 0) {
            for (var r in rooms) {
                rooms[r].y -= yPos - yRoom;
            }
        }

        while (xPos - roomWidth + 1 + xRoom < 0) {
            for (var y = 0; y < data.length; y++) {
                data[y].unshift(0);
            }
            xPos++;
        }
        while (xPos + xRoom + 1 > data[0].length) {
            for (var y = 0; y < data.length; y++) {
                data[y].push(0);
            }
        }
        while (yPos + roomHeight > data.length) {

            data.push(fill(data[0].length));
        }
        roomO.x = xPos - roomWidth + 1 + xRoom;
        roomO.y = yPos - yRoom;
        for (var y = 0; y < room.length; y++) {
            for (var x = 0; x < room[0].length; x++) {
				
				data[yPos + y][xPos + x - roomWidth + 1 + xRoom] = room[y][x];

            }
        }
    }

    return data;
}

roomAppenders[1] = function(data, roomO, wall) {
    var room = roomO.data;

    var roomWidth = room[0].length;
    var roomHeight = room.length;

    var yList = [];
    yList = firstYIndexesOf(data, wall);

    var yPos, xPos, appendSuccess, xRoom, yRoom;
    do {
        do {
            xPos = Math.floor(Math.random() * yList.length / 2) * 2;
            yPos = yList.splice(xPos, 2);
            xPos = yPos[1];
            yPos = yPos[0];
        } while (yPos == -1 || (data[yPos + 1] && data[yPos + 1][xPos] && data[yPos + 1][xPos] == wall));
        //the minus 2 and plus one is to make sure that the player
        //can pass through a door
        var roomXs = [],
            tempW = roomWidth - 2;
        while (tempW--) {
            roomXs.push(tempW + 1);
        }
        do {
            yRoom = Math.floor(Math.random() * roomXs.length);
            xRoom = roomXs.splice(yRoom, 1)[0];
            yRoom = roomHeight - 1;
            appendSuccess = true;
            for (var y = yPos - yRoom; y <= yPos && appendSuccess; y++) {
                for (var x = xPos - roomWidth + 1 + xRoom; x <= xPos + xRoom && appendSuccess; x++) {
                    if (y > 0 && x > 0 && data[y] && data[y][x] && data[y][x] != wall) {
                        appendSuccess = false;

                    }
                }
            }
        } while (!appendSuccess && roomXs.length > 0);

    } while (yList.length > 0 && !appendSuccess);
    if (appendSuccess) {
        if (xPos - roomWidth + 1 + xRoom < 0) {
            for (var r in rooms) {
                rooms[r].x -= xPos - roomWidth + 1 + xRoom;
            }
        }
        if (yPos - yRoom < 0) {
            for (var r in rooms) {
                rooms[r].y -= yPos - yRoom;
            }
        }

        while (xPos - roomWidth + 1 + xRoom < 0) {
            for (var y = 0; y < data.length; y++) {
                data[y].unshift(0);
            }
            xPos++;
        }
        while (xPos + xRoom + 1 > data[0].length) {
            for (var y = 0; y < data.length; y++) {
                data[y].push(0);
            }
        }
        while (yPos - yRoom < 0) {

            data.unshift(fill(data[0].length));
            yPos++;
        }
        roomO.x = xPos - roomWidth + 1 + xRoom;
        roomO.y = yPos - yRoom;
        for (var y = 0; y < room.length; y++) {
            for (var x = 0; x < room[0].length; x++) {

                data[yPos + y - yRoom][xPos + x - roomWidth + 1 + xRoom] = room[y][x];

            }
        }
    }

    return data;
}


roomAppenders[2] = function(data, roomO, wall) {
    var room = roomO.data;

    var roomWidth = room[0].length;
    var roomHeight = room.length;

    var xList = [];
    for (var y = 0; y < data.length; y++) {
        xList.push(data[y].lastIndexOf(wall));
        xList.push(y);
    }
    var yPos, xPos, appendSuccess, xRoom, yRoom;
    do {
        do {
            yPos = Math.floor(Math.random() * xList.length / 2) * 2;
            xPos = xList.splice(yPos, 2);
            yPos = xPos[1];
            xPos = xPos[0];
        } while (xPos == -1 || (data[yPos][xPos - 1] && data[yPos][xPos - 1] == wall));
        //the minus 2 and plus one is to make sure that the player
        //can pass through a door
        var roomYs = [],
            tempH = roomHeight - 2;
        while (tempH--) {
            roomYs.push(tempH + 1);
        }
        do {
            xRoom = Math.floor(Math.random() * roomYs.length);
            yRoom = roomYs.splice(xRoom, 1)[0];
            xRoom = 0;
            appendSuccess = true;
            for (var y = yPos - roomHeight + 1 + yRoom; y <= yPos + yRoom && appendSuccess; y++) {
                for (var x = xPos; x < xPos + roomWidth && appendSuccess; x++) {
                    if (y > 0 && x > 0 && data[y] && data[y][x] && data[y][x] != wall) {
                        appendSuccess = false;
                    }
                }
            }
        } while (!appendSuccess && roomYs.length > 0);

    } while (xList.length > 0 && !appendSuccess);
    if (appendSuccess) {

        if (yPos - roomHeight + 1 + yRoom < 0) {
            for (var r in rooms) {
                rooms[r].y -= yPos - roomHeight + 1 + yRoom;
            }
        }

        while (xPos + roomWidth > data[0].length) {
            for (var y = 0; y < data.length; y++) {
                data[y].push(0);
            }
        }
        //file:///Users/zythlander/Documents/Projects/Dungeon/index.html
        while (yPos - roomHeight + 1 + yRoom < 0) {

            data.unshift(fill(data[0].length));
            yPos++;
        }
        roomO.x = xPos - xRoom;
        roomO.y = yPos - roomHeight + 1 + yRoom;
        for (var y = 0; y < room.length; y++) {
            for (var x = 0; x < room[0].length; x++) {
                if (!data[yPos + y - roomHeight + 1 + yRoom]) {
                    data.push(fill(data[0].length));
                }
                data[yPos + y - roomHeight + 1 + yRoom][xPos + x - xRoom] = room[y][x];
            }
        }
    }

    return data;
}

roomAppenders[3] = function(data, roomO, wall) {
    var room = roomO.data;

    var roomWidth = room[0].length;
    var roomHeight = room.length;

    var xList = [];
    for (var y = 0; y < data.length; y++) {
        xList.push(data[y].indexOf(wall));
        xList.push(y);
    }
    var yPos, xPos, appendSuccess, xRoom, yRoom;
    do {
        do {
            yPos = Math.floor(Math.random() * xList.length / 2) * 2;
            xPos = xList.splice(yPos, 2);
            yPos = xPos[1];
            xPos = xPos[0];
        } while (xPos == -1 || (data[yPos][xPos + 1] && data[yPos][xPos + 1] == wall));
        //the minus 2 and plus one is to make sure that the player
        //can pass through a door
        var roomYs = [],
            tempH = roomHeight - 2;
        while (tempH--) {
            roomYs.push(tempH + 1);
        }
        do {
            xRoom = Math.floor(Math.random() * roomYs.length);
            yRoom = roomYs.splice(xRoom, 1)[0];
            xRoom = roomWidth - 1;
            appendSuccess = true;
            for (var y = yPos - roomHeight + 1 + yRoom; y <= yPos + yRoom && appendSuccess; y++) {
                for (var x = xPos - xRoom; x <= xPos && appendSuccess; x++) {
                    if (y > 0 && x > 0 && data[y] && data[y][x] && data[y][x] != wall) {
                        appendSuccess = false;

                    }
                }
            }
        } while (!appendSuccess && roomYs.length > 0);

    } while (xList.length > 0 && !appendSuccess);
    if (appendSuccess) {
        if (xPos - xRoom < 0) {
            for (var r in rooms) {
                rooms[r].x -= xPos - xRoom;
            }
        }
        if (yPos - roomHeight + 1 + yRoom < 0) {
            for (var r in rooms) {
                rooms[r].y -= yPos - roomHeight + 1 + yRoom;
            }
        }
        while (xPos - xRoom < 0) {
            for (var y = 0; y < data.length; y++) {
                data[y].unshift(0);
            }
            xPos++;
        }

        while (yPos - roomHeight + 1 + yRoom < 0) {
            data.unshift(fill(data[0].length));
            yPos++;
        }
        roomO.x = xPos - xRoom;
        roomO.y = yPos - roomHeight + 1 + yRoom;
        for (var y = 0; y < room.length; y++) {
            for (var x = 0; x < room[0].length; x++) {
                if (!data[yPos + y - roomHeight + 1 + yRoom]) {
                    data.push(fill(data[0].length));
                }
                data[yPos + y - roomHeight + 1 + yRoom][xPos + x - xRoom] = room[y][x];

            }
        }
    }

    return data;
}