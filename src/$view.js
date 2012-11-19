/**
 * $view.js
 * @require loot model
 */

(function() {

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
				var renderer, update, drop, viewNode, viewModel, viewCollection;
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
					modelCollection = $isCollection(modelData) ? modelData : spec.collection;
					drop = spec.drop;
					templateOrRenderFn = spec.template || spec.render;
					$extend(view, spec);
				}

				if ($isString(viewNode)) { viewNode = $el(viewNode); }

				if ($isString(viewModel)) { viewModel = $model(viewModel, modelData); }

				if ($isString(modelCollection)) { modelCollection = $collections(modelCollection);}

				if (!$isElement(viewNode)) {
					console.log(spec, viewNode, ctorArgs, $doc.usesRealDom());
					throw new Error("$view: node must be a DOM node");
				}

				if ((viewModel && !$isModel(viewModel))
				|| (modelCollection && !$isCollection(modelCollection))) {
					throw new Error("$view: model argument must be a product of $model");
				}

				view.type = type;
				view.id = $uniqueId(type+"View");
				view.node = viewNode;
				view.model = modelCollection || viewModel;

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

				if (modelCollection) {
					// there are more events to watch for with a collection of models
					// so we need to handle both the "change:type" events from the collection
					// and the "change" events from its child models
					//
					// this changes the signature we can provide to the update function which will affect how
					// what data is provided to the render function, in both cases the render function's
					// data argument (the first one) will be the result of calling get on the collection
					// by default this is the array of collection.items
					//
					// if the collection changes the update method will be called with the following arguments
					// 		changes = the collection instead of the usual which is any specific model or any specific changed values
					// 		type = "change:someaction"
					//		model = the value of view.model which is actually the collection instead of the usual which is an actual model instance

					// if a model in the collection changes the update method will be called with the following arguments
					// 		changes = the changed model instance NOT the changed values as is the case with models bound to views
					// 		type = "change"
					//		model = the value of view.model which is actually the collection vs an actual model instance
					//
					var matchRe = /^change/;
					view.model.listen("*", function(changes, type, model) {
						// we only want change or change:someaction events
						// the regex could be more specific but this works for now
						if (type.match(matchRe)) {
							update(model, type, this);
						}
					});
				} else {
					// the arguments passed to update will be
					// 		changes = an object of just the properties on the model that have changed
					// 		type = "change"
					// 		model = the changed model
					//
					// the view render function will be provided with the result of calling get on the model
					view.model.listen("change", update);
				}

				view.init && $isFunction(view.init) && view.init();

				events && $bindEventSpec(view);

				if ($isPlainObject(view.listeners)) {
					$speak.util.bindListenerSpec(view, view.listeners);
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
		} else if (!arguments.length) {
			return undefined;
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