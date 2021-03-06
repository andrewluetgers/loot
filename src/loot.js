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

	// also aliased as $indexOf
	function $keyOf(obj, val, key) {
		var key = $isArray(obj) ? -1 : "";
		$each(obj, function(v, k) {
			if (val === v) { key = k; return $each.break; }
		});
		return key;
	}

	// expressions of a type class, used with $typeofx
	var $typex = {
		"String": {
			$typex: "String",
			test: function(b) {return $isString(b);}
		},

		"Function": {
			$typex: "Function",
			test: function(b) {return $isFunction(b);}
		},

		"Array": {
			$typex: "Array",
			test: function(b) {return $isArray(b);}
		},

		"Number": {
			$typex: "Number",
			test: function(b) {return $isNumber(b);}
		},

		"Object": {
			$typex: "Object",
			test: function(b) {return $isObject(b);}
		},

		"Boolean": {
			$typex: "Boolean",
			test: function(b) {return $isBoolean(b);}
		},

		"has": function(x) {
			return {
				$typex: "has",
				args: $slice(arguments),
				test: function(b) {return $has(b, x);}
			}
		}
	};

	var baseConstructors = {
		"Array": Array,
		"Object": Object,
		"String": String,
		"Function": Function,
		"Boolean": Boolean,
		"Number": Number
	};

	var comparators = {
		">": function(a, b) { return a > b;},
		"<": function(a, b) { return a < b;},
		">=": function(a, b) { return a >= b;},
		"<=": function(a, b) { return a <= b;},
		"==": function(a, b) { return a == b;},
		"===": function(a, b) { return a === b;},
		"!=": function(a, b) { return a != b;},
		"!==": function(a, b) { return a !== b;},
		"&&": function(a, b) { return a && b;},
		"||": function(a, b) { return a || b;}
	};

	function $x(expr, comp) {
		// fix me
		// handle constructor functions for types like Array
		if ($isFunction(expr)) {
			expr = $keyOf(baseConstructors, expr);
		}

		console.log(expr);

		if (expr in $typex) {
			if (comp) {
				console.log("comp", comp);
				var ret = $mixin({}, $typex[expr], {
					test: function(b) {
						console.log("TEST", $typex[expr], $typex[expr].test(b), b);
						if ($typex[expr].test(b)) {
							if ($isFunction(comp)) {
								console.log("call comp(b)");
								return comp(b);

							} else if ($isString(comp)) {
								var parts = comp.split(" "),
									operator = parts[0],
									rVal = parts[1],
									compare = comparators[operator];

								console.log("test", expr, expr === "Number", parts, compare);

								if (expr === "Number") {rVal = rVal*1; b = b*1}
								if (expr === "Boolean") {rVal = (rVal === "false") ? false : true;}
								if (compare) {return compare(b, rVal);}
							}
						}
					}
				});
				console.log("ret", ret, expr, $typex[expr], $typex[expr].test);
				window.c1 = ret;
				window.c2 = $typex[expr];
				return ret;
			} else {
				return $typex[expr];
			}
		}  else {
			throw new Error("no such $typex " + expr);
		}
	}

	// typeof that supports expressions of type classes
	// eg
	function $typeofx(x) {
		var t = $typeof(x);
		if (t === "object") {
			return x.$typex || t;
		} else {
			return t;
		}
	}


	// from qunit
	var $same = (function() {
		var innerEquiv;   // the real equiv function
		var callers = []; // stack to decide between skip/abort functions
		var parents = []; // stack to avoiding loops from circular referencing

		// Call the o related callback with the given arguments.
		function bindCallbacks(o, callbacks, args) {
			var prop = $typeofx(o);
			if (prop && callbacks[prop]) {
				return callbacks[prop].apply(callbacks, args);
			}
		}

		var callbacks = (function () {
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

					// track reference to avoid circular references
					parents.push(a);
					for (i = 0; i < len; i++) {
						loop = false;
						for(j=0;j<parents.length;j++){
							if(parents[j] === a[i]){
								loop = true; // don't re-walk array
							}
						}
						if (!loop && ! innerEquiv(b[i], a[i])) {
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
					// track reference to avoid circular references
					parents.push(a);

					for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
						loop = false;
						for(j=0;j<parents.length;j++){
							if(parents[j] === a[i]) {
								loop = true; //don't go down the same path twice
							}
						}
						aProperties.push(i); // collect a's properties

						if (!loop && ! innerEquiv(b[i], a[i])) {
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
					return eq && innerEquiv(bProperties.sort(), aProperties.sort());
				},

				"String": $typex.String.test,
				"Number": $typex.Number.test,
				"Array": $typex.Array.test,
				"Function": $typex.Function.test,
				"has": function(b, a) {
					return a.test(b);
				}
			};
		}());

		innerEquiv = function () { // can take multiple arguments
			var args = $slice(arguments);
			if (args.length < 2) {
				return true; // end transition
			}

			return (function (b, a) {
				if (a === b) {
					return true; // catch the most you can
				} else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined") {
					return false; // don't lose time with error prone cases
				} else {
					return bindCallbacks(a, callbacks, [b, a]);
				}

				// apply transition with (1..n) arguments
			})(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
		};

		return innerEquiv;

	}());

	function $matchObj(obj, expr) {
		var _obj = {obj: obj}, matches = [];
		$walk(_obj, function (val) {
			if ($same(val, expr)) {matches.push(val);}
		});
		return matches;
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
		return $reject(val, function(v) {return v;});
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


	function _itemAt(obj, offset, fromEnd) {
		offset = offset || 0;
		if (!$isArray(obj)) {obj = $vals(obj);}
		return obj[fromEnd ? obj.length-1 + offset : offset];
	}

	// also aliased as $head and $tail
	function $first(obj, offset) {return _itemAt(obj, offset);}
	function $last(obj, offset) {return _itemAt(obj, offset, true);}


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
				newInstance.init = function() {
					// call the init methods using the new object for "this"
					$each(inits, function(fn) {
						fn.call(newInstance);
					});
				}
			}
		}

		return newInstance;
	}

	/*
	 * @param obj (object) the object to read properties from
	 * @param handler (function) function(value, key, depth, obj) { return boolean; }
	 * traverse an object calling a handler on each property
	 * do so with depth first top down order on owned objects by default
	 * optionally can choose depth first, reversing the order of execution, not limiting to owned objects
	 */
	function $walk(obj, handler, isDepthFirst, isReverseOrder, allProps) {
		if (typeof obj !== "object" || $isNull(obj)) {
			throw new Error("traverse source must be an object");
		}

		if (!$isFunction(handler)) {
			throw new Error("traverse handler must be a function");
		}

		allProps = !!allProps;

		var exec,
			res = {
				breadthFirst: [],
				depthFirst: [],
				siblings: [],
				allProps: allProps,
				res: null
			};

		_walk(obj, handler, -1, isDepthFirst, isReverseOrder, res, allProps, [], []);

		// finalize the bread-first list
		res.siblings = res.breadthFirst;
		res.breadthFirst = $flat(res.breadthFirst);

		if (isDepthFirst) {
			exec = res.depthFirst;
		} else {
			exec = res.breadthFirst;
		}

		if (isReverseOrder) {exec = exec.reverse();}

		var _res = $map(exec, function(obj) {return obj.fn();});
		res.res = $filter(_res, function(val) { return val !== undefined;});

		return res;
	}

	// does the actual work for $walk
	function _walk(obj, handler, depth, isBreadthFirst, isReverseOrder, res, allProps, parents, path) {
		depth++;

		var _parents,
			_path,
			key, val,
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
			if (allProps || obj.hasOwnProperty(key)) {
				val = obj[key];
				_parents = [].concat(parents, obj);
				_path = [].concat(path, key);

				// capture closure values in a new context for later access
				(function(v, k, d, parents, path) {
					// a function we can call later that would be tha same as calling it now
					var fn = function() {return handler(v, k, d, parents, siblings, path);};
					var theObj = {val: v, key: k, depth: d, fn: fn, parents: parents, siblings: siblings, path: path};
					depthFirst.push(theObj);
					siblings.push(theObj);
				} (val, key, depth, _parents, _path));

				// recursive call
				if (typeof val === "object" && !$isNull(val)) {
					// todo check for cycles!
					_walk(val, handler, depth, isBreadthFirst, isReverseOrder, res, allProps, _parents, _path);
				}
			}
		}

		levels.push(siblings);

		depth--;
	}

	// cache regexes and strings to save some garbage
	var grabReQuo = /"|'/g,
		grabReOpBr = /\[/g,
		grabReClBr = /\]/g,
		emptyStr = "",
		period = ".";

	// handle blah.foo["stuff"][0].value or blah.foo.stuff.0.value
	// does not support property names containing periods or quotes or [ or ]
	function _grabStr(obj, path, alt, verbose) {
		path = path.replace(grabReQuo, emptyStr).replace(grabReOpBr, period).replace(grabReClBr, emptyStr).split(period);
		// results in ["blah", "foo", "stuff", 0, "value"]
		var val = obj, altVal;
		$each(path, function(pathStr, idx) {
			val = val[pathStr];
			if ((idx < path.length && !val) || val === undefined) {
				altVal = $isFunction(alt) ? alt(obj, pathStr, path) : alt;
				val = altVal;
				return $each.break;
			}
		});
		return verbose ? {val: val, altVal: altVal} : val;
	}

	/* handle multi selection on one object syntax
		 $grab({blah: {foo: {test: ["hi"]}}}, {
			 foo: "blah.foo",
			 test: "blah.foo.test",
			 missing: ["blah[0].test", "a default value"]
		 });
	 */
	function _grabObj(obj, path) {
		return $map(path, function(val) {
			if ($isArray(val)) {
				return $grab(obj, val[0], val[1]); // handle default values as in missing above
			} else {
				return $grab(obj, val);
			}
		});
	}

	// handle an array of paths to try
	function _grabArr(obj, path, alt) {
		var val = {};
		$each(path, function(_path) {
			val = $grab(obj, _path, alt, true);
			if (val.val !== val.altVal) {
				return $each.break;
			}
		});
		return val.val;
	}


	function $grab(obj, path, alt, verbose) {

		// handle blah.foo["stuff"][0].value or blah.foo.stuff.0
		if (typeof path === "string") {
			return _grabStr(obj, path, alt, verbose);

		// handle an array of paths to try
		} else if ($isArray(path)) {
			return _grabArr(obj, path, alt);

		// handle multi selection on one object syntax
		} else if ($isObject(path)) {
			return _grabObj(obj, path);
		}

		return alt;
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

		$typex: $typex,
		$x: $x,
		$typeofx: $typeofx,
		$same: $same,
		$matchObj: $matchObj,
		$grab: $grab,


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
		$keyOf: $keyOf,
		$indexOf: $keyOf,
		$invoke: $invoke,
		$ex: $ex,
		$pluck: $pluck,
		$value: $value,
		$first: $first,
		$last: $last,
		$head: $first,
		$tail: $last,
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