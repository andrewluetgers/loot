(function() {

	var version = "@@version";

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
//		unshift 				= ArrayProto.unshift,
		toString 				= ObjProto.toString,
		hasOwnProperty 			= ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var nativeForEach 			= ArrayProto.forEach,
//		nativeMap  				= ArrayProto.map,
		nativeReduce 			= ArrayProto.reduce,
//		nativeReduceRight 		= ArrayProto.reduceRight,
		nativeFilter 			= ArrayProto.filter,
		nativeEvery 			= ArrayProto.every,
		nativeSome 				= ArrayProto.some,
		nativeIndexOf 			= ArrayProto.indexOf,
		nativeIsArray 			= Array.isArray,
		nativeKeys 				= Object.keys,
		nativeBind 				= FuncProto.bind;

	// basic types -------------------------------------------------------
	// stolen wholesale from underscore
	function $isNull		(obj) { 	return obj === null;}
	function $isNaN			(obj) { 	return obj !== obj;}
	function $isElement		(obj) { 	return !!(obj && obj.nodeType == 1);}
	function $isObject		(obj) { 	return obj === Object(obj); }
	function $isBoolean		(obj) { 	return obj === true || obj === false || toString.call(obj) == "[object Boolean]";}
	function $isUndefined	(obj) { 	return typeof obj === "undefined";}
	function $isFunction	(obj) { 	return typeof obj === "function";}
	function $isString		(obj) { 	return typeof obj === "string";}
	function $isNumber		(obj) { 	return toString.call(obj) === "[object Number]";}
	function $isDate		(obj) { 	return toString.call(obj) === "[object Date]";}
	function $isRegExp		(obj) { 	return toString.call(obj) === "[object RegExp]";}
	function $isError		(obj) { 	return toString.call(obj) === "Error";}

	function $isArguments	(obj) { 	return toString.call(obj) === "[object Arguments]";}
	if (!$isArguments(arguments)) {
		$isArguments = function(obj) { 	return !!(obj && $has(obj, "callee"));};
	}

	var $isArray = nativeIsArray ||
			function(obj) { 			return toString.call(obj) == "[object Array]";};

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
		var type = typeof obj, str;

		switch(type) {
			case "object":
				if (obj === null) { 											return "null";}
				else if ($isArray(obj)) { 										return "array";}
				else if ((str = toString.call(obj)) === "[object RegExp]") { 	return "regexp";}
				else if ($isArguments(obj)) { 									return "arguments";}
				else if (!!(obj && obj.nodeType == 1)) { 						return "element";}
				else if (str === "Error") {										return "error";}
				else if (str === "[object Date]") { 							return "date";}
				else {															return "object";} // this should be last
				break;

			case "number":
				if (obj !== obj) {
					return "NaN";
				} else {
					return "number"
				}
				break;

			default:
				return type;
		}
	}

	// trim string -------------------------------------------------------
	// type agnostic string trim, just returns the original val if its not a string
	var trimRe = /^\s+|\s+$/g;
	function $trim(str) {
		if ($isString(str)) {
			return str.replace(trimRe,'');
		} else {
			return str;
		}
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

	function $has(obj, key) { return hasOwnProperty.call(obj, key); }

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
			if (typeof obj === "number") {
				var arr = [];
				for (i = 0, l = parseInt(obj); i < l; i++) {
					arr[i] = i;
					if (iterator.call(context, i, i, arr) === breaker) return;
				}
			}
			if (obj.length === +obj.length) {
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

		each.break = each.breaker = breaker;
		each.nativeForEach = nativeForEach;
		each.hasOwnProperty = hasOwnProperty;

		return each;

	}());


	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native "map" if available.


	function $map(obj, iterator, context) {

		var results = [];

		if (obj) {
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
		}

		return results;
	}

	function $value(val) {return val;}

 // **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	function $reduce(obj, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (obj == null) { obj = []; }
		if (nativeReduce && obj.reduce === nativeReduce) {
			if (context) { iterator = $bind(iterator, context); }
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


	// Return the first value which passes a truth test.
	function $find(obj, iterator, context) {
		var result;
		$any(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	}

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
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
			return obj.indexOf(target) != -1;
		}
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
	if (!iterator && $isArray(obj) && obj[0] === +obj[0]) {return Math.max.apply(Math, obj);}
		if (!iterator && $isEmpty(obj)) {return -Infinity;}
		var result = {computed : -Infinity};
		$each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed >= result.computed && (result = {value : value, computed : computed});
		});
		return result.value;
	}

	// Return the minimum element (or element-based computation).
	function $min(obj, iterator, context) {
		if (!iterator && $isArray(obj) && obj[0] === +obj[0]) {return Math.min.apply(Math, obj);}
		if (!iterator && $isEmpty(obj)) {return Infinity;}
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
				index: index,
				criteria : iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria, b = right.criteria;
				if (a !== b) {
					if (a > b || a === void 0) return 1;
					if (a < b || b === void 0) return -1;
				}
				return left.index < right.index ? -1 : 1;
		}), 'value');
	}


	var $naturalSort = (function() {

		/*
		 * Natural Sort algorithm for Javascript - Version 0.6 - Released under MIT license
		 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
		 * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
		 * http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
		 * http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
		 */
		function naturalSort (a, b) {
			var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
				sre = /(^[ ]*|[ ]*$)/g,
				dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
				hre = /^0x[0-9a-f]+$/i,
				ore = /^0/,
			// convert all to strings and trim()
				x = a.toString().replace(sre, '') || '',
				y = b.toString().replace(sre, '') || '',
			// chunk/tokenize
				xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
				yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
			// numeric, hex or date detection
				xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
				yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;
			// first try and sort Hex codes or Dates
			if (yD)
				if ( xD < yD ) return -1;
				else if ( xD > yD )	return 1;
			// natural sorting through split numeric strings and default strings
			for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
				// find floats not starting with '0', string or 0 if not defined (Clint Priest)
				oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
				oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
				// handle numeric vs string comparison - number < string - (Kyle Adams)
				if (isNaN(oFxNcL) !== isNaN(oFyNcL)) return (isNaN(oFxNcL)) ? 1 : -1;
				// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
				else if (typeof oFxNcL !== typeof oFyNcL) {
					oFxNcL += '';
					oFyNcL += '';
				}
				if (oFxNcL < oFyNcL) return -1;
				if (oFxNcL > oFyNcL) return 1;
			}
			return 0;
		}

		return function(arr, by) {
			if ($isArray(arr)) {
				return arr.sort(naturalSort);
			} else {
				throw new Error("expected arry but saw " + $typeof(arr));
			}
		}

	}());

	// An internal function to generate lookup iterators.
	var lookupIterator = function(value) {
		return $isFunction(value) ? value : function(obj){ return obj[value]; };
	};

	// An internal function used for aggregate "group by" operations.
	var group = function(obj, value, context, behavior) {
		var result = {};
		var iterator = lookupIterator(value);
		$each(obj, function(value, index) {
			var key = iterator.call(context, value, index, obj);
			behavior(result, key, value);
		});
		return result;
	};

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	function $groupBy(obj, value, context) {
		return group(obj, value, context, function(result, key, value) {
			($has(result, key) ? result[key] : (result[key] = [])).push(value);
		});
	}

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	function $countBy(obj, value, context) {
		return group(obj, value, context, function(result, key, value) {
			if (!$has(result, key)) result[key] = 0;
			result[key]++;
		});
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


	// Trim out all falsey values from an array or object.
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
		if (arguments.length > 3 || typeof obj === "string") {
			return splice.apply(obj, $flat($slice(arguments, 1)));
		} else {
			return splice.call(obj, start, howMany);
		}
	}

	function $clear(obj) {
		if ($isArray(obj)) {
			obj.length = 0;
		}

		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				delete obj[key];
			}
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

			if ($isFunction(newInstance.init)) {
				newInstance.init();
			} else {
				// fix any uglyness that may have come through in the inits array
				var inits = $filter($flat(newInstance.init), $isFunction);

				// support single init functions or arrays of them
				newInstance.init = (inits.length > 1) ? inits : inits[0];

				// call the init methods using the new object for "this"
				$each(inits, function(fn) {
					fn.call(newInstance);
				});
			}
		}

		return newInstance;
	}

	/**
	 * @param obj (object) the object to read properties from
	 * @param handler (function) function(value, key, obj) { return boolean; }
	 * traverse an object calling a handler on each "owned" property
	 * do so with depth first top down order by default
	 * optionally can choose breadthFirst and or reversing the order of execution
	 */
	function $walk(obj, handler, isBreadthFirst, isReverseOrder) {
		if (typeof obj !== "object" || $isNull(obj)) {
			throw new Error("traverse source must be an object");
		}

		if (!$isFunction(handler)) {
			throw new Error("traverse handler must be a function");
		}

		var exec,
			res = {
				breadthFirst: [],
				depthFirst: [],
				siblings: []
			};

		_walk(obj, handler, -1, isBreadthFirst, isReverseOrder, res);

		// finalize the bread-first list
		res.siblings = res.breadthFirst;
		res.breadthFirst = $flat(res.breadthFirst);

		if (isBreadthFirst) {
			exec = res.breadthFirst;
		} else {
			exec = res.depthFirst;
		}

		if (isReverseOrder) {exec = exec.reverse();}

		$each(exec, function(obj) {obj.fn();});

		return res;
	}

	// does the actual work for $walk
	function _walk(obj, handler, depth, isBreadthFirst, isReverseOrder, res) {
		depth++;
		var key, val,
			depthFirst = res.depthFirst,
			breadthFirst = res.breadthFirst,
			siblings = [],
			levels = [];

		if (!breadthFirst[depth]) {
			// init the breadthFirst per-level calls array
			breadthFirst[depth] = levels;
		} else {
			levels = breadthFirst[depth];
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				val = obj[key];

				// capture closure values in a new context for later access
				(function(v, k, d) {
					// a function we can call later that would be tha same as calling it now
					var fn = function() {handler(v, k, d);};
					var theObj = {val: v, key: k, depth: d, fn: fn};
					depthFirst.push(theObj);
					siblings.push(theObj);
				} (val, key, depth));

				// recursive call
				if (typeof val === "object" && !$isNull(val)) {
					// todo check for cycles!
					_walk(val, handler, depth, isBreadthFirst, isReverseOrder, res);
				}
			}
		}

		levels.push(siblings);

		depth--;
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

			// todo check for cycles from arbitrary parents using an array of objects as a set and
			// indexOf to test if an object has been visited yet
			if (filter && !filter(key, source, target)) {
				continue;
			}

			sourceProp = source[key];

			// Prevent infinite loop
			if (sourceProp === target) {
				continue;
			}

			// todo make the more specific for various types
			if (typeof sourceProp === "object" && !$isNull(sourceProp)) {
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
					handlerExistsForTopic = false,
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
								handlerExistsForTopic = true;
								return $each.break;
							}
						});

						if (!handlerExistsForTopic) {
							topicSpecificListeners.push({
								responder: responder,
								responses: 0,
								maxResponses: maxResponses
							});

							this._listeningFor[topic] = topicSpecificListeners;
						}

					} else {
						throw new Error("Invalid parameters, expected: (string, function) but saw (" + topicType + ", " +responderType +")");
					}

				// handle listen({event:handler, event2:handler2, ...}) signature
				} else if (typeof topic === "object") {
					// call self for each function if given a map of callbacks instead of a single function
					$each(topic, function(listener, topic) {
						if ($isFunction(listener)) {
							// maxResponses is not supported in object map signature
							that.listen(topic, listener);
						}
					});
				}

				return this;
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
			 * @responder (function) optional callback if provided with a topic
			 * only that instance of the responder that is bound to the given topic will be ignored
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
			if (obj === root) {
				throw new Error("cannot make js context root a speaker");
			}
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

			obj._listeningFor = {};
			obj._audience = [];

			return obj;
		}

		return speak;

	}());


	function $isSpeaker(obj) {
		return !!(obj && $isFunction(obj.tell) && $isFunction(obj.listen));
	}


	// from backbone.js
	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	function $uniqueId(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
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
		$isError: $isError,
		$typeof: $typeof,

		// string
		$trim: $trim,

		// functions
		$bind: $bind,

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
		$value: $value,
		$max: $max,
		$min: $min,
		$shuffle: $shuffle,
		$sortBy: $sortBy,
		$naturalSort: $naturalSort,
		$groupBy: $groupBy,
		$countBy: $countBy,
		$sortedIndex: $sortedIndex,
		$size: $length,
		$length: $length,
		$compact: $compact,
		$flat: $flat,
		$slice: $slice,
		$splice: $splice,
		$clear: $clear,

		// objects
		$isEmpty: $isEmpty,
		$has: $has,
		$pick: $pick,
		$keys: $keys,
		$values: $values,
		$new: $new,
		$walk: $walk,
		$copy: $copy,
		$merge: $merge,
		$extend: $extend,
		$mixin: $mixin,
		$make: $make,

		// messaging
		$speak: $speak,
		$isSpeaker: $isSpeaker,

		// misc
		$uniqueId: $uniqueId
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
				this.addExport(name, obj[name]);
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