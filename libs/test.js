// Backbone.Router
// ---------------

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
var Router = function(options) {
	options || (options = {});
	if (options.routes) this.routes = options.routes;
	this._bindRoutes();
	this.initialize.apply(this, arguments);
};

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

// Set up all inheritable **Backbone.Router** properties and methods.
_.extend(Router.prototype, Events, {

	// Initialize is an empty function by default. Override it with your own
	// initialization logic.
	initialize: function(){},

	// Manually bind a single named route to a callback. For example:
	//
	//     this.route('search/:query/p:num', 'search', function(query, num) {
	//       ...
	//     });
	//
	route: function(route, name, callback) {
		if (!_.isRegExp(route)) route = this._routeToRegExp(route);
		if (!callback) callback = this[name];
		Backbone.history.route(route, _.bind(function(fragment) {
			var args = this._extractParameters(route, fragment);
			callback && callback.apply(this, args);
			this.trigger.apply(this, ['route:' + name].concat(args));
			this.trigger('route', name, args);
			Backbone.history.trigger('route', this, name, args);
		}, this));
		return this;
	},

	// Simple proxy to `Backbone.history` to save a fragment into the history.
	navigate: function(fragment, options) {
		Backbone.history.navigate(fragment, options);
		return this;
	},

	// Bind all defined routes to `Backbone.history`. We have to reverse the
	// order of the routes here to support behavior where the most general
	// routes can be defined at the bottom of the route map.
	_bindRoutes: function() {
		if (!this.routes) return;
		var route, routes = _.keys(this.routes);
		while ((route = routes.pop()) != null) {
			this.route(route, this.routes[route]);
		}
	},

	// Convert a route string into a regular expression, suitable for matching
	// against the current location hash.
	_routeToRegExp: function(route) {
		route = route.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional){
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		return new RegExp('^' + route + '$');
	},

	// Given a route, and a URL fragment that it matches, return the array of
	// extracted parameters.
	_extractParameters: function(route, fragment) {
		return route.exec(fragment).slice(1);
	}

});

// Backbone.History
// ----------------

// Handles cross-browser history management, based on URL fragments. If the
// browser does not support `onhashchange`, falls back to polling.
var History = Backbone.History = function() {
	this.handlers = [];
	_.bindAll(this, 'checkUrl');

	// Ensure that `History` can be used outside of the browser.
	if (typeof window !== 'undefined') {
		this.location = window.location;
		this.history = window.history;
	}
};

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for detecting MSIE.
var isExplorer = /msie [\w.]+/;

// Cached regex for removing a trailing slash.
var trailingSlash = /\/$/;

// Has the history handling already been started?
History.started = false;

// Set up all inheritable **Backbone.History** properties and methods.
_.extend(History.prototype, Events, {

	// The default interval to poll for hash changes, if necessary, is
	// twenty times a second.
	interval: 50,

	// Gets the true hash value. Cannot use location.hash directly due to bug
	// in Firefox where location.hash will always be decoded.
	getHash: function(window) {
		var match = (window || this).location.href.match(/#(.*)$/);
		return match ? match[1] : '';
	},

	// Get the cross-browser normalized URL fragment, either from the URL,
	// the hash, or the override.
	getFragment: function(fragment, forcePushState) {
		if (fragment == null) {
			if (this._hasPushState || !this._wantsHashChange || forcePushState) {
				fragment = this.location.pathname;
				var root = this.root.replace(trailingSlash, '');
				if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
			} else {
				fragment = this.getHash();
			}
		}
		return fragment.replace(routeStripper, '');
	},

	// Start the hash change handling, returning `true` if the current URL matches
	// an existing route, and `false` otherwise.
	start: function(options) {
		if (History.started) throw new Error("Backbone.history has already been started");
		History.started = true;

		// Figure out the initial configuration. Do we need an iframe?
		// Is pushState desired ... is it available?
		this.options          = _.extend({}, {root: '/'}, this.options, options);
		this.root             = this.options.root;
		this._wantsHashChange = this.options.hashChange !== false;
		this._wantsPushState  = !!this.options.pushState;
		this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
		var fragment          = this.getFragment();
		var docMode           = document.documentMode;
		var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

		// Normalize root to always include a leading and trailing slash.
		this.root = ('/' + this.root + '/').replace(rootStripper, '/');

		if (oldIE && this._wantsHashChange) {
			this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
			this.navigate(fragment);
		}

		// Depending on whether we're using pushState or hashes, and whether
		// 'onhashchange' is supported, determine how we check the URL state.
		if (this._hasPushState) {
			Backbone.$(window).on('popstate', this.checkUrl);
		} else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
			Backbone.$(window).on('hashchange', this.checkUrl);
		} else if (this._wantsHashChange) {
			this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
		}

		// Determine if we need to change the base url, for a pushState link
		// opened by a non-pushState browser.
		this.fragment = fragment;
		var loc = this.location;
		var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

		// If we've started off with a route from a `pushState`-enabled browser,
		// but we're currently in a browser that doesn't support it...
		if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
			this.fragment = this.getFragment(null, true);
			this.location.replace(this.root + this.location.search + '#' + this.fragment);
			// Return immediately as browser will do redirect to new url
			return true;

			// Or if we've started out with a hash-based route, but we're currently
			// in a browser where it could be `pushState`-based instead...
		} else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
			this.fragment = this.getHash().replace(routeStripper, '');
			this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
		}

		if (!this.options.silent) return this.loadUrl();
	},

	// Disable Backbone.history, perhaps temporarily. Not useful in a real app,
	// but possibly useful for unit testing Routers.
	stop: function() {
		Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
		clearInterval(this._checkUrlInterval);
		History.started = false;
	},

	// Add a route to be tested when the fragment changes. Routes added later
	// may override previous routes.
	route: function(route, callback) {
		this.handlers.unshift({route: route, callback: callback});
	},

	// Checks the current URL to see if it has changed, and if it has,
	// calls `loadUrl`, normalizing across the hidden iframe.
	checkUrl: function(e) {
		var current = this.getFragment();
		if (current === this.fragment && this.iframe) {
			current = this.getFragment(this.getHash(this.iframe));
		}
		if (current === this.fragment) return false;
		if (this.iframe) this.navigate(current);
		this.loadUrl() || this.loadUrl(this.getHash());
	},

	// Attempt to load the current URL fragment. If a route succeeds with a
	// match, returns `true`. If no defined routes matches the fragment,
	// returns `false`.
	loadUrl: function(fragmentOverride) {
		var fragment = this.fragment = this.getFragment(fragmentOverride);
		var matched = _.any(this.handlers, function(handler) {
			if (handler.route.test(fragment)) {
				handler.callback(fragment);
				return true;
			}
		});
		return matched;
	},

	// Save a fragment into the hash history, or replace the URL state if the
	// 'replace' option is passed. You are responsible for properly URL-encoding
	// the fragment in advance.
	//
	// The options object can contain `trigger: true` if you wish to have the
	// route callback be fired (not usually desirable), or `replace: true`, if
	// you wish to modify the current URL without adding an entry to the history.
	navigate: function(fragment, options) {
		if (!History.started) return false;
		if (!options || options === true) options = {trigger: options};
		fragment = this.getFragment(fragment || '');
		if (this.fragment === fragment) return;
		this.fragment = fragment;
		var url = this.root + fragment;

		// If pushState is available, we use it to set the fragment as a real URL.
		if (this._hasPushState) {
			this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

			// If hash changes haven't been explicitly disabled, update the hash
			// fragment to store history.
		} else if (this._wantsHashChange) {
			this._updateHash(this.location, fragment, options.replace);
			if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
				// Opening and closing the iframe tricks IE7 and earlier to push a
				// history entry on hash-tag change.  When replace is true, we don't
				// want this.
				if(!options.replace) this.iframe.document.open().close();
				this._updateHash(this.iframe.location, fragment, options.replace);
			}

			// If you've told us that you explicitly don't want fallback hashchange-
			// based history, then `navigate` becomes a page refresh.
		} else {
			return this.location.assign(url);
		}
		if (options.trigger) this.loadUrl(fragment);
	},

	// Update the hash location, either replacing the current entry, or adding
	// a new one to the browser history.
	_updateHash: function(location, fragment, replace) {
		if (replace) {
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#' + fragment);
		} else {
			// Some browsers require that `hash` contains a leading #.
			location.hash = '#' + fragment;
		}
	}

});

// Create the default Backbone.history.
Backbone.history = new History;
