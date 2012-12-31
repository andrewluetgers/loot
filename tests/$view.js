
module("$view");

test("$view", function() {
	expect(5);
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
		console.log("view renderFn", arguments, aTestView);
		same(data, m.get(), "first argument is model values object");
		ok(typeof changes === "object", "second argument is model changes object");
		ok(view === aTestView, "third argument is the view");
		ok(true, "view was rendered");
		html = "<div>all your html " + data.allYourBase + "</div>";
		return html;
	};

	var testView = $view("testView", {
		node: parentNode,
		model: "testSchema2",
		render: renderFn
	});

	console.log(testView);

	var aTestView = testView(mData);

	console.log("aTestView", aTestView);
//
	aTestView.update();

	same(parentNode.innerHTML, html, "view node was properly updated");
});