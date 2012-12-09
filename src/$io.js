/**
 * @require loot cache
 */
loot.extend("$io", loot.exports.$speak(function(url, req, dataType, reqType) {

	console.log(this);

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
}));