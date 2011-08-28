
(function() {

	// language shims -------------------------------------------

	// Extend the String prototype to include a splice method.
	// This will use an Array-based splitting / joining approach
	if (!("splice" in String.prototype)) {
		String.prototype.splice = function(index, howManyToDelete, stringToInsert) {

			var characterArray = this.split( "" );

			Array.prototype.splice.apply(
				characterArray,
				arguments
			);

			return characterArray.join("");
		};
	}


	// dom -------------------------------------------------------
	var $id = function(id) {
		var el = document.getElementById(id);
		return $isElement(el) ? el : undefined;
	};


	// basic types -------------------------------------------------------
	// stolen wholesale from underscore

	// Is a given value a number?
	var $isNumber = function(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	};

	// Is a given array or object empty?
	var $isEmpty = function(obj) {
		if ($isArray(obj) || $isString(obj)) return obj.length === 0;
		for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
		return true;
	};

	// Is a given value a DOM element?
	var $isElement = function(obj) {
		return (obj && obj.nodeType == 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	var $isArray = Array.isArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};

	// Is a given value a function?
	var $isFunction = function(obj) {
		return (obj && obj.constructor && obj.call && obj.apply);
	};

	// Is a given value a string?
	var $isString = function(obj) {
		return (obj === '' || (obj && obj.charCodeAt && obj.substr));
	};

	// Is a given value a number?
	var $isNumber = function(obj) {
		return (obj === 0 || (obj && obj.toExponential && obj.toFixed));
	};

	// Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
	// that does not equal itself.
	var $isNaN = function(obj) {
		return obj !== obj;
	};

	// Is a given value a boolean?
	var $isBoolean = function(obj) {
		return obj === true || obj === false;
	};

	// Is the given value a regular expression?
	var $isRegExp = function(obj) {
		return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
	};


	// array -------------------------------------------------------

	// the underscore each function
	var $each = (function() {

		// switched breaker to bool instead of empty object bc returning {} to break just seemed odd
		var breaker = false,
			nativeForEach = Array.prototype.forEach,
			hasOwnProperty = Object.prototype.hasOwnProperty;

		var each = function(obj, iterator, context) {
			if (obj == null) return;

			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);

			} else if ($isNumber(obj.length)) {
				for (var i = 0, l = obj.length; i < l; i++) {
					if (iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				for (var key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			}
		};

		each.breaker = breaker;
		each.nativeForEach = nativeForEach;
		each.hasOwnProperty = hasOwnProperty;

		return each;

	}());

	// Return all the elements for which a truth test fails.
	var $reject = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		$each(obj, function(value, index, list) {
			if (!iterator.call(context, value, index, list)) results[results.length] = value;
		});
		return results;
	};



	// object -------------------------------------------------------

	var $new = function(o) {

		function f() {}

		if(o) {f.prototype = o;}

		var newInstance = new f();

		if($isFunction(newInstance.initialize)) {
			newInstance.initialize();
		}

		newInstance.initialize = null;

		return newInstance;
	};


	/**
	 * make new objects like a pro
	 * @param prototype
	 * @param extender
	 * @param mixin
	 * @author ATL
	 */
	var $make = function(prototype, extender, mixin) {

		var myProto = $new(prototype),
			myExt = $new(extender),
			mixin = mixin || {},
			parts = [myProto, myExt, mixin],
			afterMake = [];

		$each(parts, function(part) {
			var fn = part.afterMake;
			if($isFunction(fn)) {
				afterMake.push(fn);
			}
		});

		$extend(myProto, myExt);

		$mixin(myProto, mixin);

		myProto.afterMake = null;

		// call the afterMake methods
		$each(afterMake, function(fn) {
			fn.call(myProto);
		});

		// make sure we don't copy or inherit _listeners and _audience by overwriting them
		if ($isSpeaker(prototype) || $isSpeaker(extender) || $isSpeaker(mixin)) {
			$speak(myProto, true); // force overwrite
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

		return myProto;
	};


	// Extend first object with all the properties of the other passed-in object(s).
	var $extend = function(obj) {
		$each(Array.prototype.slice.call(arguments, 1), function(source) {
			for (var prop in source) {
				obj[prop] = source[prop];
			}
		});
		return obj;
	};

	// add all the 'owned' properties of passed in object(s) to the first object
	var $mixin = function(obj) {
		if(obj) {
			$each(Array.prototype.slice.call(arguments, 1), function(source) {
				var prop, val;
				for (prop in source) {
					if(source.hasOwnProperty(prop)) {
						obj[prop] = source[prop];
					}
				}
			});
		}
		return obj;
	};



	// function -------------------------------------------------------

	/* $buffer
	 * buffer the provided function so that it can not be called any faster
	 * than the specified rate of execution. This is esp. handy for drag handlers.
	 * No matter how quickly the calls are placed the last call is guaranteed to
	 * fire however it may be deferred such that the rate is not exceeded.
	 *
	 * @param fn (function) the function to buffer
	 * @param rate (number) max frequency for the execution of fn
	 * @param scope (object) the "this" context for fn to be executed with
	 * @author ATL
	 */
	var $buffer = function(fn, rate, scope, ignoreLastCall) {

		var updateTimer = null,
			lastUpdate = 0,
			getTime = function() {
				return new Date().getTime();
			};

		rate = rate || 50;

		return function() {
			// buffer this function so if it gets spammed we don't call it too often
			clearTimeout(updateTimer);
			var now = getTime(),
				delta = now - lastUpdate,
				theArguments = arguments,
				callFn = function() {
					lastUpdate = now;
					fn.apply(scope, theArguments);
				};

			if (delta < rate) {
				if(!ignoreLastCall) {
					//console.log("DEFER: "+ delta);
					updateTimer = setTimeout(function() {
						callFn();
					}, delta);
				}
				return false;
			}

			//console.log("CALL: "+ delta);
			callFn();
		};
	};


	// date/time -------------------------------------------------------

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

	var $timeAgo = function(date, compareTo) {

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
	};


	// messaging -------------------------------------------------------

	// API note
	// the optional selectiveHearing property added to a speaker is a
	// function with the same signature as any responder the selectiveHearing
	// function serves as a truth-test, if it returns truthy the message
	// will be listened to otherwise it's ignored

	var $speak = (function() {

		var aSpeaker = $new({

			tell: function(topic, message, speaker) {
				if ($isString(topic) && (!this.selectiveHearing || this.selectiveHearing(topic, message, speaker))) {
					var that = this;

					// fire the listeners
					$each(this._listeners, function(listener) {
						var lTopic = listener.topic;
						if (lTopic === topic) {
							listener.responses++;

							// stopListening if we hit our maxResponses
							if ($isNumber(listener.maxResponses) && listener.responses >= listener.maxResponses) {
								that.stopListening(listener);
							}

							// fire the responder within the currently bound scope
							listener.responder.call(that, topic, message, speaker);
						}
					});

					// tell the audience
					var self = this;
					$each(this._audience, function(member) {
						member.tell(topic, message, speaker || self);
					});
				}
				return this;
			},

			listen: function(topic, responder, maxResponses) {
				if ($isString(topic) && $isFunction(responder)) {

					// dont add something twice
					var alreadySet;
					$each(this._listeners, function(listener) {
						if(listener.topic === topic && listener.responder === responder) {alreadySet = true;}
					});

					if (!alreadySet) {
						this._listeners.push({
							topic: topic,
							responder: responder,
							responses: 0,
							maxResponses: maxResponses
						});
					}

					return this;

				} else {
					throw new Error("listen: invalid arguments");
				}
			},

			stopListening: function(ignoreable) {
				if($isString(ignoreable)) {
					this._listeners = $reject(this._listeners, function(listener) {
						return (listener.topic === ignoreable);
					});
				} else if(ignoreable) {
					this._listeners = $reject(this._listeners, function(listener) {
						return (listener.responder === ignoreable);
					});
				} else {
					this._listeners = [];
				}
				return this;
			},

			talksTo: function(speaker) {
				if ($isSpeaker(speaker) && this._audience.indexOf(speaker) === -1) {
					this._audience.push(speaker);
				}
				return this;
			},

			listensTo: function(speaker) {
				if ($isSpeaker(speaker) && speaker._audience.indexOf(this) === -1) {
					speaker._audience.push(this);
				}
				return this;
			}
		});

		// return just the newSpeaker function;
		return function(o, overwrite) {
			o = o || {};

			if (!overwrite && o.hasOwnProperty("_listeners") && o.hasOwnProperty("_audience")) {
				// already a publisher, do noting
				return o;
			}

			// augment and return o
			return $extend(o, aSpeaker, {
				// we need local copies of these arrays not the inherited ones
				_listeners: [],
				_audience: []
			});
		};

	})();

	var $isSpeaker = function(obj) {
		return (obj && $isFunction(obj.tell) && $isArray(obj._listeners));
	};



	// template -------------------------------------------------------
	// a sligtly modded version of underscore template
	// see http://documentcloud.github.com/underscore/#template
	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	var $tpl = (function() {

		// create the regexes only once
		var evaluate = 		/<\$([\s\S]+?)\$>/g,
			interpolate = 	/<\$=([\s\S]+?)\$>/g,
			bslash =		/\\/g,
			squote = 		/'/g,
			esquote =		/\\'/g,
			toSpace =		/[\r\n\t]/g,
			retrn =			/\r/g,
			newln =			/\n/g,
			tab =			/\t/g,
			space = 		/\s/g;

		// the template function
		var template = function(str, data) {
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
					'with(obj||{}){__p.push(\''
					+ str.replace(bslash, '\\\\')
					.replace(squote, "\\'")
					.replace(interpolate, function(match, code) {
						return "'," + code.replace(esquote, "'") + ",'";
					})
					.replace(evaluate || null, function(match, code) {
						return "');" + code.replace(esquote, "'").replace(toSpace, ' ') + "__p.push('";
					})
					.replace(retrn, '\\r')
					.replace(newln, '\\n')
					.replace(tab, '\\t')
					+ "');}return __p.join('');";

			// the compiled template
			var func = new Function('obj', tmpl);

			// return a processed template if provided data
			// else return a complied reusable template render function
			return data ? func(data) : func;
		};


		// will compile a template for innerHTML of elem with id=t
		// if given a string like "myTemplate, myOtherTemplate, someTemplate"
		// will return a hash of compiled templates using the ids for keys
		template.compile = function(t) {

			if (typeof t === "string") {

				var ts = t.replace(space, "").split(","),
					len = ts.length,
					compiled = {},
					id;

				for (var i=0; i<len; i++) {
					id = ts[i];
					compiled[id] = template($id(id).innerHTML);
				}

				return (len == 1) ? compiled[id] : compiled;

			} else {
				throw new Error("Expected a string, saw "+ typeof t);
			}
		};

		return template;

	}());


	// ------------------------------- exports -------------------------------

	var loot = function(scope) {
		loot.fn(scope);
	};

	loot.fn = function(scope) {
		// make our public methods enumerable
		var returnScopedMethods = false;

		if (!scope) {
			returnScopedMethods = true;
			scope = {};
		}

		var oldValues = {};

		$each(this.exports, function(value, key) {
			// protect old values
			var oldValue = scope[key];
			if (oldValue) {
				oldValues[key] = oldValue;
			}
			scope[key] = value;
		});

		this.oldValues = oldValues;

		if (returnScopedMethods) {
			return scope;
		}
	};

	loot.exports = {
		$id: $id,
		$isNumber: $isNumber,
		$isEmpty: $isEmpty,
		$isElement: $isElement,
		$isArray: $isArray,
		$isFunction: $isFunction,
		$isString: $isString,
		$isNaN: $isNaN,
		$isBoolean: $isBoolean,
		$isRegExp: $isRegExp,
		$each: $each,
		$reject: $reject,
		$new: $new,
		$make: $make,
		$extend: $extend,
		$mixin: $mixin,
		$buffer: $buffer,
		$timeAgo: $timeAgo,
		$speak: $speak,
		$isSpeaker: $isSpeaker,
		$tpl: $tpl
	};

	loot.extend = function(name, obj, scope) {

		scope = scope || this.exports;

		if (typeof name == "string") {

			if(this.exports[name]) {
				throw new Error("dude... really? " + name + "is already taken, weak.");
			}

			this.exports[name] = obj;

		// handle multiple plugins if first arg is object
		} else if (arguments.length == 1 && typeof arguments[0] == "object") {
			obj =  arguments[0];
			for (name in  obj) {
				this.exports[name] = obj[name];
			}
		}
	};

	// Establish the root object, `window` in the browser, or `global` on the server.
	var root = this;
	if (this.loot) {
		loot.oldLoot = this.loot;
	}
	this.loot = loot;

	loot(this);
}());
