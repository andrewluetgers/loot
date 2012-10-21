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

			date = normalizeDateInput(date);
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
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc, langCode) {
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
			if (isNaN(date)) throw SyntaxError("invalid date");

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

	loot.extend({
		$now: $now,
		$date: $dateFormat,
		$timeAgo: $timeAgo,
		$timer: $timer
	});

}());