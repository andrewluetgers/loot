/*
 * loot.js 0.3.1 03-25-2013
 * copyright (c) 2013 Andrew Luetgers
 * you are free to distribute loot.js under the MIT license
 * https://github.com/andrewluetgers/loot
 */


(function() {

	var version = "0.3.1";

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
	var nativeReduce 			= ArrayProto.reduce,
//		nativeReduceRight 		= ArrayProto.reduceRight,
		nativeFilter 			= ArrayProto.filter,
		nativeEvery 			= ArrayProto.every,
		nativeSome 				= ArrayProto.some,
		nativeIndexOf 			= ArrayProto.indexOf,
		nativeIsArray 			= Array.isArray,
//		nativeKeys 				= Object.keys,
		nativeBind 				= FuncProto.bind;

	// basic types -------------------------------------------------------
	var typeStr = {lo: {}, ob: {}},
		strUp = "", strLo = "", one = 1, three = 3, error = "Error",
		typeStringsCap = ("Arguments Array Boolean Date Element Error Function "+
			"Null Number Object RegExp String NaN Undefined").split(" ");

	for (var i=0; i<typeStringsCap.length; i++) {
		strUp = typeStringsCap[i];
		strLo = strUp.toLowerCase();
		typeStr.lo[strLo.substr(0, 3)] = strLo;
		typeStr.ob[strLo.substr(0, 3)] = "[object " + strUp + "]";
	}

	// a garbage free typeof function derived from the one used in qunit
	function $typeof(obj) {
		var lo = typeStr.lo,
			ob = typeStr.ob,
			t = typeof obj;

		if (t === lo.str) {return t;}
		if (t === lo.und) {return t;}
		if (obj === null) {return lo.nul;}
		if (obj.nodeType === one) {return lo.ele;}

		switch (toString.call(obj)) {
			case ob.num:	return (obj === obj) ? lo.num : lo.nan;
			case ob.boo:	return lo.boo;
			case ob.arr:	return lo.arr;
			case ob.dat:	return lo.dat;
			case ob.reg:	return lo.reg;
			case ob.fun:	return lo.fun;
			case ob.arg:	return lo.arg;
		}
		return $isString(obj) ? lo.str : t;
	}

	var lo = typeStr.lo, ob = typeStr.ob;

	// stolen wholesale from underscore
	function $isNull		(obj) { 	return obj === null;}
	function $isNaN			(obj) { 	return obj !== obj;}
	function $isElement		(obj) { 	return (obj && obj.nodeType == one);}
	function $isTextNode	(obj) { 	return (obj && obj.nodeType == three);}
	function $isObject		(obj) { 	return obj === Object(obj) && obj.constructor !== String; }
	function $isBoolean		(obj) { 	return obj === true || obj === false || toString.call(obj) == ob.boo;}
	function $isUndefined	(obj) { 	return typeof obj === lo.und;}
	function $isFunction	(obj) { 	return typeof obj === lo.fun;}
	function $isString		(obj) { 	return obj && obj.constructor === String;}
	function $isNumber		(obj) { 	return toString.call(obj) === ob.num;}
	function $isDate		(obj) { 	return toString.call(obj) === ob.dat;}
	function $isRegExp		(obj) { 	return toString.call(obj) === ob.reg;}
	function $isError		(obj) { 	return toString.call(obj) === error;}

	function $isArguments	(obj) { 	return toString.call(obj) === ob.arg;}
	if (!$isArguments(arguments)) {
		$isArguments = function(obj) { 	return (obj && $has(obj, "callee"));};
	}

	function $isNodeList 	(obj) {
		// http://stackoverflow.com/questions/151348/how-to-check-if-an-object-is-an-instance-of-a-nodelist-in-ie
		return ("NodeList" in root && obj instanceof NodeList || (typeof obj.length === 'number' && obj.item !== "undefined"));
	}

	var $isArray = nativeIsArray ||
			function(obj) { 			return toString.call(obj) == ob.arr;};

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


	var $same = (function() {
		var innerEquiv; // the real equiv function
		var callers = []; // stack to decide between skip/abort functions
		var parents = []; // stack to avoiding loops from circular referencing

		// Call the o related callback with the given arguments.
		function bindCallbacks(o, callbacks, args) {
			var prop = $typeof(o);
			if (prop) {
				if ($typeof(callbacks[prop]) === "function") {
					return callbacks[prop].apply(callbacks, args);
				} else {
					return callbacks[prop]; // or undefined
				}
			}
		}

		var callbacks = function () {
			// for string, boolean, number and null
			function useStrictEquality(b, a) {
				if (b instanceof a.constructor || a instanceof b.constructor) {
					// to catch short annotaion VS 'new' annotation of a declaration
					// e.g. var i = 1;
					//      var j = new Number(1);
					return a == b;
				} else {
					return a === b;
				}
			}

			return {
				"string": useStrictEquality,
				"boolean": useStrictEquality,
				"number": useStrictEquality,
				"null": useStrictEquality,
				"undefined": useStrictEquality,

				"nan": function (b) {
					return isNaN(b);
				},

				"date": function (b, a) {
					return $isDate(b) && a.valueOf() === b.valueOf();
				},

				"regexp": function (b, a) {
					return $isRegExp(b) &&
						a.source === b.source && // the regex itself
						a.global === b.global && // and its modifers (gmi) ...
						a.ignoreCase === b.ignoreCase &&
						a.multiline === b.multiline;
				},

				// - skip when the property is a method of an instance (OOP)
				// - abort otherwise,
				//   initial === would have catch identical references anyway
				"function": function () {
					var caller = callers[callers.length - 1];
					return caller !== Object &&
						typeof caller !== "undefined";
				},

				"array": function (b, a) {
					var i, j, loop;
					var len;

					// b could be an object literal here
					if (!$isArray(b)) {
						return false;
					}

					len = a.length;
					if (len !== b.length) { // safe and faster
						return false;
					}

					//track reference to avoid circular references
					parents.push(a);
					for (i = 0; i < len; i++) {
						loop = false;
						for(j=0;j<parents.length;j++){
							if(parents[j] === a[i]){
								loop = true;//dont rewalk array
							}
						}
						if (!loop && ! innerEquiv(a[i], b[i])) {
							parents.pop();
							return false;
						}
					}
					parents.pop();
					return true;
				},

				"object": function (b, a) {
					var i, j, loop;
					var eq = true; // unless we can proove it
					var aProperties = [], bProperties = []; // collection of strings

					// comparing constructors is more strict than using instanceof
					if ( a.constructor !== b.constructor) {
						return false;
					}

					// stack constructor before traversing properties
					callers.push(a.constructor);
					//track reference to avoid circular references
					parents.push(a);

					for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
						loop = false;
						for(j=0;j<parents.length;j++){
							if(parents[j] === a[i])
								loop = true; //don't go down the same path twice
						}
						aProperties.push(i); // collect a's properties

						if (!loop && ! innerEquiv(a[i], b[i])) {
							eq = false;
							break;
						}
					}

					callers.pop(); // unstack, we are done
					parents.pop();

					for (i in b) {
						bProperties.push(i); // collect b's properties
					}

					// Ensures identical properties name
					return eq && innerEquiv(aProperties.sort(), bProperties.sort());
				}
			};
		}();

		innerEquiv = function () { // can take multiple arguments
			var args = $slice(arguments);
			if (args.length < 2) {
				return true; // end transition
			}

			return (function (a, b) {
				if (a === b) {
					return true; // catch the most you can
				} else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || $typeof(a) !== $typeof(b)) {
					return false; // don't lose time with error prone cases
				} else {
					return bindCallbacks(a, callbacks, [b, a]);
				}

				// apply transition with (1..n) arguments
			})(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
		};

		return innerEquiv;

	}());


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

	// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	function $hashCode(str) {
		var hash = 0;
		if (str.length == 0) return hash;
		for (i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
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

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function $debounce(fn, wait, immediate) {
		var timeout;
		return function() {
			var context = this,
				args = $slice(arguments),
				later = function() {
					timeout = null;
					if (!immediate) {
						fn.apply(context, args);
					}
				};

			if (immediate && !timeout) {
				fn.apply(context, args);
			}
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
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

	function _parts(obj, vals) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object, expected an object or array.');
		var parts = [];
		if (vals) {
			$each(obj, function(val) {parts.push(val)});
		} else {
			$each(obj, function(val, key) {parts.push(key)});
		}
		return parts;
	};

	// Retrieve an array the keys of an object's owned properties.
	function $keys(obj) {return _parts(obj)}

	// Retrieve and array of the values of an object's owned properties.
	function $vals(obj) {return _parts(obj, true)}


	function $range(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;

		var len = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(len);

		while(idx < len) {
			range[idx++] = start;
			start += step;
		}

		return range;
	}

	// Collection Functions (work on objects and arrays) -------------------------------------------------------

	function nodeListToArray(obj) {
		// properly handle node-list iteration
		// http://stackoverflow.com/questions/2735067/how-to-convert-a-dom-node-list-to-an-array-in-javascript
		var array = [];
		for (var i = obj.length >>> 0; i--;) {
			array[i] = obj[i];
		}
		return array;
	}

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var $each = (function() {

		// switched breaker to string "break" for better self documentation when used
		function each(obj, iterator, context, asMap) {
			var i, results, key, array, val,
				breaker = each.break,
				continuer = each.continue;

			if (!obj) return;

			if (typeof obj === "number") {
				obj = $range(obj);
			}

			if (obj.length === +obj.length) {
				array = $isNodeList(obj) ? nodeListToArray(obj) : obj;
				asMap && (results = []);
				for (i = 0; i < array.length; i++) {
					val = iterator.call(context, array[i], i, array, results);
					if (val === continuer) {continue}
					if (val === breaker) {break}
					asMap && (results[results.length] = val);
				}

			} else {
				asMap && (results = {});
				for (key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						val = iterator.call(context, obj[key], key, obj, results);
						if (val === continuer) {continue}
						if (val === breaker) {break}
						asMap && (results[key] = val);
					}
				}
			}

			return asMap ? results : undefined;
		}

		each.break = each.breaker = "break";
		each.continue = each.continuer = "continue";

		return each;

	}());


	// Return the results of applying the iterator to each element.
	function $map(obj, iterator, context) {
		return $each(obj, iterator, context, true);
	}

	function $value(val) {return val}

	function $maybe(val) {
		return $reject(val, function(v) {
			return v;
		});
	}

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
				if (iterator.call(context, value, index, list)) results[results.length] = value;
			});
		} else {
			// object mode
			results = {};
			$each(obj, function(value, key, list) {
				if (iterator.call(context, value, key, list)) results[key] = value;
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
			if (!(result = result && iterator.call(context, value, index, list))) return $each.breaker;
		});
		return result;
	}


	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native "some" if available
	function $any(obj, iterator, context) {
		var result = false;
		if (obj == null) return result;
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
		return $map(obj, function(v){ return v[key]; });
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
	// allows custom sort functions, if the sort function returns undefined it will use index position to sort
	// this allows default behavior of using index for values that are equal and overriding of default behavior in custom sort functions
	function lookupIterator(value) {
		return $isFunction(value) ? value : function(obj){ return obj[value]; };
	}

	function $sortBy(obj, val, context, sortFn) {
		var iterator = lookupIterator(val),
			sortVal;

		sortFn = sortFn || function(a, b) {
			if (a !== b) {
				if (a > b || a === void 0) return 1;
				if (a < b || b === void 0) return -1;
			}
		};

		return $pluck($map(obj, function(value, index, list) {
			return {
				value : value,
				index: index,
				criteria : iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			sortVal = sortFn(left.criteria, right.criteria);
			if (sortVal !== undefined) {
				return sortVal;
			} else {
				return left.index < right.index ? -1 : 1;
			}
		}), 'value');
	}

	/*
	 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
	 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
	 * http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
	 * http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
	 */
	function $naturalSort (a, b) {
		var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
			sre = /(^[ ]*|[ ]*$)/g,
			dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
			hre = /^0x[0-9a-f]+$/i,
			ore = /^0/,
			i = function(s) { return $naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
		// convert all to strings strip whitespace
			x = i(a).replace(sre, '') || '',
			y = i(b).replace(sre, '') || '',
		// chunk/tokenize
			xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
			yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
		// numeric, hex or date detection
			xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
			yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
			oFxNcL, oFyNcL;
		// first try and sort Hex codes or Dates
		if (yD)
			if ( xD < yD ) return -1;
			else if ( xD > yD ) return 1;
		// natural sorting through split numeric strings and default strings
		for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
			// find floats not starting with '0', string or 0 if not defined (Clint Priest)
			oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
			oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
			// handle numeric vs string comparison - number < string - (Kyle Adams)
			if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
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


	function $head(obj, n) {
		n = n > 0 && $isNumber(n) ? n : 1;
		return $map(obj, function(val) {return (n-- > 0) ? val : "break"});
	}

	function $tail(obj, n) {
		n = n > 0 && $isNumber(n) ? n : 1;
		var i = 0,
			len = $length(obj),
			start = len < n ? 0 : len - n;

		return $map(obj, function(val) {
			return (i++ < start) ? "continue" : val;
		});
	}


	// Trim out all falsey non-zero values from an array or object.
	function $compact(obj) {
		return $filter(obj, function(val){ return !!val || $isNumber(val)});
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

	function $clear(obj, nullIt) {
		if ($isArray(obj)) {
			obj.length = 0;
		}

		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				nullIt ? obj[key] = null : delete obj[key];
			}
		}
	}

	function $ex(a) {
		var args = (arguments.length === 1 && $isArray(a)) ? a : $slice(arguments),
			len = args.length,
			last = 0,
			nextFn,
			fn = args.shift(),
			applyArgs = [],
			val,
			res;

		while (last <= len) {
			for (var i=0; i<args.length; i++) {
				val = args.shift();
				last++;
				if ($isFunction(val)) {
					nextFn = val;
					break;
				} else {
					applyArgs.push(val);
				}
			}
			if (!fn) break;
			res = fn.apply(null, applyArgs);
			applyArgs = [res];
			fn = nextFn;
			nextFn = null;
		}

		return res;
	}



	// object -------------------------------------------------------

	// use the same constructor every time to save on memory usage per
	// http://oranlooney.com/functional-javascript/
	function F() {}

	function _create(proto, newMemberVals) {
		F.prototype = proto;
		var newInstance = new F();
		return $mixin(newInstance, newMemberVals);
	}

	//
	// accepts any number of arguments to easily chain prototypes,
	// owned members of resulting object are defined by the last object provided
	// each argument defines a prototype for which a new instance is created
	// if there is an init function it will be called at this time
	// the resulting object will be mutated with the members of the next object provided
	// this process repeats until all objects are processed
	function $create() {
		var args = $slice(arguments);
		var extended = args.unshift();
		$each(args, function(ext) {
			extended = _create(extended, ext);
			$isFunction(ext.init) && extended.init();
		});
		return extended;
	}

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

	/*
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
	function _copy(source, target, filter) {

		var objStr = typeStr.lo.obj,
			sourceIsObj = typeof source === objStr;

		if (!sourceIsObj) {
			// source is a value so just return it
			return source;
		}

		var targetIsObj = typeof target === objStr,
			targetIsArray = targetIsObj && $isArray(target),
			sourceIsArray = $isArray(source),
			sVal, tVal;

		if (!targetIsObj) {
			// we are replacing target so use a new object or array as appropriate
			target = sourceIsArray ? [] : {};
		} else if (targetIsArray && !sourceIsArray) {
			target = {};
		}

		for (var key in source) {
			sVal = source[key];
			tVal = target[key];
			// apply filter to source props
			if (filter && !filter(key, source, target)) {
				continue;

			} else if (typeof sVal !== objStr || !sVal || sVal === target) {
				// direct copy if current value:
				// not an object || falsy (covers null so must be after object test)
				// || the target (no recursion on cyclic structures todo: should check all parents)
				target[key] = sVal;

			} else {
				// recursive copy
				target[key] = _copy(sVal, tVal, filter);
			}
		}

		return target;
	}


	function $copy(source, filter) {
		if (filter && !$isFunction(filter)) {
			throw new Error("$copy: Optional second argument (filter) must be a function. Instead saw " + typeof filter);
		}

		var target = $isArray(source) ? [] : {};

		return _copy(source, target, filter);
	}


	function $merge(target) {
		var len = arguments.length,
			sources = $slice(arguments, 1),
			filter;

		if (len < 2) {
			throw new Error("$merge: a target and source are required and must be enumerable. Instead saw (" + typeof target +", "+ typeof source +")");
		}

		if ($isFunction(arguments[len-1])) {
			filter = sources.pop();
		}

		$each(sources, function(source) {
			_copy(source, target, filter);
		});

		return target;
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
				for (var key in source) {
					// do a deep copy that excludes any inherited properties at any level on the source
					if (source.hasOwnProperty(key)) {
						target[key] = source[key];
					}
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

		var reMatch = /^\/(.+)\/([ig]*)$/;

		var aSpeaker = {

			/** tell
			 * @param topic (string) the topic of the message, listeners can filter messages base on their topic
			 * @param message (anything) optional - a value passed to the listeners
			 * @param speaker (speaker) optional - listeners will be told the origin of the messages they receive
			 * here you can override that value, you should not need to use this
			 */
			tell: function(topic, message, speaker) {

				if (typeof topic !== "string") {
					throw new TypeError("expected string but saw " + topic);
				}

				var i, len, listener, lMax,
					regexpListeners,
					wildCardListeners,
					topicSpecificListeners,
					allListeners,
					audience = this._audience,
					originalSpeaker = speaker || this,
					selectiveHearing = this.selectiveHearing;

				if (!selectiveHearing || ($isFunction(selectiveHearing) && this.selectiveHearing(message, topic, originalSpeaker)) ) {
					topicSpecificListeners = (topic !== "*") ? this._listeningFor[topic] || [] : [];
					regexpListeners = $filter(this._listeningFor["_regexp"], function(listener) {
						return topic.match(listener.regexp);
					});
					wildCardListeners = this._listeningFor["*"];
					// exact matching listener topics have highest priority, then regexp listeners, then wildcard listeners
					allListeners = regexpListeners ? topicSpecificListeners.concat(regexpListeners) : topicSpecificListeners ;
					allListeners = wildCardListeners ? allListeners.concat(wildCardListeners) : allListeners ;

					for(i=0, len=allListeners.length; i<len; i++) {
						listener = allListeners[i];
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
			 * or in the case of a regex topic param if the receivedTopic.match(topicParam), "*" also serves as a catch-all
			 * @param responder (function) having the signature function(message, topic, originalSpeaker) execution scope is that of the handling speaker
			 * @param maxResponses (number) optional - number of times the responder will be called before being removed
			 */
			listen: function(topic, responder, maxResponses) {

				var that = this,
					topicType = typeof topic,
					topicIsString = topicType === "string",
					topicIsRegex = (topic+"").match(reMatch), // support regexps as strings
					topicKey = topicIsRegex ? "_regexp" : topic,
					listener,
					handlerExistsForTopic = false,
					responderType = typeof responder,
					responderIsFunction = responderType === "function";

				// turn our regexp topic string into an actual regexp
				topic = (topicIsString && topicIsRegex) ? new RegExp(topicIsRegex[1], topicIsRegex[2]) : topic;

				if (arguments.length > 1) {

					if (maxResponses && !$isNumber(maxResponses)) {
						throw new Error("Invalid parameter: expected a number but saw " + typeof maxResponses);
					}

					if (responderIsFunction && (topicIsString || topicIsRegex)) {

						// don't add something twice
						var topicSpecificListeners = this._listeningFor[topicKey] || [];
						$each(topicSpecificListeners, function(listener) {
							if(listener.responder === responder) {
								handlerExistsForTopic = true;
								return $each.break;
							}
						});

						if (!handlerExistsForTopic) {
							listener = {
								responder: responder,
								responses: 0,
								maxResponses: maxResponses,
								regexp: topicIsRegex ? topic : null
							};

							topicSpecificListeners.push(listener);

							this._listeningFor[topicKey] = topicSpecificListeners;
						}

					} else {
						console.log(arguments);
						throw new Error("Invalid parameters, expected: (string, function) but saw (" + topicType + ", " +responderType +")");
					}

				// handle listen({event:handler, event2:handler2, ...}) signature
				} else if (topicType === "object") {
					// call self for each function if given a map of callbacks instead of a single function
					$each(topic, function(listener, topic) {
						if ($isFunction(listener)) {
							// maxResponses is not supported in object map signature
							that.listen(topic, listener);
						} else {
							throw new Error("Invalid parameters, expected: (string, function) but saw (" + $typeof(topic) + ", " + $typeof(listener) +")");
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

				if (topic) {
					var ret = {};
					var topicSpecificListeners = (topic !== "*") ? this._listeningFor[topic] || [] : [];

					if ($length(topicSpecificListeners)) {
						ret[topic] = topicSpecificListeners;
					}

					var regexpListeners = $filter(this._listeningFor["_regexp"], function(listener) {
						return topic && topic.match(listener.regexp);
					});

					if ($length(regexpListeners)) {
						ret["_regexp"] = regexpListeners;
					}

					var catchall = this._listeningFor["*"];
					if (!ignoreCatchall && catchall && catchall.length) {
						ret["*"] = regexpListeners;
					}

					return ret;

				} else {
					return this._listeningFor;
				}
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
				var test,
					responderIsFunction = $isFunction(responder),
					ignoreString = typeof ignoreable === "string",
					ignoreIsRegex = (ignoreable+"").match(reMatch); // support regexps as strings

				if (ignoreable) {

					if (ignoreIsRegex) {

						if (responderIsFunction) {
							// clear all listeners for this regex that use the provided function
							test = function(listener) {return listener.responder+"" === ignoreable+"" && listener.responder === responder;};
						} else {
							// clear all listeners for this regex
							test = function(listener) {return listener.regexp+"" === ignoreable+"";};
						}
						this._listeningFor["_regexp"] = $reject(this._listeningFor["_regexp"], test);

					} else if (ignoreString) {

						if (responderIsFunction) {
							// clear all listeners for this topic that use the provided function
							this._listeningFor[ignoreable] = $reject(this._listeningFor[ignoreable], function(listener) {
								return listener.responder === responder;
							});
						} else {
							// clear all listeners for this topic
							delete this._listeningFor[ignoreable];
						}

					} else if (typeof ignoreable === "function") {
						// clear all listeners that use the provided function
						this._listeningFor = $map(this._listeningFor, function(listeners) {
							return $reject(listeners, function(listener) {
								return listener.responder === ignoreable;
							});
						});
					}

				} else {
					// clear all listeners
					$clear(this._listeningFor);
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

	function $bindListenerSpec(speaker) {
		var spec = speaker.listeners;
		if (!$isSpeaker(speaker)) {
			$speak(speaker);
		}
		$each(spec, function(fn, event) {
			if (!$isFunction(fn)) {
				fn = speaker[fn];
			}
			speaker.listen(event, fn);
		});
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
		$isTextNode: $isTextNode,
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
		$isNodeList: $isNodeList,
		$isArray: $isArray,
		$isError: $isError,
		$typeof: $typeof,
		$same: $same,

		// string
		$trim: $trim,
		$hashCode: $hashCode,

		// functions
		$bind: $bind,
		$debounce: $debounce,

		// collections
		$each: $each,
		$for: $each,
		$map: $map,
		$range: $range,
		$reduce: $reduce,
		$find: $find,
		$filter: $filter,
		$reject: $reject,
		$every: $all,
		$all: $all,
		$any: $any,
		$maybe: $maybe,
		$includes: $includes,
		$contains: $includes,
		$invoke: $invoke,
		$ex: $ex,
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
		$head: $head,
		$tail: $tail,
		$compact: $compact,
		$flat: $flat,
		$slice: $slice,
		$splice: $splice,
		$clear: $clear,

		// objects
		$hasOwnProperty: hasOwnProperty,
		$isEmpty: $isEmpty,
		$has: $has,
		$pick: $pick,
		$keys: $keys,
		$values: $vals,
		$vals: $vals,
		$new: $new,
		$create: $create,
		$walk: $walk,
		$copy: $copy,
		$merge: $merge,
		$extend: $extend,
		$mixin: $mixin,
		$make: $make,

		// messaging
		$speak: $speak,
		$isSpeaker: $isSpeaker,
		$bindListenerSpec: $bindListenerSpec,

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
/*! Copyright (c) 2011, Lloyd Hilaiel, ISC License */
/*
 *
 * Selector formating and parameter escaping:
 *
 * Anywhere where a string selector is selected, it may be followed by an
 * optional array of values.  When provided, they will be escaped and
 * inserted into the selector string properly escaped.  i.e.:
 *
 *   .match(':has(?)', [ 'foo' ], {})
 *
 * would result in the seclector ':has("foo")' being matched against {}.
 *
 * This feature makes dynamically generated selectors more readable.
 *
 * .match(selector, [ values ], object)
 *
 *   Parses and "compiles" the selector, then matches it against the object
 *   argument.  Matches are returned in an array.  Throws an error when
 *   there's a problem parsing the selector.
 *
 * .forEach(selector, [ values ], object, callback)
 *
 *   Like match, but rather than returning an array, invokes the provided
 *   callback once per match as the matches are discovered.
 *
 * .compile(selector, [ values ])
 *
 *   Parses the selector and compiles it to an internal form, and returns
 *   an object which contains the compiled selector and has two properties:
 *   `match` and `forEach`.  These two functions work identically to the
 *   above, except they do not take a selector as an argument and instead
 *   use the compiled selector.
 *
 *   For cases where a complex selector is repeatedly used, this method
 *   should be faster as it will avoid recompiling the selector each time.
 */

/*
	* 					Any node	1
	T					A node of type T, where T is one string, number, object, array, boolean, or null	1
	T.key				A node of type T which is the child of an object and is the value its parents key property	1
	T."complex key"		Same as previous, but with property name specified as a JSON string	1
	T:root				A node of type T which is the root of the JSON document	1
	T:nth-child(n)		A node of type T which is the nth child of an array parent	1
	T:nth-last-child(n)	A node of type T which is the nth child of an array parent counting from the end	2
	T:first-child		A node of type T which is the first child of an array parent (equivalent to T:nth-child(1)	1
	T:last-child		A node of type T which is the last child of an array parent (equivalent to T:nth-last-child(1)	2
	T:only-child		A node of type T which is the only child of an array parent	2
	T:empty				A node of type T which is an array or object with no child	2
	T U					A node of type U with an ancestor of type T	1
	T > U 				A node of type U with a parent of type T	1
	T ~ U				A node of type U with a sibling of type T	2
	S1, S2				Any node which matches either selector S1 or S2	1
	T:has(S)			A node of type T which has a child node satisfying the selector S	3
	T:expr(E)			A node of type T with a value that satisfies the expression E	3
	T:val(V)			A node of type T with a value that is equal to V	3
	T:contains(S)		A node of type T with a string value contains the substring S	3
*/

(function() {

	var // localize references
		toString = Object.prototype.toString;

	function jsonParse(str) {
		try {
			if(JSON && JSON.parse){
				return JSON.parse(str);
			}
			return (new Function("return " + str))();
		} catch(e) {
			te("ijs", e.message);
		}
	}

	// emitted error codes.
	var errorCodes = {
		"bop":  "binary operator expected",
		"ee":   "expression expected",
		"epex": "closing paren expected ')'",
		"ijs":  "invalid json string",
		"mcp":  "missing closing paren",
		"mepf": "malformed expression in pseudo-function",
		"mexp": "multiple expressions not allowed",
		"mpc":  "multiple pseudo classes (:xxx) not allowed",
		"nmi":  "multiple ids not allowed",
		"pex":  "opening paren expected '('",
		"se":   "selector expected",
		"sex":  "string expected",
		"sra":  "string required after '.'",
		"uc":   "unrecognized char",
		"ucp":  "unexpected closing paren",
		"ujs":  "unclosed json string",
		"upc":  "unrecognized pseudo class"
	};

	// throw an error message
	function te(ec, context) {
		throw new Error(errorCodes[ec] + ( context && " in '" + context + "'"));
	}

	// THE LEXER
	var toks = {
		psc: 1, // pseudo class
		psf: 2, // pseudo class function
		typ: 3, // type
		str: 4, // string
		ide: 5  // identifiers (or "classes", stuff after a dot)
	};

	// The primary lexing regular expression in jsonselect
	var pat = new RegExp(
		"^(?:" +
			// (1) whitespace
			"([\\r\\n\\t\\ ]+)|" +
			// (2) one-char ops
			"([~*,>\\)\\(])|" +
			// (3) types names
			"(string|boolean|null|array|object|number)|" +
			// (4) pseudo classes
			"(:(?:root|first-child|last-child|only-child))|" +
			// (5) pseudo functions
			"(:(?:nth-child|nth-last-child|has|expr|val|contains))|" +
			// (6) bogusly named pseudo something or others
			"(:\\w+)|" +
			// (7 & 8) identifiers and JSON strings
			"(?:(\\.)?(\\\"(?:[^\\\\\\\"]|\\\\[^\\\"])*\\\"))|" +
			// (8) bogus JSON strings missing a trailing quote
			"(\\\")|" +
			// (9) identifiers (unquoted)
			"\\.((?:[_a-zA-Z]|[^\\0-\\0177]|\\\\[^\\r\\n\\f0-9a-fA-F])(?:[\$_a-zA-Z0-9\\-]|[^\\u0000-\\u0177]|(?:\\\\[^\\r\\n\\f0-9a-fA-F]))*)" +
			")"
	);

	// A regular expression for matching "nth expressions" (see grammar, what :nth-child() eats)
	var nthPat = /^\s*\(\s*(?:([+\-]?)([0-9]*)n\s*(?:([+\-])\s*([0-9]))?|(odd|even)|([+\-]?[0-9]+))\s*\)/;
	function lex(str, off) {
		if (!off) off = 0;
		var m = pat.exec(str.substr(off));
		if (!m) return undefined;
		off+=m[0].length;
		var a;
		if (m[1]) a = [off, " "];
		else if (m[2]) a = [off, m[0]];
		else if (m[3]) a = [off, toks.typ, m[0]];
		else if (m[4]) a = [off, toks.psc, m[0]];
		else if (m[5]) a = [off, toks.psf, m[0]];
		else if (m[6]) te("upc", str);
		else if (m[8]) a = [off, m[7] ? toks.ide : toks.str, jsonParse(m[8])];
		else if (m[9]) te("ujs", str);
		else if (m[10]) a = [off, toks.ide, m[10].replace(/\\([^\r\n\f0-9a-fA-F])/g,"$1")];
		return a;
	}

	// THE EXPRESSION SUBSYSTEM

	var exprPat = new RegExp(
		// skip and don't capture leading whitespace
		"^\\s*(?:" +
			// (1) simple vals
			"(true|false|null)|" +
			// (2) numbers
			"(-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)|" +
			// (3) strings
			"(\"(?:[^\\]|\\[^\"])*\")|" +
			// (4) the 'x' value placeholder
			"(x)|" +
			// (5) binops
			"(&&|\\|\\||[\\$\\^<>!\\*]=|[=+\\-*/%<>])|" +
			// (6) parens
			"([\\(\\)])" +
			")"
	);

	function is(o, t) { return typeof o === t; }
	var operators = {
		'*':  [ 9, function(lhs, rhs) { return lhs * rhs; } ],
		'/':  [ 9, function(lhs, rhs) { return lhs / rhs; } ],
		'%':  [ 9, function(lhs, rhs) { return lhs % rhs; } ],
		'+':  [ 7, function(lhs, rhs) { return lhs + rhs; } ],
		'-':  [ 7, function(lhs, rhs) { return lhs - rhs; } ],
		'<=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs <= rhs || is(lhs, 'string') && is(rhs, 'string') && lhs <= rhs; } ],
		'>=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs >= rhs || is(lhs, 'string') && is(rhs, 'string') && lhs >= rhs; } ],
		'$=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.lastIndexOf(rhs) === lhs.length - rhs.length; } ],
		'^=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) === 0; } ],
		'*=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) !== -1; } ],
		'>':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs > rhs || is(lhs, 'string') && is(rhs, 'string') && lhs > rhs; } ],
		'<':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs < rhs || is(lhs, 'string') && is(rhs, 'string') && lhs < rhs; } ],
		'=':  [ 3, function(lhs, rhs) { return lhs === rhs; } ],
		'!=': [ 3, function(lhs, rhs) { return lhs !== rhs; } ],
		'&&': [ 2, function(lhs, rhs) { return lhs && rhs; } ],
		'||': [ 1, function(lhs, rhs) { return lhs || rhs; } ]
	};

	function exprLex(str, off) {
		var v, m = exprPat.exec(str.substr(off));
		if (m) {
			off += m[0].length;
			v = m[1] || m[2] || m[3] || m[5] || m[6];
			if (m[1] || m[2] || m[3]) return [off, 0, jsonParse(v)];
			else if (m[4]) return [off, 0, undefined];
			return [off, v];
		}
	}

	function exprParse2(str, off) {
		if (!off) off = 0;
		// first we expect a value or a '('
		var l = exprLex(str, off),
			lhs;
		if (l && l[1] === '(') {
			lhs = exprParse2(str, l[0]);
			var p = exprLex(str, lhs[0]);
			if (!p || p[1] !== ')') te('epex', str);
			off = p[0];
			lhs = [ '(', lhs[1] ];
		} else if (!l || (l[1] && l[1] != 'x')) {
			te("ee", str + " - " + ( l[1] && l[1] ));
		} else {
			lhs = ((l[1] === 'x') ? undefined : l[2]);
			off = l[0];
		}

		// now we expect a binary operator or a ')'
		var op = exprLex(str, off);
		if (!op || op[1] == ')') return [off, lhs];
		else if (op[1] == 'x' || !op[1]) {
			te('bop', str + " - " + ( op[1] && op[1] ));
		}

		// tail recursion to fetch the rhs expression
		var rhs = exprParse2(str, op[0]);
		off = rhs[0];
		rhs = rhs[1];

		// and now precedence!  how shall we put everything together?
		var v;
		if (typeof rhs !== 'object' || rhs[0] === '(' || operators[op[1]][0] < operators[rhs[1]][0] ) {
			v = [lhs, op[1], rhs];
		}
		else {
			v = rhs;
			while (typeof rhs[0] === 'object' && rhs[0][0] != '(' && operators[op[1]][0] >= operators[rhs[0][1]][0]) {
				rhs = rhs[0];
			}
			rhs[0] = [lhs, op[1], rhs[0]];
		}
		return [off, v];
	}

	function exprParse(str, off) {
		function deparen(v) {
			if (typeof v !== 'object' || v === null) return v;
			else if (v[0] === '(') return deparen(v[1]);
			else return [deparen(v[0]), v[1], deparen(v[2])];
		}
		var e = exprParse2(str, off ? off : 0);
		return [e[0], deparen(e[1])];
	}

	function exprEval(expr, x) {
		if (expr === undefined) return x;
		else if (expr === null || typeof expr !== 'object') {
			return expr;
		}
		var lhs = exprEval(expr[0], x),
			rhs = exprEval(expr[2], x);
		return operators[expr[1]][1](lhs, rhs);
	}

	// THE PARSER

	function parse(str, off, nested, hints) {
		if (!nested) hints = {};

		var a = [], am, readParen;
		if (!off) off = 0;

		while (true) {
			var s = parse_selector(str, off, hints);
			a.push(s[1]);
			s = lex(str, off = s[0]);
			if (s && s[1] === " ") s = lex(str, off = s[0]);
			if (!s) break;
			// now we've parsed a selector, and have something else...
			if (s[1] === ">" || s[1] === "~") {
				if (s[1] === "~") hints.usesSiblingOp = true;
				a.push(s[1]);
				off = s[0];
			} else if (s[1] === ",") {
				if (am === undefined) am = [ ",", a ];
				else am.push(a);
				a = [];
				off = s[0];
			} else if (s[1] === ")") {
				if (!nested) te("ucp", s[1]);
				readParen = 1;
				off = s[0];
				break;
			}
		}
		if (nested && !readParen) te("mcp", str);
		if (am) am.push(a);
		var rv;
		if (!nested && hints.usesSiblingOp) {
			rv = normalize(am ? am : a);
		} else {
			rv = am ? am : a;
		}
		return [off, rv];
	}

	function normalizeOne(sel) {
		var sels = [], s;
		for (var i = 0; i < sel.length; i++) {
			if (sel[i] === '~') {
				// `A ~ B` maps to `:has(:root > A) > B`
				// `Z A ~ B` maps to `Z :has(:root > A) > B, Z:has(:root > A) > B`
				// This first clause, takes care of the first case, and the first half of the latter case.
				if (i < 2 || sel[i-2] != '>') {
					s = sel.slice(0,i-1);
					s = s.concat([{has:[[{pc: ":root"}, ">", sel[i-1]]]}, ">"]);
					s = s.concat(sel.slice(i+1));
					sels.push(s);
				}
				// here we take care of the second half of above:
				// (`Z A ~ B` maps to `Z :has(:root > A) > B, Z :has(:root > A) > B`)
				// and a new case:
				// Z > A ~ B maps to Z:has(:root > A) > B
				if (i > 1) {
					var at = sel[i-2] === '>' ? i-3 : i-2;
					s = sel.slice(0,at);
					var z = {};
					for (var k in sel[at]) if (sel[at].hasOwnProperty(k)) z[k] = sel[at][k];
					if (!z.has) z.has = [];
					z.has.push([{pc: ":root"}, ">", sel[i-1]]);
					s = s.concat(z, '>', sel.slice(i+1));
					sels.push(s);
				}
				break;
			}
		}
		if (i == sel.length) return sel;
		return sels.length > 1 ? [','].concat(sels) : sels[0];
	}

	function normalize(sels) {
		if (sels[0] === ',') {
			var r = [","];
			for (var i = i; i < sels.length; i++) {
				var s = normalizeOne(s[i]);
				r = r.concat(s[0] === "," ? s.slice(1) : s);
			}
			return r;
		} else {
			return normalizeOne(sels);
		}
	}

	function parse_selector(str, off, hints) {
		var soff = off;
		var s = { };
		var l = lex(str, off);
		// skip space
		if (l && l[1] === " ") { soff = off = l[0]; l = lex(str, off); }
		if (l && l[1] === toks.typ) {
			s.type = l[2];
			l = lex(str, (off = l[0]));
		} else if (l && l[1] === "*") {
			// don't bother representing the universal sel, '*' in the
			// parse tree, cause it's the default
			l = lex(str, (off = l[0]));
		}

		// now support either an id or a pc
		while (true) {
			if (l === undefined) {
				break;
			} else if (l[1] === toks.ide) {
				if (s.id) te("nmi", l[1]);
				s.id = l[2];
			} else if (l[1] === toks.psc) {
				if (s.pc || s.pf) te("mpc", l[1]);
				// collapse first-child and last-child into nth-child expressions
				if (l[2] === ":first-child") {
					s.pf = ":nth-child";
					s.a = 0;
					s.b = 1;
				} else if (l[2] === ":last-child") {
					s.pf = ":nth-last-child";
					s.a = 0;
					s.b = 1;
				} else {
					s.pc = l[2];
				}
			} else if (l[1] === toks.psf) {
				if (l[2] === ":val" || l[2] === ":contains") {
					s.expr = [ undefined, l[2] === ":val" ? "=" : "*=", undefined];
					// any amount of whitespace, followed by paren, string, paren
					l = lex(str, (off = l[0]));
					if (l && l[1] === " ") l = lex(str, off = l[0]);
					if (!l || l[1] !== "(") te("pex", str);
					l = lex(str, (off = l[0]));
					if (l && l[1] === " ") l = lex(str, off = l[0]);
					if (!l || l[1] !== toks.str) te("sex", str);
					s.expr[2] = l[2];
					l = lex(str, (off = l[0]));
					if (l && l[1] === " ") l = lex(str, off = l[0]);
					if (!l || l[1] !== ")") te("epex", str);
				} else if (l[2] === ":has") {
					// any amount of whitespace, followed by paren
					l = lex(str, (off = l[0]));
					if (l && l[1] === " ") l = lex(str, off = l[0]);
					if (!l || l[1] !== "(") te("pex", str);
					var h = parse(str, l[0], true);
					l[0] = h[0];
					if (!s.has) s.has = [];
					s.has.push(h[1]);
				} else if (l[2] === ":expr") {
					if (s.expr) te("mexp", str);
					var e = exprParse(str, l[0]);
					l[0] = e[0];
					s.expr = e[1];
				} else {
					if (s.pc || s.pf ) te("mpc", str);
					s.pf = l[2];
					var m = nthPat.exec(str.substr(l[0]));
					if (!m) te("mepf", str);
					if (m[5]) {
						s.a = 2;
						s.b = (m[5] === "odd") ? 1 : 0;
					} else if (m[6]) {
						s.a = 0;
						s.b = parseInt(m[6], 10);
					} else {
						s.a = parseInt((m[1] ? m[1] : "+") + (m[2] ? m[2] : "1"),10);
						s.b = m[3] ? parseInt(m[3] + m[4],10) : 0;
					}
					l[0] += m[0].length;
				}
			} else {
				break;
			}
			l = lex(str, (off = l[0]));
		}

		// now if we didn't actually parse anything it's an error
		if (soff === off) te("se", str);

		return [off, s];
	}

	// THE EVALUATOR

	function isArray(o) {
		return Array.isArray ? Array.isArray(o) :
			toString.call(o) === "[object Array]";
	}

	function mytypeof(o) {
		if (o === null) return "null";
		var to = typeof o;
		if (to === "object" && isArray(o)) to = "array";
		return to;
	}

	function mn(node, sel, id, num, tot) {
		var sels = [];
		var cs = (sel[0] === ">") ? sel[1] : sel[0];
		var m = true, mod;
		if (cs.type) m = m && (cs.type === mytypeof(node));
		if (cs.id)   m = m && (cs.id === id);
		if (m && cs.pf) {
			if (cs.pf === ":nth-last-child") num = tot - num;
			else num++;
			if (cs.a === 0) {
				m = cs.b === num;
			} else {
				mod = ((num - cs.b) % cs.a);

				m = (!mod && ((num*cs.a + cs.b) >= 0));
			}
		}
		if (m && cs.has) {
			// perhaps we should augment forEach to handle a return value
			// that indicates "client cancels traversal"?
			var bail = function() { throw 42; };
			for (var i = 0; i < cs.has.length; i++) {
				try {
					forEach(cs.has[i], node, bail);
				} catch (e) {
					if (e === 42) continue;
				}
				m = false;
				break;
			}
		}
		if (m && cs.expr) {
			m = exprEval(cs.expr, node);
		}
		// should we repeat this selector for descendants?
		if (sel[0] !== ">" && sel[0].pc !== ":root") sels.push(sel);

		if (m) {
			// is there a fragment that we should pass down?
			if (sel[0] === ">") { if (sel.length > 2) { m = false; sels.push(sel.slice(2)); } }
			else if (sel.length > 1) { m = false; sels.push(sel.slice(1)); }
		}

		return [m, sels];
	}

	function forEach(sel, obj, fun, id, num, tot) {
		var a = (sel[0] === ",") ? sel.slice(1) : [sel],
			a0 = [],
			call = false,
			i = 0, j = 0, k, x;
		for (i = 0; i < a.length; i++) {
			x = mn(obj, a[i], id, num, tot);
			if (x[0]) {
				call = true;
			}
			for (j = 0; j < x[1].length; j++) {
				a0.push(x[1][j]);
			}
		}
		if (a0.length && typeof obj === "object") {
			if (a0.length >= 1) {
				a0.unshift(",");
			}
			if (isArray(obj)) {
				for (i = 0; i < obj.length; i++) {
					forEach(a0, obj[i], fun, undefined, i, obj.length);
				}
			} else {
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						forEach(a0, obj[k], fun, k);
					}
				}
			}
		}
		if (call && fun) {
			fun(obj);
		}
	}

	function match(sel, obj) {
		var a = [];
		forEach(sel, obj, function(x) {
			a.push(x);
		});
		return a;
	}

	function format(sel, arr) {
		sel = sel.replace(/\?/g, function() {
			if (arr.length === 0) throw "too few parameters given";
			var p = arr.shift();
			return ((typeof p === 'string') ? JSON.stringify(p) : p);
		});
		if (arr.length) throw "too many parameters supplied";
		return sel;
	}

	function compile(sel, arr) {
		if (arr) sel = format(sel, arr);
		return {
			sel: parse(sel)[1],
			match: function(obj){
				return match(this.sel, obj);
			},
			forEach: function(obj, fun) {
				return forEach(this.sel, obj, fun);
			}
		};
	}

	function $select(sel, obj) {
		if (!$isString(sel)) {
			if ($isString(obj)) {
				// flipped args
				return $select.match(obj, sel);
			} else {
				var res;
				return $map(sel, function(val) {
					res = $select(val, obj);
					return (res.length > 1) ? res : res[0];
				});
			}

		} else {
			return $select.match(sel, obj);
		}
	}

	$select._lex = lex;
	$select._parse = parse;
	$select.match = function (sel, arr, obj) {
		if (!obj) { obj = arr; arr = undefined; }
		return compile(sel, arr).match(obj);
	};
	$select.forEach = function(sel, arr, obj, fun) {
		if (!fun) { fun = obj;  obj = arr; arr = undefined }
		return compile(sel, arr).forEach(obj, fun);
	};
	$select.compile = compile;

	loot.extend({
		$select: $select
	});

}());
/**
 * $time.js
 * @require loot
 */

(function() {

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

		var minusRe = /-/g,
			tzRe = /[TZ]/g,
			margin = 0.1;

		function getFormats(lang) {
			return [
				[60, lang.now],
				[3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
				[86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
				[604800, lang.day, lang.days, 86400], // 7 days, 1 day
				[2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
				[31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
				[Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
			];
		}

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

				case "string":
					date = new Date(('' + date).replace(minusRe, "/").replace(tzRe, " "));
					break;

				case "number":
					date = new Date(date);
					break;
			}

			return date;
		}

		var timeAgo = function(date, compareTo, langCode) {

			date = normalizeDateInput(date || $now());
			compareTo = normalizeDateInput(compareTo || new Date);
			langCode = langCode || this.defaultLang;
			var lang = this.formats[langCode];

			var token,
				isString = (typeof date === "string"),
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
		};

		timeAgo.lang = {};
		timeAgo.formats = {};
		timeAgo.setLang = function(code, newLang) {
			this.defaultLang = code;
			this.lang[code] = newLang;
			this.formats[code] = getFormats(newLang);
		};

		timeAgo.setLang("en", {
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
		});

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

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 * see http://blog.stevenlevithan.com/archives/date-time-format
	 */
	/* 	Mask		Description
		 d			Day of the month as digits; no leading zero for single-digit days.
		 dd			Day of the month as digits; leading zero for single-digit days.
		 ddd		Day of the week as a three-letter abbreviation.
		 dddd		Day of the week as its full name.
		 m			Month as digits; no leading zero for single-digit months.
		 mm			Month as digits; leading zero for single-digit months.
		 mmm		Month as a three-letter abbreviation.
		 mmmm		Month as its full name.
		 yy			Year as last two digits; leading zero for years less than 10.
		 yyyy		Year represented by four digits.
		 h			Hours; no leading zero for single-digit hours (12-hour clock).
		 hh			Hours; leading zero for single-digit hours (12-hour clock).
		 H			Hours; no leading zero for single-digit hours (24-hour clock).
		 HH			Hours; leading zero for single-digit hours (24-hour clock).
		 M			Minutes; no leading zero for single-digit minutes.
		 MM			Minutes; leading zero for single-digit minutes.
		 s			Seconds; no leading zero for single-digit seconds.
		 ss			Seconds; leading zero for single-digit seconds.
		 l or L		Milliseconds. l gives 3 digits. L gives 2 digits.
		 t			Lowercase, single-character time marker string: a or p.
		 tt			Lowercase, two-character time marker string: am or pm.
		 T			Uppercase, single-character time marker string: A or P.
		 TT			Uppercase, two-character time marker string: AM or PM.
		 Z			US timezone abbreviation, e.g. EST or MDT. With non-US timezones or in the Opera browser, the GMT/UTC offset is returned, e.g. GMT-0500
		 o			GMT/UTC timezone offset, e.g. -0500 or +0230.
		 S			The date's ordinal suffix (st, nd, rd, or th). Works well with d.
		 '…' or "…"	Literal character sequence. Surrounding quotes are removed.
		 UTC:		Must be the first four characters of the mask. Converts the date from local time to UTC/GMT/Zulu time before applying the mask. The "UTC:" prefix is removed.
	 */

	var $dateFormat = (function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function(val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function(date, mask, utc, langCode) {
			if (!date) {
				return date + "";
			}
			var dF = $dateFormat;
			langCode = langCode || dF.defaultLang;
			var lang = dF.lang[langCode];

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (!$isDate(date)) throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  lang.dayNames[D],
					dddd: lang.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  lang.monthNames[m],
					mmmm: lang.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}());

	// Some common format strings
	$dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	$dateFormat.defaultLang = "en";
	$dateFormat.lang = {
		en: {
			dayNames: [
				"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
				"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
				"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			]
		}
	};

	function $secondsToTime(_s) {
		var h, m, s, ms, pad, f1, f2, f3;
		ms = Math.round((parseFloat(_s) % 1)*1000);
		s = parseInt(_s, 10);
		h  = Math.floor( s / ( 60 * 60 ) );
		s -= h * ( 60 * 60 );
		m  = Math.floor( s / 60 );
		s -= m * 60;

		pad = function(v) {return (v > 9) ? v : "0"+v;};

		f1 = $map([h, m], pad).join(":");

		f2 = $map([h, m, s], pad).join(":");

		// create x hours x minutes string
		// if no hours it will be x minutes
		// if no hours or minutes will be x seconds
		// plurality of units is handled
		var hStr = h ? h + " hour" + (h>1 ? "s " : " ") : "",
			mStr = (h || m) ? m + " minute" + (m>1 ? "s" : "") : "",
			sStr = (!m && s) ? s + " second"  + (s>1 ? "s" : "") : "";

		f3 = hStr + mStr + sStr;

		return {h: h, m: m, s: s, ms: ms, "hh:mm": f1, "hh:mm:ss": f2, formatted: f3};
	}

	function $millisToTime(ms) {
		return $secondsToTime(parseInt(ms, 10)/1000);
	}

	loot.extend({
		$now: $now,
		$date: $dateFormat,
		$timeAgo: $timeAgo,
		$timer: $timer,
		$secondsToTime: $secondsToTime,
		$millisToTime: $millisToTime
	});

}());
/**
 * $async.js
 * @require loot
 */

(function() {

	// async functions ------------------------------------------------------------
	// taken from https://github.com/caolan/async with some modifications
	// each and series support iterating over objects as well as arrays

	var $async = {
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
			var next, keys = $keys(obj), // not using keys here bc we want array indexes as numbers, each gives us that
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

		eachLimit: function (obj, limit, iterator, callback) {
			var vals = $vals(obj),
				keys = $keys(obj),
				len = $length(vals),
				completed = 0,
				started = 0,
				running = 0;

			callback = callback || function () {};

			function next(err) {
				if (err) {
					callback(err);
					callback = function() {};
				} else {
					completed++;
					running--;
					console.log(">>>", completed, len);
					(completed === len) ? callback() : replenish();
				}
			}

			function replenish() {
				if (completed === len || limit <= 0) {
					return callback();
				}

				while (running < limit && started < len) {
					started++;
					running++;
					iterator(next, vals[started-1], keys[started-1]);
				}
			}

			replenish();
		},

		// nextTick implementation with browser-compatible fallback
		nextTick: (function() {
			if (typeof process === "undefined" || !(process.nextTick)) {
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
			return fn.apply(null, [$async.each].concat(args));
		};
	};
	var _doSeries = function(fn) {
		return function() {
			var args = $slice(arguments);
			return fn.apply(null, [$async.eachSeries].concat(args));
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

	$async.map = _doParallel(_asyncMap);
	$async.mapSeries = _doSeries(_asyncMap);

	$async.tasks = function(tasks, callback) {
		var iterator = function (push, task, key, result, obj) {
			if (task && $isFunction(task)) {
				task(push, result, key);
			} else {
				throw new Error("expected a function but saw " + typeof task);
			}
		};

		$async.map(tasks, iterator, callback);
	};


	$async.tasksSeries = function(tasks, callback) {
		var iterator = function (push, task, key, result, obj) {
			if (task && $isFunction(task)) {
				task(push, key, result);
			} else {
				throw new Error("expected a function but saw " + typeof task);
			}
		};

		$async.mapSeries(tasks, iterator, callback);
	};


	function $parallel(tasks, callback) {
		var len = arguments.length,
			type = typeof callback;

		// first signature: a set of async functions to call, is converted to second signature format, no final callback is used
		if ($isFunction(tasks)) {
			tasks = $slice(arguments);
			callback = function(){};
		}

		// second signature: array of functions and final callback
		if ( ($isArray(tasks) && $isFunction(tasks[0])) || ($isPlainObject(tasks) && $isFunction($values(tasks)[0])) ) {
			$async.tasks(tasks, callback);

			// third signature: async map
		} else if ((len === 2 || len === 3) && type === "function") {
			$async.map.apply($async, $slice(arguments));

			// fourth signature: async for each limit
		} else if (len === 4 && type === "number") {
			$async.eachLimit.apply($async, $slice(arguments));

		} else {
			throw new TypeError();
		}
	}


	// $series(func1, func2, func3)
	// $series([func1, func2, func3], callback)
	// $series(objectOrArray, iterator, callback)
	function $series(tasks, callback) {
		// first signature: a set of async functions to call, is converted to second signature format, no final callback is used
		if ($isFunction(tasks)) {
			tasks = $slice(arguments);
			callback = function(){};
		}

		// second signature: array of functions and final callback
		if ( ($isArray(tasks) && $isFunction(tasks[0])) || ($isPlainObject(tasks) && $isFunction($values(tasks)[0])) ) {
			$async.tasksSeries(tasks, callback);
			// third signature: async mapSeries
		} else {
			//var iterator = callback;
			$async.mapSeries(tasks, callback, arguments[2]);
		}

	}


	function $queue(worker, concurrency) {
		var workers = 0;
		var q = {
			tasks: [],
			concurrency: concurrency,
			saturated: null,
			empty: null,
			drain: null,
			push: function(data, callback) {
				if(!$isArray(data)) {
					data = [data];
				}
				$async.each(data, function(task) {
					q.tasks.push({
						data: task,
						callback: $isFunction(callback) ? callback : null
					});
					if ($isFunction(q.saturated) && q.tasks.length == concurrency) {
						q.saturated();
					}
					$async.nextTick(q.process);
				});
			},
			process: function() {
				if (workers < q.concurrency && q.tasks.length) {
					var task = q.tasks.shift();
					if($isFunction(q.empty) && q.tasks.length == 0) q.empty();
					workers += 1;
					worker(function () {
						workers -= 1;
						if (task.callback) {
							task.callback.apply(task, arguments);
						}
						if($isFunction(q.drain) && q.tasks.length + workers == 0) q.drain();
						q.process();
					}, task.data);
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

	loot.extend({
		$async: $async,
		$parallel: $parallel,
		$series: $series,
		$queue: $queue
	});

}());
/**
 * $cache.js
 * @require loot.js
 */

(function() {


}());
/**
 * @require loot cache
 */

(function() {

	var $io = loot.exports.$speak(function(url, req, dataType, reqType) {

		var key = $cache.getKey(url, req),
			parent = $isSpeaker(this) ? this : $io,
			typeId = parent.typeId || "io",
			lastArg = arguments[arguments.length-1],
			handlers = $isPlainObject(lastArg) ? lastArg : {},
			startH = handlers.start,
			successH = handlers.success,
			errorH = handlers.error,
			useCache = (typeId !== "io"),
			bin = useCache ? $cache.get(typeId, url, req) : null;

		var xhr = $.ajax({
				dataType: 	$isString(dataType) ? dataType : "json",
				type: 		$isString(reqType) ? reqType : "GET",
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
	});




	// cache -------------------------------------------------------
	var $cache = $speak({

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
				var str = ($isString(val) || $isNumber(val)) ? val : val + "";
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
							setAt: $now()
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


	/**
	 * a space is a place to store and retrieve data
	 *
	 * @param type string, the unique name of a resource
	 * @param spec object containing, model, getter, setter
	 * get: function(next, req, res) {
	 * 		// get item with id
	 * 		next(err, req, res)
	 * },
	 * set: function(next, req, res) {
	 * 		// create or update item with id
	 * 		next(err, req, res)
	 * }
	 */
	$space = (function() {

		var spaces = {};

		return function(name, def) {
			var len = arguments.length,
				space = spaces[name];

			if (!len) {
				// get all spaces
				return spaces;

			} else if (len === 1) {
				// get a space
				return space;

			} else if (len && !space) {
				// add a space
				space = {};

				return space;
			}
		}
	}());

	function $set(type, id, cb) {

	}

	function $get(type, id, cb) {

	}

	loot.extend({
		$io: $io,
		$cache: $cache,
		$isCache: $isCache,
		$space: $space,
//		$port: $port,
		$set: $set,
		$get: $get
	});

}());



/**
 * $dom.js
 * @require loot
 */

(function() {

	var root = this;

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
						return cstart + code.replace(/\\'/g, "'").replace(/\\\\/g, "\\").replace(/[\r\t\n]/g, ' ') + ")" +
							".toString().replace(/&(?!\\w+;)/g, '&#38;').split('<').join('&#60;').split('>')" +
							".join('&#62;').split('" + '"' + "').join('&#34;').split(" + '"' + "'" + '"' + ")" +
							".join('&#39;').split('/').join('&#47;'" + cend;
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
	var selfClosing = {area:1, base:1, basefont:1, br:1, col:1, frame:1, hr:1, img:1, input:1, link:1, meta:1, param:1};
	var directProperties = {className:'class', htmlFor:'for'};
	var booleanProperties = {checked: 1, defaultChecked: 1, disabled: 1, multiple: 1, selected: 1};

	var $node = (function() {

		var lt  = "<",  gt  = ">",
			lts = "</", gts = "/>" ,
			space = " ", equo = '="',
			quo = '"';

		// usage of trailing slash on self closing tags varies so mimic the platform
		// this is mostly to help write passing tests
		var selfClosingEnd = gts;
		if ("document" in root) {
			var div = document.createElement("div");
			var img = document.createElement("img");
			div.appendChild(img);
			if (div.innerHTML === "<img>") {
				selfClosingEnd = gt;
			}
		}

		// children toString should not include commas
		var childrenToString = function(node) {
			var str = "";
			$each(node, function(val) {
				if (val || val === 0) {
	//					str += $isString(val) ? $escapeHTML(val) : val;
					str += val;
				}
			});
			return str;
		};

		var node = {
			init: function() {
				this.type = "";
				this.attr = {};
				this.children = [];
				this.children.toString = function() {
					return childrenToString(this);
				}
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
					return str + selfClosingEnd;
				} else {
					return str + gt + this.children + lts + this.type + gt;
				}
			}
		};



		// for compatibility with $el dom builder in outputStrings mode
		node.appendChild = node.append;
		node.removeAttribute = node.setAttribute = node.set;

		return function(type) {
			// use new to reduce memory footprint for many nodes
			var n = $new(node);
			n.type = type || "div";
			return n;
		};

	}());

	// for compatibility with $el dom builder in outputStrings mode
	var useDocument = root.document,
		emptyString = "";

	// create nodes in real DOM or microDom from one api
	var $doc = {
		hasRealDom: function() {
			return !!root.document;
		},
		usesRealDom: function() {
			return useDocument;
		},
		useRealDom: function(bool) {
			useDocument = root.document ? bool : false;
			return useDocument;
		},
		createTextNode: function(str) {
			if (useDocument) {
				return document.createTextNode(str);
			} else {
	//				return $escapeHTML(str + emptyString);
				return str + emptyString;
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

		var eStr = "", zero = 0;;
		function setProperty(node, key, value) {
			var directProp = directProperties[key];
			var noValue = (!value && value !== zero);
			if (directProp && !noValue) {
				node[directProp] = (noValue ? eStr : eStr + value);
			} else if (booleanProperties[key]) {
				// set the attribute if true or do not add it at all
				if (value) {
					node.setAttribute(key, key);
				}
			} else if (noValue) {
				node.removeAttribute(key);
			} else {
				node.setAttribute(key, eStr + value);
			}
		}

		var pop = "pop";
		function appendChildren(node, children) {
			if (!$isArray(children)) {
				children = [children];
			}
			$each(children, function(child) {
				appendChild(node, child);
			});
		}

		if (root.document) {
			var d = document.createElement("div");
		}
		function appendChild(node, child) {
			if (child || child === 0) {
				if (child && child.pop) {
					appendChildren(node, child);
				} else {
					if (!(child && child.nodeType === 1)) {
						// handle other node types here
						// this causes lots of garbage collections
						d.innerHTML = child; // this causes lots of parse html events
						$each(d.childNodes, function(val) {
							node.appendChild(val);
						});
					} else {
						node.appendChild(child);
					}
				}
			}
		}

	//		function appendChildren(node, children) {
	//			if (!$isArray(children)) {
	//				children = [children];
	//			}
	//			$each(children, function(child, key) {
	//				if (child || child === 0) {
	//					if ($isArray(child)) {
	//						appendChildren(node, child);
	//					} else {
	//						if (!$isElement(child)) {
	//							// handle other node types here
	//							var d = document.createElement("div");
	//							d.innerHTML = child;
	//							$each(d.childNodes, function(val) {
	//								node.appendChild(val);
	//							});
	//
	//						} else {
	//							node.appendChild(child);
	//						}
	//					}
	//				}
	//			});
	//		}

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
			if (props && (props.charAt || props.pop)) {
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

			tag = tag || "div";

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
		var maxLength = 0,
			tags = {},
			splitter = /(#|\.)/,
			whitespace = /\s+/,
			validTags = "a abbr acronym address applet area article aside audio b base basefont bdi bdo big\
							blockquote body br button canvas caption center cite code col colgroup command datalist\
							dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer\
							form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins keygen kbd\
							label legend li link map mark menu meta meter nav noframes noscript object ol optgroup\
							option output p param pre progress q rp rt ruby s samp script section select small source\
							span strike strong style sub summary sup table tbody td textarea tfoot th thead time title\
							tr track tt u ul var video wbr";
		// tags list derived from http://www.w3schools.com/html5/html5_reference.asp

		$each(validTags.split(whitespace), function(str) {
			maxLength = Math.max(maxLength, str.length);
			tags[str] = 1;
		});

		// its not perfect but should get the job done
		function $isSelector(string) {

			if (string && !string.charAt) {
				return false;
			}

			if (string.safe) {
				return false;
			}

			// spaces are not valid in selectors, must be content, this should cover 90% of content
			// a common case for content is innerHTML with tags so test for that if no space
			if ((string.indexOf(" ") > -1) || (string.indexOf("<") > -1)) {
				return false;
			}

			var parts = string.split(splitter),
				tag = parts[0].toLowerCase();

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

			if (!domInstructions || !domInstructions.pop) {
				domInstructions = $slice(arguments);
				preProcessedSelector = null;
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

//				console.log(thisStep, arg);

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
							returnNodes.push(arg);
	//						console.log("++++++++++++++++++++++", arg);
							// stay on step 1 for next arg
						}
						break;

					case "1-element":
						returnNodes.push(arg);
						// stay on step one for next arg
						break;

					// new sibling node/s via partial --------------------------------------------------------------
					case "1-function":
						// todo use object expansion here to allow more return types
						returnNodes = returnNodes.concat(arg());
						// stay on step one for next arg
						break;

					// array unwrapping kinda like macro expansion  -----------------------------------------------------------------------
					case "1-array":
						//replace array with its contents and re-run the step
						len += arg.length-1;
						domInstructions.splice.apply(domInstructions, [i, 1].concat(arg));
//						console.log("expand array", domInstructions);
						i--;
						// stay on step one for next arg
						break;

//					case "1-object":
//						//replace object with array of its contents and re-run the step
//						childNodes = $dom(arg);
//						domInstructions.splice.apply(domInstructions, [i, 1].concat(childNodes));
//						console.log("expand object", domInstructions);
//						i--;
//						// stay on step one for next arg
//						break;

					// add/merge attributes ------------------------------------------------------------------------
					case "2-object":
						// grab the first value out of the object to test if it is not actually children
						var _val;
						$each(arg, function(val) {
							_val = val;
							return "break";
						});

						// oop! looks like we actually want to treat the object as children here
						if (_val && (_val.pop || $isSelector(_val))) {
//							console.log("object as children", domInstructions);
							// final possible step so start back on 1 for next arg
							// this is where we do recursion, see also 2-array
							childNodes = $dom($values(arg));
							// and push the result back into the final output
							returnNodes.push($el(tag, attributes, childNodes));
							step = 1;
							break;
						}

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
						break;

					// next sibling node via selector or child string ------------------------------------------------------------------
					case "2-number":
					case "3-number":
						arg += ""; // convert to string and fall through to next block
					case "2-string":
					case "3-string":
					case "3-element":
						selector = preProcessedSelector || $isSelector(arg);

						// starting a new object
						if (selector || selfClosing[tag]) {
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
						break;

					// recursive child array -----------------------------------------------------------------------
					case "2-array":
					case "3-array":
						if (selfClosing[tag]) {
							throw new Error("Can not add children to " + tag);
						}
						// this is where we do our recursion, see also 2-object
						childNodes = $dom(arg);
						// and push the result back into the final output
						returnNodes.push($el(tag, attributes, childNodes));
						// final possible step so start back on 1 for next arg
						step = 1;
						break;

					case "3-function":
						// no children so done, functions in third position are treated as siblings
						// function will get handled in step 1 after we finish up here
						// to produce children functions can be wrapped in an array
						returnNodes.push($el(tag, attributes));
						returnNodes = returnNodes.concat(arg());
						// final possible step so start back on 1 for next arg
						step = 1;
						break;

					default:
						var errMsg = "$dom: No such step + type combination: " + thisStep + " - previous was " + prevStep + ", " + arg;
						console.log(errMsg, arg, returnNodes);
						throw new TypeError(errMsg);
				}

			}

			childNodes = attributes = null;

			// we do this down here bc for function types we do a concat which overwrites returnNodes
			returnNodes.toString = function() {
				return this.join('');
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
	 * @description this function serves as a constructor, getter, setter and collection interface to partials
	 * there are multiple signatures and a plural alias that makes more sense depending on what you want to do
	 * $part("name", function(data){...}) returns the provided function, saves the function under the given name so that it can be used via the following signatures
	 * $parts() returns and object that contains all the partials by name
	 * $parts("myPartial") returns a partial function(data) which if called returns a minidom
	 * $parts("myPartial", dataObject)
	 */
	function $part(name, arg) {
		if (arguments.length === 0) {
			return parts;							// get all
		} else if (!$isString(name)) {
			throw new TypeError("Expected string for name but saw " + $typeof(name));
		}

		if (name in parts) {
			if (!arg) {
				return parts[name];					// get

			} else if ($isFunction(arg)) {
				return parts[name] = arg;			// update

			} else if ($isObject(arg)) {
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

	function $render(name, data) {
		return $parts(name)(data).toString();
	}

	// script helper for $part, $dom
	var jsre = /^http|^\/|^\.|\.js$/i;
	function $js(script) {
		var val, attrs = {type: "text/javascript"};

		if ($isFunction(script)) {
			var scriptStr = script.toString();
			scriptStr = scriptStr.substring(scriptStr.indexOf("{") + 1, scriptStr.lastIndexOf("}"));
			val = $el("script", attrs, scriptStr);
			console.log("----------", val, scriptStr);
		} else if ($isString(script)) {
			if (script.match(jsre)) {
				attrs.src = script;
				val = $el("script", attrs);
			} else {
				val = $el("script", attrs, script);
			}
		} else if ($isPlainObject(script)) {
			val = $el("script", $mixin(attrs, script));
		}

		return val;
	}

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
			if (typeof string == "string") {
				string = new String(string.replace(amp, ampStr).replace(lt, ltStr).replace(gt, gtStr).replace(quot, quotStr).replace(squot, squotStr)); //.replace(fslash, fslashStr);
				string.safe = true;
			}
			return string;
		};
	}());


	// modified from backbone.js
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

	var $bindEventSpec = (function() {
		// from backbone.js
		// Cached regex to split keys for `delegate`.
		var eventSplitter = /^(\S+)\s*(.*)$/;

		return function(context) {

			var node, events, id;

			if (arguments.length == 3) {
				node = arguments[0];
				events = arguments[1];
				context = arguments[2];
			} else {
				node = context.node;
				events = context.events;
			}

			id = context.id || "";

			if (!$isElement(node) || !events) {
				console.log(node, events, context);
				throw new Error("invalid arguments");
			}

			$(node).unbind('.delegateEvents' + id);

			$each(events, function(val, key) {
				var match = key.match(eventSplitter),
					eventName = match[1] + '.delegateEvents' + id,
					selector = match[2],
					fn = $isFunction(val) ? val : context[val],
					cb;

				if ($isFunction(fn)) {
					cb = function(e) {fn.call(this, e, context);};

					if (selector === '') {
						$(node).bind(eventName, cb);
					} else {
						$(node).on(eventName, selector, cb);
					}
				} else {
					console.log(fn, val, key);
					throw new Error("No such callback " + val);
				}
			});
		};
	}());



	function touchToMouse(event) {
		if (event.touches.length > 1) return; //allow default multi-touch gestures to work
		var touch = event.changedTouches[0];
		var type = "";

		switch (event.type) {
			case "touchstart":	type = "mousedown";	break;
			case "touchmove":	type = "mousemove";	break;
			case "touchend":	type = "mouseup";	break;
			default:			return;
		}

		// https://developer.mozilla.org/en/DOM/event.initMouseEvent for API
		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
			touch.screenX, touch.screenY,
			touch.clientX, touch.clientY, false,
			false, false, false, 0, null);

		touch.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	};

	function $touchable(el) {
		el.ontouchstart = touchToMouse;
		el.ontouchmove = touchToMouse;
		el.ontouchend = touchToMouse;
	};




	loot.extend({
		$id: $id,
		$tmpl: $tmpl,
		$node: $node,
		$doc: $doc,
		$el: $el,
		$isSelector: $isSelector,
		$dom: $dom,
		$part: $part,
		$js: $js,
		$script: $js,
		$parts: $parts,
		$render: $render,
		$escapeHTML: $escapeHTML,
		$bindEventSpec: $bindEventSpec,
		$touchable: $touchable
	});

}());
/**
 * model.js
 * @require loot
 */
// models -------------------------------------------------------
(function() {

	var schemaBank = {};

	function modelApiGet(modelVals, keys) {
		keys = keys || [];
		var model = this, // this is set as the model via apply
			keyLen = keys.length,
			first = keys[0],
			singleKey = (keyLen == 1 && $isString(first)) ? true : false,
			val;

		if (singleKey) {
			val = modelVals[first];
			// supports computed values
			return $isFunction(val) ? val.call(modelVals, model) : val;

		} else if (keyLen > 1 || $isArray(keys[0])) {
			var results = {}, _keys = keyLen > 1 ? keys : keys[0];
			$each(_keys, function(key) {
				if (key in modelVals) {
					val = modelVals[key];
					// supports computed values
					results[key] = $isFunction(val) ? val(model) : val;
				}
			});
			return results;

		} else {
			return $map(modelVals, function(v, k) {
				return $isFunction(v) ? modelVals[k](model) : v;
			});
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

	function parseInput(val, key, fn, model) {
		fn = $isString(fn) ? this[fn] : fn;
		if ($isFunction(fn)) {
			return fn.call(model, val, key);
		}
		return val;
	}

	function parseInputs(vals) {
		var parse = this.parseInput,
			model = this,
			newVals = $isArray(vals) ? [] : {};

		if (parse) {
			$each(parse, function(fn, key) {
				if (key in vals) {
					newVals[key] = parseInput(vals[key], key, fn, model);
				} else if (key === "*") {
					$each(vals, function(v, k) {
						newVals[k] = parseInput(v, k, fn, model);
					});
				}
			});

			return $mixin(newVals, vals);
		}

		return vals;
	}

	function parseData(vals) {
		var parse = this.parse,
			model = this;
		if (parse) {
			return parse.call(model, vals);
		} else {
			return vals;
		}
	}

	function modelApiSet(modelVals, _key, _val) {
		var val, key, obj,
			changes = {},
			validate = this.validate || {},
			defaults = this.defaults || {},
			validators,
			validationFailures,
			failures = {},
			dynValErr = "cannot set dynamic property ";

		// handle single and multi-property syntax
		if (typeof _key === "string") {
			obj = {};
			obj[_key] = _val;
		} else {
			obj = _key;
		}

		// validate and generate our changes
		for (key in obj) {
			if (!obj.hasOwnProperty(key)) {
				continue;
			}
			val = obj[key];
			if ($isFunction(defaults[key])) {
				failures[key] = dynValErr + key;

			// check for validator fn also no need to validate if we are deleting (val === undefined)
			} else if((validators = validate[key]) && (val !== undefined)) {
				// handle single validator fn or expect an array
				validators = $isFunction(validators) ? [validators] : validators;
				validationFailures = {};
				$each(validators, function(validateFn, k) {
					var result = validateFn(val);
					if (result === true) {
						validationFailures[k] = result;
					}
				});
				if ($length(validationFailures)) {
					failures[key] = validationFailures;
				} else {
					changes[key] = val;
				}
			} else {
				changes[key] = val;
			}
		}

		if ($length(failures)) {
			this.tell("validationFailed", {
				passed: changes,
				failed: failures
			});
		} else {
			// no errors! merge our changes into the model values
			$extend(modelVals, changes);
			this.tell("change", changes);
		}

		return this;
	}

	// define a type of object or data model
	function $schema(type, spec, collection) {
		var existingSchema = schemaBank[type],
			instances = [], ctorArgs = arguments;

		// schema getter
		if (arguments.length === 0) {
			return schemaBank;

		// schema getter
		} else if (type && arguments.length === 1 && existingSchema) {
			return existingSchema;

		// schema constructor
		} else if (type && $isString(type) && !existingSchema) {
			spec = $copy(spec || {});
			spec.defaults = spec.defaults || {};

			// type-check optional validators
			if (spec.validate) {
				$each(spec.validate, function(val) {
					if (!$isFunction(val)) {
						throw new Error("validator must be a function");
					}
				});
			}

			var schemaApi = $speak({
				type: type,
				spec: function() {
					return spec;
				},
				constructor: function(vals) {
					return this.newInstance(vals);
				},
				drop: function() {
					this.dropInstances();
					instances = existingSchema = null;
					delete schemaBank[type];
					$clear(this, true);
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
					var modelVals = $copy(spec.defaults);
					var modelProto = $speak($new(spec));
					var drop = spec.drop;

					if (drop && !$isFunction(drop)) {
						throw new Error("if drop is provided it must be a function");
					}

//					console.log(type, this, arguments);

					// model instance api
					var model = $extend(modelProto, {
						schema: type,

						// the following get and set facade allows us to have a unique closure for modelVals and modelProto
						// without having copies of the larger modelApiSet and modelApiGet functions on each model instance hopefully saving some memory usage
						get: function() {
							//return modelApiGet.apply(this, $flat(modelVals, $slice(arguments))); // todo can we do this in a better way

							return modelApiGet.call(this, modelVals, $slice(arguments));
						},
						set: function(key, val) {
							return modelApiSet.call(this, modelVals, key, val);
						},
						reset: function() {
							return modelApiReset.call(this, modelVals, spec.defaults);
						},
						renew: function() {
							return init();
						},
						drop: function() {
							drop && drop();
							this.tell("drop", this);
							// remove this instance from the instances array
							instances.splice(instances.indexOf(this), 1);
							$clear(this, true);
						}
					});

					vals = parseInputs.call(model, vals);

					vals = parseData.call(model, vals);

					// copy our parsed initial values to the model
					if (!$isString(vals)) {
						$mixin(modelVals, vals);
					}

					var that = this;
					var init = function() {

						// all model events are forwarded to their parent schema
						model.talksTo(that);

//						console.log("model init", model, that);

						instances.push(model);
						model.tell("created", that);

						return model;
					};

					return init();
				}
			});

			schemaBank[type] = (collection ? $make(schemaApi, collection) : schemaApi);

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
		if (!arguments.length) {
			return $schema();
		} else if (!type || !$isString(type) || !schema) {
			//throw new Error("$model: valid type string required");
			return null;
		} else if (vals && !$isPlainObject(vals)) {
			//throw new Error("$model: valid values object required for " + type);
		} else {
			return schema.newInstance(vals);
		}
	}

	function $models(type, key, val) {
		var models = $schema(),
			len = arguments.length;

		if (len === 2) {
			val = key;
			key = "id";
		}

		if (!len) {
			return models;
		} else if (type in models) {
			var instances = models[type].getInstances(), ret;
			if (len > 1) {
				$each(instances, function(inst) {
					if (inst.get(key) == val) {
						ret = inst;
					}
				});
				return ret;
			} else {
				return instances;
			}
		}
	}

	$models.getInstanceCounts = function() {
		return $map($models(), function(model) {
			return model.getInstances().length;
		});
	};

	function $isSchema(obj) {
		return (obj && $isFunction(obj.drop) && $isString(obj.type) && obj.getInstances && obj.newInstance);
	}

	function $isModel(obj) {
		return (obj && $isFunction(obj.drop) && $isString(obj.schema) && obj.set && obj.get);
	}

	loot.extend({
		$schema: $schema,
		$define: $schema,
		$model: $model,
		$models: $models,
		$isSchema: $isSchema,
		$isModel: $isModel
	});

}());
/**
 * $view.js
 * @require loot model
 */

(function() {

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
			ctorArgs = arguments,
			instances = [];

//		console.log("$view arguments", arguments);

		// constructor getter
		if (type && arguments.length === 1 && existing) {
			return existing;

		// init a new view instance of the given, existing type
		// passing the provided model data object in the 2nd argument
		} else if (type && arguments.length === 2 && existing) {
			var modelData = node;
//			if (modelData.defaults || modelData.node || modelData.model || modelData.events) {
//				throw new Error("Invalid Arguments!");
//			}
			return existing(modelData);

		// return a view constructor
		} else if ($isString(type) && !existing) {
			var constructor = function(modelData, controller) {
				var renderer, update, drop, viewNode, viewModel, modelCollection;
				var view = $speak({
					drop: function() {
						this.model && this.unbindModel() // unsubscribe our model from events from this view
						drop && $isFunction(drop) && drop(); 	// call the custom drop method if it exists
						$(view.node).remove(); 					// this will unbind event handlers
						view.parentNode && view.parentNode.removeChild(view.node);
						view.tell("drop");						// emit our drop event
						$clear(this, true);						// final house cleaning
					},
					update: function() {
						update({}, "update", view.model);
						return this;
					},
					draw: function() {
						if (view.model) {
							view.update(view.model.get(), view.type, view.model);
						}
						return this;
					},
					get: function() {
						return view.model.get.apply(view.model, $slice(arguments));
					},
					set: function() {
						return view.model.set.apply(view.model, $slice(arguments));
					},
					unbindModel: null,
					setModel: function(model, noUpdate) {

						// do nothing if model is already set to this value
						if (model && model === this.model) {
							return;
						}

						// unbind any pre-existing models from this views update events
						this.unbindModel && this.unbindModel();

						if (model &&  !$isModel(model) && !$isCollection(model)) {
							throw new Error("$view: model argument must be a $model or $collection");
						}

						view.model = model;

						if ($isCollection(model)) {
							// there are more events to watch for with a collection of models
							// so we need to handle both the "change:type" events from the collection
							// and the "change" events from its child models
							//
							// this changes the signature we can provide to the update function which will affect how
							// what data is provided to the render function, in both cases the render function's
							// data argument (the first one) will be the result of calling get on the collection
							// by default this is the array of collection.items
							//
							// if the collection changes the update method will be called with the following arguments
							// 		changes = the collection instead of the usual which is any specific model or any specific changed values
							// 		type = "change:someaction"
							//		model = the value of view.model which is actually the collection instead of the usual which is an actual model instance

							// if a model in the collection changes the update method will be called with the following arguments
							// 		changes = the changed model instance NOT the changed values as is the case with models bound to views
							// 		type = "change"
							//		model = the value of view.model which is actually the collection vs an actual model instance
							//
							// we only want change or change:someaction events
							// the regex could be more specific but this works for now
							var matchRe = /^change/;
							var callback = function(changes, type, model) {
								update(model, type, this);
							};
							this.unbindModel = function() {
								model.ignore && model.ignore(callback);
								this.model = null;
							};

							view.model.listen(matchRe, callback);

						} else if (view.model) {
							this.unbindModel = function() {
								model.ignore && model.ignore(update);
								this.model = null;
							};
							// the arguments passed to update will be
							// 		changes = an object of just the properties on the model that have changed
							// 		type = "change"
							// 		model = the changed model
							//
							// the view render function will be provided with the result of calling get on the model
							view.model.listen("change", update);
						}

						if (!noUpdate) {
							this.update();
						}

					}
				});

				// handle object syntax
				if (node && ctorArgs.length === 2 && $isObject(node)) {
					var spec = ctorArgs[1];
					events = spec.events;
					viewNode = spec.node;
					viewModel = $isModel(modelData) ? modelData : spec.model;
					modelCollection = $isCollection(modelData) ? modelData : spec.collection;
					drop = spec.drop;
					templateOrRenderFn = spec.template || spec.render;
					$extend(view, spec);
				}

				if ($isString(viewNode)) { viewNode = $el(viewNode); }

				if ($isString(viewModel)) { viewModel = $model(viewModel, modelData); }

				if ($isString(modelCollection)) { modelCollection = $collections(modelCollection);}

				if (!$isElement(viewNode)) {
					throw new Error("$view: node must be a DOM node");
				}

				if ( (viewModel && !$isModel(viewModel)) || (modelCollection && !$isCollection(modelCollection)) ) {
					throw new Error("$view: model argument must be a product of $model");
				}

				view.type = type;
				view.id = $uniqueId(type+"View");
				view.node = viewNode;

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
						var content = templateOrRenderFn.call(view, rmodel && rmodel.get(), changes, view);

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

				view.setModel(modelCollection || viewModel, true); // 2nd arg prevents update, we do that below and we need this here before init

				view.init && $isFunction(view.init) && view.init(controller);

				events && $bindEventSpec(view);

				if ($isPlainObject(view.listeners)) {
					$speak.util.bindListenerSpec(view, view.listeners);
				}

				instances.push(view);

				view.update();

				return view;
			};

			$mixin(constructor, {
				drop: function() {
					this.dropInstances();
					instances = existing = null;
					delete viewConstructorBank[type];
					$clear(this, true);
					$view.tell("drop", {constructor: type});
				},

				getInstance: function(id) {
					return $find(this.getInstances(), function(view) {
						return view.id === id;
					});
				},

				getInstances: function() {
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
	}

	function $views(type, id) {
		if (type && type in viewConstructorBank) {
			if (type && id) {
				return viewConstructorBank[type].getInstance(id);
			} else {
				return viewConstructorBank[type].getInstances();
			}
		} else if (!arguments.length) {
			return viewConstructorBank;
		} else {
			return undefined;
		}
	}

	function $isViewInstance(view) {
		return view && view.drop && $isFunction(view.drop) && view.node && view.model;
	}

	function $isViewConstructor(view) {
		return $contains(viewConstructorBank, view);
	}


	loot.extend({
		$view: $view,
		$views: $views,
		$isView: $isViewInstance,
		$isViewConstructor: $isViewConstructor
	});

}());
/**
 * $collection.js
 * @require loot view model
 */

(function() {

	var collectionAPI = {

		items: true,

		length: function() {
			return this.items.length;
		},

		isSortedBy: "",
		isGroupedBy: "",
		skip: 0,
		limit: 10,
		filter: null,
		isReversed: false,

		add: function(val, silent, skipOrder) {
//			// console.log(val);
			// supports batch add
			var items = $isArray(val) ? val : [val];

			var that = this;
			$each(items, function(item) {
				// can add a view or model depending on how the collection is setup
				if (that.view) {
					// make sure we insert a view instance not a config obj
					if ($isModel(item)) {
//						// console.log("adding view with model", item);
						// support overriding view model on view construction
						item = that.view(item, that);
//						console.log("makin a view", item);
					} else {
//						console.log("adding view", item);
						item = $isView(item) ? item : that.view(item, that);
					}
				} else if (that.schema) {
					// make sure we insert a model instance not a config obj
					item = $isModel(item) ? item : that.schema.newInstance(item);
				}

				if ($isSpeaker(item)) {
					that.listensTo(item);
				}

				that.items.push(item);
			});

			//resort regroup
			if (!skipOrder) {	this.order();}
			if (!silent) {		this.tell("change:add", items);}

			return this;
		},

		push: function(item) {
			this.add(item);
			return this;
		},

		order: function() {
			if (this.sortIterator) {
				this.items = $sortBy(this.items, this.sortIterator);
			} else if (this.isSortedBy) {
				this.sortBy(this.isSortedBy);
			}
			if (this.groupByIterator) {		this.items = $groupBy(this.items, this.groupByIterator);}
			if (this.isReversed) {			this.items.reverse();}
			return this;
		},

		set: function(items) {
			// todo drop views or models that are not in the new items collection?
			this.items = [];
			this.add(items, "silent", true);
			this.order();
			this.tell("change:set", items);
			return this;
		},

		// returns model instances
		get: function(key, val) {
			if ($isNumber(key)) {
				return this.items[key];
			} else if (arguments.length === 2 && $isString(key)) {
				var match, model;
				$each(this.items, function(it) {
					model = it.model || it;
					if (model.get(key) == val) {
						match = it;
						return $each.break;
					}
				});
				return match;
			} else {
				return this.items;
			}
		},

		getAll: function(prop) {
			return $map(this.items, function(item) {
				return item.get(prop);
			});
		},

		// returns model values
		// todo: how does this relate to pluck?
		getValues: function(i, key) {
			var model, len = this.items.length;
			if ($isNumber(i)) {
				i = (i < 0) ? (len + i) % len : i;
				model = this.items[i];
			}

			if (model) {
				return $isFunction(val.get) ? model.get(key) : null;
			} else {
				return $map(this.items, function(val) {
					return $isFunction(val.get) ? val.get(key) : val;
				});
			}
		},

		getGroupSortIterator: function(val) {
			return function(obj) {
				if (!obj) {
					return false;
				}
				if ($isModel(obj.model)) {
					return obj.model.get()[val];
				} else if ($isFunction(obj.get)) {
					return obj.get()[val];
				} else {
					return obj[val];
				}
			};
		},

		sortBy: function(val) {
			var iterator = $isFunction(val) ? val : this.getGroupSortIterator(val);
			this.isSortedBy = val;
			this.sortIterator = iterator;
			this.items = $sortBy(this.items, iterator);
			if (this.isReversed) {
				this.items.reverse();
			}
			this.tell("change:sortBy");
			return this;
		},

		groupBy: function(val) {
			var iterator = $isFunction(val) ? val : this.getGroupSortIterator(val);
			this.isGroupedBy = val;
			this.groupByIterator = iterator;
			this.items = $groupBy(this.items, iterator);
			this.tell("change:groupBy");
			return this;
		},

		reverse: function() {
			this.isReversed = !this.isReversed;
			this.items.reverse();
			this.tell("change:reverse");
			return this;
		},

		drop: function(obj) {
			var i = obj ? this.items.indexOf(obj) : this.items.length-1;
			if (i > -1) {
				var old = this.items.splice(i, 1)[0];
			}
			this.tell("change:drop", old);
			old && old.drop();
			return this;
		},

		pop: function() {
			var old = this.items.pop();
			var snapshot = $isModel(old) ? old.get() : old ? old.model : null;
			snapshot = $isModel(snapshot) ? snapshot.get() : old;
			this.tell("change:pop", snapshot);
			return snapshot;
		},

		dropAll: function() {
			$map(this.items, function(item) {
				// both views and models have a drop method
				item.drop && item.drop();
			});
			this.items = [];
			this.tell("change:dropAll");
			return this;
		},

		draw: function() {
			if ($isElement(this.node)) {
				var nodes = [];
				$each($slice(this.items, this.skip, this.skip+this.limit), function(view) {
					if (view && $isElement(view.node)) {
						nodes.push(view.node);
					}
				}, this);

				// can't just use jquery html here because you will
				// loose click handlers and jquery.data associated with the node
				this.node.innerHTML = "";
				$(this.node).append(nodes);
			}
//			console.log("DRAW!", this, this.items);
			return this;
		},

		destroy: function() {
			this.ignore();
			$(this.node).remove().unbind();
			this.dropAll();
			delete collectionBank[this.name];
		}

	};

	var collectionBank = {};

	// $collection function creates a collection instance
	function $collection(name, spec) {
		var view = spec.view,
			schema = spec.schema;

		// console.log("collection extend", name, spec);

		// return a new collection constructor
//		if (!schema && !view) {
//			throw new Error("$collection: Expected an object with a schema or view property");
//		}

		if (name in collectionBank) {
			// console.log(collectionBank, name);
			throw new Error("collection name " + name + " already in use;");
		}

		var collection = $speak($extend($new(collectionAPI), spec));
		collection.items = [];

		// make sure we have a valid view constructor
		if (view) {
//			console.log(view, $view(view));
			view = $isString(view) ? $view(view) : view;
			if ($isViewConstructor(view)) {
				collection.view = view;
				collection.draw = spec.draw ? spec.draw : collection.draw;
			} else {
//				console.log(collection, view);
				throw new Error("$collection: Invalid view type or constructor function");
			}
		} else if (schema) {
			delete collection.draw;
			schema = $isString(schema) ? $schema(schema) : schema;
			if ($isSchema(schema)) {
				collection.schema = schema;
			} else {
//				console.log(collection, schema);
				throw new Error("$collection: Invalid schema type or constructor function ");
			}
		}

		if ($isString(collection.node)) {
			collection.node = $el(collection.node);
		}

		if (collection.events && $isElement(collection.node)) {
			$bindEventSpec(collection);
		}

		if ($isPlainObject(collection.listeners)) {
			$bindListenerSpec(collection);
		}

		if ($isFunction(collection.init)) {
			collection.init();
		}

		collectionBank[name] = collection;

		collection.listen("*", function(msg, type) {
			if (type !== "change" && type.match("change")) {
				collection.tell("change", {
					msg: msg,
					type: type
				});
			}
		});

		return collection;
	}


	function $collections(name) {
		if (!name) {
			return collectionBank;
		} else {
			return collectionBank[name];
		}
	}

	function $isCollection(obj) {
		return !!(obj && obj.add && obj.items && obj.groupBy && obj.pop);
	}

	// expose methods
	loot.extend({
		$collection: $collection,
		$collections: $collections,
		$isCollection: $isCollection
	});

}());
/**
 * $route.js
 * @require loot
 */
/*
	a lightweight URL router written in Javascript. The routing is based on the path after the hash (#)
	in the URL, thus providing pure client-side navigation for AJAX applications.

	Consider a simple scenario: myshop.com wants to implement pure AJAX-navigation between products using jsRouter.
	1. Register the routes in your application
		function onRootInvoked() { ... }
		function onProductsInvoked() { ... }
		$route('Root', '', onRootInvoked);
		$route('Products', 'products/:productId', onProductsInvoked, { productId: 0 });

	2. Use normal anchor tags or the $loadRoute method to invoke the routes
		<a href="#products">Products</a>
		$loadRoute('Products', { productId: 343434 });

	3. The callbacks gets triggered by the matched route
		http://myshop.com/ triggers onRootInvoked
		http://myshop.com/#products will trigger onProductsInvoked with productId set to 0
		http://myshop.com/#products/7724 will trigger onProductsInvoked with arguments containing the productId
*/

(function(root) {
	// modified from http://jsrouter.codeplex.com/

	var routeTable = [],
		currentRoute,
		currentPath,
		hashListenerInterval,

		isReady = false;

	function getRoute(routeName) {
//		routeName = decodeURIComponent(routeName);
		var route;
		// finds the specified route in the routeTable
		for (var i= 0, len=routeTable.length; i<len; i++) {
			route = routeTable[i];
			if (route.name == routeName) {
				return route;
			}
		}

		if (route = findRoute(routeName)) {
			return route;
		}

		throw new Error('$routes: route "' + routeName + '" was not found.');
	}

	function fillPath(route, args) {
		// replaces the values in a format string with the matching values from the args dictionary.
		var path = route.pathPattern;
		if (route.defaults) {
			for (var key in route.defaults) {
				if (args && args[key] !== undefined) continue;
				var regExp = new RegExp("\\:" + key, "gi");
				path = path.replace(regExp, '');
			}
		}
		if (args) {
			for (var key in args) {
				var keyVal = args[key],
					value = encodeURIComponent(keyVal),
					regExp = new RegExp("\\:" + key, "gi");
				path = path.replace(regExp, value);
			}
		}
		return path.replace(/\/+$/, ''); // remove any remaining trailing backslashes
	}

	function parsePath(path, route) {
		// parses the values in the hash into an object with the keys the values specified in the given route
		var values = $new(route.defaults),
			pathSegments = path.split('/');

		for (var i = 0, segment, match; i < pathSegments.length && (segment = route.segments[i]); i++) {
			if ((match = /:(\w+)/.exec(segment)) != null) {
				if (pathSegments[i] == '' && values[match[1]]) {
					continue; // skip empty values when the value is already set to a default value
				}
				values[match[1]] = pathSegments[i];
			}
		}
		return values;
	}

	function buildRegExp(route) {
		// converts the route format into a regular expression that would match matching paths
		var pathSegments = route.pathPattern.replace(/\/+$/, '').split('/'),
			defaults = route.defaults;

		var regexp = ['^'];
		for (var i = 0, segment, match; (segment = pathSegments[i]) !== undefined; i++) {
			if ((match = /:(\w+)/.exec(segment)) != null) {
				var argName = match[1];

				// add a backslash, except for the first segment
				regexp.push((i > 0 ? '(\/' : '') + '([^\/]+)' + (i > 0 ? ')' : ''));

				if (defaults && defaults[argName] !== undefined) {
					// make the group optional if the parameter has a default value
					regexp.push('?');
				}
			}
			else {
				regexp.push((i > 0 ? '/' : '') + segment);
			}
		}
		regexp.push('$');

		return new RegExp(regexp.join(''), 'i');
	}

	function findRoute(path) {
		// finds the first route that matches the given path
		for (var i = 0, route; route = routeTable[i]; i++) {
			if (!route.regexp) { // generate regexps on the fly and cache them for the future
				route.regexp = buildRegExp(route);
				route.segments = route.pathPattern.split('/');
			}
			var isMatch = route.regexp.test(path);
			if (isMatch) {
				// route found, parse the route values and return an extended object
				var values = parsePath(path, route);
				return $extend({}, route, { values: values });
			}
		}
		return null;
	}

	function getCurrentRoute() {
		var path = window.location.hash;
		if (currentRoute && currentPath == path) {
			return currentRoute; // return the cached current route
		}
		if (!isReady) return;
		path = path.replace(/^#/, '').replace(/\/+$/, ''); // remove any leading hash and trailing backslashes
		var route = findRoute(path);
		if (route) {
			var values = parsePath(path, route);
			return $extend({}, route, { values: values });
		}
	}

	function onHashChanged() {
		if (currentPath == window.location.hash) {
			return;
		}

		var route = getCurrentRoute();
		if (route && route.callback) {
			// update state
			currentRoute = route;
			currentPath = window.location.hash;
			// trigger the callback
			route.callback(route.values);
		}
	}

	function $route(routeName, pathPattern, callback, defaults) {
		if (arguments.length === 2) {
			if ($isFunction(pathPattern)) {
				// define a simple route
				routeTable.push({
					name: routeName,
					pathPattern: routeName,
					callback: pathPattern,
					defaults: defaults
				});
			} else {
				throw new Error("incomplete arguments");
			}

		} else {
			routeTable.push({
				name: routeName,
				pathPattern: pathPattern,
				callback: callback,
				defaults: defaults
			});
		}
	}

	function $routes(routeName) {
		if (!routeName) {
			return routeTable;
		} else {
			return routeTable[routeName];
		}
	}

	function $loadRoute(routeName, values) {
		var route;
		if (!arguments.length) {
			route = getCurrentRoute();
		} else {
//			routeName = encodeURIComponent(routeName);
			route = getRoute(routeName);
		}

		var path = "#" + fillPath(route, values || route.values);
		if (window.location.hash !== path) {
			console.log("set hash");
			window.location.hash = path;
		} else {
			console.log("same hash");
			onHashChanged();
		}
	}

	var routerApi = $speak({
		getCurrentRoute: function() { return currentRoute;},
		getCurrentPath: function() { return currentPath;}
	});

	function $router(spec) {
		// copy our spec
		var router = $extend(routerApi, spec);

		if (spec && spec.routes) {
			$each(spec.routes, function(fn, key) {
				$route(key, function(attrs) {
					if ($isString(fn)) {
						fn = router[fn];
					} else if (!$isFunction(fn)) {
						throw new Error("invalid route callback value");
					}
					fn.apply(router, $slice(arguments));
				});
			});
		} else {
			throw new Error("routes property required");
		}

		if ($isPlainObject(router.listeners)) {
			$bindListenerSpec(router);
		}

		return router;
 	}

	// hook up events
	// todo support node
	if ("onhashchange" in root) {
//		console.log("hashchange supported");
		$(window).on('hashchange', onHashChanged);
	} else {
//		console.log("fallback");
		// todo fix fallback
		//hashListenerInterval = setInterval(onHashChanged, 100);
	}
	isReady = true;

	// expose methods
	loot.extend({
		$route: $route,
		$router: $router,
		$routes: $routes,
		$loadRoute: $loadRoute,
		$currentRoute: getCurrentRoute
	});

}(this));

