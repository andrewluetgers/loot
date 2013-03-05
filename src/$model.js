/**
 * model.js
 * @require loot
 */
// models -------------------------------------------------------
(function() {

	var schemaBank = {};

	function modelApiGet(modelVals, keys) {
		keys = keys || [];
		var model = this, // this is set as the model via apply
			keyLen = keys.length,
			first = keys[0],
			singleKey = (keyLen == 1 && $isString(first)) ? true : false,
			val;

		if (singleKey) {
			val = modelVals[first];
			// supports computed values
			return $isFunction(val) ? val.call(modelVals, model) : val;

		} else if (keyLen > 1 || $isArray(keys[0])) {
			var results = {}, _keys = keyLen > 1 ? keys : keys[0];
			$each(_keys, function(key) {
				if (key in modelVals) {
					val = modelVals[key];
					// supports computed values
					results[key] = $isFunction(val) ? val(model) : val;
				}
			});
			return results;

		} else {
			return $map(modelVals, function(v, k) {
				return $isFunction(v) ? modelVals[k](model) : v;
			});
		}
	}

	function modelApiReset(modelVals, defaults) {
		for (var key in modelVals) {
			if (key in defaults) {
				modelVals[key] = defaults[key];
			} else {
				delete modelVals[key];
			}
		}
	}

	function parseInput(val, key, fn, model) {
		fn = $isString(fn) ? this[fn] : fn;
		if ($isFunction(fn)) {
			return fn.call(model, val, key);
		}
		return val;
	}

	function parseInputs(vals) {
		var parse = this.parseInput,
			model = this,
			newVals = $isArray(vals) ? [] : {};

		if (parse) {
			$each(parse, function(fn, key) {
				if (key in vals) {
					newVals[key] = parseInput(vals[key], key, fn, model);
				} else if (key === "*") {
					$each(vals, function(v, k) {
						newVals[k] = parseInput(v, k, fn, model);
					});
				}
			});

			return $mixin(newVals, vals);
		}

		return vals;
	}

	function parseData(vals) {
		var parse = this.parse,
			model = this;
		if (parse) {
			return parse.call(model, vals);
		} else {
			return vals;
		}
	}

	function modelApiSet(modelVals, _key, _val) {
		var val, key, obj,
			changes = {},
			validate = this.validate || {},
			defaults = this.defaults || {},
			validators,
			validationFailures,
			failures = {},
			dynValErr = "cannot set dynamic property ";

		// handle single and multi-property syntax
		if (typeof _key === "string") {
			obj = {};
			obj[_key] = _val;
		} else {
			obj = _key;
		}

		// validate and generate our changes
		for (key in obj) {
			if (!obj.hasOwnProperty(key)) {
				continue;
			}
			val = obj[key];
			if ($isFunction(defaults[key])) {
				failures[key] = dynValErr + key;

			// check for validator fn also no need to validate if we are deleting (val === undefined)
			} else if((validators = validate[key]) && (val !== undefined)) {
				// handle single validator fn or expect an array
				validators = $isFunction(validators) ? [validators] : validators;
				validationFailures = {};
				$each(validators, function(validateFn, k) {
					var result = validateFn(val);
					if (result === true) {
						validationFailures[k] = result;
					}
				});
				if ($length(validationFailures)) {
					failures[key] = validationFailures;
				} else {
					changes[key] = val;
				}
			} else {
				changes[key] = val;
			}
		}

		if ($length(failures)) {
			this.tell("validationFailed", {
				passed: changes,
				failed: failures
			});
		} else {
			// no errors! merge our changes into the model values
			$extend(modelVals, changes);
			this.tell("change", changes);
		}

		return this;
	}

	// define a type of object or data model
	function $schema(type, spec, collection) {
		var existingSchema = schemaBank[type],
			instances = [], ctorArgs = arguments;

		// schema getter
		if (arguments.length === 0) {
			return schemaBank;

			// schema getter
		} else if (type && arguments.length === 1 && existingSchema) {
			return existingSchema;

			// schema constructor
		} else if (type && $isString(type) && !existingSchema) {
			spec = $copy(spec || {});
			spec.defaults = spec.defaults || {};

			// type-check optional validators
			if (spec.validate) {
				$each(spec.validate, function(val) {
					if (!$isFunction(val)) {
						throw new Error("validator must be a function");
					}
				});
			}

			var schemaApi = $speak({
				type: type,
				spec: function() {
					return spec;
				},
				constructor: function(vals) {
					return this.newInstance(vals);
				},
				drop: function() {
					this.dropInstances();
					instances = existingSchema = null;
					delete schemaBank[type];
					$clear(this, true);
					$schema.tell("drop", {schema: type});
				},

				getInstances: function() {
					// return a copy of the instances array not the real thing
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
				},

				// instance api
				newInstance: function(vals) {
					var modelVals = $copy(spec.defaults);
					var modelProto = $speak($new(spec));
					var drop = spec.drop;

					if (drop && !$isFunction(drop)) {
						throw new Error("if drop is provided it must be a function");
					}

//					console.log(type, this, arguments);

					// model instance api
					var model = $extend(modelProto, {
						schema: type,

						// the following get and set facade allows us to have a unique closure for modelVals and modelProto
						// without having copies of the larger modelApiSet and modelApiGet functions on each model instance hopefully saving some memory usage
						get: function() {
							//return modelApiGet.apply(this, $flat(modelVals, $slice(arguments))); // todo can we do this in a better way

							return modelApiGet.call(this, modelVals, $slice(arguments));
						},
						set: function(key, val) {
							return modelApiSet.call(this, modelVals, key, val);
						},
						reset: function() {
							return modelApiReset.call(this, modelVals, spec.defaults);
						},
						renew: function() {
							return init();
						},
						drop: function() {
							drop && drop();
							this.tell("drop", this);
							// remove this instance from the instances array
							instances.splice(instances.indexOf(this), 1);
							$clear(this, true);
						}
					});

					vals = parseInputs.call(model, vals);

					vals = parseData.call(model, vals);

					// copy our parsed initial values to the model
					if (!$isString(vals)) {
						$mixin(modelVals, vals);
					}

					var that = this;
					var init = function() {

						// all model events are forwarded to their parent schema
						model.talksTo(that);

//						console.log("model init", model, that);

						instances.push(model);
						model.tell("created", that);

						return model;
					};

					return init();
				}
			});

			schemaBank[type] = (collection ? $make(schemaApi, collection) : schemaApi);

			$schema.tell("defined", {schema:type});

			// error
		} else {
			return new Error("Error: valid schema type required.");
		}
	}
	// make schema a speaker
	$speak($schema);

	function $model(type, vals) {
		var schema = schemaBank[type];
		if (!arguments.length) {
			return $schema();
		} else if (!type || !$isString(type) || !schema) {
			//throw new Error("$model: valid type string required");
			return null;
		} else if (vals && !$isPlainObject(vals)) {
			//throw new Error("$model: valid values object required for " + type);
		} else {
			return schema.newInstance(vals);
		}
	}

	function $models(type, key, val) {
		var models = $schema(),
			len = arguments.length;

		if (len === 2) {
			val = key;
			key = "id";
		}

		if (!len) {
			return models;
		} else if (type in models) {
			var instances = models[type].getInstances(), ret;
			if (len > 1) {
				$each(instances, function(inst) {
					if (inst.get(key) == val) {
						ret = inst;
					}
				});
				return ret;
			} else {
				return instances;
			}
		}
	}

	$models.getInstanceCounts = function() {
		return $map($models(), function(model) {
			return model.getInstances().length;
		});
	};

	function $isSchema(obj) {
		return (obj && $isFunction(obj.drop) && $isString(obj.type) && obj.getInstances && obj.newInstance);
	}

	function $isModel(obj) {
		return (obj && $isFunction(obj.drop) && $isString(obj.schema) && obj.set && obj.get);
	}

	loot.extend({
		$schema: $schema,
		$define: $schema,
		$model: $model,
		$models: $models,
		$isSchema: $isSchema,
		$isModel: $isModel
	});

}());