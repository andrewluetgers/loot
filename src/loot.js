/*
 * loot.js 0.2.2
 * (c) andrew luetgers
 * you are free to distribute loot.js under the MIT license
 * https://github.com/andrewluetgers/loot
 */



(function() {

	var version = "0.2.2";

	var root = this;

	// language shims -------------------------------------------

	// Extend the String prototype to include a splice method.
	// This will use an Array-based splitting / joining approach
	if (!String.prototype.splice) {
		String.prototype.splice = function(index, howManyToDelete, stringToInsert) {
			var characterArray = this.split("");
			Array.prototype.splice.apply(characterArray, arguments);
			return characterArray.join("");
		};
	}


	if(!String.prototype.trim) {
		var trimRe = /^\s+|\s+$/g;
		String.prototype.trim = function () {
			return this.replace(trimRe,'');
		};
	}


	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
			"use strict";
			if (this == null) {
				throw new TypeError();
			}
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0) {
				return -1;
			}
			var n = 0;
			if (arguments.length > 0) {
				n = Number(arguments[1]);
				if (n != n) { // shortcut for verifying if it's NaN
					n = 0;
				} else if (n != 0 && n != Infinity && n != -Infinity) {
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
				}
			}
			if (n >= len) {
				return -1;
			}
			var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) {
					return k;
				}
			}
			return -1;
		}
	}

	// some variables that get used all over -------------------------------------------------------

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var slice 					= ArrayProto.slice,
		splice 					= ArrayProto.splice,
		unshift 				= ArrayProto.unshift,
		toString 				= ObjProto.toString,
		hasOwnProperty 			= ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var nativeForEach 			= ArrayProto.forEach,
		nativeMap  				= ArrayProto.map,
		nativeReduce 			= ArrayProto.reduce,
		nativeReduceRight 		= ArrayProto.reduceRight,
		nativeFilter 			= ArrayProto.filter,
		nativeEvery 			= ArrayProto.every,
		nativeSome 				= ArrayProto.some,
		nativeIndexOf 			= ArrayProto.indexOf,
		nativeIsArray 			= Array.isArray,
		nativeKeys 				= Object.keys,
		nativeBind 				= FuncProto.bind;

	// commonly used strings, this can help mitigate a tiny bit of garbage generation
	var funType = "function", 			undType = "undefined", 	strType = "string",
		arrType = "array", 				regType = "regexp", 	argType = "arguments",
		eleType = "element", 			objType = "object", 	numType = "number",
		nanType = "NaN", 				nulType = "null", 		booType = "boolean",
		booStr = "[object Boolean]", 	numStr = "[object Number]",
		datStr = "[object Date]", 		regStr = "[object RegExp]",
		argStr = "[object Arguments]", 	aryStr = "[object Array]",
		calleeS = "callee";

	// basic types -------------------------------------------------------
	// stolen wholesale from underscore
	function $isNull		(obj) { 	return obj === null;}
	function $isNaN			(obj) { 	return obj !== obj;}
	function $isElement		(obj) { 	return !!(obj && obj.nodeType == 1);}
	function $isObject		(obj) { 	return obj === Object(obj); }
	function $isBoolean		(obj) { 	return obj === true || obj === false || toString.call(obj) == booStr;}
	function $isUndefined	(obj) { 	return typeof obj === undType;}
	function $isFunction	(obj) { 	return typeof obj === funType;}
	function $isString		(obj) { 	return typeof obj === strType;}
	function $isNumber		(obj) { 	return toString.call(obj) === numStr;}
	function $isDate		(obj) { 	return toString.call(obj) === datStr;}
	function $isRegExp		(obj) { 	return toString.call(obj) === regStr;}

	function $isArguments	(obj) { 	return toString.call(obj) === argStr;}
	if (!$isArguments(arguments)) {
		$isArguments = function(obj) { 	return !!(obj && $has(obj, calleeS));};
	}

	var $isArray = nativeIsArray ||
			function(obj) { 			return toString.call(obj) == aryStr;};

	// from jQuery
	function $isPlainObject( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that null, DOM nodes and window objects don't pass through, as well
		if (!obj || typeof obj !== "object" || obj.nodeType || root === obj) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if (obj.constructor &&
				!hasOwnProperty.call(obj, "constructor") &&
				!hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {}

		return key === undefined || hasOwnProperty.call(obj, key);
	}

	function $isEmptyObject(obj) {
		for (var name in obj) {return false;}
		return true;
	}

	function $typeof(obj) {
		var type = typeof obj;

		switch(type) {
			case objType:
				if (obj === null) {
					return nulType;
				} else if ($isArray(obj)) {
					return arrType;
				} else if (toString.call(obj) === regStr) {
					return regType;
				} else if ($isArguments(obj)) {
					return argType;
				} else if (!!(obj && obj.nodeType == 1)) {
					return eleType;
				} else { // this should be last
					return objType;
				}
				break;

			case numType:
				if (obj !== obj) {
					return nanType;
				}
				break;

			default:
				return type;
		}
	}

	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	function $isEmpty(obj) {
		if ($isArray(obj) || $isString(obj)) {
			return obj.length === 0;
		}

		for (var key in obj) {
			if ($has(obj, key)) {
				return false;
			}
		}
		return true;
	}
	
	function $has (obj, key) { return hasOwnProperty.call(obj, key); }


	// Return a copy of the object only containing the whitelisted properties.
	function $pick(obj) {
		var result = {};
		each(_.flatten(slice.call(arguments, 1)), function(key) {
			if (key in obj) result[key] = obj[key];
		});
		return result;
	}

	var $keys = nativeKeys || function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj) if ($has(obj, key)) keys[keys.length] = key;
		return keys;
	};

	// Retrieve the values of an object's properties.
	function $values(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var vals = [];
		for (var key in obj) if ($has(obj, key)) vals[vals.length] = obj[key];
		return vals;
	}

	// Collection Functions (work on objects and arrays) -------------------------------------------------------

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var breaker = "break";
	var $each = (function() {

		// switched breaker to string "break" for better self documentation when used
		function each(obj, iterator, context) {
			var i, l, key;
			if (!obj) return;
			if (typeof obj === numType) {
				var arr = [];
				for (i = 0, l = parseInt(obj); i < l; i++) {
					arr[i] = i;
					if (iterator.call(context, i, i, arr) === breaker) return;
				}
			}
			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);

			} else if (obj.length === +obj.length) {
				for (i = 0, l = obj.length; i < l; i++) {
					if (iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				for (key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			}
		}

		each.breaker = breaker;
		each.nativeForEach = nativeForEach;
		each.hasOwnProperty = hasOwnProperty;

		return each;

	}());
	
	
	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native "map" if available.
	function $map(obj, iterator, context) {

		var results = [];

		if (!obj) { return results; }

		if (nativeMap && obj.map === nativeMap) {
			return obj.map(iterator, context);
		}

		if ($isArray(obj) || $isNumber(obj)) {
			$each(obj, function(value, index, list) {
				results[results.length] = iterator.call(context, value, index, list);
			});
			if (obj.length === +obj.length) results.length = obj.length;
		} else {
			results = {};
			$each(obj, function(value, key, list) {
				results[key] = iterator.call(context, value, key, list);
			});
		}
		
		return results;
	}

	function $value(val) {return val;}

 // **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	function $reduce(obj, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (obj == null) obj = [];
		if (nativeReduce && obj.reduce === nativeReduce) {
			if (context) iterator = $bind(iterator, context);
			return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
		}

		$each(obj, function(value, index, list) {
			if (!initial) {
				memo = value;
				initial = true;
			} else {
				memo = iterator.call(context, memo, value, index, list);
			}
		});
		if (!initial) throw new TypeError('Reduce of empty array with no initial value');
		return memo;
	}


	// Return the first value which passes a truth test. Aliased as `detect`.
	function $find(obj, iterator, context) {
		var result;
		$any(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	};
	
	// Return all the elements that pass a truth test.
	// Delegates to **ECMAScript 5**'s native `filter` if available.
	// Aliased as `select`.
	function $filter(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		// nativeFilter only applies to arrays
		if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
		
		if ($isArray(obj)) {
			// array mode
			$each(obj, function(value, index, list) {
				if (iterator.call(context, value, index, list)) {
					results[results.length] = value;
				}
			});
		} else {
			// object mode
			results = {};
			$each(obj, function(value, key, list) {
				if (iterator.call(context, value, key, list)) {
					results[key] = value;
				}
			});
		}
		return results;
	}
	
	
	// Return all the elements for which a truth test fails.
	function $reject(obj, iterator, context) {
		var results;
		if (!obj) return results;
		
		if ($isArray(obj)) {
			results = [];
			$each(obj, function(value, index, list) {
				if (!iterator.call(context, value, index, list)) results[results.length] = value;
			});
		} else {
			results = {};
			$each(obj, function(value, key, list) {
				if (!iterator.call(context, value, key, list)) results[key] = value;
			});
		}
		
		return results;
	}
	
	
	// Determine whether all of the elements match a truth test.
	// Delegates to **ECMAScript 5**'s native `every` if available.
	// Aliased as `all`.
	function $all(obj, iterator, context) {
		var result = true;
		if (obj == null) return result;
		if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
		$each(obj, function(value, index, list) {
			if (!(result = result && iterator.call(context, value, index, list))) return breaker;
		});
		return result;
	}
	
	
	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native "some" if available
	function $any(obj, iterator, context) {
		var result = false;

		if (nativeSome && obj.some === nativeSome) {
			return obj.some(iterator, context);
		}

		$each(obj, function(value, index, list) {
			// note: intentional assignment in the if
			if (result = iterator.call(context, value, index, list)) {
				return "break";
			}
		});

		return !!result;
	}
	
	
	// Determine if a given value is included in the array or object using `===`.
	// Aliased as `$contains`.
	function $includes(obj, target) {
		var found = false;
		if (obj == null) return found;
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
			found = $any(obj, function(value) {
			return value === target;
		});
		return found;
	}


	// Invoke a method (with arguments) on every item in a collection.
	function $invoke(obj, method) {
	var args = $slice(arguments, 2);
		return $map(obj, function(value) {
			return ($isFunction(method) ? method || value : value[method]).apply(value, args);
		});
	}

	// Convenience version of a common use case of `map`: fetching a property.
	function $pluck(obj, key) {
		return $map(obj, function(value){ return value[key]; });
	}

	// Return the maximum element or (element-based computation).
	function $max(obj, iterator, context) {
	if (!iterator && $isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
		if (!iterator && $isEmpty(obj)) return -Infinity;
		var result = {computed : -Infinity};
		$each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed >= result.computed && (result = {value : value, computed : computed});
		});
		return result.value;
	}

	// Return the minimum element (or element-based computation).
	function $min(obj, iterator, context) {
		if (!iterator && $isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
		if (!iterator && $isEmpty(obj)) return Infinity;
		var result = {computed : Infinity};
		$each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed < result.computed && (result = {value : value, computed : computed});
		});
		return result.value;
	}

	// Shuffle an array.
	function $shuffle(obj) {
		var shuffled = [], rand;
		$each(obj, function(value, index, list) {
			rand = Math.floor(Math.random() * (index + 1));
			shuffled[index] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	}

	// Sort the object's values by a criterion produced by an iterator.
	function $sortBy(obj, val, context) {
		var iterator = $isFunction(val) ? val : function(obj) { return obj[val]; };
		return $pluck($map(obj, function(value, index, list) {
			return {
				value : value,
				criteria : iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria, b = right.criteria;
			if (a === void 0) return 1;
			if (b === void 0) return -1;
			return a < b ? -1 : a > b ? 1 : 0;
		}), 'value');
	}

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	function $groupBy(obj, val) {
		var result = {};
		var iterator = $isFunction(val) ? val : function(obj) { return obj[val]; };
		$each(obj, function(value, index) {
			var key = iterator(value, index);
			(result[key] || (result[key] = [])).push(value);
		});
		return result;
	}

	// Use a comparator function to figure out at what index an object should
	// be inserted so as to maintain order. Uses binary search.
	function $sortedIndex(array, obj, iterator) {
		iterator || (iterator = $identity);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >> 1;
			iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
		}
		return low;
	}

	
	function $length(item) {
		var len = item && item.length;
		if (!$isNumber(len)) {
			len = 0;
			$each(item, function(){len++});
		}
		return len;
	}
	
	
	// Trim out all falsy values from an array or object.
	function $compact(obj) {
		return $filter(obj, function(value){ return !!value; });
	}

	// flatten arrays recursively
	function $flat() {
		var flatArray = ArrayProto.concat.apply(ArrayProto, arguments);
		return $any(flatArray, $isArray) ? $flat.apply(this, flatArray) : flatArray;
	}

	function $slice(obj, start, end) {
		return slice.call(obj, start || 0, end);
	}

	function $splice(obj, start, howMany) {
		// slice creates garbage, lets not do that if we don't have to
		if (arguments.length > 3 || typeof obj === strType) {
			return splice.apply(obj, $flat($slice(arguments, 1)));
		} else {
			return splice.call(obj, start, howMany);
		}
	}

	var _clearKey;
	function $clear(obj) {
		if ($isArray(obj)) {
			obj.length = 0;
		}

		for (_clearKey in obj) {
			if (obj.hasOwnProperty(_clearKey)) {
				delete obj[_clearKey];
			}
		}
	}



	// async functions ------------------------------------------------------------ 
	// taken from https://github.com/caolan/async with some modifications
	// each and series support iterating over objects as well as arrays

	var _async = {
		each: function(obj, iterator, callback) {
			var len = $length(obj), i = 0 ;
			callback = callback || function() {};

			if (!len) { return callback(); }
			
			$each(obj, function(val, key, obj) {
				iterator(function(err) {
					if (err) {
						callback && callback(err, obj);
						callback = null;
					} else {
						if (++i === len) {
							callback && callback(null, obj);
						}
					}
				}, val, key, obj);
			});
		},

		eachSeries: function(obj, iterator, callback) {
			var next, keys = $map(obj, function(v, k) {return k;}), // not using keys here bc we want array indexes as numbers, each gives us that
				i = 0, len = keys.length,
				key;

			callback = callback || function() {};

			next = function() {
				key = keys[i];
				iterator(function(err) {
					if (err) {
						callback && callback(err, obj);
						callback = null;
					} else {
						if (++i === len) {
							callback && callback(null, obj);
						} else {
							next();
						}
					}
				}, obj[key], key, obj);
			};

			next();
		},

		eachLimit: function (arr, limit, iterator, callback) {
			callback = callback || function () {};
			if (!arr.length || limit <= 0) {
				return callback();
			}
			var completed = 0;
			var started = 0;
			var running = 0;

			(function replenish() {
				if (completed === arr.length) {
					return callback();
				}

				while (running < limit && started < arr.length) {
					iterator(arr[started], function (err) {
						if (err) {
							callback(err);
							callback = function() {};
						} else {
							completed += 1;
							running -= 1;
							if (completed === arr.length) {
								callback();
							} else {
								replenish();
							}
						}
					});
					started += 1;
					running += 1;
				}
			})();
		},

		// nextTick implementation with browser-compatible fallback
		nextTick: (function() {
			if (typeof process === undType || !(process.nextTick)) {
				return function(fn) { setTimeout(fn, 0); };
			} else {
				return process.nextTick;
			}
		}()),

		iterator: function(tasks) {
			var makeCallback = function(index) {
				var fn = function() {
					if (tasks.length) {
						tasks[index].apply(null, arguments);
					}
					return fn.next();
				};
				fn.next = function() {
					return (index < tasks.length - 1) ? makeCallback(index + 1): null;
				};
				return fn;
			};

			return makeCallback(0);
		}
	};

	var _doParallel = function(fn) {
		return function() {
			var args = $slice(arguments);
			return fn.apply(null, [_async.each].concat(args));
		};
	};
	var _doSeries = function(fn) {
		return function() {
			var args = $slice(arguments);
			return fn.apply(null, [_async.eachSeries].concat(args));
		};
	};

	var _asyncMap = function(eachfn, obj, iterator, callback) {
		callback = callback || function() {};
		var results = $isArray(obj) ? [] : {};
		eachfn(obj, function(next, val, key, obj) {
			iterator(function(err, _val) {
				results[key] = _val;
				next(err);
			}, val, key, results, obj);
		}, function(err) {
			callback(err, results, obj);
		});
	};

	_async.map = _doParallel(_asyncMap);
	_async.mapSeries = _doSeries(_asyncMap);

	_async.tasks = function(tasks, callback) {
		var iterator = function (push, task, key, result, obj) {
			if (task && $isFunction(task)) {
				task(push, key, result);
			} else {
				throw new Error("expected a function but saw " + typeof task);
			}
		};

		_async.map(tasks, iterator, callback);
	};


	_async.tasksSeries = function(tasks, callback) {
		var iterator = function (push, task, key, result, obj) {
			if (task && $isFunction(task)) {
				task(push, key, result);
			} else {
				throw new Error("expected a function but saw " + typeof task);
			}
		};

		_async.mapSeries(tasks, iterator, callback);
	};


	// $parallel(func1, func2, func3)
	// $parallel([func1, func2, func3], callback)
	// $parallel(objectOrArray, iterator, callback)
	// $parallel(objectOrArray, limit, iterator, callback)
	var $parallel = function(tasks, callback) {
		var len = arguments.length,
			type = typeof callback;

		// first signature: a set of async functions to call, is converted to second signature format, no final callback is used
		if ($isFunction(tasks)) {
			tasks = $slice(arguments);
			callback = function(){};
		}

		// second signature: array of functions and final callback
		if ($isArray(tasks) && $isFunction(tasks[0])) {
			_async.tasks(tasks, callback);

		// third signature: async for each
		} else if (type === funType) {
			var iterator = callback;
			callback = arguments[2];
			_async.each(tasks, iterator, callback);

		// fourth signature: async for each limit
		} else if (len === 4 && type === numType) {
			var limit = callback;
			var iterator = arguments[2];
			callback = arguments[3];
			_async.eachLimit(tasks, limit, iterator, callback);

		} else {
			throw new TypeError();
		}
	};
	

	// $series(func1, func2, func3)
	// $series([func1, func2, func3], callback)
	// $series(objectOrArray, iterator, callback)
	var $series = function(tasks, callback) {
		// first signature: a set of async functions to call, is converted to second signature format, no final callback is used
		if ($isFunction(tasks)) {
			tasks = $slice(arguments);
			callback = function(){};
		}

		// second signature: array of functions and final callback
		if ($isArray(tasks) && $isFunction(tasks[0])) {
			_async.tasksSeries(tasks, callback);

		// third signature: async for each
		} else {
			//var iterator = callback;
			_async.eachSeries(tasks, callback, arguments[2]);
		}
	};



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




	// component-------------------------------------------------------

	var $component = (function() {

		var components = {};

		var newComponent = function(name, proto) {

			if (!components.hasOwnProperty(name)) {

				var key, api = {};

				// create our api facade functions
				for (key in proto) {
					if (key.substr(0,1) !== "_" && $isFunction(proto[key])) {
						api[key] = function() {
							var compo = this._components[name][key];
							return compo.apply(compo, $slice(arguments));
						};
					}
				}

				components[name] = {
					api: api,
					proto: proto
				};
			}
		};

		newComponent.attachComponent = function(obj, name) {

			if (components.hasOwnProperty(name)) {
				var component = components[name];

				if (!(name in obj._components)) {
					var compo = components[name];
					// add the component
					obj._components[name] = $new(compo.proto);
					// attach the api
					$each(compo.api, function(fn, name) {
						if (name in obj) {
							throw new Error("Cannot overwrite existing property with new component api method " + name);
						} else {
							obj[name] = fn;
						}
					});
				}

			} else {
				throw new Error("No such component " + name);
			}
		};


		newComponent.dropComponent = function(obj, name) {
			var key, compo;

			// intentional assignment in if!!
			if (obj._components && (compo = obj._components[name])) {
				for (key in compo) {
					if (key.substr(0,1) !== "_" && $isFunction(compo[key])) {
						delete obj[key];
					}
				}

				delete obj._components[name];
			}
		};

		return newComponent;

	}());


	// compose -------------------------------------------------------
	function $compose(obj, deps) {

		// handle new object variant
		if(!deps && ($isString(obj) || $isArray(obj))) {
			deps = obj;
			obj = {};
		}

		if ($isString(deps)) {
			deps = [deps];
		}

		if (!obj._components) {
			obj._components = {
				getParent: function() {
					return obj;
				}
			};
		}

		$each(deps, function(dep) {
			if (!(dep in obj._components)) {
				$component.attachComponent(obj, dep);
			}
		});
	}

	function $decompose(obj) {
		if (obj._components) {
			$each(obj._components, function(fn, key) {
				if ($isFunction(fn)) {
					$component.dropComponent(obj, key);
				}
			});

			delete obj._components;
		}
	}


	// object -------------------------------------------------------
	
	// use the same constructor every time to save on memory usage per
	// http://oranlooney.com/functional-javascript/
	function F() {}

	function $new(prototype, ignoreInit) {

		F.prototype = prototype || {};

		var newInstance = new F();

		if(!ignoreInit && newInstance.init) {

			// fix any uglyness that may have come through in the inits array
			var inits = $filter($flat(newInstance.init), $isFunction);

			// support single init functions or arrays of them
			newInstance.init = (inits.length > 1) ? inits : inits[0];

			// call the init methods using the new object for "this"
			$each(inits, function(fn) {
				fn.call(newInstance);
			});
		}

		return newInstance;
	}

	/**
	 * serves as a utility method for $copy and $merge
	 * @param source (object) the object to copy properties from
	 * @param target (object) optional object to merge source's properties into
	 * @param filter (function) optional function(key, source, target) { return boolean; }
	 * the filter function returns true if a property should be copied and false if it should be ignored
	 * filter can also be provided as the last of two arguments when omitting a target
	 * filter example: to deep copy only owned properties from objA to objB
	 * 	$copy(objA, objB, function(key, source) {
	 * 		return source.hasOwnProperty(key);
	 * 	});
	 */
	function copy(source, target, filter) {
		var key, sourceProp, targetProp;

		if ($isString(source) || $isBoolean(source) || $isNumber(source)) {
			throw new Error("copy source must be an object");
		}

		if (target && ($isString(source) || $isBoolean(source) || $isNumber(source))) {
			throw new Error("optional copy target must be an object");
		}

		// support (source, filter) signature
		if (arguments.length === 2 && $isFunction(target)) {
			filter = target;
			target = {};
		} else {
			filter = ($isFunction(filter)) ? filter : false;
			target = target || {};
		}

		for (key in source) {

			// skip this property if filter returns false
			if (filter && !filter(key, source, target)) {
				continue;
			}

			sourceProp = source[key];

			// Prevent infinite loop
			if (sourceProp === target) {
				continue;
			}

			// todo make the more specific for various types
			if (typeof sourceProp === objType && !$isNull(sourceProp)) {
				targetProp = $isArray(sourceProp) ? [] : {};
				target[key] = copy(sourceProp, targetProp, filter);

			} else {
				target[key] = sourceProp;
			}
		}

		return target;
	}

	function $copy(source, filter) {
		if (filter && !$isFunction(filter)) {
			throw new Error("$copy: Optional second argument (filter) must be a function. Instead saw " + typeof filter);
		}
		return copy(source, filter);
	}

	function $merge(target, source, filter) {
		if (!target || !source) {
			throw new Error("$merge: First two arguments (target, source) are required and must be enumerable. Instead saw (" + typeof target +", "+ typeof source +")");
		}

		if (filter && !$isFunction(filter)) {
			throw new Error("$merge: Optional third argument (filter) must be a function. Instead saw " + typeof filter);
		}
		return copy(source, target, filter);
	}

	// from underscore
	// Reusable constructor function for prototype setting.
	function Ctor(){}
	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Binding with arguments is also known as `curry`.
	// Delegates to **ECMAScript 5**'s native `Function.bind` if available.
	// We check for `func.bind` first, to fail fast when `func` is undefined.
	function $bind(func, context) {
		var bound, args;

		if (func.bind === nativeBind && nativeBind) {
			return nativeBind.apply(func, slice.call(arguments, 1));
		}

		if (!$isFunction(func)) {
			throw new TypeError;
		}

		args = slice.call(arguments, 2);

		return bound = function() {
			if (!(this instanceof bound)) {
				return func.apply(context, args.concat(slice.call(arguments)));
			}
			Ctor.prototype = func.prototype;
			var self = new Ctor;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) {return result;}
			return self;
		};
	}

	/**
	 * $extend augments the first object with shallow copies of
	 * all other objects including their inherited properties
	 * @param target (object) an object to augment
	 * Remaining parameters may be object/s or array/s of objects
	 * all of the following are valid
	 * $extend(object, object)
	 * $extend(object, object, object, object)
	 * $extend(object, [object])
	 * $extend(object, [object, object, object])
	 * $extend(object, object, [object, object], object)
	 */
	var sources, prop;
	function $extend(target) {
		if (target) {
			// accept objects or arrays of objects
			sources = [].concat($slice(arguments, 1)); // todo can we do this without creating new objects??

			$each(sources, function(source) {
				for (prop in source) {
					target[prop] = source[prop];
				}
			});
		}

		return target;
	}

	/**
	 * $mixin augments the first object with deep copies of
	 * all other objects excluding their inherited properties
	 * @param target (object) an object to augment
	 * Remaining parameters may be object/s or array/s of objects
	 * all of the following are valid
	 * $mixin(object, object)
	 * $mixin(object, object, object, object)
	 * $mixin(object, [object])
	 * $mixin(object, [object, object, object])
	 * $mixin(object, object, [object, object], object)
	 */
	function $mixin(target) {
		if(target) {
			var sources = $slice(arguments, 1);

			// accept objects or arrays of objects
			$each(sources, function(source) {
				var prop;
				for (prop in source) {
					// do a deep copy that excludes any inherited properties at any level
					$merge(target, source, function(key, source) {
						return source.hasOwnProperty(key);
					});
				}
			});
		}

		return target;
	}

	/**
	 * make new objects like a pro
	 * @param prototype
	 * @param extender/s
	 * @param mixin/s
	 * @author ATL
	 */
	function $make(prototype, extender, mixin) {

		mixin = mixin || {};

		var myProto = $new(prototype, true),
			// we allow extender and mixin to be arrays of objects so lets flatten them out for easy traversal
			parts = [].concat(myProto, extender, mixin),
			inits = [],
			forceOverwrite = true, // for self documentation
			makeSpeaker;

		$each(parts, function(part) {
			var init = part ? part.init : null;

			// compile an array of init functions
			if (init) {
				inits.push(init);
			}

			// flatten so that init can be a function or an array of functions
			// we
			inits = $filter($flat(inits), $isFunction);

			// makeSpeaker is any of our parts a speaker?
			if ($isSpeaker(part)) {
				makeSpeaker = true;
			}
		});

		// $extend does a shallow copy including inherited properties
		if (extender) {
			$extend(myProto, extender);
		}

		// $mixin does a deep copy excluding inherited properties
		if (mixin) {
			$mixin(myProto, mixin);
		}

		// if any objects were speakers then make the new object speak as well and
		// forceOverwrite so we don't copy or inherit _listeningFor and _audience
		if (makeSpeaker) {
			$speak(myProto, forceOverwrite);
		}

		// message sharing
		var shares = myProto.shareMessages;
		if (shares && !myProto.dontShareMessages) {
			if (shares === true) {
				myProto.listensTo(prototype);
				myProto.listensTo(extender);
			} else if (shares == "prototype") {
				myProto.listensTo(prototype);
			} else if (shares == "extender") {
				myProto.listensTo(extender);
			}
			myProto.shareMessages = true;
		} else if (myProto.dontShareMessages && myProto.shareMessages) {
			// lets be consistent
			myProto.shareMessages = false;
		}

		// call the init methods using the new object for "this"
		$each(inits, function(fn) {
			fn.call(myProto);
		});

		// init is either a single function or an array of functions
		myProto.init = (inits.length > 1) ? inits : inits[0];

		return myProto;
	}


	// date/time -------------------------------------------------------

	function $now() {
		return new Date().getTime();
	}

	/* $timeAgo
	/*
	 * Javascript Humane Dates
	 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
	 * Re-write by Zach Leatherman (zachleat.com)
	 * RE-RE-write by andrew luetgers
	 * 		to accept timestamps and remove init work from each call
	 *
	 * Adopted from the John Resig's pretty.js
	 * at http://ejohn.org/blog/javascript-pretty-date
	 * and henrah's proposed modification
	 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
	 *
	 * Licensed under the MIT license.
	 */
	var $timeAgo = (function() {

		var lang = {
				ago: 'Ago',
				now: 'Just Now',
				minute: 'Minute',
				minutes: 'Minutes',
				hour: 'Hour',
				hours: 'Hours',
				day: 'Day',
				days: 'Days',
				week: 'Week',
				weeks: 'Weeks',
				month: 'Month',
				months: 'Months',
				year: 'Year',
				years: 'Years'
			},
			formats = [
				[60, lang.now],
				[3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
				[86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
				[604800, lang.day, lang.days, 86400], // 7 days, 1 day
				[2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
				[31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
				[Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
			],
			minusRe = /-/g,
			tzRe = /[TZ]/g,
			margin = 0.1;

		/*
		 * 0 seconds && < 60 seconds    Now
		 * 60 seconds            1 Minute
		 * > 60 seconds && < 60 minutes   X Minutes
		 * 60 minutes            1 Hour
		 * > 60 minutes && < 24 hours    X Hours
		 * 24 hours             1 Day
		 * > 24 hours && < 7 days      X Days
		 * 7 days              1 Week
		 * > 7 days && < ~ 1 Month     X Weeks
		 * ~ 1 Month            1 Month
		 * > ~ 1 Month && < 1 Year     X Months
		 * 1 Year              1 Year
		 * > 1 Year             X Years
		 *
		 * Single units are +10%. 1 Year shows first at 1 Year + 10%
		 */
		function normalize(val, single) {
			if(val >= single && val <= single * (1+margin)) {
				return single;
			}
			return val;
		}

		function normalizeDateInput(date) {
			switch (typeof date) {

				case strType:
					date = new Date(('' + date).replace(minusRe, "/").replace(tzRe, " "));
					break;

				case numType:
					date = new Date(date);
					break;
			}

			return date;
		}

		function timeAgo(date, compareTo) {

			date = normalizeDateInput(date);
			compareTo = normalizeDateInput(compareTo || new Date);

			var token,
				isString = (typeof date === strType),
				seconds = (compareTo - date +
							(compareTo.getTimezoneOffset() -
								// if we received a GMT time from a string, doesn't include time zone bias
								// if we got a date object, the time zone is built in, we need to remove it.
								(isString ? 0 : date.getTimezoneOffset())
							) * 60000
						) / 1000;

			if (seconds < 0) {
				seconds = Math.abs(seconds);
				token = '';
			} else {
				token = ' ' + lang.ago;
			}
			for(var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
				if(seconds < format[0]) {
					if(i === 0) {
						// Now
						return format[1];
					}

					var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
					return val +
							' ' +
							(val != 1 ? format[2] : format[1]) +
							(i > 0 ? token : '');
				}
			}
		}

		return timeAgo;
	}());


	var $timer = (function() {
		var epoch = new Date(1970, 1, 1, 0, 0, 0, 0).valueOf();
		var timerApi = {
			parent: null,
			interval: null,
			started: 0,
			elapsed: 0,
			start: function() {
				var that = this;
				this.started = $now();
				this.interval = setInterval(function() {
					that.update();
				}, 1000);
			},
			stop: function() {
				clearInterval(this.interval);
				this.reset();
			},
			pause: function() {
				clearInterval(this.interval);
			},
			reset: function() {
				this.started = $now();
				this.update();
			},
			update: function() {
				this.elapsed = $now() - this.started;
				this.parent.innerHTML = this.format(this.elapsed + $now() - this.started);
			},
			format: function(ms) {
//				console.log(ms, $now() - ms, new Date(ms - $now()).toString());
				var d = new Date(ms + epoch).toString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
				var x = (ms % 1000) + "";
				while (x.length < 3) {
					x = "0" + x;
				}
				d += "." + x;
				return d.substr(0, d.length - 4);
			}
		};

		return function(parent) {
			var timer = $new(timerApi);
			timer.parent = parent;
			return timer;
		}
	}());



	// messaging -------------------------------------------------------

	// API note
	// the optional selectiveHearing property added to a speaker is a
	// function with the same signature as any responder. the selectiveHearing
	// function serves as a truth-test, if it returns truthy the message
	// will be listened to otherwise it's ignored

	var $speak = (function() {

		var aSpeaker = {

			/** tell
			 * @param topic (string) the topic of the message, listeners can filter messages base on their topic
			 * @param message (anything) optional - a value passed to the listeners
			 * @param speaker (speaker) optional - listeners will be told the origin of the messages they receive
			 * here you can override that value, you should not need to use this
			 */
			tell: function(topic, message, speaker) {

				var i, len, listener, lMax,
					wildCardListeners,
					topicSpecificListeners,
					audience = this._audience,
					originalSpeaker = speaker || this,
					selectiveHearing = this.selectiveHearing;

				if (!selectiveHearing || ($isFunction(selectiveHearing) && this.selectiveHearing(message, topic, originalSpeaker)) ) {
					topicSpecificListeners = (topic !== "*") ? this._listeningFor[topic] || [] : []; //$reuse.array();
					wildCardListeners = this._listeningFor["*"];

					if (wildCardListeners) {
						topicSpecificListeners = topicSpecificListeners.concat(wildCardListeners);
					}

					for(i=0, len=topicSpecificListeners.length; i<len; i++) {
						listener = topicSpecificListeners[i];
						lMax = listener.maxResponses;
						listener.responses++;

						// ignore if we hit our maxResponses
						if (lMax && listener.responses >= lMax) {
							this.ignore(listener);
						}

						// fire the responder within the currently bound scope
						listener.responder.call(this, message, topic, originalSpeaker);
					}

					// tell the audience
					for(i=0, len=audience.length; i<len; i++) {
						audience[i].tell(topic, message, originalSpeaker);
					}
				}
				return this;
			},

			/** listen
			 * @param topic (string|regex) will call the given responder if received topic === topic param
			 * or in the case of a regex topic param if the receivedTopic.match(topicParam)
			 * @param responder (function) having the signature function(message, topic, originalSpeaker) execution scope is that of the handling speaker
			 * @param maxResponses (number) optional - number of times the responder will be called before being removed
			 */
			listen: function(topic, responder, maxResponses) {

				var that = this,
					topicType = typeof topic,
					topicIsString = (topicType == strType),
					responderType = typeof responder;

				if (arguments.length > 1) {

					if (maxResponses && !$isNumber(maxResponses)) {
						throw new Error("Invalid parameter: expected a number but saw " + typeof maxResponses);
					}

					if (topicIsString && responderType === "function") {
						// don't add something twice
						var topicSpecificListeners = (topic !== "*") ? this._listeningFor[topic] || [] : []; //$reuse.array();
						$each(topicSpecificListeners, function(listener) {
							if(listener.responder === responder) {
								return this;
							}
						});

						// we only hit this block if the listener has not already been added
						topicSpecificListeners.push({
							responder: responder,
							responses: 0,
							maxResponses: maxResponses
						});

						this._listeningFor[topic] = topicSpecificListeners;

						return this;

					} else {
						throw new Error("Invalid parameters, expected: (string, function) but saw (" + topicType + ", " +responderType +")");
					}

				// handle listen({event:handler}) signature
				} else if (typeof topic === objType) {
					// call self for each function if given a map of callbacks instead of a single function
					$each(topic, function(listener, topic) {
						if ($isFunction(listener)) {
							// maxResponses is not supported in object map signature
							that.listen(topic, listener);
						}
					});
				}
			},

			once: function(topic, responder) {
				this.listen(topic, responder, 1);
			},

			/** listenUntil
			 * @param topic (string) will call the given responder if received topic === topic param
			 * @param responder (function) having the signature function(message, topic, originalSpeaker) execution scope is that of the handling speaker
			 * @param condition (function) is executed before the responder, if it returns true the responder will not be executed and will be removed.
			 * The condition function has the same signature as teh responder function(message, topic, originalSpeaker) execution scope is that of the handling speaker
			 */
			listenUntil: function(topic, responder, untilCondition) {
				function untilResponder() {
					var args = $slice(arguments);
					if (untilCondition.apply(this, args)) {
						this.ignore(topic, untilResponder);
					} else {
						responder.apply(this, args);
					}
				}

				this.listen(topic, untilResponder);
			},

			/** listeningFor
			 * @param topic (string)
			 */
			listeningFor: function(topic, ignoreCatchall) {
				var topicSpecificListeners = (topic !== "*") ? this._listeningFor[topic] || [] : []; //$reuse.array();
				var wildCardListeners = this._listeningFor["*"];

				if (!ignoreCatchall && wildCardListeners) {
					topicSpecificListeners = topicSpecificListeners.concat(wildCardListeners);
				}

				return topicSpecificListeners;
			},

			/** ignore
			 * @param ignoreable (string|function) optional - remove listeners
			 * if a string is passed all listeners to that topic will be removed
			 * if a function is passed all listeners using that responder will be removed
			 * if nothing is provided all listeners will be removed
			 */
			ignore: function(ignoreable, responder) {
				var test;
				if(ignoreable) {
					if ($isString(ignoreable)) {
						// reject listeners by topic + reponder
						if (responder && $isFunction(responder)) {
							test = function(listener) { return ((listener.topic === ignoreable) && (listener.responder === responder))};
						// reject listeners by topic
						} else {
							test = function(listener) { return (listener.topic === ignoreable)};
						}
					} else {
						// reject listeners by responder function
						test = function(listener) { return (listener.responder === ignoreable)};
					}
					this._listeningFor = $reject(this._listeningFor, test);

				} else {
					$clear(this._listeningFor); // remove all elements
				}

				return this;
			},

			/** talksTo
			 * @param speaker (object|function|array) - !!will make the provided object a speaker if it is not already
			 * @description will forward all messages to the provided speaker by adding it to our _audience
			 */
			talksTo: function(speaker) {
				if (this !== speaker && this._audience.indexOf(speaker) === -1) {
					this._audience.push($speak(speaker));
				}
				return this;
			},

			/** listensTo
			 * @param speaker (speaker)
			 * @description all messages sent to speaker will be forwarded to us
			 *
			 */
			listensTo: function(speaker) {
				if ($isSpeaker(speaker) && speaker._audience.indexOf(this) === -1 && speaker !== this) {
					speaker._audience.push(this);
				}
				return this;
			}

			// the following properties are added when the speaker is created
			// this prevents the risk of them being shared across speakers
			// _listeningFor: {},
			// _audience: []
		};


		function speak(obj) {
			if (obj && obj.hasOwnProperty("_listeningFor") && obj.hasOwnProperty("_audience")) {
				// already a publisher, do noting
				return obj;
			}

			if (!obj) {
				// looks like we are starting a new speaker from scratch so
				// we can create a more memory-friendly prototypal clone of aSpeaker
				obj = $new(aSpeaker);
			} else {
				// can't use a prototypal clone of aSpeakerFacade so we augment obj via shallow copy instead
				obj = $extend(obj, aSpeaker);
			}

			// this is also a possible reuse pattern (to reduce garbage collections)
			// so lets not create new objects/garbage if we don't have to
			obj._listeningFor = {}; //$reuse.object();
			obj._audience = []; //$reuse.array();

			return obj;
		}

		// setup the reduce method for speakers, so they can be recyclable
		// we compare all keys to those on the base speaker object we defined above "aSpeakerFacade"
		var _reducer = function(val, key, obj) {

		};

		// speakers are recyclable
//		$recyclable("speaker", speak, function(speaker) {
//			// reducer for speaker
//			for (key in speaker) {
//				if (!(key in aSpeaker)) {
//					delete obj[key];
//				}
//				obj.ignoreAll();
//			}
//		});

		return speak;

	}());


	function $isSpeaker(obj) {
		return !!(obj && $isFunction(obj.tell) && $isFunction(obj.listen));
	}



	// models -------------------------------------------------------

	var schemaBank = {};

	function modelApiGet(modelVals, _key) {
		var len = arguments.length, val;
		if (len == 2 && $isString(_key)) {
			val = modelVals[_key];
			// supports computed values
			return $isFunction(val) ? modelVals[_key]() : val;

		} else if (len > 2 || $isArray(_key)) {
			var results = {}, keys = $flat($slice(arguments, 1));
			$each(keys, function(key) {
				if (key in modelVals) {
					val = modelVals[key];
					// supports computed values
					results[key] = $isFunction(val) ? modelVals[key]() : val;
				}
			});
			return results;

		} else {
			return modelVals;
		}
	}

	function modelApiReset(modelVals, defaults) {
		for (var key in modelVals) {
			if (key in defaults) {
				modelVals[key] = defaults[key];
			} else {
				delete modelVals[key];
			}
		}
	}

	function modelApiSet(modelVals, _key, _val) {
		var obj = _key,
			val, key,
			changes = {},
			validate = this.validate,
			validateFn,
			validationFailures,
			failed;

		// if using single item syntax convert it to multi-item syntax so we only need one implementation
		if (typeof obj === strType) {
			// set single item to
			if (_val === undefined) {
				modelVals[_key] = _val;
				return;
			} else {
				obj = {};
				obj[_key] = _val;
			}
		}

		// generate our changes
		if (!validate) {
			// lets not check for validators if we don't have to
			for (key in obj) {
				changes[key] = obj[key];
			}
		} else {
			// we have validators so check them and log failures
			validationFailures = {};

			for (key in obj) {
				val = obj[key];
				validateFn = validate[key];

				if(validateFn) {
					var validationResult = validateFn(val);
					if (validationResult === true) {
						changes[key] = val;
					} else {
						failed = true;
						validationFailures[key] = validationResult;
					}
				} else {
					changes[key] = val;
				}
			}
		}
		
		if (failed) {
			this.tell("validationFailed", {
				passed: changes,
				failed: validationFailures
			});
		} else {
			// no errors! merge our changes into the model values
			$extend(modelVals, changes);
			this.tell("change", changes);
		}

		return this;
	}

	// define a type of object or data model
	function $schema(type, options, collection) {
		var existingSchema = schemaBank[type],
			instances = [];

		// schema getter
		if (type && arguments.length === 1 && existingSchema) {
			return existingSchema;

		// schema constructor
		} else if (type && $isString(type) && !existingSchema) {
			options = $copy(options || {});
			options.defaults = options.defaults || {};
			
			// type-check optional validators
			if (options.validate) {
				$each(options.validate, function(val) {
					if (!$isFunction(val)) {
						throw new Error("validator must be a function");
					}
				});
			}

			var schemaApi = $speak({
				type: type,
				constructor: function(vals) {
					return this.newInstance(vals);
				},
				drop: function() {
					this.dropInstances();
					instances = existingSchema = null;
					delete schemaBank[type];
					$clear(this);
					$schema.tell("drop", {schema: type});
				},

				getInstances: function() {
					// return a copy of the instances array not the real thing
					return instances;
				},

				dropInstances: function(filter) {
					var _instances = instances;

					if (filter) {
						_instances = $filter(instances, filter);
					}

					$each(_instances, function(instance) {
						instance.drop();
					});

					return this;
				},

				// instance api
				newInstance: function(vals) {
					var modelVals = $copy(options.defaults);
					var modelProto = $speak($new(options));
					var drop = options.drop;

					if (drop && !$isFunction(drop)) {
						throw new Error("drop must be a function");
					}

					// model instance api
					var model = $extend(modelProto, {
						schema: type,

						// the following get and set facade allows us to have a unique closure for modelVals and modelProto
						// without having copies of the larger modelApiSet and modelApiGet functions on each model instance hopefully saving some memory usage
						get: function(key) {
							if (arguments.length) {
								return modelApiGet.apply(this, $flat(modelVals, $slice(arguments))); // todo can we do this in a better way
							} else {
								return modelVals;
							}
						},
						set: function(key, val) {
							return modelApiSet.call(this, modelVals, key, val);
						},
						reset: function() {
							return modelApiReset.call(this, modelVals, options.defaults);
						},
						renew: function() {
							return init();
						},
						drop: function(willReuse) {
							drop && drop();
							this.tell("drop", this);
							// remove this instance from the instances array
							instances.splice(instances.indexOf(this), 1);
							if (!willReuse) {
								$clear(this);
							}
						}
					});

					// copy our initial values to the model
					if (!$isString(vals)) {
						$mixin(modelVals, vals);
					}

					var init = function() {
						// all model events are forwarded to their parent schema
						model.talksTo(this);

						instances.push(model);
						model.tell("created", this);

						return model;
					};

					return init();
				}
			});

			schemaBank[type] = collection ? $make(schemaApi, collection) : schemaApi;


			// make models from our new schema recyclable
//			var _modelApi = {schema:1, get:1, set:1, drop:1, renew:1, _audience:1, _listeningFor:1};
//			var key;
//			$recyclable(type+"Model", function() {
//				// constructor for model instance
//				return $model(type);
//
//			}, function(model) {
//				// reducer for model instance
//				model.drop(true);
//				model.ignoreAll();
//				for (key in model) {
//					if (!_modelApi[key]) {
//						delete model[key];
//					}
//				}
//				// reset the values on the model
//				model.reset();
//
//				return model;
//			});

			$schema.tell("defined", {schema:type});

		// error
		} else {
			return new Error("Error: valid schema type required.");
		}
	}
	// make schema a speaker
	$speak($schema);

	function $model(type, vals) {
		var schema = schemaBank[type];

		if (!type || !$isString(type) || !schema) {
			//throw new Error("$model: valid type string required");
			return null;
		} else if (vals && !$isPlainObject(vals)) {
			throw new Error("$model: valid values object required");
		} else {
			return schema.newInstance(vals);
		}
	}

	function $models(type) {
		return $schema(type).getInstances();
	}

	function $isSchema(obj) {
		return ($isFunction(obj.drop) && $isString(obj.type) && obj.getInstances && obj.newInstance);
	}

	function $isModel(obj) {
		return ($isFunction(obj.drop) && $isString(obj.schema) && obj.set && obj.get);
	}


	// trim string -------------------------------------------------------
	// type agnostic string trim, just returns the original val if its not a string
	function $trim(str) {
		if ($isString(str)) {
			return str.trim();
		} else {
			return str;
		}
	}




	// cache -------------------------------------------------------
	$cache = $speak({

		types: {
			// add our default cache type for io requests without a typeId
			io: {
				bins: {}
			}
		},

		// for 1 args the cacheKey is just the url, eg. "/contents"
		// for 2 args a key is generated with the url and the req ,
		// 		if the url was /user and post or get values were {name:"jim",age:25}
		// 		then the key would be /user[name:jim,age:25]
		getKey: function(url, req) {
			if (!req) {
				return url;
			}

			var cacheKey = [],
				keys = [],
				keyStrings = {};

			$each(req, function(val, key) {
				keys.push(key);
				var str = ($isString(val) || $isNumber(val)) ? val : val.toString();
				keyStrings[key] = key + ":" + str;
			});

			$each(keys.sort(), function(val) {
				cacheKey.push(keyStrings[val]);
			});

			return url + "[" + cacheKey.join(",") + "]";
		},

		get: function(typeId, reqType, url, req) {
			var len = arguments.length;

			if (!len) {
				return this.types;

			} else if (typeId) {
				var type = this.types[typeId];

				if (len === 1) {
					return type;

				} else if (url){
					var cacheKey = this.getKey(url, req),
						bins = type.bins;

					if(!(cacheKey in bins)) {
						bins[cacheKey] = {
							typeId: typeId,
							key: cacheKey,
							url: url,
							req: req,
							val: null,
							setAt: new Date().getTime()
						};
					}
					return bins[cacheKey];
				}
			}

			throw new Error("$cache.get: invalid arguments");
		},

		// provide a typeId and a function with the signature
		// function(bin, cacheKey) return true if the bin should be evicted
		// an eviction notice will be told to the cache so others can listen in and respond as needed
		// @return object - stats on how how many were evicted from how many and what remains
		evict: function(typeId, evictionTest) {
			var evicted = 0;
				total = 0,
				that = this;

			$each(this.types[typeId].bins, function(bin, cacheKey) {
				total++;
				if (!evictionTest || evictionTest === true || ($isFunction(evictionTest) && evictionTest(bin, cacheKey)) ) {
					// yup evict that mofo
					evicted++;
					that.tell(typeId + ":evict:" + cacheKey, bin);
					delete that.types[typeId].bins[cacheKey];
				}
			});

			return {
				evicted: evicted,
				total: total,
				remain: total - evicted
			};
		},

		set: function(typeId, url, req, val, metaData) {
			var cacheKey = this.getKey(url, req),
				bin = this.get(typeId, cacheKey);

			$extend(bin, {
				typeId: typeId,
				key: cacheKey,
				url: url,
				req: req,
				val: val,
				setAt: $now()
			}, metaData);

			this.tell(typeId + ":set:" + cacheKey, bin);

			return bin;
		},

		newType: function(typeId, customType) {
			if(!this.types[typeId]) {
				customType = customType || {};
				customType.bins = {};
				this.types[typeId] = customType;
			}
		},

		newRemoteType: function(typeId, spec) {
			spec.sync = function(req, handlers, forceRefresh) {
				var bin = $cache.get(this.typeId, this.baseUrl, req);
				if (forceRefresh || bin.val === null || (bin.ttl && ($now()-bin.set > this.ttl)) ) {
					$io.call(this, baseUrl, req, this.dataType, this.reqType, handlers);
				}
				return bin;
			};

			spec.typeId = typeId;

			var remoteType = $speak(spec);

			this.newType(typeId, remoteType);

			return remoteType;
		}

	});


	function $isCache(obj) {
		return (obj && obj.bins && obj.get && obj.set);
	}




	// dom -------------------------------------------------------
	function $id(id) {
		return document.getElementById(id);
	}

	// $tmpl -------------------------------------------------------
	// just aliasing doT.js
	// 2011, Laura Doktorova
	// https://github.com/olado/doT
	//
	// doT.js is an open source component of http://bebedo.com
	//
	// doT is a custom blend of templating functions from jQote2.js
	// (jQuery plugin) by aefxx (http://aefxx.com/jquery-plugins/jqote2/)
	// and underscore.js (http://documentcloud.github.com/underscore/)
	// plus extensions.
	//
	// Licensed under the MIT license.
	//
	var $tmpl = (function() {

		var doT = { version : '0.1.7' };

		doT.templateSettings = {
			evaluate: 			/\{\{([\s\S]+?)\}\}/g,
			interpolate: 		/\{\{=([\s\S]+?)\}\}/g,
			encode: 			/\{\{!([\s\S]+?)\}\}/g,
			use: 				/\{\{#([\s\S]+?)\}\}/g, //compile time evaluation
			define: 			/\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g, //compile time defs
			conditionalStart: 	/\{\{\?([\s\S]+?)\}\}/g,
			conditionalEnd: 	/\{\{\?\}\}/g,
			varname: 'it',
			strip : true,
			append: true
		};

		function resolveDefs(c, block, def) {
			return ((typeof block === 'string') ? block : block.toString())
			.replace(c.define, function (match, code, assign, value) {
				if (code.indexOf('def.') === 0) {
					code = code.substring(4);
				}
				if (!(code in def)) {
					if (assign === ':') {
						def[code]= value;
					} else {
						eval("def[code]=" + value);
					}
				}
				return '';
			})
			.replace(c.use, function(match, code) {
				var v = eval(code);
				return v ? resolveDefs(c, v, def) : v;
			});
		}

		// todo jsperf with and without regex caching
		doT.template = function(tmpl, c, def) {
			c = c || doT.templateSettings;
			var cstart = c.append ? "'+(" : "';out+=(", // optimal choice depends on platform/size of templates
				cend  = c.append ? ")+'" : ");out+='";
			var str = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

			str = ("var out='" +
				((c.strip) ? str.replace(/\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]|(\/\*[\s\S]*?\*\/)/g, ''): str)
				.replace(/\\/g, '\\\\')
				.replace(/'/g, "\\'")
				.replace(c.interpolate, function(match, code) {
					return cstart + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + cend;
				})
				.replace(c.encode, function(match, code) {
					return cstart + code.replace(/\\'/g, "'").replace(/\\\\/g, "\\").replace(/[\r\t\n]/g, ' ') + ").toString().replace(/&(?!\\w+;)/g, '&#38;').split('<').join('&#60;').split('>').join('&#62;').split('" + '"' + "').join('&#34;').split(" + '"' + "'" + '"' + ").join('&#39;').split('/').join('&#47;'" + cend;
				})
				.replace(c.conditionalEnd, function(match, expression) {
					return "';}out+='";
				})
				.replace(c.conditionalStart, function(match, expression) {
					var code = "if(" + expression + "){";
					return "';" + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + "out+='";
				})
				.replace(c.evaluate, function(match, code) {
					return "';" + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + "out+='";
				})
				+ "';return out;")
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '\\t')
				.replace(/\r/g, '\\r')
				.split("out+='';").join('')
				.split("var out='';out+=").join('var out=');

			try {
				return new Function(c.varname, str);
			} catch (e) {
				if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
				throw e;
			}
		};

		doT.compile = function(tmpl, def) {
			return doT.template(tmpl, null, def);
		};

		return doT;
	}());



	// hyper-simplistic dom node api for html string building, used by $el for outputStrings mode
	// EXPOSED FOR TESTING ONLY, DON'T USE THIS DIRECTLY, DOES NOT ESCAPE HTML IN STRINGS
	var $node = (function() {

		var booleanProperties = {
			checked: 1,
			defaultChecked: 1,
			disabled: 1,
			multiple: 1,
			selected: 1
		};

		var lt  = "<",  gt  = ">",
			lts = "</", gts = "/>" ,
			space = " ", equo = '="',
			quo = '"';

		var directProperties = {className:'class', htmlFor:'for'};
		var selfClosing = {area:1, base:1, basefont:1, br:1, col:1, frame:1, hr:1, img:1, input:1, link:1, meta:1, param:1};

		// children toString should not include commas
		var childrenToString = function() {
			var str = "";
			$each(this, function(val) {
				if (val || val === 0) {
					str += $isString(val) ? $escapeHTML(val) : val;
				}
			});
			return str;
		};

		var node = {
			init: function() {
				this.type = "";
				this.attr = {};
				this.children = [];
				this.children.toString = childrenToString;
				// for compatibility with $el dom builder in outputStrings mode
				this.appendChild = this.append;
				this.removeAttribute = this.setAttribute = this.set;
			},
			nodeType: 1, // so we can pass the $isElement test
			append: function(nodes) {
				// no we don't do validation here, so sue me
				// this will handle a single node or an array of nodes or a mixed array of nodes and arrays of nodes
				this.children.splice.apply(this.children, $flat(this.children.length, 0, nodes));
				return this;
			},
			set: function(key, value) {
				if (key) {
					if (!$isString(key)) {
						var spec = key;
							that = this;
						// assume key is a hash of key value pairs to be added in to existing attr hash
						if (spec.id) {
							this.set("id", spec.id);
							delete spec.id;
						}

						if (spec.className) {
							this.set("className", spec["className"]);
							delete spec["className"];
						}

						$each(spec, function(val, theKey) {
							that.set(theKey, val);
						});

					} else {
						// simple key value assignment
						if (value) {
							// add/edit attribute
							// support alternate attribute names
							key = directProperties[key] || key;
							if (booleanProperties[key]) {
								if (value) {
									value = key;
								} else {
									delete this.attr[key];
								}
							}
							this.attr[key] = value;
						} else {
							// remove the attribute
							delete this.attr[key];
						}
					}
				}
				return this;
			},

			toString: function() {
				// DONT CONSOLE.log "this" in here or do anything that will call toString on this
				// it will create an infinite loop of tostring calling tostring in firefox, others??
				var str = lt + this.type;
				$each(this.attr, function(val, key) {
					if (val) {
						str += space + key + equo + val + quo;
					}
				});

				if (selfClosing[this.type]) {
					// todo support self-closing tags with and without fslash depending on a flag
					return str + gt;
				} else {
//					console.log("children tostring", this.children,  str + gt + this.children + lts + this.type + gt);
					return str + gt + this.children + lts + this.type + gt;
				}
			}
		};

		return function(type) {
			// use new to reduce memory footprint for many nodes
			var n = $new(node);
			n.type = type || "div";
			return n;
		};

	}());

	// for compatibility with $el dom builder in outputStrings mode
	var hasDocument = ("document" in root),
		useDocument = true,
		emptyString = "";

	// create nodes in real DOM or microDom from one api
	var $doc = {
		hasRealDom: function() {
			return hasDocument;
		},
		usesRealDom: function() {
			return useDocument;
		},
		useRealDom: function(bool) {
			useDocument = hasDocument ? bool : false;
			return useDocument;
		},
		createTextNode: function(str) {
			if (useDocument) {
				return document.createTextNode(str);
			} else {
				return $escapeHTML(str + emptyString);
			}
		},
		createElement: function(tag) {
			if (useDocument) {
				return document.createElement(tag);
			} else {
				return $node(tag);
			}
		}
	};

	var $el = (function() {
		// dom builder see: http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
		// modified to support dom node output or string output, for server land
		var root = this;

		var directProperties = {
			'class': 		'className',
			className: 		'className',
			defaultValue: 	'defaultValue',
			'for': 			'htmlFor',
//			html: 			'innerHTML', // these work on real dom but not on fakeDom
//			innerHTML: 		'innerHTML',
//			text: 			'textContent',
//			textContent: 	'textContent',
			value: 			'value'
		};

		var booleanProperties = {
			checked: 1,
			defaultChecked: 1,
			disabled: 1,
			multiple: 1,
			selected: 1,
			autoplay: 1,
			controls: 1,
			loop: 1
		};

		function setProperty(node, key, value) {
			var directProp = directProperties[key];
			var noValue = (!value && value !== 0);
			if (directProp && !noValue) {
				node[directProp] = (noValue ? '' : '' + value);
			} else if (booleanProperties[key]) {
				// set the attribute if true or do not add it at all
				if (value) {
					node.setAttribute(key, key);
				}
			} else if (noValue) {
				node.removeAttribute(key);
			} else {
				node.setAttribute(key, '' + value);
			}
		}

		function appendChildren(node, children) {
			if (!$isArray(children)) {
				children = [children];
			}
			$each(children, function(child, key) {
				if (child || child === 0) {
					if ($isArray(child)) {
						appendChildren(node, child);
					} else {
						if (!$isElement(child)) {
							child = $doc.createTextNode(child);
						}
						node.appendChild(child);
					}
				}
			});
		}

		var splitter = /(#|\.)/;

		function create(selector, props, children) {

			// this function is currently ugly and repeats code from elsewhere but
			// it is also the fastest I have been able to achieve by 30-100%
			if (!selector) {
				throw new Error("selector required");
			}

			var outProps,
				parts, name, len, node, i, j, l,
				tag, id, className;

			// support (selector, children) signature'
			// support (tag, children) signature
			if (typeof props === strType || $isArray(props)) {
				children = props;
				props = {};
			}

			// parse the selector and merge props
			parts = selector.split(splitter);
			tag = parts[0];
			len = parts.length;

			if (len > 2) {

				outProps = {};
				for (i=1, j=2, l=len; j<l; i+=2, j+=2) {
					name = parts[j];
					if (parts[i] === '#') {
						id = name;
					} else {
						className = className ? (className + " " + name) : name;
					}
				}

				if (id || className) {
					// properties from selector override or append to those in props
					if (props) 		{$mixin(outProps, props)}
					if (id) 		{outProps.id = id;}
					if (className) 	{outProps.className = (props && props.className) ? (className + " " + props.className) : className;} // append multiple classes
					props = outProps;
				}
			}

			id = className = null;

			// create the node
			node = $doc.createElement(tag);
			if (!useDocument) {
				props && node.set(props);
				children && node.append(children);

			} else {
				if (props) {

					props.id && setProperty(node, "id", props.id);
					props.className && setProperty(node, "class", props.className);
					$each(props, function(val, key) {
						setProperty(node, key, val);
					});
				}
				children && appendChildren(node, children);
			}
			return node;
		}

		return create;
	}());


	var $isSelector = (function() {
		var one = 1,
			maxLength = 0,
			tags = {},
			splitter = /(#|\.)/,
			whitespace = /\s+/,
			validTags = "a abbr acronym address applet area article aside audio b base basefont bdi bdo big\
						blockquote body br button canvas caption center cite code col colgroup command datalist\
						dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer\
						form frame frameset h1 head header hgroup hr html i iframe img input ins keygen kbd\
						label legend li link map mark menu meta meter nav noframes noscript object ol optgroup\
						option output p param pre progress q rp rt ruby s samp script section select small source\
						span strike strong style sub summary sup table tbody td textarea tfoot th thead time title\
						tr track tt u ul var video wbr";
						// tags list derived from http://www.w3schools.com/html5/html5_reference.asp

		$each(validTags.split(whitespace), function(str) {
			maxLength = Math.max(maxLength, str.length);
			tags[str] = one;
		});

		// its not perfect but should get the job done
		function $isSelector(string) {

			if (typeof string !== strType) {
				return false;
			}

			// spaces are not valid in selectors, must be content, this should cover 90% of content
			// a common case for content is innerHTML with tags so test for that if no space
			if ((string.indexOf(" ") > -1) || (string.indexOf("<") > -1)) {
				return false;
			}

			var parts = string.split(splitter),
				tag = parts[0];

			// is it longer than any of the valid tags or is it not a valid tag?
			if ((tag.length > maxLength) || !(tag in tags)) {
				return false;
			}

			var partsLen = parts.length,
				id = "", className = "",
				i, j, l, name, type;

			if (partsLen > 2) {
				for (i=1, j=2, l=partsLen; j<l; i+=2, j+=2) {
					name = parts[j];
					type = parts[i];
					if (type === "#") {
						id = name;
					} else {
						className = className ? className + " " + name : name;
					}
				}
			}

			return {
				tag: tag,
				id: id,
				className: className
			};
		}

		$isSelector.addTag = function(str) {
			maxLength = Math.max(maxLength, str.length);
			tags[str] = one;
		};

		return $isSelector;
	}());

	/* $dom
		dom instructions
		array == generic container for dom instructions
		object == attributes
		string == dom selector or innerHTML

		dom instruction patterns:

			[selector (String)]
			selectors begin with an html tag name optionally followed by #someId and zero or more .someClass
			a selector can be followed by any instruction another selector, an object, an array, innerHTML string

			[selector (String), innerHTML (String)]
			any string that does not look like a selector is treated as innerHTML,
			if your strings will look like a selector you can add non selector characters like so...
			invalid as innerHTML: "strong", "menu", "footer"
			valid as innerHTML: "<span>strong</span>", "menu "
			innerHTML can only be followed by a selector string

			[selector (String), children (Array)]
			an array can only be followed by a selector string

			[selector (String), attributes (Object)]
			attributes eg. {title: "my title", value: 2}
			an object can be followed by an array or a string (selector or innerHTML)

			[selector (String), attributes (Object), children (Array)]

			eg.

	var dom = [
		"div", {className: "todo " + data.done ? "done" : ""},[
			"div.display", [
				"input.check", {type: "checkbox", checked: data.done},
				"label.todo-content", data.content,
				"span.todo-destroy"
			],

			"div.edit", [
				"input.todo-input", {type: "text", value: data.content}
			],
			"ul", $map(data.items, $value)
		];
	*/

	var $dom = (function() {

		function $dom(domInstructions, preProcessedSelector) {

			if (!$isArray(domInstructions)) {
				domInstructions = $slice(arguments);
				preProcessedSelector = null;
//				throw new Error("Unexpected type, expected array but saw " + $typeof(domInstructions));
			}

			var returnNodes = [],
				tag, attributes, childNodes,
				selector, arg, type,
				id, className, step = 1, prevStep, thisStep,
				i, len = domInstructions.length;

			for (i=0; i<len; i++) {
				arg = domInstructions[i];

				prevStep = thisStep;
				thisStep = step + "-" + $typeof(arg);

				switch(thisStep) {

					// new sibling node via selector or new sibling text -------------------------------------------
					case "1-string":
						selector = preProcessedSelector || $isSelector(arg);
						if (selector) {
							tag = selector.tag;
							id = selector.id;
							className = selector.className;
							selector = preProcessedSelector = null;
							attributes = {};
							id && (attributes.id = id);
							className && (attributes.className = className);

							// create node with attributes now if final iteration
							if (i === len-1) {
								returnNodes.push($el(tag, attributes));
							}

							// we may have properties or children to add so move to step 2 for next arg
							step = 2;


						} else {
							returnNodes.push(arg + " ");
							// stay on step 1 for next arg
						}
						continue;

					case "1-element":
						returnNodes.push(arg);
						// stay on step one for next arg
						continue;

					// new sibling node/s via partial --------------------------------------------------------------
					case "1-function":
						returnNodes = returnNodes.concat(arg());
						// stay on step one for next arg
						continue;

					// add/merge attributes ------------------------------------------------------------------------
					case "2-object":
//							attributes = $mixin(attributes, arg);
						$each(arg, function(val, key) {
							attributes[key] = val;
						});
						id && (attributes.id = id);
						if (className) {
							attributes.className = arg.className ? (className + " " + arg.className) : className;  // remember we appended a space in $isSelector
						}
						// create node with attributes now if final iteration
						if (i === len-1) {
							returnNodes.push($el(tag, attributes));
						}

						id = className = null;

						// we may have a children to add so move to step 3 for next arg
						step = 3;
						continue;

					// next sibling node via selector or child string ------------------------------------------------------------------
					case "2-string":
					case "3-string":
						selector = preProcessedSelector || $isSelector(arg);

						// starting a new object
						if (selector) {
							// finish the previous object
							returnNodes.push($el(tag, attributes));

							// about to start over on step 1 lets save some work,
							// no need to parse the selector string again
							preProcessedSelector = selector;
							i--; // iterate over this arg again

						// child text
						} else {
							//create node with child text
							returnNodes.push($el(tag, attributes, arg));
						}

						// both cases are final possible step so start back on 1 for next arg
						step = 1;
						continue;

					// recursive child array -----------------------------------------------------------------------
					case "2-array":
					case "3-array":
						// this is where we do our recursion
						childNodes = $dom(arg);
						// and push the result back into the final output
						returnNodes.push($el(tag, attributes, childNodes));
						// final possible step so start back on 1 for next arg
						step = 1;
						continue;

					case "3-function":
						// this is where we do our recursion
//							childNodes = arg();
						// and push the result back into the final output
						returnNodes.push($el(tag, attributes));
						// functions in third position are treated as siblings
						// to produce children functions can be wrapped in an array
						returnNodes = returnNodes.concat(arg());
						// final possible step so start back on 1 for next arg
						step = 1;
						continue;

					default:
						throw new TypeError("No such step + type combination: " + thisStep + " - previous was " + prevStep);
				}

			}

			childNodes = attributes = null;

			// we do this down here bc for function types we do a concat which overwrites returnNodes
			returnNodes.toString = function() {
				return this.join("");
			};
			return returnNodes;
		}

		return $dom;

	}());

	var parts = {};

	/**
	 *
	 * @param name			string,
	 * @param arg			function or object
	 * @param overwrite		bool
	 * @description this function serves as a constructor, getter, setter and collection interface to partials
	 * there are multiple signatures and a plural alias that makes more sense depending on what you want to do
	 * $part("name", function(data){...}) returns undefined, saves the function under the given name so that it can be used via the following signatures
	 * $parts() returns and object that contains all the partials by name
	 * $parts("myPartial") returns a partial function(data) which if called returns a minidom
	 * $parts("myPartial", dataObject)
	 */
	function $part(name, arg, overwrite) {
		if (arguments.length === 0) {
			return parts;							// get all
		} else if (!$isString(name)) {
			throw new TypeError("Expected string for name but saw " + $typeof(name));
		}

		if (name in parts) {
			if (!arg) {
				return parts[name];					// get

			} else if ($isFunction(arg)) {
				if (overwrite) {
					return parts[name] = arg;		// update
				} else {
					throw new Error("Partial already defined for " + name + ". use overwrite flag to update");
				}
			}	else if ($isObject(arg)) {
				return function(data) {				// get instance with predefined default data object (great for nesting partials)
					return parts[name](data || arg);
				}
			}	

		} else if ($isFunction(arg)) {
			return parts[name] = arg;				// set
		} else {
			throw new Error("No such partial '"+name+"', expected a function but saw " + $typeof(arg));
		}
	}

	$part.drop = function(name) {
		delete parts[name];
	};

	$part.dropAll = function(name) {
		parts = {};
	};

	// plural alias nice for collection methods
	var $parts = $part;

	// escapeHTML -------------------------------------------------------
	// from backbone.js
	var $escapeHTML = (function() {

		// create the regexes and strings only once
		var amp = 		/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, ampStr = '&amp;',
			lt = 		/</g, ltStr = '&lt;',
			gt = 		/>/g, gtStr = '&gt;',
			quot = 		/"/g, quotStr = '&quot;',
			squot = 	/'/g, squotStr = '&#x27;',
			fslash = 	/\//g, fslashStr = '&#x2F;';

		// the escape function
		return function(string) {
			if (typeof string == strType) {
				return string.replace(amp, ampStr).replace(lt, ltStr).replace(gt, gtStr).replace(quot, quotStr).replace(squot, squotStr); //.replace(fslash, fslashStr);
			} else {
				return string;
			}
		};
	}());

	// from backbone.js
	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	function $uniqueId(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
	}

	// from backbone.js
	// Cached regex to split keys for `delegate`.
	var eventSplitter = /^(\S+)\s*(.*)$/;

	/**
	 * @param name - (string) the name of the view
	 * @param parent - a DOM node
	 * @param model - a product of $schema
	 * @param templateOrRenderFn - a doT template string or a render
	 * function(data, changes, view) which must return a dom node, the results of which will
	 * be appended to the parent node
	 * @description getter = single argument signature pass just the type string and get the
	 * view constructor
	 *
	 */
	var viewConstructorBank = {};
	function $view(type, node, model, templateOrRenderFn, events) {

		var existing = viewConstructorBank[type],
			ctorArgs = arguments, instances = [];

		// constructor getter
		if (type && arguments.length === 1 && existing) {
			return existing;

		// init a new view instance of the given, existing type
		// passing the provided model data object in the 2nd argument
		} else if (type && arguments.length === 2 && existing) {
			var modelData = node;
			if (modelData.defaults || modelData.node || modelData.model || modelData.events) {
				throw new Error("Invalid Arguments!");
			}
			return existing(modelData);

		// return a view constructor
		} else if ($isString(type) && !existing) {
			var constructor = function(modelData) {
				var renderer, update, drop, viewNode, viewModel;
				var view = $speak({
						drop: function() {
							view.model.ignore(update); 					// unsubscribe our model
							drop && $isFunction(drop) && drop(); 	// call the custom drop method if it exists
							$(view.node).remove(); 					// this will unbind event handlers
							view.tell("drop");						// emit our drop event
							$clear(view);							// final house cleaning
						},
						update: function() {
							update({}, "update", view.model);
						}
					});

				if (node && ctorArgs.length === 2 && $isObject(node)) {
					var spec = ctorArgs[1];
					events = spec.events;
					viewNode = spec.node;
					viewModel = spec.model;
					drop = spec.drop;
					templateOrRenderFn = spec.template || spec.render;
					$extend(view, spec);
				}

				if ($isString(viewNode)) { viewNode = $el(viewNode); }

				if ($isString(viewModel)) { viewModel = $model(viewModel, modelData); }

				if (!$isElement(viewNode)) {
					console.log(spec, viewNode, ctorArgs, $doc.usesRealDom());
					throw new Error("$view: parent must be a DOM node");
				}

				if (!viewModel || !$isModel(viewModel)) {
					throw new Error("$view: model argument must be a product of $model");
				}

				view.type = type;
				view.id = $uniqueId(type+"View");
				view.node = viewNode;
				view.model = viewModel;

				// define our renderer and render functions
				if ($isString(templateOrRenderFn)) {
					// in the case of a template we use extra param for template settings
					renderer = $tmpl(templateOrRenderFn);

					update = function(changes, type, rmodel) {
						view.node.innerHTML = renderer(rmodel.get());
						return view.node;
					};

				} else if ($isFunction(templateOrRenderFn)) {
					var oldContent;
					update = function(changes, type, rmodel) {
						var content = templateOrRenderFn(rmodel.get(), changes, view);

						if (content) {
							if ($isElement(content)) {
								if (oldContent) {
									view.node.replaceChild(content, oldContent);
								} else {
									view.node.appendChild(content);
								}
								oldContent = content;

							} else {
								view.node.innerHTML = content;
							}
						}

						return view.node;
					};

				} else {
					throw new Error("$view: template must be a template string or render function");
				}

				view.model.listen("change", update);

				view.init && $isFunction(view.init) && view.init();

				// from backbone.js
				// Set callbacks, where `this.callbacks` is a hash of
				//
				// *{"event selector": "callback"}*
				//
				//   {
				//    'mousedown .title': 'edit',
				//    'click .button':   'save'
				//   }
				//
				// pairs. Callbacks will be bound to the view, with `this` set properly.
				// Uses event delegation for efficiency.
				// Omitting the selector binds the event to `this.el`.
				// This only works for delegate-able events: not `focus`, `blur`, and
				// not `change`, `submit`, and `reset` in Internet Explorer.
				//view.delegateEvents = function(events) {
				if (events) {
					$(view.node).unbind('.delegateEvents' + view.id);
					for (var key in events) {
						var methodName = events[key];
						var match = key.match(eventSplitter);
						var eventName = match[1], selector = match[2];
						var method = function() {view[methodName]();};
						eventName += '.delegateEvents' + view.id;
						if (selector === '') {
							$(view.node).bind(eventName, method);
						} else {
							$(view.node).delegate(selector, eventName, method);
						}
					}
				}

				instances.push(view);

				return view;
			};

			$mixin(constructor, {
				drop: function() {
					this.dropInstances();
					instances = existing = null;
					delete viewConstructorBank[type];
					$clear(this);
					$view.tell("drop", {constructor: type});
				},

				getInstances: function() {
					// return a copy of the instances array not the real thing
					return instances;
				},

				dropInstances: function(filter) {
					var _instances = instances;

					if (filter) {
						_instances = $filter(instances, filter);
					}

					$each(_instances, function(instance) {
						instance.drop();
					});

					return this;
				}
			});

			viewConstructorBank[type] = constructor;

			return constructor;

		} else {
			console.log(arguments);
			throw new Error("Invalid Arguments!");
		}
	};

	function $views(type) {
		if (type && type in viewConstructorBank) {
			return viewConstructorBank[type];
		} else {
			return viewConstructorBank;
		}
	}

	var $isView = function(view) {
		return view && view.drop && $isFunction(view.drop) && view.node && view.model;
	};


	// ------------------------------- exports -------------------------------

	function $queue(worker, concurrency) {
		var workers = 0;
		var q = {
			tasks: [],
			concurrency: concurrency,
			saturated: null,
			empty: null,
			drain: null,
			push: function(data, callback) {
				if(data.constructor !== Array) {
					data = [data];
				}
				_async.each(data, function(task) {
					q.tasks.push({
						data: task,
						callback: typeof callback === funType ? callback : null
					});
					if (q.saturated && q.tasks.length == concurrency) {
						q.saturated();
					}
					_async.nextTick(q.process);
				});
			},
			process: function() {
				if (workers < q.concurrency && q.tasks.length) {
					var task = q.tasks.shift();
					if(q.empty && q.tasks.length == 0) q.empty();
					workers += 1;
					worker(task.data, function () {
						workers -= 1;
						if (task.callback) {
							task.callback.apply(task, arguments);
						}
						if(q.drain && q.tasks.length + workers == 0) q.drain();
						q.process();
					});
				}
			},
			length: function() {
				return q.tasks.length;
			},
			running: function() {
				return workers;
			}
		};

		return q;
	}


	// ------------------------------- exports -------------------------------
	var _scope;

	var lootedUp = false;

	var loot = function(scope) {
		loot.fn(scope);
	};

	loot.version = version;

	loot.fn = function(scope) {
		// make our public methods enumerable
		var returnScopedMethods = false;

		if (!scope) {
			returnScopedMethods = true;
			_scope = {};
		} else {
			_scope = scope;
		}

		var oldValues = {};

		$each(this.exports, function(value, key) {
			// protect old values
			var oldValue = _scope[key];
			if (oldValue) {
				oldValues[key] = oldValue;
			}
			_scope[key] = value;
		});

		this.oldValues = oldValues;

		lootedUp = true;

		if (returnScopedMethods) {
			return _scope;
		}
	};

	loot.exports = {
		// types
		$isNull: $isNull,
		$isNaN: $isNaN,
		$isElement: $isElement,
		$isObject: $isObject,
		$isPlainObject: $isPlainObject,
		$isEmptyObject: $isEmptyObject,
		$isBoolean: $isBoolean,
		$isUndefined: $isUndefined,
		$isFunction: $isFunction,
		$isString: $isString,
		$isNumber: $isNumber,
		$isDate: $isDate,
		$isRegExp: $isRegExp,
		$isArguments: $isArguments,
		$isArray: $isArray,
		$typeof: $typeof,

		// objects
		$isEmpty: $isEmpty,
		$has: $has,
		$pick: $pick,
		$keys: $keys,
		$values: $values,

		$new: $new,
		$copy: $copy,
		$merge: $merge,
		$extend: $extend,
		$mixin: $mixin,
		$make: $make,

		// collections
		$each: $each,
		$for: $each,

		$map: $map,
		$reduce: $reduce,
		$find: $find,
		$filter: $filter,
		$reject: $reject,
		$every: $all,
		$all: $all,
		$any: $any,
		$includes: $includes,
		$contains: $includes,
		$invoke: $invoke,
		$pluck: $pluck,
		$max: $max,
		$min: $min,
		$shuffle: $shuffle,
		$sortBy: $sortBy,
		$groupBy: $groupBy,
		$sortedIndex: $sortedIndex,
		$size: $length,
		$length: $length,
		$compact: $compact,
		$flat: $flat,
		$slice: $slice,
		$splice: $splice,
		$clear: $clear,

		// async
		$async: _async,
		$parallel: $parallel,
		$series: $series,

		// functions
		$bind: $bind,

		// time
		$now: $now,
		$timeAgo: $timeAgo,
		$timer: $timer,

		// messaging
		$speak: $speak,
		$isSpeaker: $isSpeaker,

		// recycling
		$recycleBin: $recycleBin,
		$recyclable: $recyclable,
		$recycle: $recycle,
		$reuse: $reuse,
		
		// traits
		$component: $component,
		$compose: $compose,
		$decompose: $decompose,

		// models
		$schema: $schema,
		$define: $schema,
		$model: $model,
		$models: $models,
		$isSchema: $isSchema,
		$isModel: $isModel,

		// views
		$view: $view,
		$views: $views,
		$isView: $isView,

		// string
		$trim: $trim,

		// misc
		$uniqueId: $uniqueId,
		$queue: $queue,

		// html
		$id: $id,
		$tmpl: $tmpl,
		$node: $node,
		$doc: $doc,
		$el: $el,
		$isSelector: $isSelector,
		$dom: $dom,
		$part: $part,
		$parts: $parts,
		$escapeHTML: $escapeHTML
	};

	loot.addExport = function(name, obj) {
		if(this.exports[name]) {
			throw new Error("loot.addExport: " + name + " is already taken.");
		}

		this.exports[name] = obj;

		if (_scope && _scope[name]) {
			this.oldValues[name] = _scope[name];
		}

		if (lootedUp) {
			_scope[name] = obj;
		}
	};

	loot.extend = function(name, obj) {

		if (typeof name == "string") {
			this.addExport(name, obj);

		// handle multiple plugins if first arg is object
		} else if (arguments.length == 1 && typeof arguments[0] == "object") {
			obj = arguments[0];
			for (name in obj) {
				this.addExport(name, obj);
			}
		}
	};

	// Establish the root object, `window` in the browser, or `global` on the server.
	if (this.loot) {
		loot.oldLoot = this.loot;
	}
	this.loot = loot;
	loot(this);
}());


loot.extend("$io", loot.exports.$speak(function(url, req, dataType, reqType) {

	var key = $cache.getKey(url, req),
		parent = $isSpeaker(this) ? this : $io,
		typeId = parent.typeId || "io",
		lastArg = arguments[arguments.length-1],
		handlers = (!lastArg || $isString(lastArg) || $isBoolean(lastArg)) ? {} : lastArg,
		startH = handlers.start,
		successH = handlers.success,
		errorH = handlers.error,
		useCache = (typeId === "io") ? false : true,
		bin = useCache ? $cache.get(typeId, url, req) : null;

	var xhr = $.ajax({
			dataType: 	$isString(dataType) ? dataType : "json",
			type: 		$isString(reqType) ? reqType : "post",
			url: 		url,
			data: 		req,

			success: function(val, textStatus, xhr) {
				var msg = useCache ?
							$cache.set(typeId, url, req, val, {xhr: xhr}) :
							{val: val, xhr: xhr, url: url, req: req};

				if ($isFunction(successH)) {
					successH.call(parent, msg, typeId + ":success:" + url);
				}

				parent.tell(typeId + ":success:" + url, msg);
			},

			error: function(xhr, textStatus, error) {
				var err = {
					status: textStatus,
					key: key,
					error: error,
					req: req,
					xhr: xhr
				};

				if (useCache) {
					err.bin = bin;
					err.key = key;
				}

				if ($isFunction(errorH)) {
					errorH.call(parent, err, typeId + ":error:" + url);
				}

				parent.tell(typeId + ":error:" + url, err);
			}
		});

	if (useCache) {
		bin.xhr = xhr;
	}

	if ($isFunction(startH)) {
		startH.call(parent, bin, typeId + ":start:" + url);
	}

	parent.tell(typeId + ":start:" + url, bin);

	return bin;
}));