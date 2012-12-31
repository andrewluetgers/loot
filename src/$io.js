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


