/**
 * $collection.js
 * @require loot view model
 */

(function() {
	var compare = function(a, b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	var collectionAPI = $speak({
		items: [],
		add: function(val) {
			// supports batch add
			var items = $isArray(val) ? val : [val];

			$each(items, function(item) {
				// can add a view or model depending on how the collection is setup
				if (this.view) {
					// make sure we insert a view instance not a config obj
					item = $isView(item) ? item : this.view(item);
				} else {
					// make sure we insert a model instance not a config obj
					item = $isModel(item) ? item : this.schema(item);
				}
				this.items.push(item);
			}, this);

			//resort regroup
			if (this.sortIterator) {	this.items = $sortBy(this.items, this.sortIterator)}
			if (this.groupByIterator) {	this.items = $groupBy(this.items, this.groupByIterator)}
			if (this.isReversed) {		this.items.reverse()}
			this.tell("change:add", items);

			return this;
		},

		sortBy: function(val) {
			var iterator = $isFunction(val) ? val : function(obj) { return obj.model.get()[val]; };
			this.sortIterator = iterator;
			this.items = $sortBy(this.items, iterator);
			this.tell("change:sortBy");
			return this;
		},

		groupBy: function(val) {
			var iterator = $isFunction(val) ? val : function(obj) { return obj.model.get()[val]; };
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
			var i = this.items.indexOf(obj);
			if (i > -1) {
				var old = this.items.splice(i, 1);
			}
			this.tell("change:drop", old[0]);
			this.view && old[0].drop();
			return this;
		},

		dropAll: function() {
			$map(this.items, function(item) {
				// both views and models have a drop method
				item.drop();
			});
			this.tell("change:dropAll");
			return this;
		}

	});

	// used for view collections
	var draw = function() {
		var node = this.node;
		if ($isElement(node)) {
			node.innerHTML = "";
			$each(this.items, function(view) {
				if (view && $isElement(view.node)) {
					node.appendChild(view.node);
				}
			});
		}
		return this;
	};

	// $collection function creates a collection instance
	loot.extend("$collection", function(spec) {
		var view = spec.view,
			schema = spec.schema;

		// return a new collection constructor
		if (!schema && !view) {
			throw new Error("$collection: Expected an object with a schema or view property");
		}

		var collection = $extend($new(collectionAPI), spec);

		// make sure we have a valid view constructor
		if (view) {
			view = $isString(view) ? $views(view) : view;
			if ($isViewConstructor(view)) {
				collection.view = view;
				collection.draw = spec.draw || draw;
			} else {
				throw new Error("$collection: Invalid view type or constructor function");
			}
		} else if (schema) {
			schema = $isString(schema) ? $schema(schema) : schema;
			if ($isSchema(schema)) {
				collection.schema = schema;
			} else {
				throw new Error("$collection: Invalid schema type or constructor function");
			}
		}

		return collection;
	});

}());