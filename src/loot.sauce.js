
loot.extend("$isCache", function(obj) {
	return (obj && obj.bins && obj.get && obj.set);
});


loot.extend("$cache", loot.exports.$speak({

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

		var cacheKey = [];
			keys = [],
			keyStrings = {};

		$each(req, function(val, key) {
			keys.push(key);
			var str = ($isString(val) || $isNumber(val)) ? val : val.toString();
			keyStrings[key] = key + ":" + str;
		});

		$each(keys.sort(), function(val, idx) {
			cacheKey.push(keyStrings[val]);
		});

		return url + "[" + cacheKey.join(",") + "]";
	},

	get: function(typeId, url, req) {
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
						set: new Date().getTime()
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
			set: new Date().getTime()
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
		var baseUrl = spec.baseUrl,
			dataType = spec.dataType,
			reqType = spec.reqType;

		spec.ttl = spec.ttl || 0;// ms to live, 0 = forever

		spec.sync = function(req, handlers, forceRefresh) {
			var bin = $cache.get(spec.typeId, this.baseUrl, req);

			if (forceRefresh || bin.val === null || (bin.ttl && ($now()-bin.set > spec.ttl)) ) {
				$sauce.io.call(this, baseUrl, req, dataType, reqType, handlers);
			}

			// always return the bin??
			return bin;
		};

		spec.typeId = typeId;

		var remoteType = $speak(spec);

		this.newType(typeId, remoteType);

		return remoteType;
	}

}));

loot.extend("$sauce", {

	io: loot.exports.$speak(function(url, req, dataType, reqType) {

		var key = $cache.getKey(url, req),
			parent = $isSpeaker(this) ? this : $sauce.io,
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
						successH.call(parent, typeId + ":success:" + url, msg);
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
						errorH.call(parent, typeId + ":error:" + url, err);
					}

					parent.tell(typeId + ":error:" + url, err);
				}
			});

		if (useCache) {
			bin.xhr = xhr;
		}

		if ($isFunction(startH)) {
			startH.call(parent, typeId + ":start:" + url, bin);
		}

		parent.tell(typeId + ":start:" + url, bin);

		return bin;
	})

	// junk below here
//	newDataConnector: function(id, url, base, extension) {
//		// the base dataConnector
//		var aDataConnector = $speak({
//			id: id,
//			url: "",
//			initialRequest: null,
//			lastRequest: null
//		});
//
//		// the newDataConnector constructor
//		return $make(aDataConnector, extension, mixin);
//	},

//	dataView: {
//		dataViewId: null,
//		template: null,
//
//		afterMake: function() {
//			this.listen("dataConnector:io:success", function() {
//
//			});
//		}
//	},


//	scrollView: {
//		scrollViewId: null,
//		template: null,
//		domNode: null,
//		disableScrollHandlers: false,
//
//		init: function(jScrollPaneSettings) {
//			$(this.domNode).jScrollPane(jScrollPaneSettings);
//
//			// apply a buffer to the tokens handler
//			var loadNextPageBuffered = $buffer(this.loadNextPageOfData, 100, this),
//				that = this;
//
//			$(this.domNode).live("jsp-scroll-y", function(e, offset, atTop, atBottom) {
//
//				if(that.disableScrollHandlers || $isNaN(that.finalPage)) {
//					console.log("skip scroll handler !!!MMMMM");
//					return false;
//				}
//
//				if (atBottom) {
//					console.log("scroll handler "+$isNaN(that.finalPage)+" !!!!MMMM");
//					loadNextPageBuffered();
//				}
//			});
//
//		},
//
//		destroy: function() {
//
//		}
//	}

});
