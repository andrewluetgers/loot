/**
 * $components.js
 * @require loot
 */

(function() {

	// component-------------------------------------------------------

	var $component = (function() {

		var components = {};

		var newComponent = function(name, proto) {

			if (!components.hasOwnProperty(name)) {

				var key, api = {};

				// create our api facade functions
				for (key in proto) {
					if (key.substr(0,1) !== "_" && $isFunction(proto[key])) {
						api[key] = function() {
							var compo = this._components[name][key];
							return compo.apply(compo, $slice(arguments));
						};
					}
				}

				components[name] = {
					api: api,
					proto: proto
				};
			}
		};

		newComponent.attachComponent = function(obj, name) {

			if (components.hasOwnProperty(name)) {
				var component = components[name];

				if (!(name in obj._components)) {
					var compo = components[name];
					// add the component
					obj._components[name] = $new(compo.proto);
					// attach the api
					$each(compo.api, function(fn, name) {
						if (name in obj) {
							throw new Error("Cannot overwrite existing property with new component api method " + name);
						} else {
							obj[name] = fn;
						}
					});
				}

			} else {
				throw new Error("No such component " + name);
			}
		};


		newComponent.dropComponent = function(obj, name) {
			var key, compo;

			// intentional assignment in if!!
			if (obj._components && (compo = obj._components[name])) {
				for (key in compo) {
					if (key.substr(0,1) !== "_" && $isFunction(compo[key])) {
						delete obj[key];
					}
				}

				delete obj._components[name];
			}
		};

		return newComponent;

	}());


	// compose -------------------------------------------------------
	function $compose(obj, deps) {

		// handle new object variant
		if(!deps && ($isString(obj) || $isArray(obj))) {
			deps = obj;
			obj = {};
		}

		if ($isString(deps)) {
			deps = [deps];
		}

		if (!obj._components) {
			obj._components = {
				getParent: function() {
					return obj;
				}
			};
		}

		$each(deps, function(dep) {
			if (!(dep in obj._components)) {
				$component.attachComponent(obj, dep);
			}
		});
	}

	function $decompose(obj) {
		if (obj._components) {
			$each(obj._components, function(fn, key) {
				if ($isFunction(fn)) {
					$component.dropComponent(obj, key);
				}
			});

			delete obj._components;
		}
	}

	loot.extend({
		$component: $component,
		$compose: $compose,
		$decompose: $decompose
	});

}());