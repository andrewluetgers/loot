
module("loot");

test("$new", function() {

	expect(12);

	var person = {
		firstName: "john",
		age: 30
	};

	var jim = $new(person);
	jim.firstName = "jim";

	ok(person.firstName == "john", "changes to new instance do not affect original object");
	ok(person.age == "30", "untouched properties on new instance inherit values form original object");
	ok(jim.firstName == "jim", "changes to new instance took place");
	delete jim.firstName;
	ok(jim.firstName == "john", "deleting modification on new instance allows original value to shine through");
	delete jim.firstName;
	ok(person.firstName == "john", "deleting inherited value has no effect on origin");
	ok(jim.firstName == "john", "deleting inherited value has no effect on new instance");
	person.age = 0;
	ok(jim.age === 0, "modifications on original get inherited by new instance");

	var initScope,
		initruns = 0,
		initTest = $new({
			init: function() {
				var myRunCount = ++initruns;
				initScope = this;
				var sharedSecret = "shared"+myRunCount;
				this.getSharedSecret = function() {
					return sharedSecret;
				};
				this.setSharedSecret = function(val) {
					sharedSecret = val + "" + myRunCount;
				};
			}
		});

	equals(initScope, initTest, "init function is properly called");
	equals(initTest.getSharedSecret(), "shared1", "init function enables providing access to private members");

	var sharingSecrets = $new(initTest);
	equals(sharingSecrets.getSharedSecret(), "shared2", "closures from init functions are unique to instances");
	sharingSecrets.setSharedSecret("changed");
	equals(initTest.getSharedSecret(), "shared1", "modifications to closures from child do not affect ancestor");
	initTest.setSharedSecret("changed");
	equals(sharingSecrets.getSharedSecret(), "changed2", "modifications to shared closures from ancestor do not affect child");
});


test("$speak", function() {
	expect(27);

	var myBlankSpeaker = $speak({name:"myBlankSpeaker"});

	ok($isSpeaker(myBlankSpeaker), "calling $speak without arguments returns a new speaker");

	var mySpeaker = $speak({
		name: "mySpeaker",
		firstName: "",
		age: 0
	});

	var mySpeaker3 = $speak({
		firstName: "",
		age: 0
	});

	ok($isSpeaker(mySpeaker), "calling $speak with arguments returns a new speaker");

	ok($isSpeaker(myBlankSpeaker) && $isSpeaker(myBlankSpeaker), "$isSpeaker works properly");

	myBlankSpeakerTestResponses = 0;
	myBlankSpeakerTestLastTopic = null;
	myBlankSpeakerTestLastMessage = null,
		myBlankSpeakerTestLastSpeaker = null,
		myBlankSpeakerTestLastScope = null,
		myBlankSpeaker.listen("test", function(message, topic, speaker) {
			myBlankSpeakerTestResponses++;
			myBlankSpeakerTestLastTopic = topic;
			myBlankSpeakerTestLastMessage = message;
			myBlankSpeakerTestLastSpeaker = speaker;
			myBlankSpeakerTestLastScope = this;

		});

	mySpeakerTestResponses = 0;
	mySpeakerTestLastTopic = null;
	mySpeakerTestLastMessage = null,
		mySpeakerTestLastSpeaker = null,
		mySpeakerTestLastScope = null,
		mySpeaker.listen("test", function(message, topic, speaker) {
			if(mySpeakerTestResponses > 20){return;}
			console.log(arguments);
			console.log((speaker && speaker === myBlankSpeaker));
			mySpeakerTestResponses++;
			mySpeakerTestLastTopic = topic;
			mySpeakerTestLastMessage = message;
			mySpeakerTestLastSpeaker = speaker;
			mySpeakerTestLastScope = this;
		});

	myBlankSpeaker.tell("test", "this is a test");
	ok(myBlankSpeakerTestResponses == 1, "properly responded to simple tell");
	ok(myBlankSpeakerTestLastMessage == "this is a test", "responder received the message as first arg");
	ok(myBlankSpeakerTestLastTopic == "test", "received the topic as second arg");
	ok(myBlankSpeakerTestLastSpeaker === myBlankSpeaker, "properly received the original speaker for 3rd arg");
	ok(myBlankSpeakerTestLastScope === myBlankSpeaker, "scope was properly the speaker that was told");

	ok(mySpeakerTestResponses == 0, "message was not shared with others");



	mySpeaker.listensTo(myBlankSpeaker);

	myBlankSpeaker.tell("test", "this is a test with sharing");
	ok(myBlankSpeakerTestResponses == 2, "properly responded to simple tell");
	ok(myBlankSpeakerTestLastMessage == "this is a test with sharing", "responder received the message");

	ok(mySpeakerTestResponses == 1, "properly responded to shared message");
	equals(mySpeakerTestLastTopic, "test", "properly received the shared topic as first arg");
	ok(mySpeakerTestLastMessage == "this is a test with sharing", "responder received the message as second arg");
	ok(mySpeakerTestLastSpeaker == myBlankSpeaker, "properly received the original speaker for speaker in 3rd arg since it was a shared message");
	ok(mySpeakerTestLastScope == mySpeaker, "scope was properly the speaker that was told");

	mySpeaker3TestResponses = 0;
	mySpeaker3TestLastTopic = null;
	mySpeaker3TestLastMessage = null,
		mySpeaker3TestLastSpeaker = null,
		mySpeaker3TestLastScope = null,
		mySpeaker3.listen("test", function(message, topic, speaker) {
			mySpeaker3TestResponses++;
			mySpeaker3TestLastTopic = topic;
			mySpeaker3TestLastMessage = message;
			mySpeaker3TestLastSpeaker = speaker;
			mySpeaker3TestLastScope = this;
		});

	mySpeaker.talksTo(mySpeaker3);
	myBlankSpeaker.tell("test", "this is a test with a sharing chain");

	ok(mySpeaker3TestResponses == 1, "third party (2nd share) properly responded to");
	ok(mySpeaker3TestLastTopic == "test", "properly received the topic as first arg");
	ok(mySpeaker3TestLastMessage == "this is a test with a sharing chain", "responder received the message as second arg");
	ok(mySpeaker3TestLastSpeaker === myBlankSpeaker, "properly received original speaker for 3rd arg");
	ok(mySpeaker3TestLastScope === mySpeaker3, "scope was properly the speaker that was told");

	mySpeaker3.selectiveHearing = function(message, topic, speaker) {
		ok(this === mySpeaker3, "selective hearing function properly scoped");
		ok(speaker === mySpeaker3, "selective hearing speaker is the original speaker for non shared messages");
		return !(topic == "test"); // ignore test messages
	};
	mySpeaker3.tell("test", "testing selectiveHearing");
	console.log("for: selective hearing ignores items when truth test returns false", mySpeaker3TestResponses);
	ok(mySpeaker3TestResponses == 1, "selective hearing ignores items when truth test returns false");


	mySpeaker3.selectiveHearing = function(message, topic, speaker) {
		ok(this === mySpeaker3, "selective hearing function properly scoped");
		ok(speaker === mySpeaker, "selective hearing speaker properly ser for shared messages");
		return (topic == "test"); // ignore all but test messages
	};

	mySpeaker.tell("test", "testing selectiveHearing again");
	ok(mySpeaker3TestResponses == 2, "selective hearing listens to items when truth test returns true");

});


test("$make", function() {
	expect(15);

	var aPerson = {
		firstName: "",
		age: 0,
		language: "en"
	};

	var aParent = $new(aPerson);
	aParent.firstName = "john";
	aParent.lastName = "doe";
	aParent.age = 40;
	aParent.city = "nevis";
	aParent.state = "MN";
	aParent.language = "cz";


	var aKid = $new(aPerson);
	aKid.firstName = "jim";
	aKid.age = 12;


	var aStudent = $new(aPerson);
	aStudent.school = "ISD 128";
	aStudent.grade = 5;

	// basic make behavior: prototype, extension, mixin
	var jim = $make(aParent, aKid, aStudent);

	equals(jim.language, "en", "inherited property on extender overwrites the prototype inherited value, while mixin inherited property is ignored");
	equals(jim.age, 12, "extension property overwrites inherited property from prototype");
	equals(aStudent.age, 0, "mixin inherits age == 0");
	equals(jim.age, 12, "property inherited on mixin is not applied");
	equals(jim.grade, 5, "property local to mixin is applied");
	equals(jim.lastName, "doe", "prototype property exists when not set by extension or mixin");

	aKid.age = 15;
	equals(jim.age, 12, "there is NO prototypal inheritance between new object and extension object");
	aStudent.grade = 8;
	equals(jim.grade, 5, "there is NO prototypal inheritance between new object and mixin object");
	aParent.lastName = "johnson";
	equals(jim.lastName, "johnson", "there IS prototypal inheritance between new object and prototype object");
	aPerson.country = "us";
	equals(aParent.country, "us", "prototype inherits new properties when they are added to its prototype object");
	equals(jim.country, "us", "inheritance chaining: new object also inherits new properties when they are added to its prototype's prototype object");




	// init callback support
	var afterProtoMake = 0,
		afterextensionMake = 0,
		afterMixinMake = 0;

	var initTester = $make({
		init: function() {
			afterProtoMake = this;
		}
	},{
		init: function() {
			afterextensionMake = this;
		}
	},{
		init: function() {
			afterMixinMake = this;
		}
	});

	equals(initTester, afterProtoMake, "init on prototype called properly");
	equals(initTester, afterextensionMake, "init on extender called properly");
	equals(initTester, afterMixinMake, "init on mixin called properly");
	equals(initTester.init.length, 3, "init is an array of all init methods after make");

});




test("$make + $speak integration", function() {

	expect(8);

	aTestResponsesMA = 0;
	var myAudience = $speak({name:"myAudience"}).listen("aTest", function(subject, message, source) {
		aTestResponsesMA++;
	});

	aTestResponsesMM = 0;
	var myMessenger = $speak({name: "myMessenger"}).listen("aTest", function(subject, message, source) {
		aTestResponsesMM++;
	}).talksTo(myAudience);

	var newMessenger = $make(myMessenger, {name: "newMessenger"});

	same(newMessenger._listeningFor, {}, "_listeningFor object is cleared out so we don't inherit/share them");
	same(newMessenger._audience, [], "_audience array is cleared out so we don't inherit/share audiences");



	aTestResponsesNM = 0;
	newMessenger.listen("aTest", function(subject, message, source) {
		aTestResponsesNM++;
	});

	myMessenger.tell("aTest", "this is a test");

	equals(aTestResponsesMM, 1, "preexisting handlers work as expected");
	equals(aTestResponsesMA, 1, "preexisting message sharing works as expected");
	equals(aTestResponsesNM, 0, "events do not bubble by default");

	var forceBubble = $make(myMessenger, {name: "forceBubble", shareMessages: true});
	aTestResponsesFB = 0;
	forceBubble.listen("aTest", function(subject, message, source) {
		aTestResponsesFB++;
	});

	myMessenger.tell("aTest", "this is a test");
	equals(aTestResponsesFB, 1, "shareMessages attribute makes new object listen to prototype messages");

	var inheritBubble = $make(forceBubble, {name: "inheritBubble"});
	aTestResponsesIB = 0;
	inheritBubble.listen("aTest", function(subject, message, source) {
		aTestResponsesIB++;
	});

	myMessenger.tell("aTest", "this is a test");
	equals(aTestResponsesIB, 1, "shareMessages attribute persists as you make new objects creating a chain of message sharing (bubbling)");

	var preventBubble = $make(inheritBubble, {name: "preventBubble", dontShareMessages: true});
	aTestResponsesPB = 0;
	preventBubble.listen("aTest", function(subject, message, source) {
		aTestResponsesPB++;
	});

	myMessenger.tell("aTest", "this is a test");
	equals(aTestResponsesPB, 0, "dontShareMessages=true property can be used to break the message chain");


});


test("$copy", function() {

	expect(5);

	var objA = {name: "objA"};
	var objB = {name: "objB", testObj: {array:[1, "string", {object:{name:"hey", age: 23} }, [0,2, 3, 5, [0, 0, 0]] ], func: function(){return this;}}};

	var aCopy = $copy(objA);
	same(aCopy, objA, "deep copy of a simple object works");

	objA.name = "objectA";
	ok(aCopy.name === "objA", "changes on simple object do not transfer to copy");

	var bCopy = $copy(objB);
	same(bCopy, objB, "deep copy of a complex object works");

	objB.testObj.array[2].object.name = "yo";
	ok(bCopy.testObj.array[2].object.name === "hey", "changes on complex object do not transfer to copy");

	var b2Copy = $new(objB);
	b2Copy.name = "b2";
	b2Copy.custom = "owned";

	var base = {
		name: "b2",
		custom: "owned"
	};

	var newB = $copy(b2Copy, function(key, source) {
		return source.hasOwnProperty(key);
	});

	same(newB, base, "filter function works properly");

});


test("$merge", function() {

	expect(3);

	var objA = {name: "objA"};
	var objB = {name: "objB", custom: "owned", testObj: {array:[1, "string", {object:{name:"hey", age: 23} }, [0,2, 3, 5, [0, 0, 0]] ], func: function(){return this;}}};

	$merge(objA, objB);
	same(objB, objA, "properly augments the provided target object");

	// test filter method that only allows owned properties
	var b2Copy = $new(objB);

	var base = {
		name: "b2",
		custom: "owned"
	};

	var augment = {
		name: "b2",
		custom: "owned"
	};

	$merge(augment, b2Copy, function(key, source) {
		return source.hasOwnProperty(key);
	});

	same(augment, base, "filter function works properly");


	$merge(augment, b2Copy);

	same(augment, b2Copy, "will copy over inherited properties by default");

});



//test("$walk", function() {
//
//	expect(3);
//
//	var samples = {
//			list: [1,2,3,4],
//			obj: {one:1, two:2, three:3, four:4},
//			nestedLists: [1,
//				[2, 3],
//				[4, 5, [7, 8], 6]
//			],
//			nestedObjs: { one: 1,
//				nest1: {
//					two: 2,
//					three: 3
//				},
//				nest2: {
//					four: 4,
//					five: 5
//				}
//			}
//		};
//
//
//});