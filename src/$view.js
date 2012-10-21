/**
 * $view.js
 * @require loot model
 */

(function() {
	// from backbone.js
	// Cached regex to split keys for `delegate`.
	var eventSplitter = /^(\S+)\s*(.*)$/;

	/**
	 * @param name - (string) the name of the view
	 * @param parent - a DOM node
	 * @param model - a product of $schema
	 * @param templateOrRenderFn - a doT template string or a render
	 * function(data, changes, view) which must return a dom node, the results of which will
	 * be appended to the parent node
	 * @description getter = single argument signature pass just the type string and get the
	 * view constructor
	 *
	 */
	var viewConstructorBank = {};

	function $view(type, node, model, templateOrRenderFn, events) {

		var existing = viewConstructorBank[type],
			ctorArgs = arguments, instances = [];

		// constructor getter
		if (type && arguments.length === 1 && existing) {
			return existing;

			// init a new view instance of the given, existing type
			// passing the provided model data object in the 2nd argument
		} else if (type && arguments.length === 2 && existing) {
			var modelData = node;
			if (modelData.defaults || modelData.node || modelData.model || modelData.events) {
				throw new Error("Invalid Arguments!");
			}
			return existing(modelData);

			// return a view constructor
		} else if ($isString(type) && !existing) {
			var constructor = function(modelData) {
				var renderer, update, drop, viewNode, viewModel;
				var view = $speak({
					drop: function() {
						view.model.ignore(update); 					// unsubscribe our model
						drop && $isFunction(drop) && drop(); 	// call the custom drop method if it exists
						$(view.node).remove(); 					// this will unbind event handlers
						view.parentNode && view.parentNode.removeChild(view.node);
						view.tell("drop");						// emit our drop event
						$clear(view);							// final house cleaning
					},
					update: function() {
						update({}, "update", view.model);
					},
					draw: function() {
						view.update(view.model.get(), view.type, view.model);
					}
				});

				// handle object syntax
				if (node && ctorArgs.length === 2 && $isObject(node)) {
					var spec = ctorArgs[1];
					events = spec.events;
					viewNode = spec.node;
					viewModel = $isModel(modelData) ? modelData : spec.model;
					drop = spec.drop;
					templateOrRenderFn = spec.template || spec.render;
					$extend(view, spec);
				}

				if ($isString(viewNode)) { viewNode = $el(viewNode); }

				if ($isString(viewModel)) { viewModel = $model(viewModel, modelData); }

				if (!$isElement(viewNode)) {
					console.log(spec, viewNode, ctorArgs, $doc.usesRealDom());
					throw new Error("$view: parent must be a DOM node");
				}

				if (!viewModel || !$isModel(viewModel)) {
					throw new Error("$view: model argument must be a product of $model");
				}

				view.type = type;
				view.id = $uniqueId(type+"View");
				view.node = viewNode;
				view.model = viewModel;

				// define our renderer and render functions
				if ($isString(templateOrRenderFn)) {
					// in the case of a template we use extra param for template settings
					renderer = $tmpl(templateOrRenderFn);

					update = function(changes, type, rmodel) {
						view.node.innerHTML = renderer(rmodel.get());
						return view.node;
					};

				} else if ($isFunction(templateOrRenderFn)) {
					var oldContent;
					update = function(changes, type, rmodel) {
						var content = templateOrRenderFn.call(view, rmodel.get(), changes, view);

						if (content) {
							if ($isElement(content)) {
								if (oldContent) {
									view.node.replaceChild(content, oldContent);
								} else {
									view.node.appendChild(content);
								}
								oldContent = content;

							} else {
								view.node.innerHTML = content;
							}
						}

						return view.node;
					};

				} else {
					throw new Error("$view: template must be a template string or render function");
				}

				view.model.listen("change", update);

				view.init && $isFunction(view.init) && view.init();

				// from backbone.js
				// Set callbacks, where `this.callbacks` is a hash of
				//
				// *{"event selector": "callback"}*
				//
				//   {
				//    'mousedown .title': 'edit',
				//    'click .button':   'save'
				//   }
				//
				// pairs. Callbacks will be bound to the view, with `this` set properly.
				// Uses event delegation for efficiency.
				// Omitting the selector binds the event to `this.el`.
				// This only works for delegate-able events: not `focus`, `blur`, and
				// not `change`, `submit`, and `reset` in Internet Explorer.
				//view.delegateEvents = function(events) {
				if (events) {
					$(view.node).unbind('.delegateEvents' + view.id);
					for (var key in events) {
						var methodName = events[key];
						var match = key.match(eventSplitter);
						var eventName = match[1], selector = match[2];
						var method = function() {view[methodName]();};
						eventName += '.delegateEvents' + view.id;
						if (selector === '') {
							$(view.node).bind(eventName, method);
						} else {
							$(view.node).delegate(selector, eventName, method);
						}
					}
				}

				instances.push(view);

				view.update();

				return view;
			};

			$mixin(constructor, {
				drop: function() {
					this.dropInstances();
					instances = existing = null;
					delete viewConstructorBank[type];
					$clear(this);
					$view.tell("drop", {constructor: type});
				},

				getInstance: function(id) {
					return $find(this.getInstances(), function(view) {
						return view.id === id;
					});
				},

				getInstances: function() {
					return instances;
				},

				dropInstances: function(filter) {
					var _instances = instances;

					if (filter) {
						_instances = $filter(instances, filter);
					}

					$each(_instances, function(instance) {
						instance.drop();
					});

					return this;
				}
			});

			viewConstructorBank[type] = constructor;

			return constructor;

		} else {
			console.log(arguments);
			throw new Error("Invalid Arguments!");
		}
	}

	function $views(type, id) {
		if (type && type in viewConstructorBank) {
			if (type && id) {
				return viewConstructorBank[type].getInstance(id);
			} else {
			return viewConstructorBank[type];
			}
		} else {
			return viewConstructorBank;
		}
	}

	function $isViewInstance(view) {
		return view && view.drop && $isFunction(view.drop) && view.node && view.model;
	}

	function $isViewConstructor(view) {
		return $contains(viewConstructorBank, view);
	}


	loot.extend({
		$view: $view,
		$views: $views,
		$isView: $isViewInstance,
		$isViewConstructor: $isViewConstructor
	});

}());