
module("$io");


//		test("$io", function() {
//
//			expect(20);
//
//			// setup mock data source
//			$.mockjax({
//				url: '/test',
//				responseTime: 200,
//				status: 200, // 500 error
//				response: function() {
//					this.responseText = JSON.stringify({msg: "Hello world!"});
//				}
//			});
//
//			$.mockjax({
//				url: '/err',
//				responseTime: 200,
//				status: 500, // 500 error
//				response: function() {
//					this.responseText = "error";
//				}
//			});
//
//			stop();
//
//			$io.listen("io:start:", function(msg, type) {
//				console.log(type);
//				console.log(msg);
//				ok(type.match(/^io:start/), "io:start event fires");
//				ok(this == $io, "'this' is sauce.io");
//			});
//
//			$io.listen("io:success", function(msg, type) {
//				console.log(type);
//				console.log(msg);
//				ok(type.match(/^io:success/), "io:success event fires");
//				ok(msg.val.msg == "Hello world!", "received the message");
//				ok(msg.req.b == 4, "received the original req");
//				ok(msg.xhr, "received the xhr");
//				ok(msg.url == "/test", "received the url");
//				ok(this == $io, "'this' is sauce.io");
//			});
//
//
//			$io.listen("io:error", function(msg, type) {
//				console.log(type);
//				console.log(msg);
//				ok(type.match(/^io:error/), "io:error event fires");
//				ok(this == $io, "'this' is sauce.io");
//				start();
//			});
//
//			$io("/test", {b:4, a:1});
//			$io("/test", {b:4, a:1});
//			$io("/err", {b:4, a:1});
//
//		});
//
//		test("$io more io", function() {
//
//			expect(5);
//
//			$.mockjax({
//				url: '/test2',
//				responseTime: 200,
//				status: 200, // 500 error
//				response: function() {
//					this.responseText = JSON.stringify({msg: "Hello world!"});
//				}
//			});
//
//			// alternate one-off non-pub-sub syntax for io with start, success and error handlers
//			var startFired = 0,
//				successFired = 0,
//				errorFired = 0;
//
//			stop();
//
//			console.log("non evented callbacks");
//			$io.ignore();
//
//			setTimeout(function() {
//				$io("/test2", {b:5, a:3}, {
//					start: function(msg, type) {
//						console.log(type);
//						console.log(msg);
//						startFired++;
//						ok(type.match("io:start"), "io:start event fires");
//						ok(this == $io, "'this' is sauce.io");
//					},
//					success: function(msg, type) {
//						console.log(type);
//						console.log(msg);
//						successFired++;
//						ok(type.match("io:success"), "io:success event fires");
//						ok(this == $io, "'this' is sauce.io");
//						ok(errorFired === 0, "error handler didn't fire");
//					},
//					error: function(msg, type) {
//						console.log(type);
//						console.log(msg);
//						errorFired++;
//					}
//				});
//			}, 500);
//
//			setTimeout(function() {
//				start();
//			},1000);
//
//		});


test("$cache", function() {

	expect(16);

	var url = "/test",
		testReq1 = {a:3, b:6, blah:"text"},
		testReq2 = {a:3, b:6, blah:{h:5}},
		testVal = {my:"val"},
		testMetaData = {more:"metadata"};

	ok($cache.getKey(url) == "/test", "cacheKeys use just the url if no req provided");
	ok($cache.getKey(url, testReq1) == '/test[a:3,b:6,blah:text]', "cacheKeys stringify req objects, strings do not show outer quotes");
	ok($cache.getKey(url, testReq2) == "/test[a:3,b:6,blah:[object Object]]", "cacheKeys toString nested objects");

	$cache.newType("aNewType");
	$cache.listen(/^aNewType:set/, function(val, type) {
		ok(type === "aNewType:set:/aTest", "custom event is fired for typeId:set:cacheKey");
		ok(val === $cache.get("aNewType", "/aTest"), "bin is passed to callback");
	});

	var bin = $cache.set("aNewType", "/aTest", null, testVal, testMetaData);

	ok(bin.typeId == "aNewType", "bins store the typeId");
	ok(bin.key == "/aTest", "bins store the cacheKey");
	ok(bin.url == "/aTest", "bins store the url");
	ok(bin.req == null, "bins store the req");
	ok(bin.val == testVal, "bins store the val");
	ok(typeof bin.setAt == "number", "bins store a timestamp for last update");

	// remove all listeners on the cache to reduce test noises
	$cache.ignore();

	$cache.set("aNewType", "/aTest", {param:1}, 1, testMetaData);
	$cache.set("aNewType", "/aTest", {param:2}, 2, testMetaData);
	$cache.set("aNewType", "/aTest", {param:3}, 3, testMetaData);
	$cache.set("aNewType", "/aTest", {param:4}, 4, testMetaData);

	var origLen = $length($cache.get("aNewType").bins),
		evicted = 0;

	$cache.listen(/^aNewType:evict/, function(val, type) {
		ok(type === "aNewType:evict:"+val.key, "custom event is fired for typeId:evict:cacheKey");
		evicted++;
	});

	var ev = $cache.evict("aNewType", function(bin, key) {
		// should evict 2 items with even values
		return (bin.val%2);
	});

	var newLen = $length($cache.get("aNewType").bins);

	ok(ev.evicted === evicted, "evicted two items");
	ok(ev.total === origLen, "processed "+origLen+" items");
	ok(ev.remain === newLen, newLen+" items remain");
});



//
//
//		test("$newRemoteType", function() {
//
//			$.mockjax({
//				url: '/test3',
//				responseTime: 200,
//				status: 200, // 500 error
//				response: function() {
//					this.responseText = JSON.stringify({msg: "Hello world!"});
//				}
//			});
//			$.mockjax({
//				url: '/err3',
//				responseTime: 200,
//				status: 500, // 500 error
//				response: function() {
//					this.responseText = "error";
//				}
//			});
//
//			var myRemoteType = $cache.newRemoteType("remote1", {
//				baseUrl: "/test3"
//			});
//
//			stop();
//
//			var successCalled = 0,
//				startCalled = 0,
//				xhr = myRemoteType.sync({param:5}, {
//				start: function(msg, type) {
//					console.log(type);
//					console.log(msg);
//					console.log(this);
//					startCalled++;
//				},
//				success: function(msg, type) {
//					console.log(type);
//					console.log(msg);
//					console.log(this);
//					successCalled++;
//					ok(startCalled == 1, "start method was called");
//					ok(successCalled == 1, "success method was called");
//					start()
//				},
//				error: function(msg, type) {
//					console.log(type);
//					console.log(msg);
//					console.log(this);
//				}
//			});
//		});
