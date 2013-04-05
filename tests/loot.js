
module("loot");

test("$sortBy", function() {

	expect(3);


	var simpleData = [
		{index: 0, orig: 0, alpha: "aaa"},
		{index: 3, orig: 1, alpha: "aab"},
		{index: 1, orig: 2, alpha: "aba"},
		{index: 5, orig: 3, alpha: "baa"},
		{index: 4, orig: 4, alpha: "aac"},
		{index: 1, orig: 5, alpha: "aca"},
		{index: 2, orig: 6, alpha: "caa"},
		{index: 0, orig: 7, alpha: "aa"},
		{index: 5, orig: 8, alpha: "ab"},
		{index: 20, orig: 9, alpha: "ac"},
		{index: 10, orig: 10, alpha: "ca"},
		{index: 4, orig: 11, alpha: "a"},
		{index: 5, orig: 12, alpha: "b"},
		{index: 100, orig: 13, alpha: "c"}
	];

	var simpleDataSortedOnIndex = [
		{index: 0, orig: 0, alpha: "aaa"},
		{index: 0, orig: 7, alpha: "aa"},
		{index: 1, orig: 2, alpha: "aba"},
		{index: 1, orig: 5, alpha: "aca"},
		{index: 2, orig: 6, alpha: "caa"},
		{index: 3, orig: 1, alpha: "aab"},
		{index: 4, orig: 4, alpha: "aac"},
		{index: 4, orig: 11, alpha: "a"},
		{index: 5, orig: 3, alpha: "baa"},
		{index: 5, orig: 8, alpha: "ab"},
		{index: 5, orig: 12, alpha: "b"},
		{index: 10, orig: 10, alpha: "ca"},
		{index: 20, orig: 9, alpha: "ac"},
		{index: 100, orig: 13, alpha: "c"}
	];

	var simpleDataSortedOnAlpha = [
		{index: 4, orig: 11, alpha: "a"},
		{index: 0, orig: 7, alpha: "aa"},
		{index: 0, orig: 0, alpha: "aaa"},
		{index: 3, orig: 1, alpha: "aab"},
		{index: 4, orig: 4, alpha: "aac"},
		{index: 5, orig: 8, alpha: "ab"},
		{index: 1, orig: 2, alpha: "aba"},
		{index: 20, orig: 9, alpha: "ac"},
		{index: 1, orig: 5, alpha: "aca"},
		{index: 5, orig: 12, alpha: "b"},
		{index: 5, orig: 3, alpha: "baa"},
		{index: 100, orig: 13, alpha: "c"},
		{index: 10, orig: 10, alpha: "ca"},
		{index: 2, orig: 6, alpha: "caa"}
	];

	var data = [
		{"type": "Workflow", "label": "General Rowcount FileStem_10", "skip": "false", "submitTS": "2012-11-09T04:15:59Z", "stopTS": 1352434588000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:28Z", "startTS": 1352434571000},
		{"type": "Workflow", "label": "General Rowcount FileStem_11", "skip": "false", "submitTS": "2012-11-09T04:16:00Z", "stopTS": 1352434615000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:55Z", "startTS": 1352434572000},
		{"type": "Workflow", "label": "General Rowcount FileStem_12", "skip": "false", "submitTS": "2012-11-09T04:16:01Z", "stopTS": 1352434580000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:19Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_13", "skip": "false", "submitTS": "2012-11-09T04:16:02Z", "stopTS": 1352434589000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:29Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_14", "skip": "false", "submitTS": "2012-11-09T04:16:03Z", "stopTS": 1352434590000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:29Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_15", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_16", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_17", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_18", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_19", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_20", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_21", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_22", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_23", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_24", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_25", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_26", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_27", "skip": "false", "submitTS": "2012-11-09T04:16:04Z", "stopTS": 1352434582000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:22Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_28", "skip": "false", "submitTS": "2012-11-09T04:16:05Z", "stopTS": 1352434583000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:23Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_29", "skip": "false", "submitTS": "2012-11-09T04:16:06Z", "stopTS": 1352434579000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:18Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_3", "skip": "false", "submitTS": "2012-11-09T04:16:07Z", "stopTS": 1352434580000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:19Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_30", "skip": "false", "submitTS": "2012-11-09T04:16:08Z", "stopTS": 1352434611000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:51Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_31", "skip": "false", "submitTS": "2012-11-09T04:16:09Z", "stopTS": 1352434615000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:55Z", "startTS": 1352434603000},
		{"type": "Workflow", "label": "General Rowcount FileStem_32", "skip": "false", "submitTS": "2012-11-09T04:16:10Z", "stopTS": 1352434608000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:48Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_33", "skip": "false", "submitTS": "2012-11-09T04:16:11Z", "stopTS": 1352434674000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:54Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_34", "skip": "false", "submitTS": "2012-11-09T04:16:12Z", "stopTS": 1352434695000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:18:15Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_35", "skip": "false", "submitTS": "2012-11-09T04:16:13Z", "stopTS": 1352434629000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:09Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_36", "skip": "false", "submitTS": "2012-11-09T04:16:14Z", "stopTS": 1352434664000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:43Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_37", "skip": "false", "submitTS": "2012-11-09T04:16:15Z", "stopTS": 1352434643000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:23Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_38", "skip": "false", "submitTS": "2012-11-09T04:16:16Z", "stopTS": 1352434851000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:20:51Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_4", "skip": "false", "submitTS": "2012-11-09T04:16:17Z", "stopTS": 1352434623000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:03Z", "startTS": 1352434619000},
		{"type": "Workflow", "label": "General Rowcount FileStem_5", "skip": "false", "submitTS": "2012-11-09T04:16:18Z", "stopTS": 1352434637000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:17Z", "startTS": 1352434633000},
		{"type": "Workflow", "label": "General Rowcount FileStem_6", "skip": "false", "submitTS": "2012-11-09T04:16:19Z", "stopTS": 1352434643000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:22Z", "startTS": 1352434634000},
		{"type": "Workflow", "label": "General Rowcount FileStem_7", "skip": "false", "submitTS": "2012-11-09T04:16:20Z", "stopTS": 1352434639000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:18Z", "startTS": 1352434635000},
		{"type": "Workflow", "label": "General Rowcount FileStem_8", "skip": "false", "submitTS": "2012-11-09T04:16:21Z", "stopTS": 1352434652000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:32Z", "startTS": 1352434649000},
		{"type": "Workflow", "label": "General Rowcount FileStem_9", "skip": "false", "submitTS": "2012-11-09T04:16:22Z", "stopTS": 1352434657000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:36Z", "startTS": 1352434650000},
		{"type": "Notification", "label": "Notification", "skip": "false", "submitTS": "2012-11-09T04:15:59Z", "stopTS": 1352434559000, "status": "SUCCESS", "message": "MAKE SURE CUSTSEG, PH and SCORE FILES ARE ALL DONE", "links": null, "startTS": 1352434559000},
		{"type": "Workflow", "label": "XZ-08- The Counts Report", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null}
	];

	var sortedData1 = [
		{"type": "Workflow", "label": "General Rowcount FileStem_15", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_16", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_17", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_18", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_19", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_20", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_21", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_22", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_23", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_24", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_25", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_26", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "XZ-08- The Counts Report", "skip": "true", "submitTS": null, "stopTS": null, "status": "SKIPPED", "runUrl": null, "links": null},
		{"type": "Workflow", "label": "General Rowcount FileStem_10", "skip": "false", "submitTS": "2012-11-09T04:15:59Z", "stopTS": 1352434588000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:28Z", "startTS": 1352434571000},
		{"type": "Workflow", "label": "General Rowcount FileStem_11", "skip": "false", "submitTS": "2012-11-09T04:16:00Z", "stopTS": 1352434615000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:55Z", "startTS": 1352434572000},
		{"type": "Workflow", "label": "General Rowcount FileStem_12", "skip": "false", "submitTS": "2012-11-09T04:16:01Z", "stopTS": 1352434580000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:19Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_13", "skip": "false", "submitTS": "2012-11-09T04:16:02Z", "stopTS": 1352434589000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:29Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_14", "skip": "false", "submitTS": "2012-11-09T04:16:03Z", "stopTS": 1352434590000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:29Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_27", "skip": "false", "submitTS": "2012-11-09T04:16:04Z", "stopTS": 1352434582000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:22Z", "startTS": 1352434573000},
		{"type": "Workflow", "label": "General Rowcount FileStem_28", "skip": "false", "submitTS": "2012-11-09T04:16:05Z", "stopTS": 1352434583000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:23Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_29", "skip": "false", "submitTS": "2012-11-09T04:16:06Z", "stopTS": 1352434579000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:18Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_3", "skip": "false", "submitTS": "2012-11-09T04:16:07Z", "stopTS": 1352434580000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:19Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_30", "skip": "false", "submitTS": "2012-11-09T04:16:08Z", "stopTS": 1352434611000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:51Z", "startTS": 1352434574000},
		{"type": "Workflow", "label": "General Rowcount FileStem_31", "skip": "false", "submitTS": "2012-11-09T04:16:09Z", "stopTS": 1352434615000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:55Z", "startTS": 1352434603000},
		{"type": "Workflow", "label": "General Rowcount FileStem_32", "skip": "false", "submitTS": "2012-11-09T04:16:10Z", "stopTS": 1352434608000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:16:48Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_33", "skip": "false", "submitTS": "2012-11-09T04:16:11Z", "stopTS": 1352434674000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:54Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_34", "skip": "false", "submitTS": "2012-11-09T04:16:12Z", "stopTS": 1352434695000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:18:15Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_35", "skip": "false", "submitTS": "2012-11-09T04:16:13Z", "stopTS": 1352434629000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:09Z", "startTS": 1352434604000},
		{"type": "Workflow", "label": "General Rowcount FileStem_36", "skip": "false", "submitTS": "2012-11-09T04:16:14Z", "stopTS": 1352434664000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:43Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_37", "skip": "false", "submitTS": "2012-11-09T04:16:15Z", "stopTS": 1352434643000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:23Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_38", "skip": "false", "submitTS": "2012-11-09T04:16:16Z", "stopTS": 1352434851000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:20:51Z", "startTS": 1352434605000},
		{"type": "Workflow", "label": "General Rowcount FileStem_4", "skip": "false", "submitTS": "2012-11-09T04:16:17Z", "stopTS": 1352434623000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:03Z", "startTS": 1352434619000},
		{"type": "Workflow", "label": "General Rowcount FileStem_5", "skip": "false", "submitTS": "2012-11-09T04:16:18Z", "stopTS": 1352434637000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:17Z", "startTS": 1352434633000},
		{"type": "Workflow", "label": "General Rowcount FileStem_6", "skip": "false", "submitTS": "2012-11-09T04:16:19Z", "stopTS": 1352434643000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:22Z", "startTS": 1352434634000},
		{"type": "Workflow", "label": "General Rowcount FileStem_7", "skip": "false", "submitTS": "2012-11-09T04:16:20Z", "stopTS": 1352434639000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:18Z", "startTS": 1352434635000},
		{"type": "Workflow", "label": "General Rowcount FileStem_8", "skip": "false", "submitTS": "2012-11-09T04:16:21Z", "stopTS": 1352434652000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:32Z", "startTS": 1352434649000},
		{"type": "Workflow", "label": "General Rowcount FileStem_9", "skip": "false", "submitTS": "2012-11-09T04:16:22Z", "stopTS": 1352434657000, "status": "SUCCESS", "links": null, "publishTS": "2012-11-09T04:17:36Z", "startTS": 1352434650000},
		{"type": "Notification", "label": "Notification", "skip": "false", "submitTS": "2012-11-09T04:15:59Z", "stopTS": 1352434559000, "status": "SUCCESS", "message": "MAKE SURE CUSTSEG, PH and SCORE FILES ARE ALL DONE", "links": null, "startTS": 1352434559000}
	];
	
	var simple1 = $sortBy(simpleData, "index");
	same(simple1, simpleDataSortedOnIndex, "basic number sort");

	var simple2 = $sortBy(simpleData, "alpha");
	same(simple2, simpleDataSortedOnAlpha, "basic string sort (a vs b vs aa vs acb etc.)");

	var sorted1 = $sortBy(data, "status");
	same(sorted1, sortedData1, "basic string sort (SKIPPED vs SUCCESS)");

});

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
	console.log(objB.testObj.array[2].object.name, bCopy.testObj.array[2].object.name);
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

	expect(5);

	var one = {name: "foo", age: 20, array: [1,2,3, {obj: "foo", bar: "baz"}], onlyOnOne: 1};
	var two = {name: "bar", age: 80, array: [3,4,5, {obj: "bar", baz: "foo"}], onlyOnTwo: 2};
	var tre = {name: "bar", age: 80, array: [3,4,5, {obj: "bar", bar: "baz", baz: "foo"}], onlyOnOne: 1, onlyOnTwo: 2};
	$merge(one, two);
	same(one, tre, "properly augments the provided target object"); // this test is sensitive to the order of items in tre

	var func = function() {return this;};
	var objA = 		{name: "objA", onlyOnA: "blarg"};
	var objB = 		{name: "objB", 						custom: "owned", testObj: {array:[1, "string", {object:{name:"hey", age: 23} }, [0,2, 3, 5, [0, 0, 0]] ], func: func}};
	var ABResult = 	{name: "objB", onlyOnA: "blarg", 	custom: "owned", testObj: {array:[1, "string", {object:{name:"hey", age: 23} }, [0,2, 3, 5, [0, 0, 0]] ], func: func}};

	$merge(objA, objB);
	console.log("test", objA, objB, ABResult, $same(objA, ABResult));
	same(ABResult, objA, "properly augments the provided target object");

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

	for (var key in b2Copy) {
		console.log(b2Copy.hasOwnProperty(key), b2Copy, key, b2Copy[key]);
	}

	$merge(augment, b2Copy, function(key, source) {
		console.log("testing with filter", source.hasOwnProperty(key));
		return source.hasOwnProperty(key);
	});

	same(augment, base, "filter function works properly");


	$merge(augment, b2Copy);

	same(augment, b2Copy, "will copy over inherited properties by default");


	var fileModelSpec = {
		defaults: {
			"size": 				"origSize",
			"key":					"origKey",
			"name":					"origName",
			//type: 				"projectFile",
			//parentType: 			"project",
			blarg:					function() {return "blargBlarg";},
			limitBytes: 			2047,
			fileData:				false
		},

		func: function() {
			return "original function";
		}
	};


	var projectFile = $merge({}, fileModelSpec, {
		defaults: {
			type: "projectFile",
			parentType: "project"
		}
	});


	var sharedFile = $merge({}, fileModelSpec, {
		defaults: {
			type: "sharedFile",
			parentType: "client"
		}
	});

	same(sharedFile.defaults, {
		"size": 				"origSize",
		"key":					"origKey",
		"name":					"origName",
		blarg:					fileModelSpec.defaults.blarg,
		limitBytes: 			2047,
		fileData:				false,
		type: 					"sharedFile",
		parentType: 			"client"
	}, "mixin performs a deep copy, overwriting shared properties that are not objects");



});


test("$mixin", function() {
	var fileModelSpec = {
		defaults: {
			"size": 				"origSize",
			"key":					"origKey",
			"name":					"origName",
			//type: 				"projectFile",
			//parentType: 			"project",
			blarg:					function() {return "blargBlarg";},
			limitBytes: 			2047,
			fileData:				false
		},

		func: function() {
			return "original function";
		}
	};


	var projectFile = $mixin({}, fileModelSpec, {
		defaults: {
			type: "projectFile",
			parentType: "project"
		}
	});


	var sharedFile = $mixin({}, fileModelSpec, {
		defaults: {
			type: "sharedFile",
			parentType: "client"
		}
	});

	same(sharedFile.defaults, {
		type: "sharedFile",
		parentType: "client"
	}, "mixin performs a shallow copy, overwriting objects");
});



/*
code for ast
 function maze(x,y) {
 var n=x*y-1;
 if (n<0) {alert("illegal maze dimensions");return;}
 var horiz=[]; for (var j= 0; j<x+1; j++) horiz[j]= [];
 var verti=[]; for (var j= 0; j<y+1; j++) verti[j]= [];
 var here= [Math.floor(Math.random()*x), Math.floor(Math.random()*y)];
 var path= [here];
 var unvisited= [];
 for (var j= 0; j<x+2; j++) {
 unvisited[j]= [];
 for (var k= 0; k<y+1; k++)
 unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
 }
 while (0<n) {
 var potential= [[here[0]+1, here[1]], [here[0],here[1]+1],
 [here[0]-1, here[1]], [here[0],here[1]-1]];
 var neighbors= [];
 for (var j= 0; j < 4; j++)
 if (unvisited[potential[j][0]+1][potential[j][1]+1])
 neighbors.push(potential[j]);
 if (neighbors.length) {
 n= n-1;
 next= neighbors[Math.floor(Math.random()*neighbors.length)];
 unvisited[next[0]+1][next[1]+1]= false;
 if (next[0] == here[0])
 horiz[next[0]][(next[1]+here[1]-1)/2]= true;
 else
 verti[(next[0]+here[0]-1)/2][next[1]]= true;
 path.push(here= next);
 } else
 here= path.pop();
 }
 return ({x: x, y: y, horiz: horiz, verti: verti});
 }

 function display(m) {
 var text= [];
 for (var j= 0; j<m.x*2+1; j++) {
 var line= [];
 if (0 == j%2)
 for (var k=0; k<m.y*4+1; k++)
 if (0 == k%4)
 line[k]= '+';
 else
 if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
 line[k]= ' ';
 else
 line[k]= '-';
 else
 for (var k=0; k<m.y*4+1; k++)
 if (0 == k%4)
 if (k>0 && m.horiz[(j-1)/2][k/4-1])
 line[k]= ' ';
 else
 line[k]= '|';
 else
 line[k]= ' ';
 if (0 == j) line[1]= line[2]= line[3]= ' ';
 if (m.x*2-1 == j) line[4*m.y]= ' ';
 text.push(line.join('')+'\r\n');
 }
 return text.join('');
 }
 */
var ast = {
	"type": "Program",
	"body": [
		{
			"type": "FunctionDeclaration",
			"id": {
				"type": "Identifier",
				"name": "maze",
				"range": [
					9,
					13
				],
				"loc": {
					"start": {
						"line": 1,
						"column": 9
					},
					"end": {
						"line": 1,
						"column": 13
					}
				}
			},
			"params": [
				{
					"type": "Identifier",
					"name": "x",
					"range": [
						14,
						15
					],
					"loc": {
						"start": {
							"line": 1,
							"column": 14
						},
						"end": {
							"line": 1,
							"column": 15
						}
					}
				},
				{
					"type": "Identifier",
					"name": "y",
					"range": [
						16,
						17
					],
					"loc": {
						"start": {
							"line": 1,
							"column": 16
						},
						"end": {
							"line": 1,
							"column": 17
						}
					}
				}
			],
			"defaults": [],
			"body": {
				"type": "BlockStatement",
				"body": [
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "n",
									"range": [
										26,
										27
									],
									"loc": {
										"start": {
											"line": 2,
											"column": 5
										},
										"end": {
											"line": 2,
											"column": 6
										}
									}
								},
								"init": {
									"type": "BinaryExpression",
									"operator": "-",
									"left": {
										"type": "BinaryExpression",
										"operator": "*",
										"left": {
											"type": "Identifier",
											"name": "x",
											"range": [
												28,
												29
											],
											"loc": {
												"start": {
													"line": 2,
													"column": 7
												},
												"end": {
													"line": 2,
													"column": 8
												}
											}
										},
										"right": {
											"type": "Identifier",
											"name": "y",
											"range": [
												30,
												31
											],
											"loc": {
												"start": {
													"line": 2,
													"column": 9
												},
												"end": {
													"line": 2,
													"column": 10
												}
											}
										},
										"range": [
											28,
											31
										],
										"loc": {
											"start": {
												"line": 2,
												"column": 7
											},
											"end": {
												"line": 2,
												"column": 10
											}
										}
									},
									"right": {
										"type": "Literal",
										"value": 1,
										"raw": "1",
										"range": [
											32,
											33
										],
										"loc": {
											"start": {
												"line": 2,
												"column": 11
											},
											"end": {
												"line": 2,
												"column": 12
											}
										}
									},
									"range": [
										28,
										33
									],
									"loc": {
										"start": {
											"line": 2,
											"column": 7
										},
										"end": {
											"line": 2,
											"column": 12
										}
									}
								},
								"range": [
									26,
									33
								],
								"loc": {
									"start": {
										"line": 2,
										"column": 5
									},
									"end": {
										"line": 2,
										"column": 12
									}
								}
							}
						],
						"kind": "var",
						"range": [
							22,
							34
						],
						"loc": {
							"start": {
								"line": 2,
								"column": 1
							},
							"end": {
								"line": 2,
								"column": 13
							}
						}
					},
					{
						"type": "IfStatement",
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Identifier",
								"name": "n",
								"range": [
									40,
									41
								],
								"loc": {
									"start": {
										"line": 3,
										"column": 5
									},
									"end": {
										"line": 3,
										"column": 6
									}
								}
							},
							"right": {
								"type": "Literal",
								"value": 0,
								"raw": "0",
								"range": [
									42,
									43
								],
								"loc": {
									"start": {
										"line": 3,
										"column": 7
									},
									"end": {
										"line": 3,
										"column": 8
									}
								}
							},
							"range": [
								40,
								43
							],
							"loc": {
								"start": {
									"line": 3,
									"column": 5
								},
								"end": {
									"line": 3,
									"column": 8
								}
							}
						},
						"consequent": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "ExpressionStatement",
									"expression": {
										"type": "CallExpression",
										"callee": {
											"type": "Identifier",
											"name": "alert",
											"range": [
												46,
												51
											],
											"loc": {
												"start": {
													"line": 3,
													"column": 11
												},
												"end": {
													"line": 3,
													"column": 16
												}
											}
										},
										"arguments": [
											{
												"type": "Literal",
												"value": "illegal maze dimensions",
												"raw": "\"illegal maze dimensions\"",
												"range": [
													52,
													77
												],
												"loc": {
													"start": {
														"line": 3,
														"column": 17
													},
													"end": {
														"line": 3,
														"column": 42
													}
												}
											}
										],
										"range": [
											46,
											78
										],
										"loc": {
											"start": {
												"line": 3,
												"column": 11
											},
											"end": {
												"line": 3,
												"column": 43
											}
										}
									},
									"range": [
										46,
										79
									],
									"loc": {
										"start": {
											"line": 3,
											"column": 11
										},
										"end": {
											"line": 3,
											"column": 44
										}
									}
								},
								{
									"type": "ReturnStatement",
									"argument": null,
									"range": [
										79,
										86
									],
									"loc": {
										"start": {
											"line": 3,
											"column": 44
										},
										"end": {
											"line": 3,
											"column": 51
										}
									}
								}
							],
							"range": [
								45,
								87
							],
							"loc": {
								"start": {
									"line": 3,
									"column": 10
								},
								"end": {
									"line": 3,
									"column": 52
								}
							}
						},
						"alternate": null,
						"range": [
							36,
							87
						],
						"loc": {
							"start": {
								"line": 3,
								"column": 1
							},
							"end": {
								"line": 3,
								"column": 52
							}
						}
					},
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "horiz",
									"range": [
										93,
										98
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 5
										},
										"end": {
											"line": 4,
											"column": 10
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										99,
										101
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 11
										},
										"end": {
											"line": 4,
											"column": 13
										}
									}
								},
								"range": [
									93,
									101
								],
								"loc": {
									"start": {
										"line": 4,
										"column": 5
									},
									"end": {
										"line": 4,
										"column": 13
									}
								}
							}
						],
						"kind": "var",
						"range": [
							89,
							102
						],
						"loc": {
							"start": {
								"line": 4,
								"column": 1
							},
							"end": {
								"line": 4,
								"column": 14
							}
						}
					},
					{
						"type": "ForStatement",
						"init": {
							"type": "VariableDeclaration",
							"declarations": [
								{
									"type": "VariableDeclarator",
									"id": {
										"type": "Identifier",
										"name": "j",
										"range": [
											112,
											113
										],
										"loc": {
											"start": {
												"line": 4,
												"column": 24
											},
											"end": {
												"line": 4,
												"column": 25
											}
										}
									},
									"init": {
										"type": "Literal",
										"value": 0,
										"raw": "0",
										"range": [
											115,
											116
										],
										"loc": {
											"start": {
												"line": 4,
												"column": 27
											},
											"end": {
												"line": 4,
												"column": 28
											}
										}
									},
									"range": [
										112,
										116
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 24
										},
										"end": {
											"line": 4,
											"column": 28
										}
									}
								}
							],
							"kind": "var",
							"range": [
								108,
								116
							],
							"loc": {
								"start": {
									"line": 4,
									"column": 20
								},
								"end": {
									"line": 4,
									"column": 28
								}
							}
						},
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Identifier",
								"name": "j",
								"range": [
									118,
									119
								],
								"loc": {
									"start": {
										"line": 4,
										"column": 30
									},
									"end": {
										"line": 4,
										"column": 31
									}
								}
							},
							"right": {
								"type": "BinaryExpression",
								"operator": "+",
								"left": {
									"type": "Identifier",
									"name": "x",
									"range": [
										120,
										121
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 32
										},
										"end": {
											"line": 4,
											"column": 33
										}
									}
								},
								"right": {
									"type": "Literal",
									"value": 1,
									"raw": "1",
									"range": [
										122,
										123
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 34
										},
										"end": {
											"line": 4,
											"column": 35
										}
									}
								},
								"range": [
									120,
									123
								],
								"loc": {
									"start": {
										"line": 4,
										"column": 32
									},
									"end": {
										"line": 4,
										"column": 35
									}
								}
							},
							"range": [
								118,
								123
							],
							"loc": {
								"start": {
									"line": 4,
									"column": 30
								},
								"end": {
									"line": 4,
									"column": 35
								}
							}
						},
						"update": {
							"type": "UpdateExpression",
							"operator": "++",
							"argument": {
								"type": "Identifier",
								"name": "j",
								"range": [
									125,
									126
								],
								"loc": {
									"start": {
										"line": 4,
										"column": 37
									},
									"end": {
										"line": 4,
										"column": 38
									}
								}
							},
							"prefix": false,
							"range": [
								125,
								128
							],
							"loc": {
								"start": {
									"line": 4,
									"column": 37
								},
								"end": {
									"line": 4,
									"column": 40
								}
							}
						},
						"body": {
							"type": "ExpressionStatement",
							"expression": {
								"type": "AssignmentExpression",
								"operator": "=",
								"left": {
									"type": "MemberExpression",
									"computed": true,
									"object": {
										"type": "Identifier",
										"name": "horiz",
										"range": [
											130,
											135
										],
										"loc": {
											"start": {
												"line": 4,
												"column": 42
											},
											"end": {
												"line": 4,
												"column": 47
											}
										}
									},
									"property": {
										"type": "Identifier",
										"name": "j",
										"range": [
											136,
											137
										],
										"loc": {
											"start": {
												"line": 4,
												"column": 48
											},
											"end": {
												"line": 4,
												"column": 49
											}
										}
									},
									"range": [
										130,
										138
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 42
										},
										"end": {
											"line": 4,
											"column": 50
										}
									}
								},
								"right": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										140,
										142
									],
									"loc": {
										"start": {
											"line": 4,
											"column": 52
										},
										"end": {
											"line": 4,
											"column": 54
										}
									}
								},
								"range": [
									130,
									142
								],
								"loc": {
									"start": {
										"line": 4,
										"column": 42
									},
									"end": {
										"line": 4,
										"column": 54
									}
								}
							},
							"range": [
								130,
								143
							],
							"loc": {
								"start": {
									"line": 4,
									"column": 42
								},
								"end": {
									"line": 4,
									"column": 55
								}
							}
						},
						"range": [
							103,
							143
						],
						"loc": {
							"start": {
								"line": 4,
								"column": 15
							},
							"end": {
								"line": 4,
								"column": 55
							}
						}
					},
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "verti",
									"range": [
										149,
										154
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 5
										},
										"end": {
											"line": 5,
											"column": 10
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										155,
										157
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 11
										},
										"end": {
											"line": 5,
											"column": 13
										}
									}
								},
								"range": [
									149,
									157
								],
								"loc": {
									"start": {
										"line": 5,
										"column": 5
									},
									"end": {
										"line": 5,
										"column": 13
									}
								}
							}
						],
						"kind": "var",
						"range": [
							145,
							158
						],
						"loc": {
							"start": {
								"line": 5,
								"column": 1
							},
							"end": {
								"line": 5,
								"column": 14
							}
						}
					},
					{
						"type": "ForStatement",
						"init": {
							"type": "VariableDeclaration",
							"declarations": [
								{
									"type": "VariableDeclarator",
									"id": {
										"type": "Identifier",
										"name": "j",
										"range": [
											168,
											169
										],
										"loc": {
											"start": {
												"line": 5,
												"column": 24
											},
											"end": {
												"line": 5,
												"column": 25
											}
										}
									},
									"init": {
										"type": "Literal",
										"value": 0,
										"raw": "0",
										"range": [
											171,
											172
										],
										"loc": {
											"start": {
												"line": 5,
												"column": 27
											},
											"end": {
												"line": 5,
												"column": 28
											}
										}
									},
									"range": [
										168,
										172
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 24
										},
										"end": {
											"line": 5,
											"column": 28
										}
									}
								}
							],
							"kind": "var",
							"range": [
								164,
								172
							],
							"loc": {
								"start": {
									"line": 5,
									"column": 20
								},
								"end": {
									"line": 5,
									"column": 28
								}
							}
						},
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Identifier",
								"name": "j",
								"range": [
									174,
									175
								],
								"loc": {
									"start": {
										"line": 5,
										"column": 30
									},
									"end": {
										"line": 5,
										"column": 31
									}
								}
							},
							"right": {
								"type": "BinaryExpression",
								"operator": "+",
								"left": {
									"type": "Identifier",
									"name": "y",
									"range": [
										176,
										177
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 32
										},
										"end": {
											"line": 5,
											"column": 33
										}
									}
								},
								"right": {
									"type": "Literal",
									"value": 1,
									"raw": "1",
									"range": [
										178,
										179
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 34
										},
										"end": {
											"line": 5,
											"column": 35
										}
									}
								},
								"range": [
									176,
									179
								],
								"loc": {
									"start": {
										"line": 5,
										"column": 32
									},
									"end": {
										"line": 5,
										"column": 35
									}
								}
							},
							"range": [
								174,
								179
							],
							"loc": {
								"start": {
									"line": 5,
									"column": 30
								},
								"end": {
									"line": 5,
									"column": 35
								}
							}
						},
						"update": {
							"type": "UpdateExpression",
							"operator": "++",
							"argument": {
								"type": "Identifier",
								"name": "j",
								"range": [
									181,
									182
								],
								"loc": {
									"start": {
										"line": 5,
										"column": 37
									},
									"end": {
										"line": 5,
										"column": 38
									}
								}
							},
							"prefix": false,
							"range": [
								181,
								184
							],
							"loc": {
								"start": {
									"line": 5,
									"column": 37
								},
								"end": {
									"line": 5,
									"column": 40
								}
							}
						},
						"body": {
							"type": "ExpressionStatement",
							"expression": {
								"type": "AssignmentExpression",
								"operator": "=",
								"left": {
									"type": "MemberExpression",
									"computed": true,
									"object": {
										"type": "Identifier",
										"name": "verti",
										"range": [
											186,
											191
										],
										"loc": {
											"start": {
												"line": 5,
												"column": 42
											},
											"end": {
												"line": 5,
												"column": 47
											}
										}
									},
									"property": {
										"type": "Identifier",
										"name": "j",
										"range": [
											192,
											193
										],
										"loc": {
											"start": {
												"line": 5,
												"column": 48
											},
											"end": {
												"line": 5,
												"column": 49
											}
										}
									},
									"range": [
										186,
										194
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 42
										},
										"end": {
											"line": 5,
											"column": 50
										}
									}
								},
								"right": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										196,
										198
									],
									"loc": {
										"start": {
											"line": 5,
											"column": 52
										},
										"end": {
											"line": 5,
											"column": 54
										}
									}
								},
								"range": [
									186,
									198
								],
								"loc": {
									"start": {
										"line": 5,
										"column": 42
									},
									"end": {
										"line": 5,
										"column": 54
									}
								}
							},
							"range": [
								186,
								199
							],
							"loc": {
								"start": {
									"line": 5,
									"column": 42
								},
								"end": {
									"line": 5,
									"column": 55
								}
							}
						},
						"range": [
							159,
							199
						],
						"loc": {
							"start": {
								"line": 5,
								"column": 15
							},
							"end": {
								"line": 5,
								"column": 55
							}
						}
					},
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "here",
									"range": [
										205,
										209
									],
									"loc": {
										"start": {
											"line": 6,
											"column": 5
										},
										"end": {
											"line": 6,
											"column": 9
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [
										{
											"type": "CallExpression",
											"callee": {
												"type": "MemberExpression",
												"computed": false,
												"object": {
													"type": "Identifier",
													"name": "Math",
													"range": [
														212,
														216
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 12
														},
														"end": {
															"line": 6,
															"column": 16
														}
													}
												},
												"property": {
													"type": "Identifier",
													"name": "floor",
													"range": [
														217,
														222
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 17
														},
														"end": {
															"line": 6,
															"column": 22
														}
													}
												},
												"range": [
													212,
													222
												],
												"loc": {
													"start": {
														"line": 6,
														"column": 12
													},
													"end": {
														"line": 6,
														"column": 22
													}
												}
											},
											"arguments": [
												{
													"type": "BinaryExpression",
													"operator": "*",
													"left": {
														"type": "CallExpression",
														"callee": {
															"type": "MemberExpression",
															"computed": false,
															"object": {
																"type": "Identifier",
																"name": "Math",
																"range": [
																	223,
																	227
																],
																"loc": {
																	"start": {
																		"line": 6,
																		"column": 23
																	},
																	"end": {
																		"line": 6,
																		"column": 27
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "random",
																"range": [
																	228,
																	234
																],
																"loc": {
																	"start": {
																		"line": 6,
																		"column": 28
																	},
																	"end": {
																		"line": 6,
																		"column": 34
																	}
																}
															},
															"range": [
																223,
																234
															],
															"loc": {
																"start": {
																	"line": 6,
																	"column": 23
																},
																"end": {
																	"line": 6,
																	"column": 34
																}
															}
														},
														"arguments": [],
														"range": [
															223,
															236
														],
														"loc": {
															"start": {
																"line": 6,
																"column": 23
															},
															"end": {
																"line": 6,
																"column": 36
															}
														}
													},
													"right": {
														"type": "Identifier",
														"name": "x",
														"range": [
															237,
															238
														],
														"loc": {
															"start": {
																"line": 6,
																"column": 37
															},
															"end": {
																"line": 6,
																"column": 38
															}
														}
													},
													"range": [
														223,
														238
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 23
														},
														"end": {
															"line": 6,
															"column": 38
														}
													}
												}
											],
											"range": [
												212,
												239
											],
											"loc": {
												"start": {
													"line": 6,
													"column": 12
												},
												"end": {
													"line": 6,
													"column": 39
												}
											}
										},
										{
											"type": "CallExpression",
											"callee": {
												"type": "MemberExpression",
												"computed": false,
												"object": {
													"type": "Identifier",
													"name": "Math",
													"range": [
														241,
														245
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 41
														},
														"end": {
															"line": 6,
															"column": 45
														}
													}
												},
												"property": {
													"type": "Identifier",
													"name": "floor",
													"range": [
														246,
														251
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 46
														},
														"end": {
															"line": 6,
															"column": 51
														}
													}
												},
												"range": [
													241,
													251
												],
												"loc": {
													"start": {
														"line": 6,
														"column": 41
													},
													"end": {
														"line": 6,
														"column": 51
													}
												}
											},
											"arguments": [
												{
													"type": "BinaryExpression",
													"operator": "*",
													"left": {
														"type": "CallExpression",
														"callee": {
															"type": "MemberExpression",
															"computed": false,
															"object": {
																"type": "Identifier",
																"name": "Math",
																"range": [
																	252,
																	256
																],
																"loc": {
																	"start": {
																		"line": 6,
																		"column": 52
																	},
																	"end": {
																		"line": 6,
																		"column": 56
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "random",
																"range": [
																	257,
																	263
																],
																"loc": {
																	"start": {
																		"line": 6,
																		"column": 57
																	},
																	"end": {
																		"line": 6,
																		"column": 63
																	}
																}
															},
															"range": [
																252,
																263
															],
															"loc": {
																"start": {
																	"line": 6,
																	"column": 52
																},
																"end": {
																	"line": 6,
																	"column": 63
																}
															}
														},
														"arguments": [],
														"range": [
															252,
															265
														],
														"loc": {
															"start": {
																"line": 6,
																"column": 52
															},
															"end": {
																"line": 6,
																"column": 65
															}
														}
													},
													"right": {
														"type": "Identifier",
														"name": "y",
														"range": [
															266,
															267
														],
														"loc": {
															"start": {
																"line": 6,
																"column": 66
															},
															"end": {
																"line": 6,
																"column": 67
															}
														}
													},
													"range": [
														252,
														267
													],
													"loc": {
														"start": {
															"line": 6,
															"column": 52
														},
														"end": {
															"line": 6,
															"column": 67
														}
													}
												}
											],
											"range": [
												241,
												268
											],
											"loc": {
												"start": {
													"line": 6,
													"column": 41
												},
												"end": {
													"line": 6,
													"column": 68
												}
											}
										}
									],
									"range": [
										211,
										269
									],
									"loc": {
										"start": {
											"line": 6,
											"column": 11
										},
										"end": {
											"line": 6,
											"column": 69
										}
									}
								},
								"range": [
									205,
									269
								],
								"loc": {
									"start": {
										"line": 6,
										"column": 5
									},
									"end": {
										"line": 6,
										"column": 69
									}
								}
							}
						],
						"kind": "var",
						"range": [
							201,
							270
						],
						"loc": {
							"start": {
								"line": 6,
								"column": 1
							},
							"end": {
								"line": 6,
								"column": 70
							}
						}
					},
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "path",
									"range": [
										276,
										280
									],
									"loc": {
										"start": {
											"line": 7,
											"column": 5
										},
										"end": {
											"line": 7,
											"column": 9
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [
										{
											"type": "Identifier",
											"name": "here",
											"range": [
												283,
												287
											],
											"loc": {
												"start": {
													"line": 7,
													"column": 12
												},
												"end": {
													"line": 7,
													"column": 16
												}
											}
										}
									],
									"range": [
										282,
										288
									],
									"loc": {
										"start": {
											"line": 7,
											"column": 11
										},
										"end": {
											"line": 7,
											"column": 17
										}
									}
								},
								"range": [
									276,
									288
								],
								"loc": {
									"start": {
										"line": 7,
										"column": 5
									},
									"end": {
										"line": 7,
										"column": 17
									}
								}
							}
						],
						"kind": "var",
						"range": [
							272,
							289
						],
						"loc": {
							"start": {
								"line": 7,
								"column": 1
							},
							"end": {
								"line": 7,
								"column": 18
							}
						}
					},
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "unvisited",
									"range": [
										295,
										304
									],
									"loc": {
										"start": {
											"line": 8,
											"column": 5
										},
										"end": {
											"line": 8,
											"column": 14
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										306,
										308
									],
									"loc": {
										"start": {
											"line": 8,
											"column": 16
										},
										"end": {
											"line": 8,
											"column": 18
										}
									}
								},
								"range": [
									295,
									308
								],
								"loc": {
									"start": {
										"line": 8,
										"column": 5
									},
									"end": {
										"line": 8,
										"column": 18
									}
								}
							}
						],
						"kind": "var",
						"range": [
							291,
							309
						],
						"loc": {
							"start": {
								"line": 8,
								"column": 1
							},
							"end": {
								"line": 8,
								"column": 19
							}
						}
					},
					{
						"type": "ForStatement",
						"init": {
							"type": "VariableDeclaration",
							"declarations": [
								{
									"type": "VariableDeclarator",
									"id": {
										"type": "Identifier",
										"name": "j",
										"range": [
											320,
											321
										],
										"loc": {
											"start": {
												"line": 9,
												"column": 10
											},
											"end": {
												"line": 9,
												"column": 11
											}
										}
									},
									"init": {
										"type": "Literal",
										"value": 0,
										"raw": "0",
										"range": [
											323,
											324
										],
										"loc": {
											"start": {
												"line": 9,
												"column": 13
											},
											"end": {
												"line": 9,
												"column": 14
											}
										}
									},
									"range": [
										320,
										324
									],
									"loc": {
										"start": {
											"line": 9,
											"column": 10
										},
										"end": {
											"line": 9,
											"column": 14
										}
									}
								}
							],
							"kind": "var",
							"range": [
								316,
								324
							],
							"loc": {
								"start": {
									"line": 9,
									"column": 6
								},
								"end": {
									"line": 9,
									"column": 14
								}
							}
						},
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Identifier",
								"name": "j",
								"range": [
									326,
									327
								],
								"loc": {
									"start": {
										"line": 9,
										"column": 16
									},
									"end": {
										"line": 9,
										"column": 17
									}
								}
							},
							"right": {
								"type": "BinaryExpression",
								"operator": "+",
								"left": {
									"type": "Identifier",
									"name": "x",
									"range": [
										328,
										329
									],
									"loc": {
										"start": {
											"line": 9,
											"column": 18
										},
										"end": {
											"line": 9,
											"column": 19
										}
									}
								},
								"right": {
									"type": "Literal",
									"value": 2,
									"raw": "2",
									"range": [
										330,
										331
									],
									"loc": {
										"start": {
											"line": 9,
											"column": 20
										},
										"end": {
											"line": 9,
											"column": 21
										}
									}
								},
								"range": [
									328,
									331
								],
								"loc": {
									"start": {
										"line": 9,
										"column": 18
									},
									"end": {
										"line": 9,
										"column": 21
									}
								}
							},
							"range": [
								326,
								331
							],
							"loc": {
								"start": {
									"line": 9,
									"column": 16
								},
								"end": {
									"line": 9,
									"column": 21
								}
							}
						},
						"update": {
							"type": "UpdateExpression",
							"operator": "++",
							"argument": {
								"type": "Identifier",
								"name": "j",
								"range": [
									333,
									334
								],
								"loc": {
									"start": {
										"line": 9,
										"column": 23
									},
									"end": {
										"line": 9,
										"column": 24
									}
								}
							},
							"prefix": false,
							"range": [
								333,
								336
							],
							"loc": {
								"start": {
									"line": 9,
									"column": 23
								},
								"end": {
									"line": 9,
									"column": 26
								}
							}
						},
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "ExpressionStatement",
									"expression": {
										"type": "AssignmentExpression",
										"operator": "=",
										"left": {
											"type": "MemberExpression",
											"computed": true,
											"object": {
												"type": "Identifier",
												"name": "unvisited",
												"range": [
													342,
													351
												],
												"loc": {
													"start": {
														"line": 10,
														"column": 2
													},
													"end": {
														"line": 10,
														"column": 11
													}
												}
											},
											"property": {
												"type": "Identifier",
												"name": "j",
												"range": [
													352,
													353
												],
												"loc": {
													"start": {
														"line": 10,
														"column": 12
													},
													"end": {
														"line": 10,
														"column": 13
													}
												}
											},
											"range": [
												342,
												354
											],
											"loc": {
												"start": {
													"line": 10,
													"column": 2
												},
												"end": {
													"line": 10,
													"column": 14
												}
											}
										},
										"right": {
											"type": "ArrayExpression",
											"elements": [],
											"range": [
												356,
												358
											],
											"loc": {
												"start": {
													"line": 10,
													"column": 16
												},
												"end": {
													"line": 10,
													"column": 18
												}
											}
										},
										"range": [
											342,
											358
										],
										"loc": {
											"start": {
												"line": 10,
												"column": 2
											},
											"end": {
												"line": 10,
												"column": 18
											}
										}
									},
									"range": [
										342,
										359
									],
									"loc": {
										"start": {
											"line": 10,
											"column": 2
										},
										"end": {
											"line": 10,
											"column": 19
										}
									}
								},
								{
									"type": "ForStatement",
									"init": {
										"type": "VariableDeclaration",
										"declarations": [
											{
												"type": "VariableDeclarator",
												"id": {
													"type": "Identifier",
													"name": "k",
													"range": [
														371,
														372
													],
													"loc": {
														"start": {
															"line": 11,
															"column": 11
														},
														"end": {
															"line": 11,
															"column": 12
														}
													}
												},
												"init": {
													"type": "Literal",
													"value": 0,
													"raw": "0",
													"range": [
														374,
														375
													],
													"loc": {
														"start": {
															"line": 11,
															"column": 14
														},
														"end": {
															"line": 11,
															"column": 15
														}
													}
												},
												"range": [
													371,
													375
												],
												"loc": {
													"start": {
														"line": 11,
														"column": 11
													},
													"end": {
														"line": 11,
														"column": 15
													}
												}
											}
										],
										"kind": "var",
										"range": [
											367,
											375
										],
										"loc": {
											"start": {
												"line": 11,
												"column": 7
											},
											"end": {
												"line": 11,
												"column": 15
											}
										}
									},
									"test": {
										"type": "BinaryExpression",
										"operator": "<",
										"left": {
											"type": "Identifier",
											"name": "k",
											"range": [
												377,
												378
											],
											"loc": {
												"start": {
													"line": 11,
													"column": 17
												},
												"end": {
													"line": 11,
													"column": 18
												}
											}
										},
										"right": {
											"type": "BinaryExpression",
											"operator": "+",
											"left": {
												"type": "Identifier",
												"name": "y",
												"range": [
													379,
													380
												],
												"loc": {
													"start": {
														"line": 11,
														"column": 19
													},
													"end": {
														"line": 11,
														"column": 20
													}
												}
											},
											"right": {
												"type": "Literal",
												"value": 1,
												"raw": "1",
												"range": [
													381,
													382
												],
												"loc": {
													"start": {
														"line": 11,
														"column": 21
													},
													"end": {
														"line": 11,
														"column": 22
													}
												}
											},
											"range": [
												379,
												382
											],
											"loc": {
												"start": {
													"line": 11,
													"column": 19
												},
												"end": {
													"line": 11,
													"column": 22
												}
											}
										},
										"range": [
											377,
											382
										],
										"loc": {
											"start": {
												"line": 11,
												"column": 17
											},
											"end": {
												"line": 11,
												"column": 22
											}
										}
									},
									"update": {
										"type": "UpdateExpression",
										"operator": "++",
										"argument": {
											"type": "Identifier",
											"name": "k",
											"range": [
												384,
												385
											],
											"loc": {
												"start": {
													"line": 11,
													"column": 24
												},
												"end": {
													"line": 11,
													"column": 25
												}
											}
										},
										"prefix": false,
										"range": [
											384,
											387
										],
										"loc": {
											"start": {
												"line": 11,
												"column": 24
											},
											"end": {
												"line": 11,
												"column": 27
											}
										}
									},
									"body": {
										"type": "ExpressionStatement",
										"expression": {
											"type": "CallExpression",
											"callee": {
												"type": "MemberExpression",
												"computed": false,
												"object": {
													"type": "MemberExpression",
													"computed": true,
													"object": {
														"type": "Identifier",
														"name": "unvisited",
														"range": [
															392,
															401
														],
														"loc": {
															"start": {
																"line": 12,
																"column": 3
															},
															"end": {
																"line": 12,
																"column": 12
															}
														}
													},
													"property": {
														"type": "Identifier",
														"name": "j",
														"range": [
															402,
															403
														],
														"loc": {
															"start": {
																"line": 12,
																"column": 13
															},
															"end": {
																"line": 12,
																"column": 14
															}
														}
													},
													"range": [
														392,
														404
													],
													"loc": {
														"start": {
															"line": 12,
															"column": 3
														},
														"end": {
															"line": 12,
															"column": 15
														}
													}
												},
												"property": {
													"type": "Identifier",
													"name": "push",
													"range": [
														405,
														409
													],
													"loc": {
														"start": {
															"line": 12,
															"column": 16
														},
														"end": {
															"line": 12,
															"column": 20
														}
													}
												},
												"range": [
													392,
													409
												],
												"loc": {
													"start": {
														"line": 12,
														"column": 3
													},
													"end": {
														"line": 12,
														"column": 20
													}
												}
											},
											"arguments": [
												{
													"type": "LogicalExpression",
													"operator": "&&",
													"left": {
														"type": "LogicalExpression",
														"operator": "&&",
														"left": {
															"type": "LogicalExpression",
															"operator": "&&",
															"left": {
																"type": "BinaryExpression",
																"operator": ">",
																"left": {
																	"type": "Identifier",
																	"name": "j",
																	"range": [
																		410,
																		411
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 21
																		},
																		"end": {
																			"line": 12,
																			"column": 22
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 0,
																	"raw": "0",
																	"range": [
																		412,
																		413
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 23
																		},
																		"end": {
																			"line": 12,
																			"column": 24
																		}
																	}
																},
																"range": [
																	410,
																	413
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 21
																	},
																	"end": {
																		"line": 12,
																		"column": 24
																	}
																}
															},
															"right": {
																"type": "BinaryExpression",
																"operator": "<",
																"left": {
																	"type": "Identifier",
																	"name": "j",
																	"range": [
																		417,
																		418
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 28
																		},
																		"end": {
																			"line": 12,
																			"column": 29
																		}
																	}
																},
																"right": {
																	"type": "BinaryExpression",
																	"operator": "+",
																	"left": {
																		"type": "Identifier",
																		"name": "x",
																		"range": [
																			419,
																			420
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 30
																			},
																			"end": {
																				"line": 12,
																				"column": 31
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			421,
																			422
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 32
																			},
																			"end": {
																				"line": 12,
																				"column": 33
																			}
																		}
																	},
																	"range": [
																		419,
																		422
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 30
																		},
																		"end": {
																			"line": 12,
																			"column": 33
																		}
																	}
																},
																"range": [
																	417,
																	422
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 28
																	},
																	"end": {
																		"line": 12,
																		"column": 33
																	}
																}
															},
															"range": [
																410,
																422
															],
															"loc": {
																"start": {
																	"line": 12,
																	"column": 21
																},
																"end": {
																	"line": 12,
																	"column": 33
																}
															}
														},
														"right": {
															"type": "BinaryExpression",
															"operator": ">",
															"left": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	426,
																	427
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 37
																	},
																	"end": {
																		"line": 12,
																		"column": 38
																	}
																}
															},
															"right": {
																"type": "Literal",
																"value": 0,
																"raw": "0",
																"range": [
																	428,
																	429
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 39
																	},
																	"end": {
																		"line": 12,
																		"column": 40
																	}
																}
															},
															"range": [
																426,
																429
															],
															"loc": {
																"start": {
																	"line": 12,
																	"column": 37
																},
																"end": {
																	"line": 12,
																	"column": 40
																}
															}
														},
														"range": [
															410,
															429
														],
														"loc": {
															"start": {
																"line": 12,
																"column": 21
															},
															"end": {
																"line": 12,
																"column": 40
															}
														}
													},
													"right": {
														"type": "LogicalExpression",
														"operator": "||",
														"left": {
															"type": "BinaryExpression",
															"operator": "!=",
															"left": {
																"type": "Identifier",
																"name": "j",
																"range": [
																	434,
																	435
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 45
																	},
																	"end": {
																		"line": 12,
																		"column": 46
																	}
																}
															},
															"right": {
																"type": "BinaryExpression",
																"operator": "+",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			439,
																			443
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 50
																			},
																			"end": {
																				"line": 12,
																				"column": 54
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 0,
																		"raw": "0",
																		"range": [
																			444,
																			445
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 55
																			},
																			"end": {
																				"line": 12,
																				"column": 56
																			}
																		}
																	},
																	"range": [
																		439,
																		446
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 50
																		},
																		"end": {
																			"line": 12,
																			"column": 57
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		447,
																		448
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 58
																		},
																		"end": {
																			"line": 12,
																			"column": 59
																		}
																	}
																},
																"range": [
																	439,
																	448
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 50
																	},
																	"end": {
																		"line": 12,
																		"column": 59
																	}
																}
															},
															"range": [
																434,
																448
															],
															"loc": {
																"start": {
																	"line": 12,
																	"column": 45
																},
																"end": {
																	"line": 12,
																	"column": 59
																}
															}
														},
														"right": {
															"type": "BinaryExpression",
															"operator": "!=",
															"left": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	452,
																	453
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 63
																	},
																	"end": {
																		"line": 12,
																		"column": 64
																	}
																}
															},
															"right": {
																"type": "BinaryExpression",
																"operator": "+",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			457,
																			461
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 68
																			},
																			"end": {
																				"line": 12,
																				"column": 72
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			462,
																			463
																		],
																		"loc": {
																			"start": {
																				"line": 12,
																				"column": 73
																			},
																			"end": {
																				"line": 12,
																				"column": 74
																			}
																		}
																	},
																	"range": [
																		457,
																		464
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 68
																		},
																		"end": {
																			"line": 12,
																			"column": 75
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		465,
																		466
																	],
																	"loc": {
																		"start": {
																			"line": 12,
																			"column": 76
																		},
																		"end": {
																			"line": 12,
																			"column": 77
																		}
																	}
																},
																"range": [
																	457,
																	466
																],
																"loc": {
																	"start": {
																		"line": 12,
																		"column": 68
																	},
																	"end": {
																		"line": 12,
																		"column": 77
																	}
																}
															},
															"range": [
																452,
																466
															],
															"loc": {
																"start": {
																	"line": 12,
																	"column": 63
																},
																"end": {
																	"line": 12,
																	"column": 77
																}
															}
														},
														"range": [
															434,
															466
														],
														"loc": {
															"start": {
																"line": 12,
																"column": 45
															},
															"end": {
																"line": 12,
																"column": 77
															}
														}
													},
													"range": [
														410,
														467
													],
													"loc": {
														"start": {
															"line": 12,
															"column": 21
														},
														"end": {
															"line": 12,
															"column": 78
														}
													}
												}
											],
											"range": [
												392,
												468
											],
											"loc": {
												"start": {
													"line": 12,
													"column": 3
												},
												"end": {
													"line": 12,
													"column": 79
												}
											}
										},
										"range": [
											392,
											469
										],
										"loc": {
											"start": {
												"line": 12,
												"column": 3
											},
											"end": {
												"line": 12,
												"column": 80
											}
										}
									},
									"range": [
										362,
										469
									],
									"loc": {
										"start": {
											"line": 11,
											"column": 2
										},
										"end": {
											"line": 12,
											"column": 80
										}
									}
								}
							],
							"range": [
								338,
								472
							],
							"loc": {
								"start": {
									"line": 9,
									"column": 28
								},
								"end": {
									"line": 13,
									"column": 2
								}
							}
						},
						"range": [
							311,
							472
						],
						"loc": {
							"start": {
								"line": 9,
								"column": 1
							},
							"end": {
								"line": 13,
								"column": 2
							}
						}
					},
					{
						"type": "WhileStatement",
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Literal",
								"value": 0,
								"raw": "0",
								"range": [
									481,
									482
								],
								"loc": {
									"start": {
										"line": 14,
										"column": 8
									},
									"end": {
										"line": 14,
										"column": 9
									}
								}
							},
							"right": {
								"type": "Identifier",
								"name": "n",
								"range": [
									483,
									484
								],
								"loc": {
									"start": {
										"line": 14,
										"column": 10
									},
									"end": {
										"line": 14,
										"column": 11
									}
								}
							},
							"range": [
								481,
								484
							],
							"loc": {
								"start": {
									"line": 14,
									"column": 8
								},
								"end": {
									"line": 14,
									"column": 11
								}
							}
						},
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "VariableDeclaration",
									"declarations": [
										{
											"type": "VariableDeclarator",
											"id": {
												"type": "Identifier",
												"name": "potential",
												"range": [
													494,
													503
												],
												"loc": {
													"start": {
														"line": 15,
														"column": 6
													},
													"end": {
														"line": 15,
														"column": 15
													}
												}
											},
											"init": {
												"type": "ArrayExpression",
												"elements": [
													{
														"type": "ArrayExpression",
														"elements": [
															{
																"type": "BinaryExpression",
																"operator": "+",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			507,
																			511
																		],
																		"loc": {
																			"start": {
																				"line": 15,
																				"column": 19
																			},
																			"end": {
																				"line": 15,
																				"column": 23
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 0,
																		"raw": "0",
																		"range": [
																			512,
																			513
																		],
																		"loc": {
																			"start": {
																				"line": 15,
																				"column": 24
																			},
																			"end": {
																				"line": 15,
																				"column": 25
																			}
																		}
																	},
																	"range": [
																		507,
																		514
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 19
																		},
																		"end": {
																			"line": 15,
																			"column": 26
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		515,
																		516
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 27
																		},
																		"end": {
																			"line": 15,
																			"column": 28
																		}
																	}
																},
																"range": [
																	507,
																	516
																],
																"loc": {
																	"start": {
																		"line": 15,
																		"column": 19
																	},
																	"end": {
																		"line": 15,
																		"column": 28
																	}
																}
															},
															{
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "here",
																	"range": [
																		518,
																		522
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 30
																		},
																		"end": {
																			"line": 15,
																			"column": 34
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		523,
																		524
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 35
																		},
																		"end": {
																			"line": 15,
																			"column": 36
																		}
																	}
																},
																"range": [
																	518,
																	525
																],
																"loc": {
																	"start": {
																		"line": 15,
																		"column": 30
																	},
																	"end": {
																		"line": 15,
																		"column": 37
																	}
																}
															}
														],
														"range": [
															506,
															526
														],
														"loc": {
															"start": {
																"line": 15,
																"column": 18
															},
															"end": {
																"line": 15,
																"column": 38
															}
														}
													},
													{
														"type": "ArrayExpression",
														"elements": [
															{
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "here",
																	"range": [
																		529,
																		533
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 41
																		},
																		"end": {
																			"line": 15,
																			"column": 45
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 0,
																	"raw": "0",
																	"range": [
																		534,
																		535
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 46
																		},
																		"end": {
																			"line": 15,
																			"column": 47
																		}
																	}
																},
																"range": [
																	529,
																	536
																],
																"loc": {
																	"start": {
																		"line": 15,
																		"column": 41
																	},
																	"end": {
																		"line": 15,
																		"column": 48
																	}
																}
															},
															{
																"type": "BinaryExpression",
																"operator": "+",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			537,
																			541
																		],
																		"loc": {
																			"start": {
																				"line": 15,
																				"column": 49
																			},
																			"end": {
																				"line": 15,
																				"column": 53
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			542,
																			543
																		],
																		"loc": {
																			"start": {
																				"line": 15,
																				"column": 54
																			},
																			"end": {
																				"line": 15,
																				"column": 55
																			}
																		}
																	},
																	"range": [
																		537,
																		544
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 49
																		},
																		"end": {
																			"line": 15,
																			"column": 56
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		545,
																		546
																	],
																	"loc": {
																		"start": {
																			"line": 15,
																			"column": 57
																		},
																		"end": {
																			"line": 15,
																			"column": 58
																		}
																	}
																},
																"range": [
																	537,
																	546
																],
																"loc": {
																	"start": {
																		"line": 15,
																		"column": 49
																	},
																	"end": {
																		"line": 15,
																		"column": 58
																	}
																}
															}
														],
														"range": [
															528,
															547
														],
														"loc": {
															"start": {
																"line": 15,
																"column": 40
															},
															"end": {
																"line": 15,
																"column": 59
															}
														}
													},
													{
														"type": "ArrayExpression",
														"elements": [
															{
																"type": "BinaryExpression",
																"operator": "-",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			556,
																			560
																		],
																		"loc": {
																			"start": {
																				"line": 16,
																				"column": 7
																			},
																			"end": {
																				"line": 16,
																				"column": 11
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 0,
																		"raw": "0",
																		"range": [
																			561,
																			562
																		],
																		"loc": {
																			"start": {
																				"line": 16,
																				"column": 12
																			},
																			"end": {
																				"line": 16,
																				"column": 13
																			}
																		}
																	},
																	"range": [
																		556,
																		563
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 7
																		},
																		"end": {
																			"line": 16,
																			"column": 14
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		564,
																		565
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 15
																		},
																		"end": {
																			"line": 16,
																			"column": 16
																		}
																	}
																},
																"range": [
																	556,
																	565
																],
																"loc": {
																	"start": {
																		"line": 16,
																		"column": 7
																	},
																	"end": {
																		"line": 16,
																		"column": 16
																	}
																}
															},
															{
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "here",
																	"range": [
																		567,
																		571
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 18
																		},
																		"end": {
																			"line": 16,
																			"column": 22
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		572,
																		573
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 23
																		},
																		"end": {
																			"line": 16,
																			"column": 24
																		}
																	}
																},
																"range": [
																	567,
																	574
																],
																"loc": {
																	"start": {
																		"line": 16,
																		"column": 18
																	},
																	"end": {
																		"line": 16,
																		"column": 25
																	}
																}
															}
														],
														"range": [
															555,
															575
														],
														"loc": {
															"start": {
																"line": 16,
																"column": 6
															},
															"end": {
																"line": 16,
																"column": 26
															}
														}
													},
													{
														"type": "ArrayExpression",
														"elements": [
															{
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "here",
																	"range": [
																		578,
																		582
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 29
																		},
																		"end": {
																			"line": 16,
																			"column": 33
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 0,
																	"raw": "0",
																	"range": [
																		583,
																		584
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 34
																		},
																		"end": {
																			"line": 16,
																			"column": 35
																		}
																	}
																},
																"range": [
																	578,
																	585
																],
																"loc": {
																	"start": {
																		"line": 16,
																		"column": 29
																	},
																	"end": {
																		"line": 16,
																		"column": 36
																	}
																}
															},
															{
																"type": "BinaryExpression",
																"operator": "-",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "here",
																		"range": [
																			586,
																			590
																		],
																		"loc": {
																			"start": {
																				"line": 16,
																				"column": 37
																			},
																			"end": {
																				"line": 16,
																				"column": 41
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			591,
																			592
																		],
																		"loc": {
																			"start": {
																				"line": 16,
																				"column": 42
																			},
																			"end": {
																				"line": 16,
																				"column": 43
																			}
																		}
																	},
																	"range": [
																		586,
																		593
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 37
																		},
																		"end": {
																			"line": 16,
																			"column": 44
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		594,
																		595
																	],
																	"loc": {
																		"start": {
																			"line": 16,
																			"column": 45
																		},
																		"end": {
																			"line": 16,
																			"column": 46
																		}
																	}
																},
																"range": [
																	586,
																	595
																],
																"loc": {
																	"start": {
																		"line": 16,
																		"column": 37
																	},
																	"end": {
																		"line": 16,
																		"column": 46
																	}
																}
															}
														],
														"range": [
															577,
															596
														],
														"loc": {
															"start": {
																"line": 16,
																"column": 28
															},
															"end": {
																"line": 16,
																"column": 47
															}
														}
													}
												],
												"range": [
													505,
													597
												],
												"loc": {
													"start": {
														"line": 15,
														"column": 17
													},
													"end": {
														"line": 16,
														"column": 48
													}
												}
											},
											"range": [
												494,
												597
											],
											"loc": {
												"start": {
													"line": 15,
													"column": 6
												},
												"end": {
													"line": 16,
													"column": 48
												}
											}
										}
									],
									"kind": "var",
									"range": [
										490,
										598
									],
									"loc": {
										"start": {
											"line": 15,
											"column": 2
										},
										"end": {
											"line": 16,
											"column": 49
										}
									}
								},
								{
									"type": "VariableDeclaration",
									"declarations": [
										{
											"type": "VariableDeclarator",
											"id": {
												"type": "Identifier",
												"name": "neighbors",
												"range": [
													605,
													614
												],
												"loc": {
													"start": {
														"line": 17,
														"column": 6
													},
													"end": {
														"line": 17,
														"column": 15
													}
												}
											},
											"init": {
												"type": "ArrayExpression",
												"elements": [],
												"range": [
													616,
													618
												],
												"loc": {
													"start": {
														"line": 17,
														"column": 17
													},
													"end": {
														"line": 17,
														"column": 19
													}
												}
											},
											"range": [
												605,
												618
											],
											"loc": {
												"start": {
													"line": 17,
													"column": 6
												},
												"end": {
													"line": 17,
													"column": 19
												}
											}
										}
									],
									"kind": "var",
									"range": [
										601,
										619
									],
									"loc": {
										"start": {
											"line": 17,
											"column": 2
										},
										"end": {
											"line": 17,
											"column": 20
										}
									}
								},
								{
									"type": "ForStatement",
									"init": {
										"type": "VariableDeclaration",
										"declarations": [
											{
												"type": "VariableDeclarator",
												"id": {
													"type": "Identifier",
													"name": "j",
													"range": [
														631,
														632
													],
													"loc": {
														"start": {
															"line": 18,
															"column": 11
														},
														"end": {
															"line": 18,
															"column": 12
														}
													}
												},
												"init": {
													"type": "Literal",
													"value": 0,
													"raw": "0",
													"range": [
														634,
														635
													],
													"loc": {
														"start": {
															"line": 18,
															"column": 14
														},
														"end": {
															"line": 18,
															"column": 15
														}
													}
												},
												"range": [
													631,
													635
												],
												"loc": {
													"start": {
														"line": 18,
														"column": 11
													},
													"end": {
														"line": 18,
														"column": 15
													}
												}
											}
										],
										"kind": "var",
										"range": [
											627,
											635
										],
										"loc": {
											"start": {
												"line": 18,
												"column": 7
											},
											"end": {
												"line": 18,
												"column": 15
											}
										}
									},
									"test": {
										"type": "BinaryExpression",
										"operator": "<",
										"left": {
											"type": "Identifier",
											"name": "j",
											"range": [
												637,
												638
											],
											"loc": {
												"start": {
													"line": 18,
													"column": 17
												},
												"end": {
													"line": 18,
													"column": 18
												}
											}
										},
										"right": {
											"type": "Literal",
											"value": 4,
											"raw": "4",
											"range": [
												641,
												642
											],
											"loc": {
												"start": {
													"line": 18,
													"column": 21
												},
												"end": {
													"line": 18,
													"column": 22
												}
											}
										},
										"range": [
											637,
											642
										],
										"loc": {
											"start": {
												"line": 18,
												"column": 17
											},
											"end": {
												"line": 18,
												"column": 22
											}
										}
									},
									"update": {
										"type": "UpdateExpression",
										"operator": "++",
										"argument": {
											"type": "Identifier",
											"name": "j",
											"range": [
												644,
												645
											],
											"loc": {
												"start": {
													"line": 18,
													"column": 24
												},
												"end": {
													"line": 18,
													"column": 25
												}
											}
										},
										"prefix": false,
										"range": [
											644,
											647
										],
										"loc": {
											"start": {
												"line": 18,
												"column": 24
											},
											"end": {
												"line": 18,
												"column": 27
											}
										}
									},
									"body": {
										"type": "IfStatement",
										"test": {
											"type": "MemberExpression",
											"computed": true,
											"object": {
												"type": "MemberExpression",
												"computed": true,
												"object": {
													"type": "Identifier",
													"name": "unvisited",
													"range": [
														656,
														665
													],
													"loc": {
														"start": {
															"line": 19,
															"column": 7
														},
														"end": {
															"line": 19,
															"column": 16
														}
													}
												},
												"property": {
													"type": "BinaryExpression",
													"operator": "+",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "potential",
																"range": [
																	666,
																	675
																],
																"loc": {
																	"start": {
																		"line": 19,
																		"column": 17
																	},
																	"end": {
																		"line": 19,
																		"column": 26
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "j",
																"range": [
																	676,
																	677
																],
																"loc": {
																	"start": {
																		"line": 19,
																		"column": 27
																	},
																	"end": {
																		"line": 19,
																		"column": 28
																	}
																}
															},
															"range": [
																666,
																678
															],
															"loc": {
																"start": {
																	"line": 19,
																	"column": 17
																},
																"end": {
																	"line": 19,
																	"column": 29
																}
															}
														},
														"property": {
															"type": "Literal",
															"value": 0,
															"raw": "0",
															"range": [
																679,
																680
															],
															"loc": {
																"start": {
																	"line": 19,
																	"column": 30
																},
																"end": {
																	"line": 19,
																	"column": 31
																}
															}
														},
														"range": [
															666,
															681
														],
														"loc": {
															"start": {
																"line": 19,
																"column": 17
															},
															"end": {
																"line": 19,
																"column": 32
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": 1,
														"raw": "1",
														"range": [
															682,
															683
														],
														"loc": {
															"start": {
																"line": 19,
																"column": 33
															},
															"end": {
																"line": 19,
																"column": 34
															}
														}
													},
													"range": [
														666,
														683
													],
													"loc": {
														"start": {
															"line": 19,
															"column": 17
														},
														"end": {
															"line": 19,
															"column": 34
														}
													}
												},
												"range": [
													656,
													684
												],
												"loc": {
													"start": {
														"line": 19,
														"column": 7
													},
													"end": {
														"line": 19,
														"column": 35
													}
												}
											},
											"property": {
												"type": "BinaryExpression",
												"operator": "+",
												"left": {
													"type": "MemberExpression",
													"computed": true,
													"object": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "potential",
															"range": [
																685,
																694
															],
															"loc": {
																"start": {
																	"line": 19,
																	"column": 36
																},
																"end": {
																	"line": 19,
																	"column": 45
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "j",
															"range": [
																695,
																696
															],
															"loc": {
																"start": {
																	"line": 19,
																	"column": 46
																},
																"end": {
																	"line": 19,
																	"column": 47
																}
															}
														},
														"range": [
															685,
															697
														],
														"loc": {
															"start": {
																"line": 19,
																"column": 36
															},
															"end": {
																"line": 19,
																"column": 48
															}
														}
													},
													"property": {
														"type": "Literal",
														"value": 1,
														"raw": "1",
														"range": [
															698,
															699
														],
														"loc": {
															"start": {
																"line": 19,
																"column": 49
															},
															"end": {
																"line": 19,
																"column": 50
															}
														}
													},
													"range": [
														685,
														700
													],
													"loc": {
														"start": {
															"line": 19,
															"column": 36
														},
														"end": {
															"line": 19,
															"column": 51
														}
													}
												},
												"right": {
													"type": "Literal",
													"value": 1,
													"raw": "1",
													"range": [
														701,
														702
													],
													"loc": {
														"start": {
															"line": 19,
															"column": 52
														},
														"end": {
															"line": 19,
															"column": 53
														}
													}
												},
												"range": [
													685,
													702
												],
												"loc": {
													"start": {
														"line": 19,
														"column": 36
													},
													"end": {
														"line": 19,
														"column": 53
													}
												}
											},
											"range": [
												656,
												703
											],
											"loc": {
												"start": {
													"line": 19,
													"column": 7
												},
												"end": {
													"line": 19,
													"column": 54
												}
											}
										},
										"consequent": {
											"type": "ExpressionStatement",
											"expression": {
												"type": "CallExpression",
												"callee": {
													"type": "MemberExpression",
													"computed": false,
													"object": {
														"type": "Identifier",
														"name": "neighbors",
														"range": [
															709,
															718
														],
														"loc": {
															"start": {
																"line": 20,
																"column": 4
															},
															"end": {
																"line": 20,
																"column": 13
															}
														}
													},
													"property": {
														"type": "Identifier",
														"name": "push",
														"range": [
															719,
															723
														],
														"loc": {
															"start": {
																"line": 20,
																"column": 14
															},
															"end": {
																"line": 20,
																"column": 18
															}
														}
													},
													"range": [
														709,
														723
													],
													"loc": {
														"start": {
															"line": 20,
															"column": 4
														},
														"end": {
															"line": 20,
															"column": 18
														}
													}
												},
												"arguments": [
													{
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "potential",
															"range": [
																724,
																733
															],
															"loc": {
																"start": {
																	"line": 20,
																	"column": 19
																},
																"end": {
																	"line": 20,
																	"column": 28
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "j",
															"range": [
																734,
																735
															],
															"loc": {
																"start": {
																	"line": 20,
																	"column": 29
																},
																"end": {
																	"line": 20,
																	"column": 30
																}
															}
														},
														"range": [
															724,
															736
														],
														"loc": {
															"start": {
																"line": 20,
																"column": 19
															},
															"end": {
																"line": 20,
																"column": 31
															}
														}
													}
												],
												"range": [
													709,
													737
												],
												"loc": {
													"start": {
														"line": 20,
														"column": 4
													},
													"end": {
														"line": 20,
														"column": 32
													}
												}
											},
											"range": [
												709,
												738
											],
											"loc": {
												"start": {
													"line": 20,
													"column": 4
												},
												"end": {
													"line": 20,
													"column": 33
												}
											}
										},
										"alternate": null,
										"range": [
											652,
											738
										],
										"loc": {
											"start": {
												"line": 19,
												"column": 3
											},
											"end": {
												"line": 20,
												"column": 33
											}
										}
									},
									"range": [
										622,
										738
									],
									"loc": {
										"start": {
											"line": 18,
											"column": 2
										},
										"end": {
											"line": 20,
											"column": 33
										}
									}
								},
								{
									"type": "IfStatement",
									"test": {
										"type": "MemberExpression",
										"computed": false,
										"object": {
											"type": "Identifier",
											"name": "neighbors",
											"range": [
												745,
												754
											],
											"loc": {
												"start": {
													"line": 21,
													"column": 6
												},
												"end": {
													"line": 21,
													"column": 15
												}
											}
										},
										"property": {
											"type": "Identifier",
											"name": "length",
											"range": [
												755,
												761
											],
											"loc": {
												"start": {
													"line": 21,
													"column": 16
												},
												"end": {
													"line": 21,
													"column": 22
												}
											}
										},
										"range": [
											745,
											761
										],
										"loc": {
											"start": {
												"line": 21,
												"column": 6
											},
											"end": {
												"line": 21,
												"column": 22
											}
										}
									},
									"consequent": {
										"type": "BlockStatement",
										"body": [
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "Identifier",
														"name": "n",
														"range": [
															768,
															769
														],
														"loc": {
															"start": {
																"line": 22,
																"column": 3
															},
															"end": {
																"line": 22,
																"column": 4
															}
														}
													},
													"right": {
														"type": "BinaryExpression",
														"operator": "-",
														"left": {
															"type": "Identifier",
															"name": "n",
															"range": [
																771,
																772
															],
															"loc": {
																"start": {
																	"line": 22,
																	"column": 6
																},
																"end": {
																	"line": 22,
																	"column": 7
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": 1,
															"raw": "1",
															"range": [
																773,
																774
															],
															"loc": {
																"start": {
																	"line": 22,
																	"column": 8
																},
																"end": {
																	"line": 22,
																	"column": 9
																}
															}
														},
														"range": [
															771,
															774
														],
														"loc": {
															"start": {
																"line": 22,
																"column": 6
															},
															"end": {
																"line": 22,
																"column": 9
															}
														}
													},
													"range": [
														768,
														774
													],
													"loc": {
														"start": {
															"line": 22,
															"column": 3
														},
														"end": {
															"line": 22,
															"column": 9
														}
													}
												},
												"range": [
													768,
													775
												],
												"loc": {
													"start": {
														"line": 22,
														"column": 3
													},
													"end": {
														"line": 22,
														"column": 10
													}
												}
											},
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "Identifier",
														"name": "next",
														"range": [
															779,
															783
														],
														"loc": {
															"start": {
																"line": 23,
																"column": 3
															},
															"end": {
																"line": 23,
																"column": 7
															}
														}
													},
													"right": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "neighbors",
															"range": [
																785,
																794
															],
															"loc": {
																"start": {
																	"line": 23,
																	"column": 9
																},
																"end": {
																	"line": 23,
																	"column": 18
																}
															}
														},
														"property": {
															"type": "CallExpression",
															"callee": {
																"type": "MemberExpression",
																"computed": false,
																"object": {
																	"type": "Identifier",
																	"name": "Math",
																	"range": [
																		795,
																		799
																	],
																	"loc": {
																		"start": {
																			"line": 23,
																			"column": 19
																		},
																		"end": {
																			"line": 23,
																			"column": 23
																		}
																	}
																},
																"property": {
																	"type": "Identifier",
																	"name": "floor",
																	"range": [
																		800,
																		805
																	],
																	"loc": {
																		"start": {
																			"line": 23,
																			"column": 24
																		},
																		"end": {
																			"line": 23,
																			"column": 29
																		}
																	}
																},
																"range": [
																	795,
																	805
																],
																"loc": {
																	"start": {
																		"line": 23,
																		"column": 19
																	},
																	"end": {
																		"line": 23,
																		"column": 29
																	}
																}
															},
															"arguments": [
																{
																	"type": "BinaryExpression",
																	"operator": "*",
																	"left": {
																		"type": "CallExpression",
																		"callee": {
																			"type": "MemberExpression",
																			"computed": false,
																			"object": {
																				"type": "Identifier",
																				"name": "Math",
																				"range": [
																					806,
																					810
																				],
																				"loc": {
																					"start": {
																						"line": 23,
																						"column": 30
																					},
																					"end": {
																						"line": 23,
																						"column": 34
																					}
																				}
																			},
																			"property": {
																				"type": "Identifier",
																				"name": "random",
																				"range": [
																					811,
																					817
																				],
																				"loc": {
																					"start": {
																						"line": 23,
																						"column": 35
																					},
																					"end": {
																						"line": 23,
																						"column": 41
																					}
																				}
																			},
																			"range": [
																				806,
																				817
																			],
																			"loc": {
																				"start": {
																					"line": 23,
																					"column": 30
																				},
																				"end": {
																					"line": 23,
																					"column": 41
																				}
																			}
																		},
																		"arguments": [],
																		"range": [
																			806,
																			819
																		],
																		"loc": {
																			"start": {
																				"line": 23,
																				"column": 30
																			},
																			"end": {
																				"line": 23,
																				"column": 43
																			}
																		}
																	},
																	"right": {
																		"type": "MemberExpression",
																		"computed": false,
																		"object": {
																			"type": "Identifier",
																			"name": "neighbors",
																			"range": [
																				820,
																				829
																			],
																			"loc": {
																				"start": {
																					"line": 23,
																					"column": 44
																				},
																				"end": {
																					"line": 23,
																					"column": 53
																				}
																			}
																		},
																		"property": {
																			"type": "Identifier",
																			"name": "length",
																			"range": [
																				830,
																				836
																			],
																			"loc": {
																				"start": {
																					"line": 23,
																					"column": 54
																				},
																				"end": {
																					"line": 23,
																					"column": 60
																				}
																			}
																		},
																		"range": [
																			820,
																			836
																		],
																		"loc": {
																			"start": {
																				"line": 23,
																				"column": 44
																			},
																			"end": {
																				"line": 23,
																				"column": 60
																			}
																		}
																	},
																	"range": [
																		806,
																		836
																	],
																	"loc": {
																		"start": {
																			"line": 23,
																			"column": 30
																		},
																		"end": {
																			"line": 23,
																			"column": 60
																		}
																	}
																}
															],
															"range": [
																795,
																837
															],
															"loc": {
																"start": {
																	"line": 23,
																	"column": 19
																},
																"end": {
																	"line": 23,
																	"column": 61
																}
															}
														},
														"range": [
															785,
															838
														],
														"loc": {
															"start": {
																"line": 23,
																"column": 9
															},
															"end": {
																"line": 23,
																"column": 62
															}
														}
													},
													"range": [
														779,
														838
													],
													"loc": {
														"start": {
															"line": 23,
															"column": 3
														},
														"end": {
															"line": 23,
															"column": 62
														}
													}
												},
												"range": [
													779,
													839
												],
												"loc": {
													"start": {
														"line": 23,
														"column": 3
													},
													"end": {
														"line": 23,
														"column": 63
													}
												}
											},
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "unvisited",
																"range": [
																	843,
																	852
																],
																"loc": {
																	"start": {
																		"line": 24,
																		"column": 3
																	},
																	"end": {
																		"line": 24,
																		"column": 12
																	}
																}
															},
															"property": {
																"type": "BinaryExpression",
																"operator": "+",
																"left": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "next",
																		"range": [
																			853,
																			857
																		],
																		"loc": {
																			"start": {
																				"line": 24,
																				"column": 13
																			},
																			"end": {
																				"line": 24,
																				"column": 17
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 0,
																		"raw": "0",
																		"range": [
																			858,
																			859
																		],
																		"loc": {
																			"start": {
																				"line": 24,
																				"column": 18
																			},
																			"end": {
																				"line": 24,
																				"column": 19
																			}
																		}
																	},
																	"range": [
																		853,
																		860
																	],
																	"loc": {
																		"start": {
																			"line": 24,
																			"column": 13
																		},
																		"end": {
																			"line": 24,
																			"column": 20
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		861,
																		862
																	],
																	"loc": {
																		"start": {
																			"line": 24,
																			"column": 21
																		},
																		"end": {
																			"line": 24,
																			"column": 22
																		}
																	}
																},
																"range": [
																	853,
																	862
																],
																"loc": {
																	"start": {
																		"line": 24,
																		"column": 13
																	},
																	"end": {
																		"line": 24,
																		"column": 22
																	}
																}
															},
															"range": [
																843,
																863
															],
															"loc": {
																"start": {
																	"line": 24,
																	"column": 3
																},
																"end": {
																	"line": 24,
																	"column": 23
																}
															}
														},
														"property": {
															"type": "BinaryExpression",
															"operator": "+",
															"left": {
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "next",
																	"range": [
																		864,
																		868
																	],
																	"loc": {
																		"start": {
																			"line": 24,
																			"column": 24
																		},
																		"end": {
																			"line": 24,
																			"column": 28
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		869,
																		870
																	],
																	"loc": {
																		"start": {
																			"line": 24,
																			"column": 29
																		},
																		"end": {
																			"line": 24,
																			"column": 30
																		}
																	}
																},
																"range": [
																	864,
																	871
																],
																"loc": {
																	"start": {
																		"line": 24,
																		"column": 24
																	},
																	"end": {
																		"line": 24,
																		"column": 31
																	}
																}
															},
															"right": {
																"type": "Literal",
																"value": 1,
																"raw": "1",
																"range": [
																	872,
																	873
																],
																"loc": {
																	"start": {
																		"line": 24,
																		"column": 32
																	},
																	"end": {
																		"line": 24,
																		"column": 33
																	}
																}
															},
															"range": [
																864,
																873
															],
															"loc": {
																"start": {
																	"line": 24,
																	"column": 24
																},
																"end": {
																	"line": 24,
																	"column": 33
																}
															}
														},
														"range": [
															843,
															874
														],
														"loc": {
															"start": {
																"line": 24,
																"column": 3
															},
															"end": {
																"line": 24,
																"column": 34
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": false,
														"raw": "false",
														"range": [
															876,
															881
														],
														"loc": {
															"start": {
																"line": 24,
																"column": 36
															},
															"end": {
																"line": 24,
																"column": 41
															}
														}
													},
													"range": [
														843,
														881
													],
													"loc": {
														"start": {
															"line": 24,
															"column": 3
														},
														"end": {
															"line": 24,
															"column": 41
														}
													}
												},
												"range": [
													843,
													882
												],
												"loc": {
													"start": {
														"line": 24,
														"column": 3
													},
													"end": {
														"line": 24,
														"column": 42
													}
												}
											},
											{
												"type": "IfStatement",
												"test": {
													"type": "BinaryExpression",
													"operator": "==",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "next",
															"range": [
																890,
																894
															],
															"loc": {
																"start": {
																	"line": 25,
																	"column": 7
																},
																"end": {
																	"line": 25,
																	"column": 11
																}
															}
														},
														"property": {
															"type": "Literal",
															"value": 0,
															"raw": "0",
															"range": [
																895,
																896
															],
															"loc": {
																"start": {
																	"line": 25,
																	"column": 12
																},
																"end": {
																	"line": 25,
																	"column": 13
																}
															}
														},
														"range": [
															890,
															897
														],
														"loc": {
															"start": {
																"line": 25,
																"column": 7
															},
															"end": {
																"line": 25,
																"column": 14
															}
														}
													},
													"right": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "here",
															"range": [
																901,
																905
															],
															"loc": {
																"start": {
																	"line": 25,
																	"column": 18
																},
																"end": {
																	"line": 25,
																	"column": 22
																}
															}
														},
														"property": {
															"type": "Literal",
															"value": 0,
															"raw": "0",
															"range": [
																906,
																907
															],
															"loc": {
																"start": {
																	"line": 25,
																	"column": 23
																},
																"end": {
																	"line": 25,
																	"column": 24
																}
															}
														},
														"range": [
															901,
															908
														],
														"loc": {
															"start": {
																"line": 25,
																"column": 18
															},
															"end": {
																"line": 25,
																"column": 25
															}
														}
													},
													"range": [
														890,
														908
													],
													"loc": {
														"start": {
															"line": 25,
															"column": 7
														},
														"end": {
															"line": 25,
															"column": 25
														}
													}
												},
												"consequent": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "horiz",
																	"range": [
																		914,
																		919
																	],
																	"loc": {
																		"start": {
																			"line": 26,
																			"column": 4
																		},
																		"end": {
																			"line": 26,
																			"column": 9
																		}
																	}
																},
																"property": {
																	"type": "MemberExpression",
																	"computed": true,
																	"object": {
																		"type": "Identifier",
																		"name": "next",
																		"range": [
																			920,
																			924
																		],
																		"loc": {
																			"start": {
																				"line": 26,
																				"column": 10
																			},
																			"end": {
																				"line": 26,
																				"column": 14
																			}
																		}
																	},
																	"property": {
																		"type": "Literal",
																		"value": 0,
																		"raw": "0",
																		"range": [
																			925,
																			926
																		],
																		"loc": {
																			"start": {
																				"line": 26,
																				"column": 15
																			},
																			"end": {
																				"line": 26,
																				"column": 16
																			}
																		}
																	},
																	"range": [
																		920,
																		927
																	],
																	"loc": {
																		"start": {
																			"line": 26,
																			"column": 10
																		},
																		"end": {
																			"line": 26,
																			"column": 17
																		}
																	}
																},
																"range": [
																	914,
																	928
																],
																"loc": {
																	"start": {
																		"line": 26,
																		"column": 4
																	},
																	"end": {
																		"line": 26,
																		"column": 18
																	}
																}
															},
															"property": {
																"type": "BinaryExpression",
																"operator": "/",
																"left": {
																	"type": "BinaryExpression",
																	"operator": "-",
																	"left": {
																		"type": "BinaryExpression",
																		"operator": "+",
																		"left": {
																			"type": "MemberExpression",
																			"computed": true,
																			"object": {
																				"type": "Identifier",
																				"name": "next",
																				"range": [
																					930,
																					934
																				],
																				"loc": {
																					"start": {
																						"line": 26,
																						"column": 20
																					},
																					"end": {
																						"line": 26,
																						"column": 24
																					}
																				}
																			},
																			"property": {
																				"type": "Literal",
																				"value": 1,
																				"raw": "1",
																				"range": [
																					935,
																					936
																				],
																				"loc": {
																					"start": {
																						"line": 26,
																						"column": 25
																					},
																					"end": {
																						"line": 26,
																						"column": 26
																					}
																				}
																			},
																			"range": [
																				930,
																				937
																			],
																			"loc": {
																				"start": {
																					"line": 26,
																					"column": 20
																				},
																				"end": {
																					"line": 26,
																					"column": 27
																				}
																			}
																		},
																		"right": {
																			"type": "MemberExpression",
																			"computed": true,
																			"object": {
																				"type": "Identifier",
																				"name": "here",
																				"range": [
																					938,
																					942
																				],
																				"loc": {
																					"start": {
																						"line": 26,
																						"column": 28
																					},
																					"end": {
																						"line": 26,
																						"column": 32
																					}
																				}
																			},
																			"property": {
																				"type": "Literal",
																				"value": 1,
																				"raw": "1",
																				"range": [
																					943,
																					944
																				],
																				"loc": {
																					"start": {
																						"line": 26,
																						"column": 33
																					},
																					"end": {
																						"line": 26,
																						"column": 34
																					}
																				}
																			},
																			"range": [
																				938,
																				945
																			],
																			"loc": {
																				"start": {
																					"line": 26,
																					"column": 28
																				},
																				"end": {
																					"line": 26,
																					"column": 35
																				}
																			}
																		},
																		"range": [
																			930,
																			945
																		],
																		"loc": {
																			"start": {
																				"line": 26,
																				"column": 20
																			},
																			"end": {
																				"line": 26,
																				"column": 35
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			946,
																			947
																		],
																		"loc": {
																			"start": {
																				"line": 26,
																				"column": 36
																			},
																			"end": {
																				"line": 26,
																				"column": 37
																			}
																		}
																	},
																	"range": [
																		930,
																		947
																	],
																	"loc": {
																		"start": {
																			"line": 26,
																			"column": 20
																		},
																		"end": {
																			"line": 26,
																			"column": 37
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 2,
																	"raw": "2",
																	"range": [
																		949,
																		950
																	],
																	"loc": {
																		"start": {
																			"line": 26,
																			"column": 39
																		},
																		"end": {
																			"line": 26,
																			"column": 40
																		}
																	}
																},
																"range": [
																	929,
																	950
																],
																"loc": {
																	"start": {
																		"line": 26,
																		"column": 19
																	},
																	"end": {
																		"line": 26,
																		"column": 40
																	}
																}
															},
															"range": [
																914,
																951
															],
															"loc": {
																"start": {
																	"line": 26,
																	"column": 4
																},
																"end": {
																	"line": 26,
																	"column": 41
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": true,
															"raw": "true",
															"range": [
																953,
																957
															],
															"loc": {
																"start": {
																	"line": 26,
																	"column": 43
																},
																"end": {
																	"line": 26,
																	"column": 47
																}
															}
														},
														"range": [
															914,
															957
														],
														"loc": {
															"start": {
																"line": 26,
																"column": 4
															},
															"end": {
																"line": 26,
																"column": 47
															}
														}
													},
													"range": [
														914,
														958
													],
													"loc": {
														"start": {
															"line": 26,
															"column": 4
														},
														"end": {
															"line": 26,
															"column": 48
														}
													}
												},
												"alternate": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "verti",
																	"range": [
																		972,
																		977
																	],
																	"loc": {
																		"start": {
																			"line": 28,
																			"column": 4
																		},
																		"end": {
																			"line": 28,
																			"column": 9
																		}
																	}
																},
																"property": {
																	"type": "BinaryExpression",
																	"operator": "/",
																	"left": {
																		"type": "BinaryExpression",
																		"operator": "-",
																		"left": {
																			"type": "BinaryExpression",
																			"operator": "+",
																			"left": {
																				"type": "MemberExpression",
																				"computed": true,
																				"object": {
																					"type": "Identifier",
																					"name": "next",
																					"range": [
																						979,
																						983
																					],
																					"loc": {
																						"start": {
																							"line": 28,
																							"column": 11
																						},
																						"end": {
																							"line": 28,
																							"column": 15
																						}
																					}
																				},
																				"property": {
																					"type": "Literal",
																					"value": 0,
																					"raw": "0",
																					"range": [
																						984,
																						985
																					],
																					"loc": {
																						"start": {
																							"line": 28,
																							"column": 16
																						},
																						"end": {
																							"line": 28,
																							"column": 17
																						}
																					}
																				},
																				"range": [
																					979,
																					986
																				],
																				"loc": {
																					"start": {
																						"line": 28,
																						"column": 11
																					},
																					"end": {
																						"line": 28,
																						"column": 18
																					}
																				}
																			},
																			"right": {
																				"type": "MemberExpression",
																				"computed": true,
																				"object": {
																					"type": "Identifier",
																					"name": "here",
																					"range": [
																						987,
																						991
																					],
																					"loc": {
																						"start": {
																							"line": 28,
																							"column": 19
																						},
																						"end": {
																							"line": 28,
																							"column": 23
																						}
																					}
																				},
																				"property": {
																					"type": "Literal",
																					"value": 0,
																					"raw": "0",
																					"range": [
																						992,
																						993
																					],
																					"loc": {
																						"start": {
																							"line": 28,
																							"column": 24
																						},
																						"end": {
																							"line": 28,
																							"column": 25
																						}
																					}
																				},
																				"range": [
																					987,
																					994
																				],
																				"loc": {
																					"start": {
																						"line": 28,
																						"column": 19
																					},
																					"end": {
																						"line": 28,
																						"column": 26
																					}
																				}
																			},
																			"range": [
																				979,
																				994
																			],
																			"loc": {
																				"start": {
																					"line": 28,
																					"column": 11
																				},
																				"end": {
																					"line": 28,
																					"column": 26
																				}
																			}
																		},
																		"right": {
																			"type": "Literal",
																			"value": 1,
																			"raw": "1",
																			"range": [
																				995,
																				996
																			],
																			"loc": {
																				"start": {
																					"line": 28,
																					"column": 27
																				},
																				"end": {
																					"line": 28,
																					"column": 28
																				}
																			}
																		},
																		"range": [
																			979,
																			996
																		],
																		"loc": {
																			"start": {
																				"line": 28,
																				"column": 11
																			},
																			"end": {
																				"line": 28,
																				"column": 28
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 2,
																		"raw": "2",
																		"range": [
																			998,
																			999
																		],
																		"loc": {
																			"start": {
																				"line": 28,
																				"column": 30
																			},
																			"end": {
																				"line": 28,
																				"column": 31
																			}
																		}
																	},
																	"range": [
																		978,
																		999
																	],
																	"loc": {
																		"start": {
																			"line": 28,
																			"column": 10
																		},
																		"end": {
																			"line": 28,
																			"column": 31
																		}
																	}
																},
																"range": [
																	972,
																	1000
																],
																"loc": {
																	"start": {
																		"line": 28,
																		"column": 4
																	},
																	"end": {
																		"line": 28,
																		"column": 32
																	}
																}
															},
															"property": {
																"type": "MemberExpression",
																"computed": true,
																"object": {
																	"type": "Identifier",
																	"name": "next",
																	"range": [
																		1001,
																		1005
																	],
																	"loc": {
																		"start": {
																			"line": 28,
																			"column": 33
																		},
																		"end": {
																			"line": 28,
																			"column": 37
																		}
																	}
																},
																"property": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		1006,
																		1007
																	],
																	"loc": {
																		"start": {
																			"line": 28,
																			"column": 38
																		},
																		"end": {
																			"line": 28,
																			"column": 39
																		}
																	}
																},
																"range": [
																	1001,
																	1008
																],
																"loc": {
																	"start": {
																		"line": 28,
																		"column": 33
																	},
																	"end": {
																		"line": 28,
																		"column": 40
																	}
																}
															},
															"range": [
																972,
																1009
															],
															"loc": {
																"start": {
																	"line": 28,
																	"column": 4
																},
																"end": {
																	"line": 28,
																	"column": 41
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": true,
															"raw": "true",
															"range": [
																1011,
																1015
															],
															"loc": {
																"start": {
																	"line": 28,
																	"column": 43
																},
																"end": {
																	"line": 28,
																	"column": 47
																}
															}
														},
														"range": [
															972,
															1015
														],
														"loc": {
															"start": {
																"line": 28,
																"column": 4
															},
															"end": {
																"line": 28,
																"column": 47
															}
														}
													},
													"range": [
														972,
														1016
													],
													"loc": {
														"start": {
															"line": 28,
															"column": 4
														},
														"end": {
															"line": 28,
															"column": 48
														}
													}
												},
												"range": [
													886,
													1016
												],
												"loc": {
													"start": {
														"line": 25,
														"column": 3
													},
													"end": {
														"line": 28,
														"column": 48
													}
												}
											},
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "CallExpression",
													"callee": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "path",
															"range": [
																1020,
																1024
															],
															"loc": {
																"start": {
																	"line": 29,
																	"column": 3
																},
																"end": {
																	"line": 29,
																	"column": 7
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "push",
															"range": [
																1025,
																1029
															],
															"loc": {
																"start": {
																	"line": 29,
																	"column": 8
																},
																"end": {
																	"line": 29,
																	"column": 12
																}
															}
														},
														"range": [
															1020,
															1029
														],
														"loc": {
															"start": {
																"line": 29,
																"column": 3
															},
															"end": {
																"line": 29,
																"column": 12
															}
														}
													},
													"arguments": [
														{
															"type": "AssignmentExpression",
															"operator": "=",
															"left": {
																"type": "Identifier",
																"name": "here",
																"range": [
																	1030,
																	1034
																],
																"loc": {
																	"start": {
																		"line": 29,
																		"column": 13
																	},
																	"end": {
																		"line": 29,
																		"column": 17
																	}
																}
															},
															"right": {
																"type": "Identifier",
																"name": "next",
																"range": [
																	1036,
																	1040
																],
																"loc": {
																	"start": {
																		"line": 29,
																		"column": 19
																	},
																	"end": {
																		"line": 29,
																		"column": 23
																	}
																}
															},
															"range": [
																1030,
																1040
															],
															"loc": {
																"start": {
																	"line": 29,
																	"column": 13
																},
																"end": {
																	"line": 29,
																	"column": 23
																}
															}
														}
													],
													"range": [
														1020,
														1041
													],
													"loc": {
														"start": {
															"line": 29,
															"column": 3
														},
														"end": {
															"line": 29,
															"column": 24
														}
													}
												},
												"range": [
													1020,
													1042
												],
												"loc": {
													"start": {
														"line": 29,
														"column": 3
													},
													"end": {
														"line": 29,
														"column": 25
													}
												}
											}
										],
										"range": [
											763,
											1046
										],
										"loc": {
											"start": {
												"line": 21,
												"column": 24
											},
											"end": {
												"line": 30,
												"column": 3
											}
										}
									},
									"alternate": {
										"type": "ExpressionStatement",
										"expression": {
											"type": "AssignmentExpression",
											"operator": "=",
											"left": {
												"type": "Identifier",
												"name": "here",
												"range": [
													1056,
													1060
												],
												"loc": {
													"start": {
														"line": 31,
														"column": 3
													},
													"end": {
														"line": 31,
														"column": 7
													}
												}
											},
											"right": {
												"type": "CallExpression",
												"callee": {
													"type": "MemberExpression",
													"computed": false,
													"object": {
														"type": "Identifier",
														"name": "path",
														"range": [
															1062,
															1066
														],
														"loc": {
															"start": {
																"line": 31,
																"column": 9
															},
															"end": {
																"line": 31,
																"column": 13
															}
														}
													},
													"property": {
														"type": "Identifier",
														"name": "pop",
														"range": [
															1067,
															1070
														],
														"loc": {
															"start": {
																"line": 31,
																"column": 14
															},
															"end": {
																"line": 31,
																"column": 17
															}
														}
													},
													"range": [
														1062,
														1070
													],
													"loc": {
														"start": {
															"line": 31,
															"column": 9
														},
														"end": {
															"line": 31,
															"column": 17
														}
													}
												},
												"arguments": [],
												"range": [
													1062,
													1072
												],
												"loc": {
													"start": {
														"line": 31,
														"column": 9
													},
													"end": {
														"line": 31,
														"column": 19
													}
												}
											},
											"range": [
												1056,
												1072
											],
											"loc": {
												"start": {
													"line": 31,
													"column": 3
												},
												"end": {
													"line": 31,
													"column": 19
												}
											}
										},
										"range": [
											1056,
											1073
										],
										"loc": {
											"start": {
												"line": 31,
												"column": 3
											},
											"end": {
												"line": 31,
												"column": 20
											}
										}
									},
									"range": [
										741,
										1073
									],
									"loc": {
										"start": {
											"line": 21,
											"column": 2
										},
										"end": {
											"line": 31,
											"column": 20
										}
									}
								}
							],
							"range": [
								486,
								1076
							],
							"loc": {
								"start": {
									"line": 14,
									"column": 13
								},
								"end": {
									"line": 32,
									"column": 2
								}
							}
						},
						"range": [
							474,
							1076
						],
						"loc": {
							"start": {
								"line": 14,
								"column": 1
							},
							"end": {
								"line": 32,
								"column": 2
							}
						}
					},
					{
						"type": "ReturnStatement",
						"argument": {
							"type": "ObjectExpression",
							"properties": [
								{
									"type": "Property",
									"key": {
										"type": "Identifier",
										"name": "x",
										"range": [
											1087,
											1088
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 10
											},
											"end": {
												"line": 33,
												"column": 11
											}
										}
									},
									"value": {
										"type": "Identifier",
										"name": "x",
										"range": [
											1090,
											1091
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 13
											},
											"end": {
												"line": 33,
												"column": 14
											}
										}
									},
									"kind": "init",
									"range": [
										1087,
										1091
									],
									"loc": {
										"start": {
											"line": 33,
											"column": 10
										},
										"end": {
											"line": 33,
											"column": 14
										}
									}
								},
								{
									"type": "Property",
									"key": {
										"type": "Identifier",
										"name": "y",
										"range": [
											1093,
											1094
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 16
											},
											"end": {
												"line": 33,
												"column": 17
											}
										}
									},
									"value": {
										"type": "Identifier",
										"name": "y",
										"range": [
											1096,
											1097
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 19
											},
											"end": {
												"line": 33,
												"column": 20
											}
										}
									},
									"kind": "init",
									"range": [
										1093,
										1097
									],
									"loc": {
										"start": {
											"line": 33,
											"column": 16
										},
										"end": {
											"line": 33,
											"column": 20
										}
									}
								},
								{
									"type": "Property",
									"key": {
										"type": "Identifier",
										"name": "horiz",
										"range": [
											1099,
											1104
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 22
											},
											"end": {
												"line": 33,
												"column": 27
											}
										}
									},
									"value": {
										"type": "Identifier",
										"name": "horiz",
										"range": [
											1106,
											1111
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 29
											},
											"end": {
												"line": 33,
												"column": 34
											}
										}
									},
									"kind": "init",
									"range": [
										1099,
										1111
									],
									"loc": {
										"start": {
											"line": 33,
											"column": 22
										},
										"end": {
											"line": 33,
											"column": 34
										}
									}
								},
								{
									"type": "Property",
									"key": {
										"type": "Identifier",
										"name": "verti",
										"range": [
											1113,
											1118
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 36
											},
											"end": {
												"line": 33,
												"column": 41
											}
										}
									},
									"value": {
										"type": "Identifier",
										"name": "verti",
										"range": [
											1120,
											1125
										],
										"loc": {
											"start": {
												"line": 33,
												"column": 43
											},
											"end": {
												"line": 33,
												"column": 48
											}
										}
									},
									"kind": "init",
									"range": [
										1113,
										1125
									],
									"loc": {
										"start": {
											"line": 33,
											"column": 36
										},
										"end": {
											"line": 33,
											"column": 48
										}
									}
								}
							],
							"range": [
								1086,
								1126
							],
							"loc": {
								"start": {
									"line": 33,
									"column": 9
								},
								"end": {
									"line": 33,
									"column": 49
								}
							}
						},
						"range": [
							1078,
							1128
						],
						"loc": {
							"start": {
								"line": 33,
								"column": 1
							},
							"end": {
								"line": 33,
								"column": 51
							}
						}
					}
				],
				"range": [
					19,
					1130
				],
				"loc": {
					"start": {
						"line": 1,
						"column": 19
					},
					"end": {
						"line": 34,
						"column": 1
					}
				}
			},
			"rest": null,
			"generator": false,
			"expression": false,
			"range": [
				0,
				1130
			],
			"loc": {
				"start": {
					"line": 1,
					"column": 0
				},
				"end": {
					"line": 34,
					"column": 1
				}
			}
		},
		{
			"type": "FunctionDeclaration",
			"id": {
				"type": "Identifier",
				"name": "display",
				"range": [
					1142,
					1149
				],
				"loc": {
					"start": {
						"line": 36,
						"column": 9
					},
					"end": {
						"line": 36,
						"column": 16
					}
				}
			},
			"params": [
				{
					"type": "Identifier",
					"name": "m",
					"range": [
						1150,
						1151
					],
					"loc": {
						"start": {
							"line": 36,
							"column": 17
						},
						"end": {
							"line": 36,
							"column": 18
						}
					}
				}
			],
			"defaults": [],
			"body": {
				"type": "BlockStatement",
				"body": [
					{
						"type": "VariableDeclaration",
						"declarations": [
							{
								"type": "VariableDeclarator",
								"id": {
									"type": "Identifier",
									"name": "text",
									"range": [
										1160,
										1164
									],
									"loc": {
										"start": {
											"line": 37,
											"column": 5
										},
										"end": {
											"line": 37,
											"column": 9
										}
									}
								},
								"init": {
									"type": "ArrayExpression",
									"elements": [],
									"range": [
										1166,
										1168
									],
									"loc": {
										"start": {
											"line": 37,
											"column": 11
										},
										"end": {
											"line": 37,
											"column": 13
										}
									}
								},
								"range": [
									1160,
									1168
								],
								"loc": {
									"start": {
										"line": 37,
										"column": 5
									},
									"end": {
										"line": 37,
										"column": 13
									}
								}
							}
						],
						"kind": "var",
						"range": [
							1156,
							1169
						],
						"loc": {
							"start": {
								"line": 37,
								"column": 1
							},
							"end": {
								"line": 37,
								"column": 14
							}
						}
					},
					{
						"type": "ForStatement",
						"init": {
							"type": "VariableDeclaration",
							"declarations": [
								{
									"type": "VariableDeclarator",
									"id": {
										"type": "Identifier",
										"name": "j",
										"range": [
											1180,
											1181
										],
										"loc": {
											"start": {
												"line": 38,
												"column": 10
											},
											"end": {
												"line": 38,
												"column": 11
											}
										}
									},
									"init": {
										"type": "Literal",
										"value": 0,
										"raw": "0",
										"range": [
											1183,
											1184
										],
										"loc": {
											"start": {
												"line": 38,
												"column": 13
											},
											"end": {
												"line": 38,
												"column": 14
											}
										}
									},
									"range": [
										1180,
										1184
									],
									"loc": {
										"start": {
											"line": 38,
											"column": 10
										},
										"end": {
											"line": 38,
											"column": 14
										}
									}
								}
							],
							"kind": "var",
							"range": [
								1176,
								1184
							],
							"loc": {
								"start": {
									"line": 38,
									"column": 6
								},
								"end": {
									"line": 38,
									"column": 14
								}
							}
						},
						"test": {
							"type": "BinaryExpression",
							"operator": "<",
							"left": {
								"type": "Identifier",
								"name": "j",
								"range": [
									1186,
									1187
								],
								"loc": {
									"start": {
										"line": 38,
										"column": 16
									},
									"end": {
										"line": 38,
										"column": 17
									}
								}
							},
							"right": {
								"type": "BinaryExpression",
								"operator": "+",
								"left": {
									"type": "BinaryExpression",
									"operator": "*",
									"left": {
										"type": "MemberExpression",
										"computed": false,
										"object": {
											"type": "Identifier",
											"name": "m",
											"range": [
												1188,
												1189
											],
											"loc": {
												"start": {
													"line": 38,
													"column": 18
												},
												"end": {
													"line": 38,
													"column": 19
												}
											}
										},
										"property": {
											"type": "Identifier",
											"name": "x",
											"range": [
												1190,
												1191
											],
											"loc": {
												"start": {
													"line": 38,
													"column": 20
												},
												"end": {
													"line": 38,
													"column": 21
												}
											}
										},
										"range": [
											1188,
											1191
										],
										"loc": {
											"start": {
												"line": 38,
												"column": 18
											},
											"end": {
												"line": 38,
												"column": 21
											}
										}
									},
									"right": {
										"type": "Literal",
										"value": 2,
										"raw": "2",
										"range": [
											1192,
											1193
										],
										"loc": {
											"start": {
												"line": 38,
												"column": 22
											},
											"end": {
												"line": 38,
												"column": 23
											}
										}
									},
									"range": [
										1188,
										1193
									],
									"loc": {
										"start": {
											"line": 38,
											"column": 18
										},
										"end": {
											"line": 38,
											"column": 23
										}
									}
								},
								"right": {
									"type": "Literal",
									"value": 1,
									"raw": "1",
									"range": [
										1194,
										1195
									],
									"loc": {
										"start": {
											"line": 38,
											"column": 24
										},
										"end": {
											"line": 38,
											"column": 25
										}
									}
								},
								"range": [
									1188,
									1195
								],
								"loc": {
									"start": {
										"line": 38,
										"column": 18
									},
									"end": {
										"line": 38,
										"column": 25
									}
								}
							},
							"range": [
								1186,
								1195
							],
							"loc": {
								"start": {
									"line": 38,
									"column": 16
								},
								"end": {
									"line": 38,
									"column": 25
								}
							}
						},
						"update": {
							"type": "UpdateExpression",
							"operator": "++",
							"argument": {
								"type": "Identifier",
								"name": "j",
								"range": [
									1197,
									1198
								],
								"loc": {
									"start": {
										"line": 38,
										"column": 27
									},
									"end": {
										"line": 38,
										"column": 28
									}
								}
							},
							"prefix": false,
							"range": [
								1197,
								1200
							],
							"loc": {
								"start": {
									"line": 38,
									"column": 27
								},
								"end": {
									"line": 38,
									"column": 30
								}
							}
						},
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "VariableDeclaration",
									"declarations": [
										{
											"type": "VariableDeclarator",
											"id": {
												"type": "Identifier",
												"name": "line",
												"range": [
													1210,
													1214
												],
												"loc": {
													"start": {
														"line": 39,
														"column": 6
													},
													"end": {
														"line": 39,
														"column": 10
													}
												}
											},
											"init": {
												"type": "ArrayExpression",
												"elements": [],
												"range": [
													1216,
													1218
												],
												"loc": {
													"start": {
														"line": 39,
														"column": 12
													},
													"end": {
														"line": 39,
														"column": 14
													}
												}
											},
											"range": [
												1210,
												1218
											],
											"loc": {
												"start": {
													"line": 39,
													"column": 6
												},
												"end": {
													"line": 39,
													"column": 14
												}
											}
										}
									],
									"kind": "var",
									"range": [
										1206,
										1219
									],
									"loc": {
										"start": {
											"line": 39,
											"column": 2
										},
										"end": {
											"line": 39,
											"column": 15
										}
									}
								},
								{
									"type": "IfStatement",
									"test": {
										"type": "BinaryExpression",
										"operator": "==",
										"left": {
											"type": "Literal",
											"value": 0,
											"raw": "0",
											"range": [
												1226,
												1227
											],
											"loc": {
												"start": {
													"line": 40,
													"column": 6
												},
												"end": {
													"line": 40,
													"column": 7
												}
											}
										},
										"right": {
											"type": "BinaryExpression",
											"operator": "%",
											"left": {
												"type": "Identifier",
												"name": "j",
												"range": [
													1231,
													1232
												],
												"loc": {
													"start": {
														"line": 40,
														"column": 11
													},
													"end": {
														"line": 40,
														"column": 12
													}
												}
											},
											"right": {
												"type": "Literal",
												"value": 2,
												"raw": "2",
												"range": [
													1233,
													1234
												],
												"loc": {
													"start": {
														"line": 40,
														"column": 13
													},
													"end": {
														"line": 40,
														"column": 14
													}
												}
											},
											"range": [
												1231,
												1234
											],
											"loc": {
												"start": {
													"line": 40,
													"column": 11
												},
												"end": {
													"line": 40,
													"column": 14
												}
											}
										},
										"range": [
											1226,
											1234
										],
										"loc": {
											"start": {
												"line": 40,
												"column": 6
											},
											"end": {
												"line": 40,
												"column": 14
											}
										}
									},
									"consequent": {
										"type": "ForStatement",
										"init": {
											"type": "VariableDeclaration",
											"declarations": [
												{
													"type": "VariableDeclarator",
													"id": {
														"type": "Identifier",
														"name": "k",
														"range": [
															1248,
															1249
														],
														"loc": {
															"start": {
																"line": 41,
																"column": 12
															},
															"end": {
																"line": 41,
																"column": 13
															}
														}
													},
													"init": {
														"type": "Literal",
														"value": 0,
														"raw": "0",
														"range": [
															1250,
															1251
														],
														"loc": {
															"start": {
																"line": 41,
																"column": 14
															},
															"end": {
																"line": 41,
																"column": 15
															}
														}
													},
													"range": [
														1248,
														1251
													],
													"loc": {
														"start": {
															"line": 41,
															"column": 12
														},
														"end": {
															"line": 41,
															"column": 15
														}
													}
												}
											],
											"kind": "var",
											"range": [
												1244,
												1251
											],
											"loc": {
												"start": {
													"line": 41,
													"column": 8
												},
												"end": {
													"line": 41,
													"column": 15
												}
											}
										},
										"test": {
											"type": "BinaryExpression",
											"operator": "<",
											"left": {
												"type": "Identifier",
												"name": "k",
												"range": [
													1253,
													1254
												],
												"loc": {
													"start": {
														"line": 41,
														"column": 17
													},
													"end": {
														"line": 41,
														"column": 18
													}
												}
											},
											"right": {
												"type": "BinaryExpression",
												"operator": "+",
												"left": {
													"type": "BinaryExpression",
													"operator": "*",
													"left": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "m",
															"range": [
																1255,
																1256
															],
															"loc": {
																"start": {
																	"line": 41,
																	"column": 19
																},
																"end": {
																	"line": 41,
																	"column": 20
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "y",
															"range": [
																1257,
																1258
															],
															"loc": {
																"start": {
																	"line": 41,
																	"column": 21
																},
																"end": {
																	"line": 41,
																	"column": 22
																}
															}
														},
														"range": [
															1255,
															1258
														],
														"loc": {
															"start": {
																"line": 41,
																"column": 19
															},
															"end": {
																"line": 41,
																"column": 22
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": 4,
														"raw": "4",
														"range": [
															1259,
															1260
														],
														"loc": {
															"start": {
																"line": 41,
																"column": 23
															},
															"end": {
																"line": 41,
																"column": 24
															}
														}
													},
													"range": [
														1255,
														1260
													],
													"loc": {
														"start": {
															"line": 41,
															"column": 19
														},
														"end": {
															"line": 41,
															"column": 24
														}
													}
												},
												"right": {
													"type": "Literal",
													"value": 1,
													"raw": "1",
													"range": [
														1261,
														1262
													],
													"loc": {
														"start": {
															"line": 41,
															"column": 25
														},
														"end": {
															"line": 41,
															"column": 26
														}
													}
												},
												"range": [
													1255,
													1262
												],
												"loc": {
													"start": {
														"line": 41,
														"column": 19
													},
													"end": {
														"line": 41,
														"column": 26
													}
												}
											},
											"range": [
												1253,
												1262
											],
											"loc": {
												"start": {
													"line": 41,
													"column": 17
												},
												"end": {
													"line": 41,
													"column": 26
												}
											}
										},
										"update": {
											"type": "UpdateExpression",
											"operator": "++",
											"argument": {
												"type": "Identifier",
												"name": "k",
												"range": [
													1264,
													1265
												],
												"loc": {
													"start": {
														"line": 41,
														"column": 28
													},
													"end": {
														"line": 41,
														"column": 29
													}
												}
											},
											"prefix": false,
											"range": [
												1264,
												1267
											],
											"loc": {
												"start": {
													"line": 41,
													"column": 28
												},
												"end": {
													"line": 41,
													"column": 31
												}
											}
										},
										"body": {
											"type": "IfStatement",
											"test": {
												"type": "BinaryExpression",
												"operator": "==",
												"left": {
													"type": "Literal",
													"value": 0,
													"raw": "0",
													"range": [
														1277,
														1278
													],
													"loc": {
														"start": {
															"line": 42,
															"column": 8
														},
														"end": {
															"line": 42,
															"column": 9
														}
													}
												},
												"right": {
													"type": "BinaryExpression",
													"operator": "%",
													"left": {
														"type": "Identifier",
														"name": "k",
														"range": [
															1282,
															1283
														],
														"loc": {
															"start": {
																"line": 42,
																"column": 13
															},
															"end": {
																"line": 42,
																"column": 14
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": 4,
														"raw": "4",
														"range": [
															1284,
															1285
														],
														"loc": {
															"start": {
																"line": 42,
																"column": 15
															},
															"end": {
																"line": 42,
																"column": 16
															}
														}
													},
													"range": [
														1282,
														1285
													],
													"loc": {
														"start": {
															"line": 42,
															"column": 13
														},
														"end": {
															"line": 42,
															"column": 16
														}
													}
												},
												"range": [
													1277,
													1285
												],
												"loc": {
													"start": {
														"line": 42,
														"column": 8
													},
													"end": {
														"line": 42,
														"column": 16
													}
												}
											},
											"consequent": {
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "line",
															"range": [
																1293,
																1297
															],
															"loc": {
																"start": {
																	"line": 43,
																	"column": 5
																},
																"end": {
																	"line": 43,
																	"column": 9
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "k",
															"range": [
																1298,
																1299
															],
															"loc": {
																"start": {
																	"line": 43,
																	"column": 10
																},
																"end": {
																	"line": 43,
																	"column": 11
																}
															}
														},
														"range": [
															1293,
															1300
														],
														"loc": {
															"start": {
																"line": 43,
																"column": 5
															},
															"end": {
																"line": 43,
																"column": 12
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": "+",
														"raw": "'+'",
														"range": [
															1302,
															1305
														],
														"loc": {
															"start": {
																"line": 43,
																"column": 14
															},
															"end": {
																"line": 43,
																"column": 17
															}
														}
													},
													"range": [
														1293,
														1305
													],
													"loc": {
														"start": {
															"line": 43,
															"column": 5
														},
														"end": {
															"line": 43,
															"column": 17
														}
													}
												},
												"range": [
													1293,
													1306
												],
												"loc": {
													"start": {
														"line": 43,
														"column": 5
													},
													"end": {
														"line": 43,
														"column": 18
													}
												}
											},
											"alternate": {
												"type": "IfStatement",
												"test": {
													"type": "LogicalExpression",
													"operator": "&&",
													"left": {
														"type": "BinaryExpression",
														"operator": ">",
														"left": {
															"type": "Identifier",
															"name": "j",
															"range": [
																1325,
																1326
															],
															"loc": {
																"start": {
																	"line": 45,
																	"column": 9
																},
																"end": {
																	"line": 45,
																	"column": 10
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": 0,
															"raw": "0",
															"range": [
																1327,
																1328
															],
															"loc": {
																"start": {
																	"line": 45,
																	"column": 11
																},
																"end": {
																	"line": 45,
																	"column": 12
																}
															}
														},
														"range": [
															1325,
															1328
														],
														"loc": {
															"start": {
																"line": 45,
																"column": 9
															},
															"end": {
																"line": 45,
																"column": 12
															}
														}
													},
													"right": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "MemberExpression",
																"computed": false,
																"object": {
																	"type": "Identifier",
																	"name": "m",
																	"range": [
																		1332,
																		1333
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 16
																		},
																		"end": {
																			"line": 45,
																			"column": 17
																		}
																	}
																},
																"property": {
																	"type": "Identifier",
																	"name": "verti",
																	"range": [
																		1334,
																		1339
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 18
																		},
																		"end": {
																			"line": 45,
																			"column": 23
																		}
																	}
																},
																"range": [
																	1332,
																	1339
																],
																"loc": {
																	"start": {
																		"line": 45,
																		"column": 16
																	},
																	"end": {
																		"line": 45,
																		"column": 23
																	}
																}
															},
															"property": {
																"type": "BinaryExpression",
																"operator": "-",
																"left": {
																	"type": "BinaryExpression",
																	"operator": "/",
																	"left": {
																		"type": "Identifier",
																		"name": "j",
																		"range": [
																			1340,
																			1341
																		],
																		"loc": {
																			"start": {
																				"line": 45,
																				"column": 24
																			},
																			"end": {
																				"line": 45,
																				"column": 25
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 2,
																		"raw": "2",
																		"range": [
																			1342,
																			1343
																		],
																		"loc": {
																			"start": {
																				"line": 45,
																				"column": 26
																			},
																			"end": {
																				"line": 45,
																				"column": 27
																			}
																		}
																	},
																	"range": [
																		1340,
																		1343
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 24
																		},
																		"end": {
																			"line": 45,
																			"column": 27
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 1,
																	"raw": "1",
																	"range": [
																		1344,
																		1345
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 28
																		},
																		"end": {
																			"line": 45,
																			"column": 29
																		}
																	}
																},
																"range": [
																	1340,
																	1345
																],
																"loc": {
																	"start": {
																		"line": 45,
																		"column": 24
																	},
																	"end": {
																		"line": 45,
																		"column": 29
																	}
																}
															},
															"range": [
																1332,
																1346
															],
															"loc": {
																"start": {
																	"line": 45,
																	"column": 16
																},
																"end": {
																	"line": 45,
																	"column": 30
																}
															}
														},
														"property": {
															"type": "CallExpression",
															"callee": {
																"type": "MemberExpression",
																"computed": false,
																"object": {
																	"type": "Identifier",
																	"name": "Math",
																	"range": [
																		1347,
																		1351
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 31
																		},
																		"end": {
																			"line": 45,
																			"column": 35
																		}
																	}
																},
																"property": {
																	"type": "Identifier",
																	"name": "floor",
																	"range": [
																		1352,
																		1357
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 36
																		},
																		"end": {
																			"line": 45,
																			"column": 41
																		}
																	}
																},
																"range": [
																	1347,
																	1357
																],
																"loc": {
																	"start": {
																		"line": 45,
																		"column": 31
																	},
																	"end": {
																		"line": 45,
																		"column": 41
																	}
																}
															},
															"arguments": [
																{
																	"type": "BinaryExpression",
																	"operator": "/",
																	"left": {
																		"type": "Identifier",
																		"name": "k",
																		"range": [
																			1358,
																			1359
																		],
																		"loc": {
																			"start": {
																				"line": 45,
																				"column": 42
																			},
																			"end": {
																				"line": 45,
																				"column": 43
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 4,
																		"raw": "4",
																		"range": [
																			1360,
																			1361
																		],
																		"loc": {
																			"start": {
																				"line": 45,
																				"column": 44
																			},
																			"end": {
																				"line": 45,
																				"column": 45
																			}
																		}
																	},
																	"range": [
																		1358,
																		1361
																	],
																	"loc": {
																		"start": {
																			"line": 45,
																			"column": 42
																		},
																		"end": {
																			"line": 45,
																			"column": 45
																		}
																	}
																}
															],
															"range": [
																1347,
																1362
															],
															"loc": {
																"start": {
																	"line": 45,
																	"column": 31
																},
																"end": {
																	"line": 45,
																	"column": 46
																}
															}
														},
														"range": [
															1332,
															1363
														],
														"loc": {
															"start": {
																"line": 45,
																"column": 16
															},
															"end": {
																"line": 45,
																"column": 47
															}
														}
													},
													"range": [
														1325,
														1363
													],
													"loc": {
														"start": {
															"line": 45,
															"column": 9
														},
														"end": {
															"line": 45,
															"column": 47
														}
													}
												},
												"consequent": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "line",
																"range": [
																	1371,
																	1375
																],
																"loc": {
																	"start": {
																		"line": 46,
																		"column": 6
																	},
																	"end": {
																		"line": 46,
																		"column": 10
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	1376,
																	1377
																],
																"loc": {
																	"start": {
																		"line": 46,
																		"column": 11
																	},
																	"end": {
																		"line": 46,
																		"column": 12
																	}
																}
															},
															"range": [
																1371,
																1378
															],
															"loc": {
																"start": {
																	"line": 46,
																	"column": 6
																},
																"end": {
																	"line": 46,
																	"column": 13
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": " ",
															"raw": "' '",
															"range": [
																1380,
																1383
															],
															"loc": {
																"start": {
																	"line": 46,
																	"column": 15
																},
																"end": {
																	"line": 46,
																	"column": 18
																}
															}
														},
														"range": [
															1371,
															1383
														],
														"loc": {
															"start": {
																"line": 46,
																"column": 6
															},
															"end": {
																"line": 46,
																"column": 18
															}
														}
													},
													"range": [
														1371,
														1384
													],
													"loc": {
														"start": {
															"line": 46,
															"column": 6
														},
														"end": {
															"line": 46,
															"column": 19
														}
													}
												},
												"alternate": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "line",
																"range": [
																	1401,
																	1405
																],
																"loc": {
																	"start": {
																		"line": 48,
																		"column": 6
																	},
																	"end": {
																		"line": 48,
																		"column": 10
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	1406,
																	1407
																],
																"loc": {
																	"start": {
																		"line": 48,
																		"column": 11
																	},
																	"end": {
																		"line": 48,
																		"column": 12
																	}
																}
															},
															"range": [
																1401,
																1408
															],
															"loc": {
																"start": {
																	"line": 48,
																	"column": 6
																},
																"end": {
																	"line": 48,
																	"column": 13
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": "-",
															"raw": "'-'",
															"range": [
																1410,
																1413
															],
															"loc": {
																"start": {
																	"line": 48,
																	"column": 15
																},
																"end": {
																	"line": 48,
																	"column": 18
																}
															}
														},
														"range": [
															1401,
															1413
														],
														"loc": {
															"start": {
																"line": 48,
																"column": 6
															},
															"end": {
																"line": 48,
																"column": 18
															}
														}
													},
													"range": [
														1401,
														1414
													],
													"loc": {
														"start": {
															"line": 48,
															"column": 6
														},
														"end": {
															"line": 48,
															"column": 19
														}
													}
												},
												"range": [
													1321,
													1414
												],
												"loc": {
													"start": {
														"line": 45,
														"column": 5
													},
													"end": {
														"line": 48,
														"column": 19
													}
												}
											},
											"range": [
												1273,
												1414
											],
											"loc": {
												"start": {
													"line": 42,
													"column": 4
												},
												"end": {
													"line": 48,
													"column": 19
												}
											}
										},
										"range": [
											1239,
											1414
										],
										"loc": {
											"start": {
												"line": 41,
												"column": 3
											},
											"end": {
												"line": 48,
												"column": 19
											}
										}
									},
									"alternate": {
										"type": "ForStatement",
										"init": {
											"type": "VariableDeclaration",
											"declarations": [
												{
													"type": "VariableDeclarator",
													"id": {
														"type": "Identifier",
														"name": "k",
														"range": [
															1434,
															1435
														],
														"loc": {
															"start": {
																"line": 50,
																"column": 12
															},
															"end": {
																"line": 50,
																"column": 13
															}
														}
													},
													"init": {
														"type": "Literal",
														"value": 0,
														"raw": "0",
														"range": [
															1436,
															1437
														],
														"loc": {
															"start": {
																"line": 50,
																"column": 14
															},
															"end": {
																"line": 50,
																"column": 15
															}
														}
													},
													"range": [
														1434,
														1437
													],
													"loc": {
														"start": {
															"line": 50,
															"column": 12
														},
														"end": {
															"line": 50,
															"column": 15
														}
													}
												}
											],
											"kind": "var",
											"range": [
												1430,
												1437
											],
											"loc": {
												"start": {
													"line": 50,
													"column": 8
												},
												"end": {
													"line": 50,
													"column": 15
												}
											}
										},
										"test": {
											"type": "BinaryExpression",
											"operator": "<",
											"left": {
												"type": "Identifier",
												"name": "k",
												"range": [
													1439,
													1440
												],
												"loc": {
													"start": {
														"line": 50,
														"column": 17
													},
													"end": {
														"line": 50,
														"column": 18
													}
												}
											},
											"right": {
												"type": "BinaryExpression",
												"operator": "+",
												"left": {
													"type": "BinaryExpression",
													"operator": "*",
													"left": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "m",
															"range": [
																1441,
																1442
															],
															"loc": {
																"start": {
																	"line": 50,
																	"column": 19
																},
																"end": {
																	"line": 50,
																	"column": 20
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "y",
															"range": [
																1443,
																1444
															],
															"loc": {
																"start": {
																	"line": 50,
																	"column": 21
																},
																"end": {
																	"line": 50,
																	"column": 22
																}
															}
														},
														"range": [
															1441,
															1444
														],
														"loc": {
															"start": {
																"line": 50,
																"column": 19
															},
															"end": {
																"line": 50,
																"column": 22
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": 4,
														"raw": "4",
														"range": [
															1445,
															1446
														],
														"loc": {
															"start": {
																"line": 50,
																"column": 23
															},
															"end": {
																"line": 50,
																"column": 24
															}
														}
													},
													"range": [
														1441,
														1446
													],
													"loc": {
														"start": {
															"line": 50,
															"column": 19
														},
														"end": {
															"line": 50,
															"column": 24
														}
													}
												},
												"right": {
													"type": "Literal",
													"value": 1,
													"raw": "1",
													"range": [
														1447,
														1448
													],
													"loc": {
														"start": {
															"line": 50,
															"column": 25
														},
														"end": {
															"line": 50,
															"column": 26
														}
													}
												},
												"range": [
													1441,
													1448
												],
												"loc": {
													"start": {
														"line": 50,
														"column": 19
													},
													"end": {
														"line": 50,
														"column": 26
													}
												}
											},
											"range": [
												1439,
												1448
											],
											"loc": {
												"start": {
													"line": 50,
													"column": 17
												},
												"end": {
													"line": 50,
													"column": 26
												}
											}
										},
										"update": {
											"type": "UpdateExpression",
											"operator": "++",
											"argument": {
												"type": "Identifier",
												"name": "k",
												"range": [
													1450,
													1451
												],
												"loc": {
													"start": {
														"line": 50,
														"column": 28
													},
													"end": {
														"line": 50,
														"column": 29
													}
												}
											},
											"prefix": false,
											"range": [
												1450,
												1453
											],
											"loc": {
												"start": {
													"line": 50,
													"column": 28
												},
												"end": {
													"line": 50,
													"column": 31
												}
											}
										},
										"body": {
											"type": "IfStatement",
											"test": {
												"type": "BinaryExpression",
												"operator": "==",
												"left": {
													"type": "Literal",
													"value": 0,
													"raw": "0",
													"range": [
														1463,
														1464
													],
													"loc": {
														"start": {
															"line": 51,
															"column": 8
														},
														"end": {
															"line": 51,
															"column": 9
														}
													}
												},
												"right": {
													"type": "BinaryExpression",
													"operator": "%",
													"left": {
														"type": "Identifier",
														"name": "k",
														"range": [
															1468,
															1469
														],
														"loc": {
															"start": {
																"line": 51,
																"column": 13
															},
															"end": {
																"line": 51,
																"column": 14
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": 4,
														"raw": "4",
														"range": [
															1470,
															1471
														],
														"loc": {
															"start": {
																"line": 51,
																"column": 15
															},
															"end": {
																"line": 51,
																"column": 16
															}
														}
													},
													"range": [
														1468,
														1471
													],
													"loc": {
														"start": {
															"line": 51,
															"column": 13
														},
														"end": {
															"line": 51,
															"column": 16
														}
													}
												},
												"range": [
													1463,
													1471
												],
												"loc": {
													"start": {
														"line": 51,
														"column": 8
													},
													"end": {
														"line": 51,
														"column": 16
													}
												}
											},
											"consequent": {
												"type": "IfStatement",
												"test": {
													"type": "LogicalExpression",
													"operator": "&&",
													"left": {
														"type": "BinaryExpression",
														"operator": ">",
														"left": {
															"type": "Identifier",
															"name": "k",
															"range": [
																1482,
																1483
															],
															"loc": {
																"start": {
																	"line": 52,
																	"column": 9
																},
																"end": {
																	"line": 52,
																	"column": 10
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": 0,
															"raw": "0",
															"range": [
																1484,
																1485
															],
															"loc": {
																"start": {
																	"line": 52,
																	"column": 11
																},
																"end": {
																	"line": 52,
																	"column": 12
																}
															}
														},
														"range": [
															1482,
															1485
														],
														"loc": {
															"start": {
																"line": 52,
																"column": 9
															},
															"end": {
																"line": 52,
																"column": 12
															}
														}
													},
													"right": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "MemberExpression",
																"computed": false,
																"object": {
																	"type": "Identifier",
																	"name": "m",
																	"range": [
																		1489,
																		1490
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 16
																		},
																		"end": {
																			"line": 52,
																			"column": 17
																		}
																	}
																},
																"property": {
																	"type": "Identifier",
																	"name": "horiz",
																	"range": [
																		1491,
																		1496
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 18
																		},
																		"end": {
																			"line": 52,
																			"column": 23
																		}
																	}
																},
																"range": [
																	1489,
																	1496
																],
																"loc": {
																	"start": {
																		"line": 52,
																		"column": 16
																	},
																	"end": {
																		"line": 52,
																		"column": 23
																	}
																}
															},
															"property": {
																"type": "BinaryExpression",
																"operator": "/",
																"left": {
																	"type": "BinaryExpression",
																	"operator": "-",
																	"left": {
																		"type": "Identifier",
																		"name": "j",
																		"range": [
																			1498,
																			1499
																		],
																		"loc": {
																			"start": {
																				"line": 52,
																				"column": 25
																			},
																			"end": {
																				"line": 52,
																				"column": 26
																			}
																		}
																	},
																	"right": {
																		"type": "Literal",
																		"value": 1,
																		"raw": "1",
																		"range": [
																			1500,
																			1501
																		],
																		"loc": {
																			"start": {
																				"line": 52,
																				"column": 27
																			},
																			"end": {
																				"line": 52,
																				"column": 28
																			}
																		}
																	},
																	"range": [
																		1498,
																		1501
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 25
																		},
																		"end": {
																			"line": 52,
																			"column": 28
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 2,
																	"raw": "2",
																	"range": [
																		1503,
																		1504
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 30
																		},
																		"end": {
																			"line": 52,
																			"column": 31
																		}
																	}
																},
																"range": [
																	1497,
																	1504
																],
																"loc": {
																	"start": {
																		"line": 52,
																		"column": 24
																	},
																	"end": {
																		"line": 52,
																		"column": 31
																	}
																}
															},
															"range": [
																1489,
																1505
															],
															"loc": {
																"start": {
																	"line": 52,
																	"column": 16
																},
																"end": {
																	"line": 52,
																	"column": 32
																}
															}
														},
														"property": {
															"type": "BinaryExpression",
															"operator": "-",
															"left": {
																"type": "BinaryExpression",
																"operator": "/",
																"left": {
																	"type": "Identifier",
																	"name": "k",
																	"range": [
																		1506,
																		1507
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 33
																		},
																		"end": {
																			"line": 52,
																			"column": 34
																		}
																	}
																},
																"right": {
																	"type": "Literal",
																	"value": 4,
																	"raw": "4",
																	"range": [
																		1508,
																		1509
																	],
																	"loc": {
																		"start": {
																			"line": 52,
																			"column": 35
																		},
																		"end": {
																			"line": 52,
																			"column": 36
																		}
																	}
																},
																"range": [
																	1506,
																	1509
																],
																"loc": {
																	"start": {
																		"line": 52,
																		"column": 33
																	},
																	"end": {
																		"line": 52,
																		"column": 36
																	}
																}
															},
															"right": {
																"type": "Literal",
																"value": 1,
																"raw": "1",
																"range": [
																	1510,
																	1511
																],
																"loc": {
																	"start": {
																		"line": 52,
																		"column": 37
																	},
																	"end": {
																		"line": 52,
																		"column": 38
																	}
																}
															},
															"range": [
																1506,
																1511
															],
															"loc": {
																"start": {
																	"line": 52,
																	"column": 33
																},
																"end": {
																	"line": 52,
																	"column": 38
																}
															}
														},
														"range": [
															1489,
															1512
														],
														"loc": {
															"start": {
																"line": 52,
																"column": 16
															},
															"end": {
																"line": 52,
																"column": 39
															}
														}
													},
													"range": [
														1482,
														1512
													],
													"loc": {
														"start": {
															"line": 52,
															"column": 9
														},
														"end": {
															"line": 52,
															"column": 39
														}
													}
												},
												"consequent": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "line",
																"range": [
																	1520,
																	1524
																],
																"loc": {
																	"start": {
																		"line": 53,
																		"column": 6
																	},
																	"end": {
																		"line": 53,
																		"column": 10
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	1525,
																	1526
																],
																"loc": {
																	"start": {
																		"line": 53,
																		"column": 11
																	},
																	"end": {
																		"line": 53,
																		"column": 12
																	}
																}
															},
															"range": [
																1520,
																1527
															],
															"loc": {
																"start": {
																	"line": 53,
																	"column": 6
																},
																"end": {
																	"line": 53,
																	"column": 13
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": " ",
															"raw": "' '",
															"range": [
																1529,
																1532
															],
															"loc": {
																"start": {
																	"line": 53,
																	"column": 15
																},
																"end": {
																	"line": 53,
																	"column": 18
																}
															}
														},
														"range": [
															1520,
															1532
														],
														"loc": {
															"start": {
																"line": 53,
																"column": 6
															},
															"end": {
																"line": 53,
																"column": 18
															}
														}
													},
													"range": [
														1520,
														1533
													],
													"loc": {
														"start": {
															"line": 53,
															"column": 6
														},
														"end": {
															"line": 53,
															"column": 19
														}
													}
												},
												"alternate": {
													"type": "ExpressionStatement",
													"expression": {
														"type": "AssignmentExpression",
														"operator": "=",
														"left": {
															"type": "MemberExpression",
															"computed": true,
															"object": {
																"type": "Identifier",
																"name": "line",
																"range": [
																	1550,
																	1554
																],
																"loc": {
																	"start": {
																		"line": 55,
																		"column": 6
																	},
																	"end": {
																		"line": 55,
																		"column": 10
																	}
																}
															},
															"property": {
																"type": "Identifier",
																"name": "k",
																"range": [
																	1555,
																	1556
																],
																"loc": {
																	"start": {
																		"line": 55,
																		"column": 11
																	},
																	"end": {
																		"line": 55,
																		"column": 12
																	}
																}
															},
															"range": [
																1550,
																1557
															],
															"loc": {
																"start": {
																	"line": 55,
																	"column": 6
																},
																"end": {
																	"line": 55,
																	"column": 13
																}
															}
														},
														"right": {
															"type": "Literal",
															"value": "|",
															"raw": "'|'",
															"range": [
																1559,
																1562
															],
															"loc": {
																"start": {
																	"line": 55,
																	"column": 15
																},
																"end": {
																	"line": 55,
																	"column": 18
																}
															}
														},
														"range": [
															1550,
															1562
														],
														"loc": {
															"start": {
																"line": 55,
																"column": 6
															},
															"end": {
																"line": 55,
																"column": 18
															}
														}
													},
													"range": [
														1550,
														1563
													],
													"loc": {
														"start": {
															"line": 55,
															"column": 6
														},
														"end": {
															"line": 55,
															"column": 19
														}
													}
												},
												"range": [
													1478,
													1563
												],
												"loc": {
													"start": {
														"line": 52,
														"column": 5
													},
													"end": {
														"line": 55,
														"column": 19
													}
												}
											},
											"alternate": {
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "line",
															"range": [
																1578,
																1582
															],
															"loc": {
																"start": {
																	"line": 57,
																	"column": 5
																},
																"end": {
																	"line": 57,
																	"column": 9
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "k",
															"range": [
																1583,
																1584
															],
															"loc": {
																"start": {
																	"line": 57,
																	"column": 10
																},
																"end": {
																	"line": 57,
																	"column": 11
																}
															}
														},
														"range": [
															1578,
															1585
														],
														"loc": {
															"start": {
																"line": 57,
																"column": 5
															},
															"end": {
																"line": 57,
																"column": 12
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": " ",
														"raw": "' '",
														"range": [
															1587,
															1590
														],
														"loc": {
															"start": {
																"line": 57,
																"column": 14
															},
															"end": {
																"line": 57,
																"column": 17
															}
														}
													},
													"range": [
														1578,
														1590
													],
													"loc": {
														"start": {
															"line": 57,
															"column": 5
														},
														"end": {
															"line": 57,
															"column": 17
														}
													}
												},
												"range": [
													1578,
													1591
												],
												"loc": {
													"start": {
														"line": 57,
														"column": 5
													},
													"end": {
														"line": 57,
														"column": 18
													}
												}
											},
											"range": [
												1459,
												1591
											],
											"loc": {
												"start": {
													"line": 51,
													"column": 4
												},
												"end": {
													"line": 57,
													"column": 18
												}
											}
										},
										"range": [
											1425,
											1591
										],
										"loc": {
											"start": {
												"line": 50,
												"column": 3
											},
											"end": {
												"line": 57,
												"column": 18
											}
										}
									},
									"range": [
										1222,
										1591
									],
									"loc": {
										"start": {
											"line": 40,
											"column": 2
										},
										"end": {
											"line": 57,
											"column": 18
										}
									}
								},
								{
									"type": "IfStatement",
									"test": {
										"type": "BinaryExpression",
										"operator": "==",
										"left": {
											"type": "Literal",
											"value": 0,
											"raw": "0",
											"range": [
												1598,
												1599
											],
											"loc": {
												"start": {
													"line": 58,
													"column": 6
												},
												"end": {
													"line": 58,
													"column": 7
												}
											}
										},
										"right": {
											"type": "Identifier",
											"name": "j",
											"range": [
												1603,
												1604
											],
											"loc": {
												"start": {
													"line": 58,
													"column": 11
												},
												"end": {
													"line": 58,
													"column": 12
												}
											}
										},
										"range": [
											1598,
											1604
										],
										"loc": {
											"start": {
												"line": 58,
												"column": 6
											},
											"end": {
												"line": 58,
												"column": 12
											}
										}
									},
									"consequent": {
										"type": "ExpressionStatement",
										"expression": {
											"type": "AssignmentExpression",
											"operator": "=",
											"left": {
												"type": "MemberExpression",
												"computed": true,
												"object": {
													"type": "Identifier",
													"name": "line",
													"range": [
														1606,
														1610
													],
													"loc": {
														"start": {
															"line": 58,
															"column": 14
														},
														"end": {
															"line": 58,
															"column": 18
														}
													}
												},
												"property": {
													"type": "Literal",
													"value": 1,
													"raw": "1",
													"range": [
														1611,
														1612
													],
													"loc": {
														"start": {
															"line": 58,
															"column": 19
														},
														"end": {
															"line": 58,
															"column": 20
														}
													}
												},
												"range": [
													1606,
													1613
												],
												"loc": {
													"start": {
														"line": 58,
														"column": 14
													},
													"end": {
														"line": 58,
														"column": 21
													}
												}
											},
											"right": {
												"type": "AssignmentExpression",
												"operator": "=",
												"left": {
													"type": "MemberExpression",
													"computed": true,
													"object": {
														"type": "Identifier",
														"name": "line",
														"range": [
															1615,
															1619
														],
														"loc": {
															"start": {
																"line": 58,
																"column": 23
															},
															"end": {
																"line": 58,
																"column": 27
															}
														}
													},
													"property": {
														"type": "Literal",
														"value": 2,
														"raw": "2",
														"range": [
															1620,
															1621
														],
														"loc": {
															"start": {
																"line": 58,
																"column": 28
															},
															"end": {
																"line": 58,
																"column": 29
															}
														}
													},
													"range": [
														1615,
														1622
													],
													"loc": {
														"start": {
															"line": 58,
															"column": 23
														},
														"end": {
															"line": 58,
															"column": 30
														}
													}
												},
												"right": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "MemberExpression",
														"computed": true,
														"object": {
															"type": "Identifier",
															"name": "line",
															"range": [
																1624,
																1628
															],
															"loc": {
																"start": {
																	"line": 58,
																	"column": 32
																},
																"end": {
																	"line": 58,
																	"column": 36
																}
															}
														},
														"property": {
															"type": "Literal",
															"value": 3,
															"raw": "3",
															"range": [
																1629,
																1630
															],
															"loc": {
																"start": {
																	"line": 58,
																	"column": 37
																},
																"end": {
																	"line": 58,
																	"column": 38
																}
															}
														},
														"range": [
															1624,
															1631
														],
														"loc": {
															"start": {
																"line": 58,
																"column": 32
															},
															"end": {
																"line": 58,
																"column": 39
															}
														}
													},
													"right": {
														"type": "Literal",
														"value": " ",
														"raw": "' '",
														"range": [
															1633,
															1636
														],
														"loc": {
															"start": {
																"line": 58,
																"column": 41
															},
															"end": {
																"line": 58,
																"column": 44
															}
														}
													},
													"range": [
														1624,
														1636
													],
													"loc": {
														"start": {
															"line": 58,
															"column": 32
														},
														"end": {
															"line": 58,
															"column": 44
														}
													}
												},
												"range": [
													1615,
													1636
												],
												"loc": {
													"start": {
														"line": 58,
														"column": 23
													},
													"end": {
														"line": 58,
														"column": 44
													}
												}
											},
											"range": [
												1606,
												1636
											],
											"loc": {
												"start": {
													"line": 58,
													"column": 14
												},
												"end": {
													"line": 58,
													"column": 44
												}
											}
										},
										"range": [
											1606,
											1637
										],
										"loc": {
											"start": {
												"line": 58,
												"column": 14
											},
											"end": {
												"line": 58,
												"column": 45
											}
										}
									},
									"alternate": null,
									"range": [
										1594,
										1637
									],
									"loc": {
										"start": {
											"line": 58,
											"column": 2
										},
										"end": {
											"line": 58,
											"column": 45
										}
									}
								},
								{
									"type": "IfStatement",
									"test": {
										"type": "BinaryExpression",
										"operator": "==",
										"left": {
											"type": "BinaryExpression",
											"operator": "-",
											"left": {
												"type": "BinaryExpression",
												"operator": "*",
												"left": {
													"type": "MemberExpression",
													"computed": false,
													"object": {
														"type": "Identifier",
														"name": "m",
														"range": [
															1644,
															1645
														],
														"loc": {
															"start": {
																"line": 59,
																"column": 6
															},
															"end": {
																"line": 59,
																"column": 7
															}
														}
													},
													"property": {
														"type": "Identifier",
														"name": "x",
														"range": [
															1646,
															1647
														],
														"loc": {
															"start": {
																"line": 59,
																"column": 8
															},
															"end": {
																"line": 59,
																"column": 9
															}
														}
													},
													"range": [
														1644,
														1647
													],
													"loc": {
														"start": {
															"line": 59,
															"column": 6
														},
														"end": {
															"line": 59,
															"column": 9
														}
													}
												},
												"right": {
													"type": "Literal",
													"value": 2,
													"raw": "2",
													"range": [
														1648,
														1649
													],
													"loc": {
														"start": {
															"line": 59,
															"column": 10
														},
														"end": {
															"line": 59,
															"column": 11
														}
													}
												},
												"range": [
													1644,
													1649
												],
												"loc": {
													"start": {
														"line": 59,
														"column": 6
													},
													"end": {
														"line": 59,
														"column": 11
													}
												}
											},
											"right": {
												"type": "Literal",
												"value": 1,
												"raw": "1",
												"range": [
													1650,
													1651
												],
												"loc": {
													"start": {
														"line": 59,
														"column": 12
													},
													"end": {
														"line": 59,
														"column": 13
													}
												}
											},
											"range": [
												1644,
												1651
											],
											"loc": {
												"start": {
													"line": 59,
													"column": 6
												},
												"end": {
													"line": 59,
													"column": 13
												}
											}
										},
										"right": {
											"type": "Identifier",
											"name": "j",
											"range": [
												1655,
												1656
											],
											"loc": {
												"start": {
													"line": 59,
													"column": 17
												},
												"end": {
													"line": 59,
													"column": 18
												}
											}
										},
										"range": [
											1644,
											1656
										],
										"loc": {
											"start": {
												"line": 59,
												"column": 6
											},
											"end": {
												"line": 59,
												"column": 18
											}
										}
									},
									"consequent": {
										"type": "ExpressionStatement",
										"expression": {
											"type": "AssignmentExpression",
											"operator": "=",
											"left": {
												"type": "MemberExpression",
												"computed": true,
												"object": {
													"type": "Identifier",
													"name": "line",
													"range": [
														1658,
														1662
													],
													"loc": {
														"start": {
															"line": 59,
															"column": 20
														},
														"end": {
															"line": 59,
															"column": 24
														}
													}
												},
												"property": {
													"type": "BinaryExpression",
													"operator": "*",
													"left": {
														"type": "Literal",
														"value": 4,
														"raw": "4",
														"range": [
															1663,
															1664
														],
														"loc": {
															"start": {
																"line": 59,
																"column": 25
															},
															"end": {
																"line": 59,
																"column": 26
															}
														}
													},
													"right": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "m",
															"range": [
																1665,
																1666
															],
															"loc": {
																"start": {
																	"line": 59,
																	"column": 27
																},
																"end": {
																	"line": 59,
																	"column": 28
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "y",
															"range": [
																1667,
																1668
															],
															"loc": {
																"start": {
																	"line": 59,
																	"column": 29
																},
																"end": {
																	"line": 59,
																	"column": 30
																}
															}
														},
														"range": [
															1665,
															1668
														],
														"loc": {
															"start": {
																"line": 59,
																"column": 27
															},
															"end": {
																"line": 59,
																"column": 30
															}
														}
													},
													"range": [
														1663,
														1668
													],
													"loc": {
														"start": {
															"line": 59,
															"column": 25
														},
														"end": {
															"line": 59,
															"column": 30
														}
													}
												},
												"range": [
													1658,
													1669
												],
												"loc": {
													"start": {
														"line": 59,
														"column": 20
													},
													"end": {
														"line": 59,
														"column": 31
													}
												}
											},
											"right": {
												"type": "Literal",
												"value": " ",
												"raw": "' '",
												"range": [
													1671,
													1674
												],
												"loc": {
													"start": {
														"line": 59,
														"column": 33
													},
													"end": {
														"line": 59,
														"column": 36
													}
												}
											},
											"range": [
												1658,
												1674
											],
											"loc": {
												"start": {
													"line": 59,
													"column": 20
												},
												"end": {
													"line": 59,
													"column": 36
												}
											}
										},
										"range": [
											1658,
											1675
										],
										"loc": {
											"start": {
												"line": 59,
												"column": 20
											},
											"end": {
												"line": 59,
												"column": 37
											}
										}
									},
									"alternate": null,
									"range": [
										1640,
										1675
									],
									"loc": {
										"start": {
											"line": 59,
											"column": 2
										},
										"end": {
											"line": 59,
											"column": 37
										}
									}
								},
								{
									"type": "ExpressionStatement",
									"expression": {
										"type": "CallExpression",
										"callee": {
											"type": "MemberExpression",
											"computed": false,
											"object": {
												"type": "Identifier",
												"name": "text",
												"range": [
													1678,
													1682
												],
												"loc": {
													"start": {
														"line": 60,
														"column": 2
													},
													"end": {
														"line": 60,
														"column": 6
													}
												}
											},
											"property": {
												"type": "Identifier",
												"name": "push",
												"range": [
													1683,
													1687
												],
												"loc": {
													"start": {
														"line": 60,
														"column": 7
													},
													"end": {
														"line": 60,
														"column": 11
													}
												}
											},
											"range": [
												1678,
												1687
											],
											"loc": {
												"start": {
													"line": 60,
													"column": 2
												},
												"end": {
													"line": 60,
													"column": 11
												}
											}
										},
										"arguments": [
											{
												"type": "BinaryExpression",
												"operator": "+",
												"left": {
													"type": "CallExpression",
													"callee": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "line",
															"range": [
																1688,
																1692
															],
															"loc": {
																"start": {
																	"line": 60,
																	"column": 12
																},
																"end": {
																	"line": 60,
																	"column": 16
																}
															}
														},
														"property": {
															"type": "Identifier",
															"name": "join",
															"range": [
																1693,
																1697
															],
															"loc": {
																"start": {
																	"line": 60,
																	"column": 17
																},
																"end": {
																	"line": 60,
																	"column": 21
																}
															}
														},
														"range": [
															1688,
															1697
														],
														"loc": {
															"start": {
																"line": 60,
																"column": 12
															},
															"end": {
																"line": 60,
																"column": 21
															}
														}
													},
													"arguments": [
														{
															"type": "Literal",
															"value": "",
															"raw": "''",
															"range": [
																1698,
																1700
															],
															"loc": {
																"start": {
																	"line": 60,
																	"column": 22
																},
																"end": {
																	"line": 60,
																	"column": 24
																}
															}
														}
													],
													"range": [
														1688,
														1701
													],
													"loc": {
														"start": {
															"line": 60,
															"column": 12
														},
														"end": {
															"line": 60,
															"column": 25
														}
													}
												},
												"right": {
													"type": "Literal",
													"value": "\r\n",
													"raw": "'\\r\\n'",
													"range": [
														1702,
														1708
													],
													"loc": {
														"start": {
															"line": 60,
															"column": 26
														},
														"end": {
															"line": 60,
															"column": 32
														}
													}
												},
												"range": [
													1688,
													1708
												],
												"loc": {
													"start": {
														"line": 60,
														"column": 12
													},
													"end": {
														"line": 60,
														"column": 32
													}
												}
											}
										],
										"range": [
											1678,
											1709
										],
										"loc": {
											"start": {
												"line": 60,
												"column": 2
											},
											"end": {
												"line": 60,
												"column": 33
											}
										}
									},
									"range": [
										1678,
										1710
									],
									"loc": {
										"start": {
											"line": 60,
											"column": 2
										},
										"end": {
											"line": 60,
											"column": 34
										}
									}
								}
							],
							"range": [
								1202,
								1713
							],
							"loc": {
								"start": {
									"line": 38,
									"column": 32
								},
								"end": {
									"line": 61,
									"column": 2
								}
							}
						},
						"range": [
							1171,
							1713
						],
						"loc": {
							"start": {
								"line": 38,
								"column": 1
							},
							"end": {
								"line": 61,
								"column": 2
							}
						}
					},
					{
						"type": "ReturnStatement",
						"argument": {
							"type": "CallExpression",
							"callee": {
								"type": "MemberExpression",
								"computed": false,
								"object": {
									"type": "Identifier",
									"name": "text",
									"range": [
										1722,
										1726
									],
									"loc": {
										"start": {
											"line": 62,
											"column": 8
										},
										"end": {
											"line": 62,
											"column": 12
										}
									}
								},
								"property": {
									"type": "Identifier",
									"name": "join",
									"range": [
										1727,
										1731
									],
									"loc": {
										"start": {
											"line": 62,
											"column": 13
										},
										"end": {
											"line": 62,
											"column": 17
										}
									}
								},
								"range": [
									1722,
									1731
								],
								"loc": {
									"start": {
										"line": 62,
										"column": 8
									},
									"end": {
										"line": 62,
										"column": 17
									}
								}
							},
							"arguments": [
								{
									"type": "Literal",
									"value": "",
									"raw": "''",
									"range": [
										1732,
										1734
									],
									"loc": {
										"start": {
											"line": 62,
											"column": 18
										},
										"end": {
											"line": 62,
											"column": 20
										}
									}
								}
							],
							"range": [
								1722,
								1735
							],
							"loc": {
								"start": {
									"line": 62,
									"column": 8
								},
								"end": {
									"line": 62,
									"column": 21
								}
							}
						},
						"range": [
							1715,
							1736
						],
						"loc": {
							"start": {
								"line": 62,
								"column": 1
							},
							"end": {
								"line": 62,
								"column": 22
							}
						}
					}
				],
				"range": [
					1153,
					1738
				],
				"loc": {
					"start": {
						"line": 36,
						"column": 20
					},
					"end": {
						"line": 63,
						"column": 1
					}
				}
			},
			"rest": null,
			"generator": false,
			"expression": false,
			"range": [
				1133,
				1738
			],
			"loc": {
				"start": {
					"line": 36,
					"column": 0
				},
				"end": {
					"line": 63,
					"column": 1
				}
			}
		}
	],
	"range": [
		0,
		1738
	],
	"loc": {
		"start": {
			"line": 1,
			"column": 0
		},
		"end": {
			"line": 63,
			"column": 1
		}
	}
};


test("$same", function() {
	var x = {a:5, b:"foo", v:{bar:"baz"}, x:[1,2,3, {g:["sdfas", 0]} ]};
	var y = {a:5, b:"foo", v:{bar:"baz"}, x:[1,2,3, {g:["sdfas", 0]} ]};

	var result = $same(x, y);
	ok(result, "comparing two complex objects");

	var complex = {
		name: "loot",
		age: 34,
		skillz: ["js", "kung-fu"],
		foo: function() {console.log("foo")},
		bar: {
			stuff: ["cat", "dog", "car"],
			dob: "12-1-78"
		}
	};

	$same({
		name: $x("String"),
		age: $x("Number"),
		skillz: ["js", "kung-fu"],
		foo: $x("Function"),
		bar: {
			stuff: $x("Array"),
			dob: $x("String")
		}
	}, complex);

	$same({
		name: $x(String),
		age: $x(Number),
		skillz: ["js", "kung-fu"],
		foo: $x(Function),
		bar: $x("has")("stuff")
	}, complex);

	$same($x("has")("skillz"), complex);

	$walk(ast, function(val, key, depth, obj, parents, siblings, path) {
		if (key === "line" && val === 36 && $includes(path, "start")) {
			console.log($slice(path, 0, -3).join("."));
			return $last(parents, -2);
		}
	});
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