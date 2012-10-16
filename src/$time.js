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

	loot.extend({
		$now: $now,
		$timeAgo: $timeAgo,
		$timer: $timer
	});

}());