
module("$async");

test("$async.each", function() {
	expect(12);
	stop();
	var work = [1,2,3];
	var finishOrder = [];
	var delays = [100, 1, 10];


	// with error
	var finishOrder2 = [];
	var iterator2 = function(done, val, key, obj) {
		console.log("provided each iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder2.push(key);
			done("error");
		}, delays[key]);
	};

	$async.each(work, iterator2, function(error, obj) {
		console.log("each callback", arguments);
		ok(true, "callback fired");
		ok(error === "error", "error was handled");
		same(obj, work, "second argument in final callback is same as the object iterated over");
		same(finishOrder2, [1], "finish order was as expected");
	});

	// without error
	var iterator = function(done, val, key, obj) {
		console.log("provided each iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder.push(key);
			done();
		}, delays[key]);
	};

	$async.each(work, iterator, function() {
		console.log("each callback", arguments);
		ok(true, "callback fired");
		same(finishOrder, [1,2,0], "finish order was as expected");
		start();
	});
});

test("$async.eachSeries", function() {
	expect(10);
	stop();
	var work = [1,2,3];
	var finishOrder = [];
	var delays = [100, 1, 10];


	// with error
	var finishOrder2 = [];
	var iterator2 = function(done, val, key, obj) {
		key = key*1;
		console.log("provided each iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder2.push(key);
			done("error");
		}, delays[key]);
	};

	$async.eachSeries(work, iterator2, function(error, obj) {
		console.log("each callback", arguments);
		ok(true, "callback fired");
		ok(error === "error", "error was handled");
		ok(obj === work, "second argument in final callback is the object iterated over");
		same(finishOrder2, [0], "finish order was as expected");
	});

	// without error
	var iterator = function(done, val, key, obj) {
		key = key*1;
		console.log("provided eachSeries iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder.push(key);
			done();
		}, delays[key]);
	};

	$async.eachSeries(work, iterator, function() {
		console.log("each callback", arguments);
		ok(true, "callback fired");
		same(finishOrder, [0,1,2], "finish order was as expected");
		start();
	});

});


test("$async.map", function() {
	expect(10);
	stop();
	var work = [1,2,3];
	var finishOrder = [];
	var delays = [100, 1, 10];
	var resultsObj;
	var valObj;
	var keyObj;
	var objObj;

	var iterator = function(push, val, key, result, obj) {
		console.log("iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder.push(key);
			valObj = val;
			keyObj = key;
			resultsObj = result;
			objObj = obj;
			push(null, val * 2);
		}, delays[key]);
	};

	$async.map(work, iterator, function(err, result, obj) {
		console.log("map callback", arguments);
		ok(true, "callback fired");
		same(finishOrder, [1,2,0], "finish order was as expected");
		same(result, [2,4,6], "result order was as expected");
		ok(valObj === 1, "second argument for iterator function is the value");
		ok(keyObj === 0, "third argument for iterator function is the key/index");
		ok(resultsObj === result, "fourth argument for iterator function is the result");
		same(objObj, work, "fifth argument for iterator function is same as the object/array being iterated over");
		start();
	});
});

test("$async.mapSeries", function() {
	expect(10);
	stop();
	var work = [1,2,3];
	var finishOrder = [];
	var delays = [100, 1, 10];
	var resultsObj;
	var valObj;
	var keyObj;
	var objObj;

	var iterator = function(push, val, key, result, obj) {
		key = key*1;
		console.log("iterator", arguments);
		ok(true, "iterator fired");
		setTimeout(function() {
			finishOrder.push(key);
			valObj = val;
			keyObj = key;
			resultsObj = result;
			objObj = obj;
			push(null, val * 2);
		}, delays[key]);
	};

	$async.mapSeries(work, iterator, function(err, result, obj) {
		console.log("mapSeries callback", arguments);
		ok(true, "callback fired");
		same(finishOrder, [0,1,2], "finish order was as expected");
		same(result, [2,4,6], "result order was as expected");
		ok(valObj === 3, "second argument for iterator function is the value");
		ok(keyObj === 2, "third argument for iterator function is the key/index");
		ok(resultsObj === result, "fourth argument for iterator function is the result");
		ok(objObj === work, "fifth argument for iterator function is the object/array being iterated over");
		start();
	});
});


test("$parallel", function() {

	expect(22);
	stop();

	var runs = 0;
	var run = function(i) {
		runs++;
		console.log("called from " + i + " runs "+ runs);
		if(runs === 3) {
			runs = 0;
			ok(true, "call a bunch of functions in any order signature: all functions ran");
		}
	};

	var runOrder = [];

	var func1 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(1);
			runOrder.push(1);
			done(null, 2);
		}, 100);
	};

	var func2 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(2);
			runOrder.push(2);
			done(null, 4);
		}, 1);
	};

	var func3 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(3);
			runOrder.push(3);
			done(null, 6);
		}, 10);
	};

	$parallel(func1, func2, func3);

	setTimeout(function() {
		$parallel([func1, func2, func3], function(err, result, work) {
			console.log("$parallel 2", arguments);
			same(result, [2,4,6], "result is as expected");
			same(runOrder, [2,3,1,2,3,1], "run order is as expected");
			ok(true, "array of functions with callback signature: all functions ran");
		});
	}, 200);

	var runOrder1 = [];
	var delays = [100, 1, 10];
	var work = [5,6,7];

	$parallel(work, function(next, val, key, obj) {
		key = key*1;
		console.log("parallel", arguments);
		setTimeout(function() {
			run(key);
			ok($isNumber(val) && val > 4, "val param is correct");
			ok($isNumber(key) && key < 3, "key param is correct");
			runOrder1.push(key);
			obj[key] = val * 2;
			next(null, val * 2);
		}, delays[key]);
	});

	var runOrder2 = [];
	var work2 = [5,6,7];
	setTimeout(function() {
		$parallel(work2, function(next, val, key, obj) {
			key = key*1;
			console.log("$parallel 4", arguments);
			setTimeout(function() {
				run(key);
				ok($isNumber(val) && val > 4, "val param is correct");
				ok($isNumber(key) && key < 3, "key param is correct");
				runOrder2.push(key);
				obj[key] = val * 2;
				next(null, val * 2);
			}, delays[key]);
		}, function(err, result) {
			console.log("finish", arguments);
			ok(true, "array of functions with callback signature: all functions ran");
			same(runOrder2, [1,2,0], "run order is as expected");
			same(result, [10,12,14], "result is as expected");
			start();
		});

		console.log("done with $parallel");
	}, 500);

});

test("$series", function() {

	expect(22);
	stop();

	var runs = 0;
	var run = function(i) {
		runs++;
		console.log("called from " + i + " runs "+ runs);
		if(runs === 3) {
			runs = 0;
			ok(true, "call a bunch of functions in any order signature: all functions ran");
		}
	};

	var runOrder = [];

	var func1 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(1);
			runOrder.push(1);
			done(null, 2);
		}, 100);
	};

	var func2 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(2);
			runOrder.push(2);
			done(null, 4);
		}, 1);
	};

	var func3 = function(done, key, result) {
		setTimeout(function() {
			console.log("task", arguments);
			run(3);
			runOrder.push(3);
			done(null, 6);
		}, 10);
	};

	$series(func1, func2, func3);

	$series([func1, func2, func3], function(err, result) {
		console.log("$series 2", arguments);
		same(result, [2,4,6], "result is as expected");
		same(runOrder, [1,1,2,2,3,3], "run order is as expected");
		ok(true, "array of functions with callback signature: all functions ran");
	});

	var runOrder1 = [];
	var delays = [100, 1, 10];
	var work = [5,6,7];

	$series(work, function(next, val, key, obj) {
		key = key*1;
		setTimeout(function() {
			run(key);
			ok($isNumber(val) && val > 4, "val param is correct");
			ok($isNumber(key) && key < 3, "key param is correct");
			runOrder1.push(key);
			obj[key] = val * 2;
			next(null, val * 2);
		}, delays[key]);
	});

	var runOrder2 = [];
	var work2 = [5,6,7];
	$series(work2, function(next, val, key, obj) {
		key = key*1;
		console.log("$series 4", arguments);
		setTimeout(function() {
			run(key);
			ok($isNumber(val) && val > 4, "val param is correct");
			ok($isNumber(key) && key < 3, "key param is correct");
			runOrder2.push(key);
			obj[key] = val * 2;
			next(null, val * 2);
		}, delays[key]);
	}, function(err, result) {
		ok(true, "array of functions with callback signature: all functions ran");
		same(runOrder2, [0,1,2], "run order is as expected");
		same(result, [10,12,14], "result is as expected");
		start();
	});

	console.log("done with $parallel");

});