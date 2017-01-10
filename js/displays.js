/*
gameTextDisp(text) write something to the top of the screen (message the player)
addGUIs(obj) add health and xp guis for the player
addSkipButton() add skip button to gui
dataInterrupts(e, btn) set btn.data.interrupt to true on call
addShowInvButton() add show inventory button to gui
addLoadButton() add load from save button to gui
insertConsoleButton() add console log button to beginning of gui list /// WIP functionality
addSaveButton() add save game state button to gui
*/

function gameTextDisp(text) {
	for (var i = 0; i < gameTexts.length - 1 && gameTexts[i].visible; i++);
	gameTexts[i].visible = true;

	while (i) {
		gameTexts[i].div.innerHTML = gameTexts[i - 1].div.innerHTML;
		i--;
	}

	gameTexts[i].div.innerHTML = text;
}

function addGUIs(obj) {
	playerHPGUI = new HPGUI(player, 6, 232, 1);
	playerXPGUI = new XPGUI(player, 26, 232, 1);
	add(playerHPGUI);
	add(playerXPGUI);
}

function addSkipButton() {
	Buttons.push(new Button(0, 0, 48, 48, dungeonArt.generalArt.imgs.skipBtn, {
		update: function (data) {
			var stops = data.interrupt;
			if (stops) {
				data.interrupt = false;
				GameEngine.update();
			}
			return stops;
		},
		down: function (e, btn) {
			var data = btn.data;
			mx = (e.clientX || e.pageX);
			my = (e.clientY || e.pageY);
			if (mx >= btn.x && mx <= btn.x + btn.width && my >= btn.y && my <= btn.y + btn.height) {
				data.interrupt = true;
			} else {
				data.interrupt = false;
			}
		}
	}, {}, 2));
	add(Buttons[Buttons.length - 1]);
}

function dataInterrupts(e, btn) {
	var data = btn.data;
	mx = (e.clientX || e.pageX);
	my = (e.clientY || e.pageY);
	if (mx >= btn.x && mx <= btn.x + btn.width && my >= btn.y && my <= btn.y + btn.height) {
		data.interrupt = true;
	} else {
		data.interrupt = false;
	}
}

function addShowInvButton() {
	Buttons.push(new Button(0, 44, 48, 48, dungeonArt.generalArt.imgs.invChest, {
		update: function (data) {
			var stops = data.interrupt;
			if (stops) {
				data.interrupt = false;
				showInventory({
					m1: player,
					m2: player
				});
			}
			return stops;
		},
		down: dataInterrupts
	}, {}, 2));
	add(Buttons[Buttons.length - 1]);
}

function addLoadButton() {
	Buttons.push(new Button(0, 132, 48, 48, dungeonArt.generalArt.imgs.load, {
		update: function (data) {
			var stops = data.interrupt;
			if (stops) {
				data.interrupt = false;
				var slot = prompt("Load Slot?");
				if (slot.length > 0 && slot)
					RestoreSlot(slot);
				//GameEngine.resize();
			}
			return stops;
		},
		down: dataInterrupts
	}, {}, 2));
	add(Buttons[Buttons.length - 1]);
}
var consoleButton;
function insertConsoleButton() {
	Buttons.unshift(new Button(0, 176, 48, 48, dungeonArt.generalArt.imgs.console, {
		update: function (data) {
			var stops = data.interrupt;
			if (stops) {
				if (stops != 3) {
					data.interrupt = 3;
					util();
				}
			}
			return stops;
		},
		down: function (e, btn) {
			var data = btn.data;
			if (!data.interrupt) {
				mx = (e.clientX || e.pageX);
				my = (e.clientY || e.pageY);
				if (mx >= btn.x && mx <= btn.x + btn.width && my >= btn.y && my <= btn.y + btn.height) {
					data.interrupt = 2;
				} else {
					data.interrupt = false;
				}
			}
		}
	}, {}, 2));
	add(Buttons[0]);
	consoleButton = Buttons[0];
}

function addSaveButton() {
	Buttons.push(new Button(0, 88, 48, 48, dungeonArt.generalArt.imgs.save, {
		update: function (data) {
			var stops = data.interrupt;
			if (data.interrupt) {
				data.interrupt = false;
				var slot = prompt("Save Slot?");
				if (slot.length > 0 && slot)
					SaveSlot(slot);
			}
			return stops;
		},
		down: dataInterrupts
	}, {}, 2));
	add(Buttons[Buttons.length - 1]);
}