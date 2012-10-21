/**
 * $route.js
 * @require loot
 */

(function() {
	// modified from http://jsrouter.codeplex.com/

	var routeTable = [],
		currentRoute,
		currentPath,
		hashListenerInterval,

		isReady = false;

	function getRoute(routeName) {
		var route;

		// finds the spcified route in the routeTable
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
				var regExp = new RegExp("\\{" + key + "}", "gi");
				path = path.replace(regExp, '');
			}
		}
		if (args) {
			for (var key in args) {
				var keyVal = args[key],
					value = encodeURIComponent(keyVal),
					regExp = new RegExp("\\{" + key + "}", "gi");
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
			if ((match = /{(\w+)}/.exec(segment)) != null) {
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
			if ((match = /{(\w+)}/.exec(segment)) != null) {
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
		if (route && route.callback && typeof route.callback == 'function') {
			// update state
			currentRoute = route;
			currentPath = window.location.hash;
			// trigger the callback
			route.callback(route.values);
		}
	}

	function init() {
		if (window.onhashchange) {
			window.bind('hashchange', onHashChanged)
		} else {
			hashListenerInterval = setInterval(onHashChanged, 100);
		}
		isReady = true;
	}

	function $route(routeName, pathPattern, callback, defaults) {
		if (arguments.length === 1) {
			$routes(routeName);

		} else if (arguments.length === 2) {
			routeTable.push({
				name: routeName,
				pathPattern: routeName,
				callback: pathPattern,
				defaults: defaults
			});

		} else {
			routeTable.push({
				name: routeName,
				pathPattern: pathPattern,
				callback: callback,
				defaults: defaults
			});
		}
	}

	function $routes(routeName, values) {
		if (!arguments.length) {
			return routeTable;
		} else {
			var route = getRoute(routeName);
			var path = fillPath(route, values || route.values);
			window.location.hash = path;
		}
	}

//	$(init);	// hook up events, expects jquery style ready callback

	if (window.onhashchange) {
		window.bind('hashchange', onHashChanged)
	} else {
		hashListenerInterval = setInterval(onHashChanged, 100);
	}
	isReady = true;

	// expose methods
	loot.extend({
		$route: $route,
		$routes: $routes,
		$loadRoute: $routes
	});

}());