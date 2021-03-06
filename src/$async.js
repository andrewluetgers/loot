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