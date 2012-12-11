/**
 * $collection.js
 * @require loot view model
 */

(function() {

	var collectionAPI = {

		init: function() {
			// make sure our values are unique across instances
			this.items = [];
		},
		length: function() {
			return this.items.length;
		},
		add: function(val, silent) {
//			// console.log(val);
			// supports batch add
			var items = $isArray(val) ? val : [val];

			var that = this;
			$each(items, function(item) {
				// can add a view or model depending on how the collection is setup
				if (that.view) {
					// make sure we insert a view instance not a config obj
					if ($isModel(item)) {
//						// console.log("adding view with model", item);
						// support overriding view model on view construction
						item = that.view(item);
//						console.log("makin a view", item);
					} else {
//						console.log("adding view", item);
						item = $isView(item) ? item : that.view(item);
					}
				} else if  (that.schema) {
					// make sure we insert a model instance not a config obj
					item = $isModel(item) ? item : that.schema.newInstance(item);
				}

				if ($isSpeaker(item)) {
					that.listensTo(item);
				}

				that.items.push(item);
			});

			//resort regroup
			if (this.sortIterator) {	this.items = $sortBy(this.items, this.sortIterator);}
			if (this.groupByIterator) {	this.items = $groupBy(this.items, this.groupByIterator);}
			if (this.isReversed) {		this.items.reverse();}
			if (!silent) {
				this.tell("change:add", items);
			}

			return this;
		},

		push: function(item) {
			this.add(item);
			return this;
		},

		set: function(items) {
			// todo drop views or models that are not in the new items collection?
			this.items = [];
			this.add(items, "silent");
			this.tell("change:set", items);
			return this;
		},

		// returns model instances
		get: function(i) {
			if ($isNumber(i)) {
				return this.items[i];
			} else if (i === "last") {
				return this.items[this.items.length-1];
			} else {
				return this.items;
			}
		},

		getAll: function(prop) {
			return $map(this.items, function(item) {
				return item.get(prop);
			});
		},

		// returns model values
		// todo: how does this relate to pluck?
		getValues: function(i, key) {
			var model, len = this.items.length;
			if ($isNumber(i)) {
				i = (i < 0) ? (len + i) % len : i;
				model = this.items[i];
			} else if (i === "last") {
				model = this.items[len-1];
			}

			if (model) {
				return $isFunction(val.get) ? model.get(key) : null;
			} else {
				return $map(this.items, function(val) {
					return $isFunction(val.get) ? val.get(key) : val;
				});
			}
		},

		getGroupSortIterator: function(val) {

			return function(obj) {
				if ($isModel(obj.model)) {
					return obj.model.get()[val];
				} else if ($isFunction(obj.get)) {
					return obj.get()[val];
				} else {
					return obj[val];
				}
			};
		},

		sortBy: function(val) {
			var iterator = $isFunction(val) ? val : this.getGroupSortIterator(val);
			this.sortIterator = iterator;
			this.items = $sortBy(this.items, iterator);
			this.tell("change:sortBy");
			return this;
		},

		groupBy: function(val) {
			var iterator = $isFunction(val) ? val : this.getGroupSortIterator(val);
			this.groupByIterator = iterator;
			this.items = $groupBy(this.items, iterator);
			this.tell("change:groupBy");
			return this;
		},

		reverse: function() {
			this.isReversed = !this.isReversed;
			this.items.reverse();
			this.tell("change:reverse");
			return this;
		},

		drop: function(obj) {
			var i = obj ? this.items.indexOf(obj) : this.items.length-1;
			if (i > -1) {
				var old = this.items.splice(i, 1)[0];
			}
			this.tell("change:drop", old);
			old && old.drop();
			return this;
		},

		pop: function() {
			var old = this.items.pop();
			var snapshot = $isModel(old) ? old.get() : old ? old.model : null;
			snapshot = $isModel(snapshot) ? snapshot.get() : old;
			this.tell("change:pop", snapshot);
			return snapshot;
		},

		dropAll: function() {
			$map(this.items, function(item) {
				// both views and models have a drop method
				item.drop && item.drop();
			});
			this.items = [];
			this.tell("change:dropAll");
			return this;
		},

		draw: function() {
			if ($isElement(this.node)) {
				this.node.innerHTML = "";
				$each(this.items, function(view) {
					if (view && $isElement(view.node)) {
						this.node.appendChild(view.node);
					}
				}, this);
			}
//			console.log("DRAW!", this, this.items, this.node.id, this.view.getInstances());
			return this;
		}

	};

	var collectionBank = {};

	// $collection function creates a collection instance
	function $collection(name, spec) {
		var view = spec.view,
			schema = spec.schema;

		// console.log("collection extend", name, spec);

		// return a new collection constructor
//		if (!schema && !view) {
//			throw new Error("$collection: Expected an object with a schema or view property");
//		}

		if (name in collectionBank) {
			// console.log(collectionBank, name);
			throw new Error("collection name " + name + " already in use;");
		}

		var collection = $speak($extend($new(collectionAPI), spec));

		// make sure we have a valid view constructor
		if (view) {
//			// console.log(view, $views(view));
			view = $isString(view) ? $views(view) : view;
			if ($isViewConstructor(view)) {
				collection.view = view;
				collection.draw = spec.draw ? spec.draw : collection.draw;
			} else {
//				// console.log(collection, view);
				throw new Error("$collection: Invalid view type or constructor function");
			}
		} else if (schema) {
			delete collection.draw;
			schema = $isString(schema) ? $schema(schema) : schema;
			if ($isSchema(schema)) {
				collection.schema = schema;
			} else {
				throw new Error("$collection: Invalid schema type or constructor function ");
			}
		}

		if ($isString(collection.node)) {
			collection.node = $el(collection.node);
		}

		if (collection.events && $isElement(collection.node)) {
			$bindEventSpec(collection);
		}

		if ($isPlainObject(collection.listeners)) {
			$bindListenerSpec(collection);
		}

		if ($isFunction(collection.init)) {
			collection.init();
		}

		collectionBank[name] = collection;

		collection.listen("*", function(msg, type) {
			console.log("navPath collection", type, msg);
			if (type !== "change" && type.match("change")) {
				collection.tell("change", {
					msg: msg,
					type: type
				});
			}
		});

		return collection;
	}


	function $collections(name) {
		if (!name) {
			return collectionBank;
		} else {
			return collectionBank[name];
		}
	}

	function $isCollection(obj) {
		return !!(obj && obj.add && $isArray(obj.items) && obj.pop);
	}

	// expose methods
	loot.extend({
		$collection: $collection,
		$collections: $collections,
		$isCollection: $isCollection
	});

}());