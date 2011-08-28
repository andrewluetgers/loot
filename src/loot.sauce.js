
loot.extend("$isCache", function(obj) {
	return (obj && obj.bins && obj.get && obj.set);
});

loot.extend("$sequence", function(seq, exp, success, error) {

	error = error || success;


	var _sequence = {
		steps: $isArray(seq) ? seq : [],
		exports: exp
	};

	var runSequence = function() {
		next();
	};

	var exp0rt = function(exp) {
		$mixin(_sequence.exports, exp);
	};

	var then = function(cb, exp) {
		if ($isFunction(cb)) {
			_sequence.push(cb);
			exp0rt(exp);
		}
		return runSequence;
	};

	var next = function(err, exp) {

		try {
			if (steps.length > 0) {
				var cb = _sequence.steps.shift();
				cb(sequence);
			} else {
				success(null, sequence);
			}
		} catch (err) {
			error(err, sequence);
		}
	};

	runSequence.next = next;
	_sequence.next = next;

	runSequence.then = then;
	_sequence.then = then;

	return runSequence;

});



loot.extend("$sauce", {

	cache: $speak({

		bins: {},

		getKey: function(url, req) {
			var cacheKey = url + "[";
				keys = [],
				keyStrings = {};

			$each(req, function(val, key) {
				keys.push(key);
				var str = ($isString(val) || $isNumber(val)) ? val : JSON.stringify(val).substr(0, 100);
				keyStrings[key] = key + ":" + str + ",";
			});

			$each(keys.sort(), function(val, idx) {
				cacheKey += keyStrings[val];
			});

			return cacheKey + "]";
		},

		get: function(url, req) {
			var cacheKey = (arguments.length > 1) ? this.getKey(url, req) : url;

			if(!(cacheKey in this.bins)) {
				this.bins[cacheKey] = {
					key: cacheKey,
					url: url,
					req: req,
					val: null,
					upd: 0
				};
			}
			return this.bins[cacheKey];
		},

		set: function(url, req, val, metaData) {
			var cacheKey = this.getKey(url, req),
				bin = this.get(cacheKey);

			$mixin(bin, {
				key: cacheKey,
				url: url,
				req: req,
				val: val,
				upd: new Date().getTime()
			}, metaData);

			this.tell("cache:set:"+cacheKey, bin);

			return bin;
		}
	}),


	io: $speak(function(url, req, reqType, dataType) {

		var key = $sauce.cache.getKey(url, req),
			parent = $isSpeaker(this) ? this : $sauce.io;

		parent.tell("io:start", key);

		$.ajax({
			type: 		reqType || "post",
			dataType: 	dataType || "json",
			url: 		url,
			data: 		req,

			success: function(val, textStatus, xhr) {
				var bin = $sauce.cache.set(url, req, val, {xhr: xhr});
				parent.tell("io:success", bin);
			},

			error: function(xhr, textStatus, error) {
				parent.tell("io:error", {
					key: key,
					error: error,
					req: req,
					xhr: xhr
				});
			}
		});
	}),




	newDataConnector: function(id, url, base, extension) {

		// the base dataConnector
		var aDataConnector = $speak({
			id: id,
			url: "",
			initialRequest: null,
			lastRequest: null
		});

		// the newDataConnector constructor
		return $make(aDataConnector, extension, mixin);
	},

	dataView: {

		dataViewId: null,
		template: null,
	
		afterMake: function() {
			this.listen("dataConnector:io:success", function() {

			});
		}

	},


	scrollView: {

		scrollViewId: null,
		template: null,

		domNode: null,
		disableScrollHandlers: false,


		init: function(jScrollPaneSettings) {
			$(this.domNode).jScrollPane(jScrollPaneSettings);

			// apply a buffer to the tokens handler
			var loadNextPageBuffered = $buffer(this.loadNextPageOfData, 100, this),
				that = this;

			$(this.domNode).live("jsp-scroll-y", function(e, offset, atTop, atBottom) {

				if(that.disableScrollHandlers || $isNaN(that.finalPage)) {
					console.log("skip scroll handler !!!MMMMM");
					return false;
				}

				if (atBottom) {
					console.log("scroll handler "+$isNaN(that.finalPage)+" !!!!MMMM");
					loadNextPageBuffered();
				}
			});

		},

		destroy: function() {

		}


	}

}, loot);