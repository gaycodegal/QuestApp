//Generally allow for repeating actions applied to objects. not really used right now.

function tween2(obj, prop, ticks, value, x, neg, comp) {
	tween(obj, prop, ticks / 2, value / 2, x, neg, function () {
		tween(obj, prop, ticks / 2, value / 2, x, !neg, comp);
	});
}

function tween(obj, prop, ticks, value, x, neg, comp) {
	var tick = 0;
	var oldVal = 0;
	ticks *= 60 / 1000;
	var func = function (o, t) {
		tick += t;
		var val;
		if (neg) {
			val = 1 - tick / ticks;
			if (val <= 0) {
				val = 0;
			}
		} else {
			val = tick / ticks;
			if (val >= 1) {
				val = 1;
			}
		}

		var m = 1;
		for (var p = 0; p < x; p++) {
			m *= val;
		}


		obj[prop] -= oldVal;
		oldVal = Math.floor(10000 * (neg ? value - value * m : value * m)) / 10000;
		obj[prop] += oldVal;
		if ((val == 1 && !neg) || (val == 0 && neg)) {
			if (comp)
				comp(obj);
			return true;
		} else {
			return false;
		}
	};
	obj.tween.push(func);
}

function wticks(obj, ticks, comp) {
	var func = function (o, t) {
		ticks -= t;

		if (ticks <= 0) {
			if (comp)
				comp(obj);
			return true;
		} else {
			return false;
		}
	};
	obj.tween.push(func);
}

function tveen(obj, prop, value, dx, comp) {
	var neg = Math.max(value - dx) < value;
	var func = function (o, t) {

		var x = t * dx;
		value -= x;
		obj[prop] += x;
		if ((!neg && value >= 0) || (neg && value <= 0)) {
			if (comp)
				comp(obj);
			return true;
		} else {
			return false;
		}
	};
	obj.tween.push(func);
}