var INV = {
	controls: {
		down: function (e, btn) {
			var data = btn.data;
			mx = (e.clientX || e.pageX);
			my = (e.clientY || e.pageY);
			var position = Math.floor((mx - INV.bx) / INV.ew) + INV.width * Math.floor((my - INV.by) / INV.eh);
			if (position == 9) {
				hideInventory();
			} else {
				if (data.m1 == data.m2) {
					if (data.m1.inv[position] && data.m1.inv[position].use)
						data.m1.inv[position].use(data.m1, data.m1.x, data.m1.y);
				} else {
					giveItemToMonster(data.m1.inv, position, data.m2);
				}

				GameEngine.update();
			}
		},
		keydown: function (e, btn) {
			var key = e.which;
			switch (key) {
			case 27:
				hideInventory();
				break;
			case 84:
				invTakeAll(btn.data);
				break;
			default:
				console.log(key);
				break;
			}
		}
	},

	draw: InventoryDraw,
	update: buttonInterrupts,
	width: 10,
	height: 6,
	sw: 48,
	sh: 48,
	ew: 44,
	eh: 44,
	bx: 0,
	by: 0,
	sqr: null,
	focusMonster: null
};


function invTakeAll(data) {
	if (data.m1 == data.m2) {
	} else {
		while(data.m1.inv.length > 0)
			giveItemToMonster(data.m1.inv, 0, data.m2);
		hideInventory();
	}
}

function ButtonInventory(data) {
	this.data = data;
	this.type = "inventory";
}

function showInventory(data) {
	Buttons.push(new ButtonInventory(data));

	for (var i = 0; i < gameTexts.length; i++) {
		gameTexts[i].div.style.display = "none";
	}
	GameEngine.update();
}

function hideInventory() {
	for (var b = 0; b < Buttons.length; b++) {
		if (Buttons[b].type == "inventory") {
			Buttons.splice(b, 1);
			b = Buttons.length;
		}
	}

	for (var i = 0; i < gameTexts.length; i++) {
		gameTexts[i].div.style.display = "block";
	}
	GameEngine.isResizing = true;
	GameEngine.update();
	GameEngine.isResizing = false;
}

function InventoryDraw(ctx, data) {

	ctx.clearRect(0, 0, GameEngine.width, GameEngine.height);
	var inx = (GameEngine.width - INV.width * INV.sw) / 2,
		iny = (GameEngine.height - INV.height * INV.sh) / 2;
	var i = 0;
	INV.bx = inx;
	INV.by = iny;

	for (var y = 0; y < INV.height; y++) {
		for (var x = 0; x < INV.width; x++, i++) {
			ctx.drawImage(INV.sqr, inx + x * INV.ew, iny + y * INV.eh, INV.sw, INV.sh);
			var o = data.m1.inv[i];
			if (o && o.draw) {
				o.draw(ctx, inx + x * INV.ew + (INV.sw - SW) / 2, iny + y * INV.eh + (INV.sh - SH) / 2);
			}
			if (i == 9) {
				ctx.fillStyle = "#ffffff";
				ctx.font = "16px monospace";
				ctx.fillText("x", inx + x * INV.ew + (INV.sw - SW) / 2 + 16, iny + y * INV.eh + (INV.sh - SH) / 2 + 24);
			}
		}
	}
}

ButtonTypes.inventory = INV;