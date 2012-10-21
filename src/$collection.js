/**
 * $collection.js
 * @require loot view model
 */

(function() {

	var collectionAPI = {
		init: function() {
			// make sure our values are unique across instances
			this.items = [];
			this.node = null;
			this.view = null;
			this.schema = null;
		},
		add: function(val) {
//			console.log(val);
			// supports batch add
			var items = $isArray(val) ? val : [val];

			var that = this;
			$each(items, function(item) {
				// can add a view or model depending on how the collection is setup
				if (that.view) {
					// make sure we insert a view instance not a config obj
					if ($isModel(item)) {
//						console.log("adding view with model", item);
						// support overriding view model on view construction
						item = that.view(item);
//						console.log("makin a view", item);
					} else {
//						console.log("adding view", item);
						item = $isView(item) ? item : that.view(item);
					}
				} else {
					// make sure we insert a model instance not a config obj
//					console.log("adding model", item);
					item = $isModel(item) ? item : that.schema(item);
				}
				that.items.push(item);
			});

			//resort regroup
			if (this.sortIterator) {	this.items = $sortBy(this.items, this.sortIterator)}
			if (this.groupByIterator) {	this.items = $groupBy(this.items, this.groupByIterator)}
			if (this.isReversed) {		this.items.reverse()}
			this.tell("change:add", items);

			return this;
		},

		sortBy: function(val) {
//			console.log(this);
			var iterator = $isFunction(val) ? val : function(obj) {
//				console.log(obj, val);
				return obj.model.get()[val];
			};
			this.sortIterator = iterator;
			this.items = $sortBy(this.items, iterator);
//			console.log(val, this.items);
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
		},

		draw: function() {
			if ($isElement(this.node)) {
				this.node.innerHTML = "";
				$each(this.items, function(view) {
					if (view && $isElement(view.node)) {
//						console.log(that.node.id);
						this.node.appendChild(view.node);
					}
				}, this);
			}
//			console.log("DRAW!", this, this.items, this.node.id, this.view.getInstances());
			return this;
		}

	};

	// used for view collections

	// $collection function creates a collection instance
	loot.extend("$collection", function(spec) {
		var view = spec.view,
			schema = spec.schema;

		// return a new collection constructor
		if (!schema && !view) {
			throw new Error("$collection: Expected an object with a schema or view property");
		}

		var collection = $speak($extend($new(collectionAPI), spec));

		// make sure we have a valid view constructor
		if (view) {
			view = $isString(view) ? $views(view) : view;
			if ($isViewConstructor(view)) {
				collection.view = view;
				collection.draw = spec.draw ? spec.draw : collection.draw;
			} else {
				throw new Error("$collection: Invalid view type or constructor function");
			}
		} else if (schema) {
			delete collection.draw;
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