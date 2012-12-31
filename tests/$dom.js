

module("$dom");


// tests will not pass because of variations in self closing tags (with or without ending slash) so we detect that
var gt  = ">",
	gts = "/>";

var selfClosingEnd = gts;
var div = document.createElement("div");
var img = document.createElement("img");
div.appendChild(img);
if (div.innerHTML === "<img>") {
	selfClosingEnd = gt;
}


// not sure if we are escaping by default or not
var escapeHTML = false;
$esc = function(str) {
	if (escapeHTML) {
		return $escapeHTML(str);
	} else {
		return str;
	}
};

test("$node", function() {

	expect(7);

	var node = $node();
	same(node.toString(), "<div></div>", "empty div by default");

	node.set("id", "test");
	same(node.toString(), '<div id="test"></div>', "simple set attr works fine");
	console.log(node.toString());

	node.set({
		id: "test",
		"class": "test",
		title: "this is a good title"
	});

	var expectedNodeStr = '<div id="test" class="test" title="this is a good title"></div>';

	same(node.toString(), expectedNodeStr, "complex set attr, with spec object and attr removal works fine");
	console.log(node.toString());

	var nextNode = $node("div");
	nextNode.set("id", "next");
	nextNode.append(node);
	console.log(nextNode.toString());
	same(nextNode.toString(), '<div id="next">'+expectedNodeStr+'</div>', "simple append works fine");

	console.log(nextNode.children.toString());
	same(expectedNodeStr, nextNode.children.toString(), "children.toString works fine");

	nextNode.append([node, $node(), $node()]);

	same(nextNode.toString(), '<div id="next">'+expectedNodeStr+expectedNodeStr+'<div></div><div></div></div>', "array append works fine");

	var p = $node("p");
	var textNode = 'this is some text with some <html><p>in it</p></html>';
	p.append(textNode);
	console.log(p.toString());
	nextNode.append(p);

	escapeHTML = $doc.usesRealDom();

	same(p.toString(), "<p>"+textNode+"</p>", "text append with escaping html strings works fine");

});



test("$el", function() {

	expect(0);

	$doc.useRealDom(true);
	var div = $el("div");
	div.id = "testdiv";

	console.log(typeof div, div, div.toString());
	document.body.appendChild(div);

	var items = [ 1, 2, 3, 4];
	var div2 = $el('div#message', [
		$el('a.biglink', {href: 'http://www.google.com'}, 'A link to Google'),
		$el('ul', $map(items, function(item) {
			return $el('li.item', item + '. Item');
		})
		)
	]);

	div.appendChild(div2);
	console.log(typeof div2, div2, div2.toString());

	$doc.useRealDom(false);
	var div3 = $el('div#message', [
		$el('a.biglink', {href: 'http://www.google.com'}, ['A link to Google']),
		$el('ul', $map(items, function(item) {
			return $el('li.item', [item + '. Item']);
		})
		)
	]);

	console.log(typeof div3, div3, div3.toString());
	console.log(div3.toString());
	console.log(div.innerHTML);

	var html = '<div id="message"><a class="biglink" href="http://www.google.com">A link to Google</a><ul><li class="item">1. Item</li><li class="item">2. Item</li><li class="item">3. Item</li><li class="item">4. Item</li></ul></div>';

	same(html, div3.toString(), "string mode html output is as expected");
	same(html, div.innerHTML, "dom mode html output is as expected");

	$id("testdiv").innerHTML = "";


	var genDOMWith$el = function ( data ) {

		return $el( 'div', {
			className: 'Foo' +
				( data.isSelected ? ' selected' : '' ) +
				( data.isActive ? ' active' : '' )
		}, [
			$el( 'label', [
				$el( 'input', {
					type: 'checkbox',
					checked: data.isSelected ? 'checked': ''
				})
			]),
			$el( 'button', {
				className:'button',
				title: 'A title'
			}, ['The button text']),
			$el( 'a', {
				href: data.href
			}, [
				$el( 'span', {
					className: 'lorem' +
						( data.total > 1 ? ' ipsum' : '' )
				}, [
					$el( 'span', {
						className:'dolores',
						unselectable: 'on'
					}, [
						data.text
					]),
					data.total > 1 ? $el( 'span', {
						className:'total',
						unselectable: 'on'
					},'(' + data.total + ')') : null
				]),
				data.yes ? $el( 'span', {className:'yes'},'*') : null,
				$el( 'span', {
						className:'text',unselectable: 'on'
					},
					data.total > 1 ? data.text : null
				),
				$el( 'time', {
					unselectable: 'on',
					title: data.displayDate
				}, data.displayDate),
				$el( 'span', {
					className:'preview',unselectable: 'on'
				}, data.preview)
			])
		]);
	};


	var genDOMWithInnerHTML = function ( data ) {
		var div = document.createElement( 'div' );
		div.innerHTML = '<div class="Foo' +
			(data.isSelected ? ' selected' : '') +
			(data.isActive ? ' active' : '') + '">' +
			'<label><input type="checkbox" checked="' +
			(data.isSelected ? 'checked': '') + '"></label>' +
			'<button class="button" title="A title">The button text</button>' +
			'<a href="' + data.href + '"><span class="lorem' +
			( data.total > 1 ? ' ipsum' : '' ) +
			'"><span class="dolores" unselectable="on">' + data.text +
			'</span>' + ( data.total > 1 ?
			'<span class="total" unselectable="on">(' + data.total + ')</span>' :
			'') +
			'</span>' + (data.yes ? '<span class="yes">*</span>' : '') +
			'<span class="text" unselectable="on">' +
			(data.total > 1 ? data.text : null) +
			'</span>' +
			'<time unselectable="on" title="' + data.displayDate + '">' +
			data.displayDate +
			'</time><span class="preview" unselectable="on">' + data.preview +
			'</span></a></div>';
		return div.firstChild;
	};

	var data = {
		isSelected: true,
		isActive: false,
		href: 'http://www.google.com',
		total: 4,
		displayDate: '28th December 2011',
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		preview: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	};

	$doc.useRealDom(true);
	var elDomContainer = $el("div");
	var elDom = genDOMWith$el(data);
	elDomContainer.appendChild(elDom);
	var elDomHtml = elDomContainer.innerHTML;

	$doc.useRealDom(false);
	var elHtm = genDOMWith$el(data);
	var elHtmHtml = elHtm.toString();


	$doc.useRealDom(true);
	var htmlDomContainer = $el("div");
	var htmlDom = genDOMWithInnerHTML(data);
	htmlDomContainer.appendChild(htmlDom);
	var htmlInner = htmlDomContainer.innerHTML;

	// debug
//			console.log(elDomHtml, elHtmHtml, htmlInner);
//			$id("testdiv").innerHTML = elHtmHtml;
//			$id("testdiv").appendChild(elDomContainer);
//			$id("testdiv").appendChild(htmlDomContainer);

	same(elDomHtml, elHtmHtml, "complex string and dom mode output is the same");
	same(elHtmHtml, htmlInner, "complex string mode output is the same as reference html");
	same(elDomHtml, htmlInner, "complex dom mode output is the same as reference html");
//			same(html, div.innerHTML, "dom mode html output is as expected");

});


// used in $dom and $part tests
var validDoms = {

	simple1: {
		dom: 		["div"],
		val:		"<div></div>"
	},
	simple2: {
		dom: 		["div", "h1", "p"],
		val:		"<div></div><h1></h1><p></p>"
	},
	simple3: {
		dom: 		["div", "hello"],
		val:		"<div>hello</div>"
	},
	simple4: {
		dom: 		["div", ["h1", "p"]],
		val:		"<div><h1></h1><p></p></div>"
	},
	simple5: {
		dom: 		["div", ["h1"], "p"],
		val:		"<div><h1></h1></div><p></p>"
	},
	simple6: {
		dom: 		["div.test", "h1#foo", "p#foo2.test.test2"],
		val:		'<div class="test"></div><h1 id="foo"></h1><p id="foo2" class="test test2"></p>'
	},
	simple7: {
		dom: 		["div.test", {title: "the title"}, "h1#foo", {className: "test3", title: "the title"}, "inner text", "p#foo2.test.test2", {className: "test3", title: "the title"}],
		val:		'<div class="test" title="the title"></div><h1 id="foo" class="test3" title="the title">inner text</h1><p id="foo2" class="test test2 test3" title="the title"></p>'
	},
	simple8: {
		dom: 		["div.test", {title: "the title"}, ["h1#foo", {className: "test3", title: "the title"}, "inner text", "p#foo2.test.test2", {className: "test3", title: "the title"}]],
		val:		'<div class="test" title="the title"><h1 id="foo" class="test3" title="the title">inner text</h1><p id="foo2" class="test test2 test3" title="the title"></p></div>'
	},
	simple9: {
		dom: 		["div.test", {title: "the title"}, ["h1#foo", {className: "test3", title: "the title"}, "inner text"], "p#foo2.test.test2", {className: "test3", title: "the title"}],
		val:		'<div class="test" title="the title"><h1 id="foo" class="test3" title="the title">inner text</h1></div><p id="foo2" class="test test2 test3" title="the title"></p>'
	},
	escapeHtmlStrings: {
		dom: ["div.test-3", "<div>this is some html<p>p tag</p></div>"],
		val: '<div class="test-3"><div>this is some html<p>p tag</p></div></div>'
	}
	// todo add LOTS more here
};


test("$dom", function() {

	var data = {
		isSelected: true,
		isActive: false,
		href: 'http://www.google.com',
		total: 4,
		displayDate: '28th December 2011',
		text: "text",
		preview: "preview"
//				text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
//				preview: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	};



	$each(validDoms, function(d) {

		$doc.useRealDom(false);
		var dom1 = $dom(d.dom);
		console.log(d);
		console.log(dom1.toString());

		$doc.useRealDom(true);
		var div = $el("div");


		var dom2 = $dom(d.dom);
		console.log(dom1, div, dom2);
		$each(dom2, function(val) {
			div.appendChild(val);
		});

		console.log(div.innerHTML);

		same(dom1.toString(), d.val, "outputStrings dom output is good");
		same(d.val, div.innerHTML, "dom output converted to string is good");
	});



	function genDom(data) {
		return $dom([
			'div', {className: 'Foo' + (data.isSelected ? ' selected' : '') + (data.isActive ? ' active' : '')}, [
				'label', [
					'input', {type: 'checkbox', checked: (data.isSelected ? 'checked': '')}
				]
				,
				'button.button', {title: 'A title'},
				'The button text',
				'a', {href: data.href}, [
					'span', {className: 'lorem' + (data.total > 1 ? ' ipsum' : '')}, [
						'span.dolores', {unselectable: 'on'}, [
							data.text
						],
						'span.total', {unselectable: 'on', className: (data.total < 1 ? "hidden" : "")}
					],
					'span.yes', {className: (!data.yes ? "hidden" : "")},
					"*",
					'span', {unselectable: 'on'}, data.total > 1 ? data.text : null,
					'time', {unselectable: 'on', title: data.displayDate},
					data.displayDate,
					'span.preview', {unselectable: 'on'},
					data.preview
				]
			]
		]);
	}

	$doc.useRealDom(false);
	var dom = genDom(data);

//			console.log(dom.toString());

	$doc.useRealDom(true);
	var div = $el("div");

	var dom2 = genDom(data);
//			console.log(div, dom2);
	$each(dom2, function(val) {
		div.appendChild(val);
	});
//			console.log(div.innerHTML);

	escapeHTML = $doc.usesRealDom();

	same(div.innerHTML, dom.toString(), "complex dom output same for both render modes");




});


test("$part", function() {
	var testData = {
		val1: "this is a test",
		val2: "foo",
		val3: "bar",
		val4: "baz"
	};

//			$each(validDoms, function(d, name) {
//
//				console.log(arguments);
//
//				$part(name, function(data) {
//					return $dom(d.dom);
//				});
//
//				$doc.useRealDom(false);
//				var dom1 = $parts(name)(testData);
//
//				console.log(dom1.toString());
//
//				$doc.useRealDom(true);
//				var div = $el("div");
//
//
//				var dom2 =  $parts(name)(testData);
//				console.log(dom1, div, dom2);
//				$each(dom2, function(val) {
//					div.appendChild(val);
//				});
//
//				console.log(div.innerHTML);
//
//				same(dom1.toString(), d.val, "outputStrings partial output is good");
//				same(div.innerHTML, d.val, "partial output converted to string is good");
//			});

	$doc.useRealDom(false);
	var template = $part("testTemplate", function(data) {
		return $dom(["div.test", data.content]);
	});

	var template2 = $part("testTemplate", {content:"the content"});

	console.log(
		template,
		$parts("testTemplate"),
		template2,
		$parts("testTemplate")({content:"the content"}),
		$parts("testTemplate", {content:"the content2"})(),
		template2(),
		template2({content:"the content"})
	);

	var expected = '<div class="test">the content</div>';
	var expected2 = '<div class="test">the content2</div>';

	same(expected, $parts("testTemplate")({content:"the content"}).toString(), "basic template as expected");
	same(expected, template2().toString(), "basic template with predefined data as expected");
	same(expected2, template2({content:"the content2"}).toString(), "basic template with predefined data as expected");




	var templateDoms = {
		simpleTpl1: {
			fn: function(data) {return $dom(["div.test", data.val]);},
			val: '<div class="test">'+testData.val2+'</div>',
			val2: '<div class="test">'+testData.val3+'</div>'
		},
		simpleTpl2: {
			fn: function(data) {return $dom(["div.test", {title: data.val}, data.val]);},
			val: '<div class="test" title="'+testData.val2+'">'+testData.val2+'</div>',
			val2: '<div class="test" title="'+testData.val3+'">'+testData.val3+'</div>'
		},
		simpleTpl3: {
			fn: function(data) {return $dom(["div.test", {title: data.val}, $part("simpleTpl2")(data)]);},
			val: '<div class="test" title="'+testData.val2+'"><div class="test" title="'+testData.val2+'">'+testData.val2+'</div></div>',
			val2: '<div class="test" title="'+testData.val3+'"><div class="test" title="'+testData.val3+'">'+testData.val3+'</div></div>'
		},
		imgs: {
			fn: function(data) {return $dom(["img", {src: "#", title: data.val}, "img", {src: "#", title: data.val2}]);},
			val: '<img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd,
			val2: '<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val4+'"'+ selfClosingEnd
		},
		imgsDiv: {
			fn: function(data) {return $dom(["div.images", {title: data.val}, $part("imgs", data)()]);},
			val: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'</div>',
			val2: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val4+'"'+ selfClosingEnd+'</div>'
		},
		imgsDiv2: {
			fn: function(data) {return $dom(["div.images", {title: data.val}, $part("imgs", data)]);},
			val: '<div class="images" title="'+testData.val2+'"></div><img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd,
			val2: '<div class="images" title="'+testData.val2+'"></div><img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val4+'"'+ selfClosingEnd
		},
		imgsDiv3: {
			fn: function(data) {
				return $dom([
					"div.images", {title: data.val}, [
						$part("imgs", data)
					]
				]);
			},
			val: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'</div>',
			val2: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val4+'"'+ selfClosingEnd+'</div>'
		},
		imgsDiv4: {
			fn: function(data) {
				return $dom([
					"div.images", {title: data.val}, [
						$part("imgs", data),
						$part("imgs", data)
					]
				]);
			},
			val: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'</div>',
			val2: '<div class="images" title="'+testData.val2+'"><img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val2+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val3+'"'+ selfClosingEnd+'<img src="#" title="'+testData.val4+'"'+ selfClosingEnd+'</div>'
		},
		page0: {
			fn: function(data) {
				return $dom([
					"html", [
						"head", [
							"title", data.val
						],
						"body", [
							"div.midNoise", [
							]
						]
					]
				]);
			},
			val: '<html><head><title>'+testData.val2+'</title></head><body><div class="midNoise"></div></body></html>',
			val2: '<html><head><title>'+testData.val2+'</title></head><body><div class="midNoise"></div></body></html>'
		},
		page1: {
			fn: function(data) {
				console.log("page1", data);
				return $dom([
					"html", [
						"head", [
							"title", data.val
						],
						"body", [
							"div.midNoise", [
								"div.container", [
									"div.row", [
										"div.span16", [
											"h1#pageTitle", [
												"span.big", "TalkSmash", "br",
												data.val2
											]
										]
									]
								]
							]
						]
					]
				]);
			},
			val: '<html><head><title>'+testData.val2+'</title></head><body><div class="midNoise"><div class="container"><div class="row"><div class="span16"><h1 id="pageTitle"><span class="big">TalkSmash</span><br'+ selfClosingEnd + testData.val3+'</h1></div></div></div></div></body></html>',
			val2: '<html><head><title>'+testData.val2+'</title></head><body><div class="midNoise"><div class="container"><div class="row"><div class="span16"><h1 id="pageTitle"><span class="big">TalkSmash</span><br'+ selfClosingEnd + testData.val3+'</h1></div></div></div></div></body></html>'
		}
//				,
//				page2: {
//					fn: function(data) {
//						$dom([
//							"meta", {charset: "utf-8"},
//							"<!-- HTML5 shim, for IE6-8 support of HTML elements -->",
//							"<!--[if lt IE 9]>",
//							$js("js/html5shiv.js"),
//							"<![endif]-->",
//
//							"link", {type: "text/css", rel: "stylesheet", href: "/bootstrap/bootstrap.min.css"},
//							"link", {type: "text/css", rel: "stylesheet", href: "/css/main.css"},
//
//							$js(function() {
//								var _gaq = _gaq || [];
//								_gaq.push(['_setAccount', 'UA-24315605-1']);
//								_gaq.push(['_trackPageview']);
//								(function() {
//									var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//									ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//									var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
//								})();
//							})
//						]);
//					}
//				},
//				val: '<meta charset="utf-8"'+ selfClosingEnd

	};



	$each(templateDoms, function(d, name) {

		console.log("-------------- new dom structure " + name + " -------------------");

		$part(name, d.fn);

		$doc.useRealDom(false);
		var dom0 = $parts(name, {val: testData.val2, val2: testData.val3})();
		var dom1 = $parts(name)({val: testData.val2, val2: testData.val3});
//				var dom01 = $parts(name, {val: testData.val3, val2: testData.val4})();
//				var dom11 = $parts(name)({val: testData.val3, val2: testData.val4});

		same(dom1.toString(), d.val, "outputStrings partial output with template data is good");
		same(dom0.toString(), d.val, "outputStrings partial output with predefined default data is good");

		$doc.useRealDom(true);
		var div = $el("div.holder");
		var dom2 = $parts(name)({val: testData.val2, val2: testData.val3});
		console.log("useRealDom = true", dom2);
		$each(dom2, function(val) {
			div.appendChild(val);
		});

		console.log(dom0, dom1, div.innerHTML, dom2);

		console.log(name, dom0.toString(), "--", dom1.toString());

		same(dom1.toString(), d.val, "outputStrings partial output with template data is good");
		same(dom0.toString(), d.val, "outputStrings partial output with predefined default data is good");
//				same(dom0.toString(), d.val, "outputStrings partial output with predefined default data being overridden is good");
//				same(dom1.toString(), d.val, "outputStrings partial output with template data is good");
		same(div.innerHTML, d.val, "partial output converted to string is good");
	});
});

