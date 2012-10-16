/**
 * $reuse.js
 * @require loot
 */

(function() {

	// recycling and reuse of objects (object pool / gc mitigation strategy) ---------------------------------------------
	var _recycleBins = {};
	var _defaultPoolMax = 100;
	var _recycleBinName;
	var _recycleBin;

	// reset an object and make it ready to be reused
	// if none is provided when calling $recyclable
	// this is the reducer that will be used by default
	function _reduce(obj) {
		if (obj) {
			if (obj.reduce) {
				return obj.reduce();
			} else {
				// $clear will leave the prototype in tact! All inherited properties will shine through.
				$clear(obj);
			}
		}
		return obj;
	}

	function $recycle(obj) {
		obj = obj || this;
		_recycleBinName = obj.recycleBin;
		_recycleBin = _recycleBins[_recycleBinName];
		_recycleBin.push(_recycleBin.reduce(obj));
	}

	// make an object recyclable/reusable
	function $recyclable(name, constructor, reducer, maxItems) {

		reducer = reducer || _reduce;

		if (!$isString(name)) {
			throw new Error("name must be a string");
		} else if (name in _recycleBins) {
			throw new Error("name already in use");
		}

		if (!$isFunction(reducer)) {
			throw new Error("reducer must be a function");
		}

		if (!$isFunction(constructor)) {
			throw new Error("constructor must be a function");
		}

		var bin = [];
		bin.name = name;
		bin.constructor = constructor;
		bin.reducer = reducer;
		bin.maxItems = maxItems || _defaultPoolMax;
		_recycleBins[name] = bin;

		$reuse[name] = function() {
			return this(name);
		};

		return bin;
	}

	function $recycleBin(name) {
		if (name && name in _recycleBins) {
			return _recycleBins[name];
		} else {
			return _recycleBins;
		}
	}

	// return a recycled object or a new object
	var _recyclable;
	function $reuse(name) {
		if (name in _recycleBins) {
			// return an object out of the recycleBin or a new one
			_recycleBin = _recycleBins[name];
			if (_recycleBin.length) {
				_recyclable = _recycleBin.pop();
				_recyclable.renew && _recyclable.renew();
			} else {
				_recyclable = _recycleBin.constructor();
			}
			return _recyclable;

		} else {
			throw new Error("no such recyclable " + name);
		}
	}

	// lets make objects, arrays and speakers recyclable by default
	// all models will also automatically be made recyclable
	//	$recyclable("array", function() {
	//		return [];
	//	});
	//	$recyclable("object", function() {
	//		return {};
	//	});

	loot.extend({
		$recycle: $recycle,
		$recyclable: $recyclable,
		$recycleBin: $recycleBin,
		$reuse: $reuse
	});

}());