
//Call buttons with key down. if they interrupt the call, don't do regular actions.
//else, do standard movement or actions based on keys pressed
window.addEventListener("keydown", function (e) {
	var interrupted = false;
	for (var b = 0; b < Buttons.length && !interrupted; b++) {
		var btn = Buttons[b];

		var but = ButtonTypes[Buttons[b].type] || btn;



		if (but.controls.keydown)
			but.controls.keydown(e, btn);

		if (but.update)
			interrupted = but.update(btn.data);
	}

	if (!interrupted) {
		var key = e.which;
		var x = player.x;
		var y = player.y;
		player.dx = 0;
		player.dy = 0;
		var playerMoved = false;
		switch (key) {
		case 37:
			player.dx = -1;
			playerMoved = true;
			break;
		case 40:
			player.dy = 1;
			playerMoved = true;
			break;
		case 39:
			player.dx = 1;
			playerMoved = true;
			break;
		case 38:
			player.dy = -1;
			playerMoved = true;
			break;
		case 32:
			player.path = [{
				pos: {
					y: player.x,
					x: player.y
				}
		}];
			GameEngine.update();
			break;
		default:
			//console.log(e.which);
			break;

		}
		if (playerMoved) {
			var cpy = player.y + player.dy,
				cpx = player.x + player.dx;

			player.path = [{
				pos: {
					y: cpx,
					x: cpy
				}
		}];
			player.dx = 0;
			player.dy = 0;
			GameEngine.update();

		}
	}
});

//doesn't really do anything atm
window.addEventListener("keyup", function (e) {
	var key = e.which;
	switch (key) {
	case 32:
		break;

	}
});

var mouseIsDown = false,
	mx = 0,
	my = 0;

//call buttons with mouse down
//if not interrupted, continue onto standard mouse down things, like moving
var mouseDown = function (e) {

	//gets location from touch or click


	var interrupted = false;
	for (var b = 0; b < Buttons.length && !interrupted; b++) {

		var btn = Buttons[b];

		var but = ButtonTypes[Buttons[b].type] || btn;



		if (but.controls.down)
			but.controls.down(e, btn);

		if (but.update)
			interrupted = but.update(btn.data);
	}
	if (interrupted === true || interrupted === false) {
		e.preventDefault();
		e.stopPropagation();
	}
	if (!interrupted) {
		mx = Math.floor(((e.clientX || e.pageX) - GameEngine.ox) / SW) - GameEngine.x;
		my = Math.floor(((e.clientY || e.pageY) - GameEngine.oy) / SH) - GameEngine.y;
		if (mx > land.width) mx = land.width;
		if (mx < 0) mx = 0;
		if (my > land.height) my = land.height;
		if (my < 0) my = 0;


		var o = land.objs[my][mx];
		var target;
		if (o && o.i) {

			for (var i = 0; i < o.i.length; i++) {
				if (o.i[i].interact || (o.i[i].shouldTarget && o.i[i].shouldTarget(player, mx, my))) {
					target = o.i[i];
					i = o.i.length;
				}
			}
		}

		player.path = astar.search(land.objs, {
			x: player.x,
			y: player.y
		}, {
			x: mx,
			y: my
		}, player);
		var x, y;
		if (player.path.length > 0) {
			var nd = player.path[player.path.length - 1];
			x = nd.pos.y;
			y = nd.pos.x;

		} else {
			x = player.x;
			y = player.y;
		}

		if (target && (target.x != x || target.y != y)) {
			var h = manhatten(x, mx, y, my);
			if (h < player.range) {
				player.path.push({
					pos: {
						x: my,
						y: mx
					}
				});
			}
		}

		if (player.path.length > 0) {
			if (GameEngine.updatesLeft < player.path.length) {
				GameEngine.updatesLeft = player.path.length - 1;
			}
			if (!GameEngine.isUpdating) {
				GameEngine.update();
			}
		}

	}
};
//not used atm
var mouseMove = function (e) {
	if (!GameEngine.paused) {
		//move if mousedown
		if (mouseIsDown) {
			mx = (e.clientX || e.pageX) - GameEngine.x;
			my = (e.clientY || e.pageY) - GameEngine.y;
			e.preventDefault();
			e.stopPropagation();
			if (controls[controlsIndex].move)
				controls[controlsIndex].move(e);
		}
	}
};
//not used atm
var mouseUp = function (e) {
	if (!GameEngine.paused) {

		//move if obj not touched or mousedown
		if (mouseIsDown) {
			if (controls[controlsIndex].up)
				controls[controlsIndex].up(e);
		}
		e.preventDefault();
		e.stopPropagation();
	}
};








gameDiv.addEventListener("resize", GameEngine.resize);
gameDiv.addEventListener("mousedown", mouseDown);
gameDiv.addEventListener("mousemove", mouseMove);
gameDiv.addEventListener("mouseup", mouseUp);
gameDiv.addEventListener("touchstart", mouseDown);
gameDiv.addEventListener("touchmove", mouseMove);
gameDiv.addEventListener("touchend", mouseUp);

//Load dungeon art
loadADungeon(-1);