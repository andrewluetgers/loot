/*
 * loot.js 0.1.0
 * (c) andrew luetgers
 * you are free to distribute loot.js under the MIT license
 * https://github.com/andrewluetgers/loot
 */

(function() {

	var version = "0.1.0";

	var root = this;

	// language shims -------------------------------------------

	// Extend the String prototype to include a splice method.
	// This will use an Array-based splitting / joining approach
	if (!("splice" in String.prototype)) {
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

	if (!Object.keys) {
		Object.keys = function(o) {
			var keys=[], p;

			if (o !== Object(o)) {
				throw new TypeError('Object.keys called on non-object');
			}

			for(p in o) {
				if(Object.prototype.hasOwnProperty.call(o,p)) {
					keys.push(p);
				}
			}

			return keys;
		};
	}


	// basic types -------------------------------------------------------
	// stolen wholesale from underscore

	// Is a given value a number?
	function $isNumber(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	}

	// Is a given array or object empty?
	function $isEmpty(obj) {
		if ($isArray(obj) || $isString(obj)) return obj.length === 0;
		for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
		return true;
	}



	// Is a given value a DOM element?
	function $isElement(obj) {
		return (obj && obj.nodeType == 1);
	}

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	var $isArray = Array.isArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};

	// Is a given value a function?
	function $isFunction(obj) {
		return (obj && obj.constructor && obj.call && obj.apply);
	}

	// Is a given value a string?
	function $isString(obj) {
		return (obj === '' || (obj && obj.charCodeAt && obj.substr));
	}

	// Is a given value a number?
	function $isNumber(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	}

	// Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
	// that does not equal itself.
	function $isNaN(obj) {
		return obj !== obj;
	}

	function $isNull(obj) {
		return obj === null;
	}

	// Is a given value a boolean?
	function $isBoolean(obj) {
		return obj === true || obj === false;
	}

	// Is the given value a regular expression?
	function $isRegExp(obj) {
		return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
	}

	// collections (objects, arrays) -------------------------------------------------------
	var arrayProto = Array.prototype;

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


	// the underscore each function
	var $each = (function() {

		// switched breaker to string "break" for better self documentation when used
		var breaker = "break",
			nativeForEach = Array.prototype.forEach,
			hasOwnProperty = Object.prototype.hasOwnProperty,
			i, l, key;

		function each(obj, iterator, context) {
			if (!obj) return;

			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);

			} else if ($isNumber(obj.length)) {
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

	var $keys = function(obj) {
		var keys = [];
		$each(obj, function(val, key) {
			keys.push(key);
		});
		return keys;
	};
	

	var nativeMap = arrayProto.map;

	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native "map" if available.
	function $map(obj, iterator, context) {

		var results = $isArray(obj) ? [] : {};

		if (!obj) {
			return results;
		}

		if (nativeMap && obj.map === nativeMap) {
			return obj.map(iterator, context);
		}

		$each(obj, function(value, index, list) {
			results[index] = iterator.call(context, value, index, list);
		});

		return results;
	}


	var nativeSome = Array.prototype.some;

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

	function $all(obj, iterator, context) {
		var results = $find(obj, iterator, context);
		return $length(obj) === results.length;
	}

	// Return all the elements for which a truth test passes.
	function $find(obj, iterator, context) {
		var results = $isArray(obj) ? [] : {};
		if (!obj) return results;
		$each(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) results.push(value);
		});
		return results;
	}

	// Return all the elements for which a truth test fails.
	function $reject(obj, iterator, context) {
		var results = $isArray(obj) ? [] : {};
		if (!obj) return results;
		$each(obj, function(value, index, list) {
			if (!iterator.call(context, value, index, list)) results[index] = value;
		});
		return results;
	}

	function $length(item) {
		var len = item && item.length;
		if (!$isNumber(len)) {
			len = 0;
			$each(item, function(){len++});
		}
		return len;
	}

	// flatten arrays recursively
	function $flat() {
		var flatArray = arrayProto.concat.apply(arrayProto, arguments);
		return $any(flatArray, $isArray) ? $flat.apply(this, flatArray) : flatArray;
	}

	var slice = Array.prototype.slice;
	function $slice(obj, start, end) {
		return slice.call(obj, start || 0, end);
	}

	var splice = Array.prototype.splice;
	function $splice(obj, start, howMany) {
		// slice creates garbage, lets not do that if we don't have to
		if (arguments.length > 3 || typeof obj === "string") {
			return splice.apply(obj, $flat($slice(arguments, 1)));
		} else {
			return splice.call(obj, start, howMany);
		}
	}


	// async functions taken from https://github.com/caolan/async with some modifications
	// each and series support iterating over objects as well as arrays

	var _async = {
		each: function(obj, iterator, callback) {
			var len = $length(obj), i = 0;
			callback = callback || function() {};

			if (!len) {
				return callback();
			}
			
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
			var next, keys = $keys(obj),
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

		// nextTick implementation with browser-compatible fallback
		nextTick: (function() {
			if (typeof process === 'undefined' || !(process.nextTick)) {
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
		},

		// to be ued for async.limit and async.limitSeries
		queue: function(worker, concurrency) {
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
					_forEach(data, function(task) {
						q.tasks.push({
							data: task,
							callback: typeof callback === 'function' ? callback : null
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
	var $parallel = function(tasks, callback) {
		// first signature: a set of async functions to call, is converted to second signature format, no final callback is used
		if ($isFunction(tasks)) {
			tasks = $slice(arguments);
			callback = function(){};
		}

		// second signature: array of functions and final callback
		if ($isArray(tasks) && $isFunction(tasks[0])) {
			_async.tasks(tasks, callback);

		// third signature: async for each
		} else {
			var iterator = callback;
			_async.map(tasks, iterator, arguments[2]);
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
			var iterator = callback;
			_async.mapSeries(tasks, iterator, arguments[2]);
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

	// object -------------------------------------------------------
	
	// use the same constructor every time to save on memory usage per
	// http://oranlooney.com/functional-javascript/
	function F() {}

	function $new(prototype, ignoreInit) {

		F.prototype = prototype || {};

		var newInstance = new F();

		if(!ignoreInit && newInstance.init) {

			// fix any uglyness that may have come through in the inits array
			var inits = $find($flat(newInstance.init), $isFunction);

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
	 * serves as a utility method for deepCopy and deepMerge
	 * @param source (object) the object to copy properties from
	 * @param target (object) optional object to merge source's properties into
	 * @param filter (function) optional function(key, source, target) { return boolean; }
	 *  the filter function returns true if a property should be copied and false if it should be ignored
	 *  filter can also be provided as the last of two arguments when omitting a target
	 *  filter example: to deep copy only owned properties from objA to objB
	 *  	$copy(objA, objB, function(key, source) {
	 *  		return source.hasOwnProperty(key);
	 *  	});
	 */
	function copy(source, target, filter) {
		var key, sourceProp, targetProp,
			targetType = typeof target;

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

			if (typeof sourceProp === 'object' && !$isNull(sourceProp)) {
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
			inits = $find($flat(inits), $isFunction);

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
	 *
	 * Adopted from the John Resig's pretty.js
	 * at http://ejohn.org/blog/javascript-pretty-date
	 * and henrah's proposed modification
	 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
	 *
	 * Licensed under the MIT license.
	 */

	// modified by andrew luetgers to accept timestamps

	function $timeAgo(date, compareTo) {

		function normalizeDateInput(date) {
			switch (typeof date) {

				case "string":
					date = new Date(('' + date).replace(/-/g,"/").replace(/[TZ]/g," "));
					break;

				case "number":
					date = new Date(date);
					break;
			}

			return date;
		}

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
			isString = typeof date == 'string',
			date = normalizeDateInput(date),
			compareTo = normalizeDateInput(compareTo || new Date),
			seconds = (compareTo - date +
						(compareTo.getTimezoneOffset() -
							// if we received a GMT time from a string, doesn't include time zone bias
							// if we got a date object, the time zone is built in, we need to remove it.
							(isString ? 0 : date.getTimezoneOffset())
						) * 60000
					) / 1000,
			token;

		if(seconds < 0) {
			seconds = Math.abs(seconds);
			token = '';
		} else {
			token = ' ' + lang.ago;
		}

		/*
		 * 0 seconds && < 60 seconds        Now
		 * 60 seconds                       1 Minute
		 * > 60 seconds && < 60 minutes     X Minutes
		 * 60 minutes                       1 Hour
		 * > 60 minutes && < 24 hours       X Hours
		 * 24 hours                         1 Day
		 * > 24 hours && < 7 days           X Days
		 * 7 days                           1 Week
		 * > 7 days && < ~ 1 Month          X Weeks
		 * ~ 1 Month                        1 Month
		 * > ~ 1 Month && < 1 Year          X Months
		 * 1 Year                           1 Year
		 * > 1 Year                         X Years
		 *
		 * Single units are +10%. 1 Year shows first at 1 Year + 10%
		 */

		function normalize(val, single) {
			var margin = 0.1;
			if(val >= single && val <= single * (1+margin)) {
				return single;
			}
			return val;
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
					topicIsString = (topicType == "string"),
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
				} else if (typeof topic === "object") {
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
		return (obj && $isFunction(obj.tell) && $isArray(obj._audience));
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
		for (key in modelVals) {
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
		if (typeof obj === "string") {
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
					validationResult = validateFn(val);
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
	function $schema(type, options) {
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

			var schema = $speak({
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
						_instances = $find(instances, filter);
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
					var that = this;

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

			schemaBank[type] = schema;


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
		} else if (vals && ($isArray(vals) || $isString(vals) || $isBoolean(vals) || $isFunction(vals) || $isRegExp(vals)|| $isNumber(vals))) {
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

		doT.template = function(tmpl, c, def) {
			c = c || doT.templateSettings;
			var cstart = c.append ? "'+(" : "';out+=(", // optimal choice depends on platform/size of templates
				cend   = c.append ? ")+'" : ");out+='";
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
					return "';" + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ')  + "out+='";
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
	var $node = (function() {

		var directProperties = {className:'class', htmlFor:'for'};
		var selfClosing = {area:1, base:1, basefont:1, br:1, col:1, frame:1, hr:1, img:1, input:1, link:1, meta:1, param:1};

		// children toString should not include commas
		var childrenToString = function() {
			var str = "";
			$each(this, function(val) {
				str += $isString(val) ? $escapeHTML(val) : val;
			});
			return str;
		};

		var node = {
			init: function() {
				this.type = "div";
				this.attr = {};
				this.children = [];
				this.children.toString = childrenToString;

				// for compatability with $el dom builder in outputStrings mode
				this.appendChild = this.append;
				this.removeAttribute = this.setAttribute = this.set;
			},
			nodeType: 1, // so we can pass the $isNode test
			append: function(nodes) {
				// no we don't do validation here, so sue me
				// this will handle a single node or an array of nodes or a mixed array of nodes and arrays of nodes
				this.children.splice.apply(this.children,  $flat(this.children.length, 0, nodes));
				return this;
			},
			set: function(key, value) {
				if (key) {
					if (!$isString(key)) {
						// assume key is a hash of key value pairs to be added in to existing attr hash
						var spec = key, that = this;
						$each(spec, function(val, theKey) {
							that.set(theKey, val);
						});
					} else {
						// simple key value assignment
						if (value !== null && value !== undefined && value !== "") {
							// add/edit attribute
							// support alternate attribute names
							key = directProperties[key] || key;
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
				var str = "<" + this.type;
				$each(this.attr, function(val, key) {
					str += ' ' + key + '="' + val + '"';
				});

				if (selfClosing[this.type]) {
					return str + "/>";
				} else {
					return str + ">" + this.children + "</" + this.type + ">";
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
	var $doc = {
		createTextNode: function(str) {
			return str;
		},
		createElement: $node
	};

	// dom builder see: http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
	// modified to support dom node ouput or string output, for server land
	var $el = (function () {
		var root = this;
		var doc = this.document || $doc;

		var directProperties = {
			'class': 		'className',
			className: 		'className',
			defaultValue: 	'defaultValue',
			'for': 			'htmlFor',
			html: 			'innerHTML',
			text: 			'textContent',
			value: 			'value'
		};

		var booleanProperties = {
			checked: 1,
			defaultChecked: 1,
			disabled: 1,
			multiple: 1,
			selected: 1
		};

		var setProperty = function (el, key, value) {
			var prop = directProperties[key];
			if (prop) {
				el[prop] = (value == null ? '' : '' + value);
			} else if (booleanProperties[key]) {
				el[key] = !!value;
			} else if ( value == null ) {
				el.removeAttribute(key);
			} else {
				el.setAttribute(key, '' + value);
			}
		};

		var appendChildren = function (el, children) {
			$each(children, function(node) {
				if (node) {
					if ($isArray(node)) {
						appendChildren(el, node);
					} else {
						if ($isString(node)) {
							node = doc.createTextNode(node);
						}
						el.appendChild(node);
					}
				}
			});
		};

		var splitter = /(#|\.)/;

		function create(tag, props, children) {

			props = props || {};

			var parts, name, len, el, i, j, l;

			// support (tag, children) signature
			if ($isArray(props)) {
				children = props;
				props = {};
			}

			parts = tag.split(splitter);
			tag = parts[0];
			len = parts.length;

			if (len > 2) {

				for (i=1, j=2, l=len; j<l; i+=2, j+=2) {
					name = parts[j];
					if (parts[i] === '#') {
						props.id = name;
					} else {
						props.className = props.className ? props.className + ' ' + name : name;
					}
				}
			}

			el = doc.createElement(tag);

			if (_outputStrings) {
				props && el.set(props);
				children && el.append(children);

			} else {
				props && $each(props, function(val, key) {
					setProperty(el, key, val);
				});
				children && appendChildren(el, children);
			}
			return el;
		}

		var _outputStrings = false;

		create.outputStrings = function(outputStrings) {
			_outputStrings = outputStrings;
			if (!outputStrings) {
				doc = root.document || $doc;
			} else {
				doc = $doc;
			}
		};

		create.outputMode = function() {
			return _outputStrings ? "string" : "DOM";
		};

		return create;

	}());


	// escapeHTML -------------------------------------------------------
	// from backbone.js
	var $escapeHTML = (function() {

		// create the regexes only once
		var amp = 		/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,
			lt = 		/</g,
			gt = 		/>/g,
			quot = 		/"/g,
			squot = 	/'/g,
			fslash = 	/\//g;

		// the escape function
		return function(string) {
			return string.replace(amp, '&amp;').replace(lt, '&lt;').replace(gt, '&gt;').replace(quot, '&quot;').replace(squot, '&#x27;').replace(fslash,'&#x2F;');
		};
	}());



	/**
	 *
	 * @param parent - a DOM node
	 * @param model - a product of $schema
	 * @param templateOrRenderFn - a doT template string or a render function(data, changes, view) which must return a dom node, the results of which will be appended to the parent node
	 * @description single argument signature
	 *
	 */
	var $view = function(node, model, templateOrRenderFn) {

		var view = $speak(),
			renderer, update, drop;

		if (node && arguments.length === 1) {
			var spec = arguments[0];
			node = spec.node;
			model = spec.model;
			drop = spec.drop;
			templateOrRenderFn = spec.template || spec.render;

			$extend(view, spec);
		}

		if(!$isElement(node)) {
			throw new Error("$view: parent must be a DOM node");
		}

		if(!model || !$isModel(model)) {
			throw new Error("$view: model argument must be a product of $model");
		}

		view.node = node;
		view.model = model;

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
							node.replaceChild(content, oldContent);
						} else {
							node.appendChild(content);
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

		view.drop = function() {
			model.ignore(update);
			drop && $isFunction(drop) && drop();
			this.tell("drop");
			$clear(this);
		};


		view.update = function() {
			update({}, "update", this.model);
		};

		model.listen("change", update);

		view.init && $isFunction(view.init) && view.init();

		return view;
	};

	var $isView = function(view) {
		return view && view.drop && $isFunction(view.drop) && view.node && view.model;
	};



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
		$isNumber: $isNumber,
		$isEmpty: $isEmpty,
		$isElement: $isElement,
		$isArray: $isArray,
		$isFunction: $isFunction,
		$isString: $isString,
		$isNaN: $isNaN,
		$isNull: $isNull,
		$isBoolean: $isBoolean,
		$isRegExp: $isRegExp,

		// collections
		$clear: $clear,
		$each: $each,
		$keys: $keys,
		$map: $map,
		$any: $any,
		$all: $all,
		$find: $find,
		$reject: $reject,
		$length: $length,
		$flat: $flat,
		$slice: $slice,
		$splice: $splice,

		// async
		$async: _async,
		$parallel: $parallel,
		$series: $series,

		// objects
		$new: $new,
		$copy: $copy,
		$merge: $merge,
		$extend: $extend,
		$mixin: $mixin,
		$make: $make,

		// time
		$now: $now,
		$timeAgo: $timeAgo,

		// messaging
		$speak: $speak,
		$isSpeaker: $isSpeaker,

		// recycling
		$recycleBin: $recycleBin,
		$recyclable: $recyclable,
		$recycle: $recycle,
		$reuse: $reuse,

		// models
		$define: $schema,
		$schema: $schema,
		$model: $model,
		$models: $models,
		$isSchema: $isSchema,
		$isModel: $isModel,

		// string
		$trim: $trim,

		// html
		$id: $id,
		$tmpl: $tmpl,
		$node: $node,
		$el: $el,
		$escapeHTML: $escapeHTML,

		// views
		$view: $view,
		$isView: $isView

	};

	loot.addExport = function(name, obj) {
		if(this.exports[name]) {
			throw new Error("loot.addExport: " + name + "is already taken.");
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
			for (name in  obj) {
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