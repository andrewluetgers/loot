
module("$model");

test("$define, $schema, $model", function() {

	var data = {
		test: 1,
		foo: "bar",
		allYourBase: "are belong to us"
	};

	// theoretical new api
//			$define("agent", {
//				defaults: {
//					first: "Fox",
//					last: "Mulder",
//					fooNum: 1,
//					barnum: 0,
//					fullName: {
//						get: function(model) {
//							return this.first + " " + this.last;
//						},
//						set: function(val, model) {
//							var parts = val.split(" ");
//							model.set({
//								first: parts[0],
//								last: parts[1]
//							});
//						}
//					}
//				},
//				validators: {
//					isString: function(val, key) {
//						return $isString(val);
//					},
//					isTruthy: function(val) {
//						return !!val;
//					},
//					isNumber: function(val, key) {
//						return $isNumber(val);
//					},
//					lessThan10: function(val) {
//						return ($length(val) < 10);
//					}
//				},
//				rules: {
//					first: verify.isString,
//					last: {
//						isString: "must be a string",
//					},
//				}
//			});



	$define("testSchema");

	// start with blank model
	var m = $model("testSchema");

	m.listen("change", function(msg) {
		if (msg.test) {
			same(msg, {test:1}, "change event is fired providing the change-set");
		} else {
			same(msg, {
				foo: "bar",
				allYourBase: "are belong to us"
			}, "change event is fired providing the changeset");
		}
	});

	m.set("test", 1);
	m.set({
		foo: "bar",
		allYourBase: "are belong to us"
	});

	var t = m.get("test");
	ok(t === 1, "single key get");

	t = m.get("test", "foo");
	same(t, {test: 1, foo: "bar"}, "multi-key get using arguments");

	t = m.get(["test", "foo"]);
	same(t, {test: 1, foo: "bar"}, "multi-key get using an array");

	t = m.get();
	same(t, {test: 1, foo: "bar", allYourBase: "are belong to us"}, "get model (no arguments)");

	// initial set on model call
	var x = $model("testSchema", {
		test: 1,
		foo: "bar",
		allYourBase: "are belong to us"
	});

	t = x.get("test");
	ok(t === 1, "single key get");

	t = x.get("test", "foo");
	same(t, {test: 1, foo: "bar"}, "multi-key get using arguments");

	t = x.get(["test", "foo"]);
	same(t, {test: 1, foo: "bar"}, "multi-key get using an array");

	t = x.get();
	same(t, {test: 1, foo: "bar", allYourBase: "are belong to us"}, "get model (no arguments)");

	x.set("test");
	t = x.get("test");
	ok(t === undefined, "set without a second argument deletes");


	// testing $models
	var m2 = $models("testSchema");

	ok($isArray(m2), "$models returns an array when provided a valid schema type");
	ok( (m2.length === 2) && m2[0] === m && m2[1] === x , "$models returns an array of all model instances created under the provided schema");


	// testing setting things to falsy values
	x.set("bar", 5);

	var falsy = {
		test: 0,
		foo: undefined,
		allYourBase: null,
		bar: false,
		nully: null,
		falsy: false,
		zeroy: 0,
		undefinedy: undefined
	};

	var falsy2 = {
		test: 0,
		allYourBase: null,
		bar: false,
		nully: null,
		falsy: false,
		zeroy: 0
	};

	x.set(falsy);
	t = x.get();
	same(t, falsy, "set without a second argument sets to undefined");

	// testing model instance destruction
	x.listen("drop", function(msg) {
		same(this.get(), falsy, "drop event fired providing last opportunity to deal with the model and its values");
	});

	x.drop();
	ok(x.get == undefined, "methods no longer exist on model after drop");

	ok(m2.length == 1 && m2[0] === m, "the killed instance is removed from the instances array");

	// todo, drop, various events, validators, computed values, error conditions
	var itemsKilled = 0;
	m.listen("drop", function() {
		itemsKilled++;
	});

	$schema.listen("drop", function(msg) {
		same(msg, {schema:"testSchema"}, "schema drop event fired with message of dropped schema type string for message")
		ok(itemsKilled === 1, "all model instances removed on schema drop")
	});

	$schema("testSchema").drop();

	$schema.listen("created", function(msg, type, speaker) {
		console.log("created",arguments);
		ok(msg, "created event was fired");
	});

	// test schema cration with defaults, validators and computed values
	var $validateWtih = function(fn, msg) {
		return function(val) {
			return fn(val) ? true : msg;
		}
	};

	$define("dog", {
		defaults: {
			// computed value
			color: "brown",
			info: function() {
				return (this.name || "unknown") + " is " + (this.age || "unknown") + " years old " + (this.breed || "unknown") + " breed";
			}
		},
		validate: {
			name:  $validateWtih($isString, "String Required"),
			age:   $validateWtih($isNumber, "Number Required"),
			breed: $validateWtih($isString, "String Required")
		}
	});

	var dog1 = $model("dog");
	var info = "unknown is unknown years old unknown breed";

	ok(dog1.get("info") === info, "computed values work as expected");
	ok(dog1.get("color") === "brown", "default values work as expected");

//	console.log($schema("dog"));

	$schema("dog").listen("validatonFailed", function(msg) {
		console.log(msg);
		if (msg.failed.name) {
			ok(msg.failed.name === "String Required", "validators can return a string explaining a failure")
		}
	});

	dog1.set("name", 5);
	dog1.set({
		name: null,
		age: null,
		breed: "pointer"
	});


	// lets try to derive a new schema from a previous schema
	$define("modelA", {
		defaults: {
			name: "loot",
			type: "modelA",
			computed: function() {
				return [this, arguments];
			}
		},
		someMethodA: function() {
			var vals = this.get();
			console.log(this, arguments, vals);
		},
		overwriteMethod: function() {
			var vals = this.get();
			console.log("A", this, arguments, vals);
		}
	});

	var modelB = $make($models("modelA"), {
		defaults: {
			type: "modelB",
			foo: "bar"
		},
		someMethodB: function() {
			var vals = this.get();
			console.log(this, arguments, vals);
		},
		overwriteMethod: function() {
			var vals = this.get();
			console.log("B", this, arguments, vals);
		}
	});

//	console.log($models("modelA"), modelB, $models("modelA") === modelB);
});