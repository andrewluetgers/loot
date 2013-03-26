
module("$view");

test("$view", function() {
	expect(14);
	$doc.useRealDom(true);
	var parentNode = $el("div#parentNode");


	document.body.appendChild(parentNode);

	var mData = {
		test: 1,
		foo: "bar",
		allYourBase: "are belong to us"
	};

	// start with blank model
	$define("testSchema2");

	// create an instance with mData
	var m = $model("testSchema2", mData);
	var html;
	// verify model is working correctly
	var renderFn = function(data, changes, view) {
		console.log("view renderFn", arguments);
		same(data, m.get(), "first argument is model values object");
		ok(typeof changes === "object", "second argument is model changes object");
		ok(view === this, "third argument is the view");
		ok(true, "view was rendered");
		html = "<div>all your html " + data.allYourBase + "</div>";
		return html;
	};

	var testView = $view("testView", {
		node: parentNode,
		model: "testSchema2",
		render: renderFn
	});

	var aTestView = testView(mData);

	console.log("aTestView", aTestView);
//
	aTestView.update();

	same(parentNode.innerHTML, html, "view node was properly updated");


	$define("model1", {
		defaults: {
			name: "joe",
			age: 55
		}
	});

	$define("model2", {
		defaults: {
			name: "janee",
			age: 35,
			favColor: "green"
		}
	});

	var parentNode2 = $el("div#parentNode2");
	document.body.appendChild(parentNode2);

	// define a view with no model type defined
	var v2 = $view("view2", {
		node: parentNode2,
		init: function() {
			console.log("view2 init!");
		},
		render: function(data, changes, view) {
			console.log("render!!!!", changes, data, view);
			return data.name + ", age " + data.age;

		}
	});


	// a couple models
	var m1 = $model("model1", {
		name: "loot",
		age: 35
	});

	var m2 = $model("model2", {
		name: "dan",
		age: 30
	});

	// assign a model instance to a view instead of model data
	var v1i = v2(m1);
	console.log();
	ok(parentNode2.innerHTML == "loot, age 35", "assigning a model instance to a view forces it to render the view with that model data");
	m1.set({name: "test", age: 0});
	ok(parentNode2.innerHTML == "test, age 0", "assigning a model instance to a view forces the view to render model instance changes");
	v1i.unbindModel();
	m1.set({name: "test2", age: 2});
	ok(parentNode2.innerHTML == "test, age 0", "view.unbindModel() prevents the view from rendering model instance changes");

	var v2i = v2(m2);
	ok(parentNode2.innerHTML == "dan, age 30", "assigning another model instance to a view forces it to render the view with that model data");
	m2.set({name: "test3", age: 3});
	ok(parentNode2.innerHTML == "test3, age 3", "assigning a model instance to a view forces the view to render model instance changes");






	console.log("----------------", [v2, m2, v2i]);
});