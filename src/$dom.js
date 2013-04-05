/**
 * $dom.js
 * @require loot
 */

(function() {

	var root = this;

	// dom -------------------------------------------------------
	function $id(id) {
		return document.getElementById(id);
	}

	// $tmpl -------------------------------------------------------
	// just aliasing doT.js
	// 2011, Laura Doktorova
	// https://github.com/olado/doT
	//
	// doT.js is an open source component of http://bebedo.com
	//
	// doT is a custom blend of templating functions from jQote2.js
	// (jQuery plugin) by aefxx (http://aefxx.com/jquery-plugins/jqote2/)
	// and underscore.js (http://documentcloud.github.com/underscore/)
	// plus extensions.
	//
	// Licensed under the MIT license.
	//
	var $tmpl = (function() {

		var doT = { version : '0.1.7' };

		doT.templateSettings = {
			evaluate: 			/\{\{([\s\S]+?)\}\}/g,
			interpolate: 		/\{\{=([\s\S]+?)\}\}/g,
			encode: 			/\{\{!([\s\S]+?)\}\}/g,
			use: 				/\{\{#([\s\S]+?)\}\}/g, //compile time evaluation
			define: 			/\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g, //compile time defs
			conditionalStart: 	/\{\{\?([\s\S]+?)\}\}/g,
			conditionalEnd: 	/\{\{\?\}\}/g,
			varname: 'it',
			strip : true,
			append: true
		};

		function resolveDefs(c, block, def) {
			return ((typeof block === 'string') ? block : block.toString())
				.replace(c.define, function (match, code, assign, value) {
					if (code.indexOf('def.') === 0) {
						code = code.substring(4);
					}
					if (!(code in def)) {
						if (assign === ':') {
							def[code]= value;
						} else {
							eval("def[code]=" + value);
						}
					}
					return '';
				})
				.replace(c.use, function(match, code) {
					var v = eval(code);
					return v ? resolveDefs(c, v, def) : v;
				});
		}

		// todo jsperf with and without regex caching
		doT.template = function(tmpl, c, def) {
			c = c || doT.templateSettings;
			var cstart = c.append ? "'+(" : "';out+=(", // optimal choice depends on platform/size of templates
				cend  = c.append ? ")+'" : ");out+='";
			var str = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

			str = ("var out='" +
				((c.strip) ? str.replace(/\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]|(\/\*[\s\S]*?\*\/)/g, ''): str)
					.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.interpolate, function(match, code) {
						return cstart + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + cend;
					})
					.replace(c.encode, function(match, code) {
						return cstart + code.replace(/\\'/g, "'").replace(/\\\\/g, "\\").replace(/[\r\t\n]/g, ' ') + ")" +
							".toString().replace(/&(?!\\w+;)/g, '&#38;').split('<').join('&#60;').split('>')" +
							".join('&#62;').split('" + '"' + "').join('&#34;').split(" + '"' + "'" + '"' + ")" +
							".join('&#39;').split('/').join('&#47;'" + cend;
					})
					.replace(c.conditionalEnd, function(match, expression) {
						return "';}out+='";
					})
					.replace(c.conditionalStart, function(match, expression) {
						var code = "if(" + expression + "){";
						return "';" + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + "out+='";
					})
					.replace(c.evaluate, function(match, code) {
						return "';" + code.replace(/\\'/g, "'").replace(/\\\\/g,"\\").replace(/[\r\t\n]/g, ' ') + "out+='";
					})
				+ "';return out;")
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '\\t')
				.replace(/\r/g, '\\r')
				.split("out+='';").join('')
				.split("var out='';out+=").join('var out=');

			try {
				return new Function(c.varname, str);
			} catch (e) {
				if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
				throw e;
			}
		};

		doT.compile = function(tmpl, def) {
			return doT.template(tmpl, null, def);
		};

		return doT;
	}());



	// hyper-simplistic dom node api for html string building, used by $el for outputStrings mode
	// EXPOSED FOR TESTING ONLY, DON'T USE THIS DIRECTLY, DOES NOT ESCAPE HTML IN STRINGS
	var selfClosing = {area:1, base:1, basefont:1, br:1, col:1, frame:1, hr:1, img:1, input:1, link:1, meta:1, param:1};
	var directProperties = {className:'class', htmlFor:'for'};
	var booleanProperties = {checked: 1, defaultChecked: 1, disabled: 1, multiple: 1, selected: 1};

	var $node = (function() {

		var lt  = "<",  gt  = ">",
			lts = "</", gts = "/>" ,
			space = " ", equo = '="',
			quo = '"';

		// usage of trailing slash on self closing tags varies so mimic the platform
		// this is mostly to help write passing tests
		var selfClosingEnd = gts;
		if ("document" in root) {
			var div = document.createElement("div");
			var img = document.createElement("img");
			div.appendChild(img);
			if (div.innerHTML === "<img>") {
				selfClosingEnd = gt;
			}
		}

		// children toString should not include commas
		var childrenToString = function(node) {
			var str = "";
			$each(node, function(val) {
				if (val || val === 0) {
	//					str += $isString(val) ? $escapeHTML(val) : val;
					str += val;
				}
			});
			return str;
		};

		var node = {
			init: function() {
				this.type = "";
				this.attr = {};
				this.children = [];
				this.children.toString = function() {
					return childrenToString(this);
				}
			},
			nodeType: 1, // so we can pass the $isElement test
			append: function(nodes) {
				// no we don't do validation here, so sue me
				// this will handle a single node or an array of nodes or a mixed array of nodes and arrays of nodes
				this.children.splice.apply(this.children, $flat(this.children.length, 0, nodes));
				return this;
			},
			set: function(key, value) {
				if (key) {
					if (!$isString(key)) {
						var spec = key;
						that = this;
						// assume key is a hash of key value pairs to be added in to existing attr hash
						if (spec.id) {
							this.set("id", spec.id);
							delete spec.id;
						}

						if (spec.className) {
							this.set("className", spec["className"]);
							delete spec["className"];
						}

						$each(spec, function(val, theKey) {
							that.set(theKey, val);
						});

					} else {
						// simple key value assignment
						if (value) {
							// add/edit attribute
							// support alternate attribute names
							key = directProperties[key] || key;
							if (booleanProperties[key]) {
								if (value) {
									value = key;
								} else {
									delete this.attr[key];
								}
							}
							this.attr[key] = value;
						} else {
							// remove the attribute
							delete this.attr[key];
						}
					}
				}
				return this;
			},

			toString: function() {
				// DONT CONSOLE.log "this" in here or do anything that will call toString on this
				// it will create an infinite loop of tostring calling tostring in firefox, others??
				var str = lt + this.type;
				$each(this.attr, function(val, key) {
					if (val) {
						str += space + key + equo + val + quo;
					}
				});

				if (selfClosing[this.type]) {
					return str + selfClosingEnd;
				} else {
					return str + gt + this.children + lts + this.type + gt;
				}
			}
		};



		// for compatibility with $el dom builder in outputStrings mode
		node.appendChild = node.append;
		node.removeAttribute = node.setAttribute = node.set;

		return function(type) {
			// use new to reduce memory footprint for many nodes
			var n = $new(node);
			n.type = type || "div";
			return n;
		};

	}());

	// for compatibility with $el dom builder in outputStrings mode
	var useDocument = root.document,
		emptyString = "";

	// create nodes in real DOM or microDom from one api
	var $doc = {
		hasRealDom: function() {
			return !!root.document;
		},
		usesRealDom: function() {
			return useDocument;
		},
		useRealDom: function(bool) {
			useDocument = root.document ? bool : false;
			return useDocument;
		},
		createTextNode: function(str) {
			if (useDocument) {
				return document.createTextNode(str);
			} else {
	//				return $escapeHTML(str + emptyString);
				return str + emptyString;
			}
		},
		createElement: function(tag) {
			if (useDocument) {
				return document.createElement(tag);
			} else {
				return $node(tag);
			}
		}
	};

	var $el = (function() {
		// dom builder see: http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
		// modified to support dom node output or string output, for server land
		var root = this;

		var directProperties = {
			'class': 		'className',
			className: 		'className',
			defaultValue: 	'defaultValue',
			'for': 			'htmlFor',
	//			html: 			'innerHTML', // these work on real dom but not on fakeDom
	//			innerHTML: 		'innerHTML',
	//			text: 			'textContent',
	//			textContent: 	'textContent',
			value: 			'value'
		};

		var booleanProperties = {
			checked: 1,
			defaultChecked: 1,
			disabled: 1,
			multiple: 1,
			selected: 1,
			autoplay: 1,
			controls: 1,
			loop: 1
		};

		var eStr = "", zero = 0;;
		function setProperty(node, key, value) {
			var directProp = directProperties[key];
			var noValue = (!value && value !== zero);
			if (directProp && !noValue) {
				node[directProp] = (noValue ? eStr : eStr + value);
			} else if (booleanProperties[key]) {
				// set the attribute if true or do not add it at all
				if (value) {
					node.setAttribute(key, key);
				}
			} else if (noValue) {
				node.removeAttribute(key);
			} else {
				node.setAttribute(key, eStr + value);
			}
		}

		var pop = "pop";
		function appendChildren(node, children) {
			if (!$isArray(children)) {
				children = [children];
			}
			$each(children, function(child) {
				appendChild(node, child);
			});
		}

		if (root.document) {
			var d = document.createElement("div");
		}
		function appendChild(node, child) {
			if (child || child === 0) {
				if (child && child.pop) {
					appendChildren(node, child);
				} else {
					if (!(child && child.nodeType === 1)) {
						// handle other node types here
						// this causes lots of garbage collections
						d.innerHTML = child; // this causes lots of parse html events
						$each(d.childNodes, function(val) {
							node.appendChild(val);
						});
					} else {
						node.appendChild(child);
					}
				}
			}
		}

	//		function appendChildren(node, children) {
	//			if (!$isArray(children)) {
	//				children = [children];
	//			}
	//			$each(children, function(child, key) {
	//				if (child || child === 0) {
	//					if ($isArray(child)) {
	//						appendChildren(node, child);
	//					} else {
	//						if (!$isElement(child)) {
	//							// handle other node types here
	//							var d = document.createElement("div");
	//							d.innerHTML = child;
	//							$each(d.childNodes, function(val) {
	//								node.appendChild(val);
	//							});
	//
	//						} else {
	//							node.appendChild(child);
	//						}
	//					}
	//				}
	//			});
	//		}

		var splitter = /(#|\.)/;
		function create(selector, props, children) {

			// this function is currently ugly and repeats code from elsewhere but
			// it is also the fastest I have been able to achieve by 30-100%
			if (!selector) {
				throw new Error("selector required");
			}

			var outProps,
				parts, name, len, node, i, j, l,
				tag, id, className;

			// support (selector, children) signature'
			// support (tag, children) signature
			if (props && (props.charAt || props.pop)) {
				children = props;
				props = {};
			}

			// parse the selector and merge props
			parts = selector.split(splitter);
			tag = parts[0];
			len = parts.length;

			if (len > 2) {

				outProps = {};
				for (i=1, j=2, l=len; j<l; i+=2, j+=2) {
					name = parts[j];
					if (parts[i] === '#') {
						id = name;
					} else {
						className = className ? (className + " " + name) : name;
					}
				}

				if (id || className) {
					// properties from selector override or append to those in props
					if (props) 		{$mixin(outProps, props)}
					if (id) 		{outProps.id = id;}
					if (className) 	{outProps.className = (props && props.className) ? (className + " " + props.className) : className;} // append multiple classes
					props = outProps;
				}
			}

			id = className = null;

			tag = tag || "div";

			// create the node
			node = $doc.createElement(tag);
			if (!useDocument) {
				props && node.set(props);
				children && node.append(children);

			} else {
				if (props) {
					props.id && setProperty(node, "id", props.id);
					props.className && setProperty(node, "class", props.className);
					$each(props, function(val, key) {
						setProperty(node, key, val);
					});
				}
				children && appendChildren(node, children);
			}
			return node;
		}

		return create;
	}());


	var $isSelector = (function() {
		var maxLength = 0,
			tags = {},
			splitter = /(#|\.)/,
			whitespace = /\s+/,
			validTags = "a abbr acronym address applet area article aside audio b base basefont bdi bdo big\
							blockquote body br button canvas caption center cite code col colgroup command datalist\
							dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer\
							form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins keygen kbd\
							label legend li link map mark menu meta meter nav noframes noscript object ol optgroup\
							option output p param pre progress q rp rt ruby s samp script section select small source\
							span strike strong style sub summary sup table tbody td textarea tfoot th thead time title\
							tr track tt u ul var video wbr";
		// tags list derived from http://www.w3schools.com/html5/html5_reference.asp

		$each(validTags.split(whitespace), function(str) {
			maxLength = Math.max(maxLength, str.length);
			tags[str] = 1;
		});

		// its not perfect but should get the job done
		function $isSelector(string) {

			if (string && !string.charAt) {
				return false;
			}

			if (string.safe) {
				return false;
			}

			// spaces are not valid in selectors, must be content, this should cover 90% of content
			// a common case for content is innerHTML with tags so test for that if no space
			if ((string.indexOf(" ") > -1) || (string.indexOf("<") > -1)) {
				return false;
			}

			var parts = string.split(splitter),
				tag = parts[0].toLowerCase();

			// is it longer than any of the valid tags or is it not a valid tag?
			if ((tag.length > maxLength) || !(tag in tags)) {
				return false;
			}

			var partsLen = parts.length,
				id = "", className = "",
				i, j, l, name, type;

			if (partsLen > 2) {
				for (i=1, j=2, l=partsLen; j<l; i+=2, j+=2) {
					name = parts[j];
					type = parts[i];
					if (type === "#") {
						id = name;
					} else {
						className = className ? className + " " + name : name;
					}
				}
			}

			return {
				tag: tag,
				id: id,
				className: className
			};
		}

		$isSelector.addTag = function(str) {
			maxLength = Math.max(maxLength, str.length);
			tags[str] = one;
		};

		return $isSelector;
	}());

	/* $dom
	 dom instructions
	 array == generic container for dom instructions
	 object == attributes
	 string == dom selector or innerHTML

	 dom instruction patterns:

	 [selector (String)]
	 selectors begin with an html tag name optionally followed by #someId and zero or more .someClass
	 a selector can be followed by any instruction another selector, an object, an array, innerHTML string

	 [selector (String), innerHTML (String)]
	 any string that does not look like a selector is treated as innerHTML,
	 if your strings will look like a selector you can add non selector characters like so...
	 invalid as innerHTML: "strong", "menu", "footer"
	 valid as innerHTML: "<span>strong</span>", "menu "
	 innerHTML can only be followed by a selector string

	 [selector (String), children (Array)]
	 an array can only be followed by a selector string

	 [selector (String), attributes (Object)]
	 attributes eg. {title: "my title", value: 2}
	 an object can be followed by an array or a string (selector or innerHTML)

	 [selector (String), attributes (Object), children (Array)]

	 eg.

	 var dom = [
	 "div", {className: "todo " + data.done ? "done" : ""},[
	 "div.display", [
	 "input.check", {type: "checkbox", checked: data.done},
	 "label.todo-content", data.content,
	 "span.todo-destroy"
	 ],

	 "div.edit", [
	 "input.todo-input", {type: "text", value: data.content}
	 ],
	 "ul", $map(data.items, $value)
	 ];
	 */

	var $dom = (function() {

		function $dom(domInstructions, preProcessedSelector) {

			if (!domInstructions || !domInstructions.pop) {
				domInstructions = $slice(arguments);
				preProcessedSelector = null;
			}

			var returnNodes = [],
				tag, attributes, childNodes,
				selector, arg, type,
				id, className, step = 1, prevStep, thisStep,
				i, len = domInstructions.length;

			for (i=0; i<len; i++) {
				arg = domInstructions[i];

				prevStep = thisStep;
				thisStep = step + "-" + $typeof(arg);

//				console.log(thisStep, arg);

				switch(thisStep) {

					// new sibling node via selector or new sibling text -------------------------------------------
					case "1-string":
						selector = preProcessedSelector || $isSelector(arg);
						if (selector) {
							tag = selector.tag;
							id = selector.id;
							className = selector.className;
							selector = preProcessedSelector = null;
							attributes = {};
							id && (attributes.id = id);
							className && (attributes.className = className);

							// create node with attributes now if final iteration
							if (i === len-1) {
								returnNodes.push($el(tag, attributes));
							}

							// we may have properties or children to add so move to step 2 for next arg
							step = 2;

						} else {
							returnNodes.push(arg);
	//						console.log("++++++++++++++++++++++", arg);
							// stay on step 1 for next arg
						}
						break;

					case "1-element":
						returnNodes.push(arg);
						// stay on step one for next arg
						break;

					// new sibling node/s via partial --------------------------------------------------------------
					case "1-function":
						// todo use object expansion here to allow more return types
						returnNodes = returnNodes.concat(arg());
						// stay on step one for next arg
						break;

					// array unwrapping kinda like macro expansion  -----------------------------------------------------------------------
					case "1-array":
						//replace array with its contents and re-run the step
						len += arg.length-1;
						domInstructions.splice.apply(domInstructions, [i, 1].concat(arg));
//						console.log("expand array", domInstructions);
						i--;
						// stay on step one for next arg
						break;

//					case "1-object":
//						//replace object with array of its contents and re-run the step
//						childNodes = $dom(arg);
//						domInstructions.splice.apply(domInstructions, [i, 1].concat(childNodes));
//						console.log("expand object", domInstructions);
//						i--;
//						// stay on step one for next arg
//						break;

					// add/merge attributes ------------------------------------------------------------------------
					case "2-object":
						// grab the first value out of the object to test if it is not actually children
						var _val;
						$each(arg, function(val) {
							_val = val;
							return "break";
						});

						// oop! looks like we actually want to treat the object as children here
						if (_val && (_val.pop || $isSelector(_val))) {
//							console.log("object as children", domInstructions);
							// final possible step so start back on 1 for next arg
							// this is where we do recursion, see also 2-array
							childNodes = $dom($values(arg));
							// and push the result back into the final output
							returnNodes.push($el(tag, attributes, childNodes));
							step = 1;
							break;
						}

						$each(arg, function(val, key) {
							attributes[key] = val;
						});

						id && (attributes.id = id);
						if (className) {
							attributes.className = arg.className ? (className + " " + arg.className) : className;  // remember we appended a space in $isSelector
						}
						// create node with attributes now if final iteration
						if (i === len-1) {
							returnNodes.push($el(tag, attributes));
						}

						id = className = null;

						// we may have a children to add so move to step 3 for next arg
						step = 3;
						break;

					// next sibling node via selector or child string ------------------------------------------------------------------
					case "2-number":
					case "3-number":
						arg += ""; // convert to string and fall through to next block
					case "2-string":
					case "3-string":
					case "3-element":
						selector = preProcessedSelector || $isSelector(arg);

						// starting a new object
						if (selector || selfClosing[tag]) {
							// finish the previous object
							returnNodes.push($el(tag, attributes));

							// about to start over on step 1 lets save some work,
							// no need to parse the selector string again
							preProcessedSelector = selector;
							i--; // iterate over this arg again

							// child text
						} else {
							//create node with child text
							returnNodes.push($el(tag, attributes, arg));
						}

						// both cases are final possible step so start back on 1 for next arg
						step = 1;
						break;

					// recursive child array -----------------------------------------------------------------------
					case "2-array":
					case "3-array":
						if (selfClosing[tag]) {
							throw new Error("Can not add children to " + tag);
						}
						// this is where we do our recursion, see also 2-object
						childNodes = $dom(arg);
						// and push the result back into the final output
						returnNodes.push($el(tag, attributes, childNodes));
						// final possible step so start back on 1 for next arg
						step = 1;
						break;

					case "3-function":
						// no children so done, functions in third position are treated as siblings
						// function will get handled in step 1 after we finish up here
						// to produce children functions can be wrapped in an array
						returnNodes.push($el(tag, attributes));
						returnNodes = returnNodes.concat(arg());
						// final possible step so start back on 1 for next arg
						step = 1;
						break;

					default:
						var errMsg = "$dom: No such step + type combination: " + thisStep + " - previous was " + prevStep + ", " + arg;
						console.log(errMsg, arg, returnNodes);
						throw new TypeError(errMsg);
				}

			}

			childNodes = attributes = null;

			// we do this down here bc for function types we do a concat which overwrites returnNodes
			returnNodes.toString = function() {
				return this.join('');
			};
			return returnNodes;
		}

		return $dom;

	}());

	var parts = {};

	/**
	 *
	 * @param name			string,
	 * @param arg			function or object
	 * @description this function serves as a constructor, getter, setter and collection interface to partials
	 * there are multiple signatures and a plural alias that makes more sense depending on what you want to do
	 * $part("name", function(data){...}) returns the provided function, saves the function under the given name so that it can be used via the following signatures
	 * $parts() returns and object that contains all the partials by name
	 * $parts("myPartial") returns a partial function(data) which if called returns a minidom
	 * $parts("myPartial", dataObject)
	 */
	function $part(name, arg) {
		if (arguments.length === 0) {
			return parts;							// get all
		} else if (!$isString(name)) {
			throw new TypeError("Expected string for name but saw " + $typeof(name));
		}

		if (name in parts) {
			if (!arg) {
				return parts[name];					// get

			} else if ($isFunction(arg)) {
				return parts[name] = arg;			// update

			} else {
				return function(data) {				// get instance with predefined default data object (great for nesting partials)
					return parts[name](data || arg);
				}
			}

		} else if ($isFunction(arg)) {
			return parts[name] = arg;				// set

		} else {
			throw new Error("No such partial '"+name+"', expected a function but saw " + $typeof(arg));
		}
	}

	$part.drop = function(name) {
		delete parts[name];
	};

	$part.dropAll = function(name) {
		parts = {};
	};

	// plural alias nice for collection methods
	var $parts = $part;

	function $render(name, data) {
		return $parts(name)(data).toString();
	}

	// script helper for $part, $dom
	var jsre = /^http|^\/|^\.|\.js$/i;
	function $js(script) {
		var val, attrs = {type: "text/javascript"};

		if ($isFunction(script)) {
			var scriptStr = script.toString();
			scriptStr = scriptStr.substring(scriptStr.indexOf("{") + 1, scriptStr.lastIndexOf("}"));
			val = $el("script", attrs, scriptStr);
			console.log("----------", val, scriptStr);
		} else if ($isString(script)) {
			if (script.match(jsre)) {
				attrs.src = script;
				val = $el("script", attrs);
			} else {
				val = $el("script", attrs, script);
			}
		} else if ($isPlainObject(script)) {
			val = $el("script", $mixin(attrs, script));
		}

		return val;
	}

	// escapeHTML -------------------------------------------------------
	// from backbone.js
	var $escapeHTML = (function() {

		// create the regexes and strings only once
		var amp = 		/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, ampStr = '&amp;',
			lt = 		/</g, ltStr = '&lt;',
			gt = 		/>/g, gtStr = '&gt;',
			quot = 		/"/g, quotStr = '&quot;',
			squot = 	/'/g, squotStr = '&#x27;',
			fslash = 	/\//g, fslashStr = '&#x2F;';

		// the escape function
		return function(string) {
			if (typeof string == "string") {
				string = new String(string.replace(amp, ampStr).replace(lt, ltStr).replace(gt, gtStr).replace(quot, quotStr).replace(squot, squotStr)); //.replace(fslash, fslashStr);
				string.safe = true;
			}
			return string;
		};
	}());


	// modified from backbone.js
	// Set callbacks, where `this.callbacks` is a hash of
	//
	// *{"event selector": "callback"}*
	//
	//   {
	//    'mousedown .title': 'edit',
	//    'click .button':   'save'
	//   }
	//
	// pairs. Callbacks will be bound to the view, with `this` set properly.
	// Uses event delegation for efficiency.
	// Omitting the selector binds the event to `this.el`.
	// This only works for delegate-able events: not `focus`, `blur`, and
	// not `change`, `submit`, and `reset` in Internet Explorer.
	//view.delegateEvents = function(events) {

	var $bindEventSpec = (function() {
		// from backbone.js
		// Cached regex to split keys for `delegate`.
		var eventSplitter = /^(\S+)\s*(.*)$/;

		return function(context) {

			var node, events, id;

			if (arguments.length == 3) {
				node = arguments[0];
				events = arguments[1];
				context = arguments[2];
			} else {
				node = context.node;
				events = context.events;
			}

			id = context.id || "";

			if (!$isElement(node) || !events) {
				console.log(node, events, context);
				throw new Error("invalid arguments");
			}

			$(node).unbind('.delegateEvents' + id);

			$each(events, function(val, key) {
				var match = key.match(eventSplitter),
					eventName = match[1] + '.delegateEvents' + id,
					selector = match[2],
					fn = $isFunction(val) ? val : context[val],
					cb;

				if ($isFunction(fn)) {
					cb = function(e) {fn.call(this, e, context);};

					if (selector === '') {
						$(node).bind(eventName, cb);
					} else {
						$(node).on(eventName, selector, cb);
					}
				} else {
					console.log(fn, val, key);
					throw new Error("No such callback " + val);
				}
			});
		};
	}());



	function touchToMouse(event) {
		if (event.touches.length > 1) return; //allow default multi-touch gestures to work
		var touch = event.changedTouches[0];
		var type = "";

		switch (event.type) {
			case "touchstart":	type = "mousedown";	break;
			case "touchmove":	type = "mousemove";	break;
			case "touchend":	type = "mouseup";	break;
			default:			return;
		}

		// https://developer.mozilla.org/en/DOM/event.initMouseEvent for API
		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
			touch.screenX, touch.screenY,
			touch.clientX, touch.clientY, false,
			false, false, false, 0, null);

		touch.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	};

	function $touchable(el) {
		el.ontouchstart = touchToMouse;
		el.ontouchmove = touchToMouse;
		el.ontouchend = touchToMouse;
	};




	loot.extend({
		$id: $id,
		$tmpl: $tmpl,
		$node: $node,
		$doc: $doc,
		$el: $el,
		$isSelector: $isSelector,
		$dom: $dom,
		$part: $part,
		$js: $js,
		$script: $js,
		$parts: $parts,
		$render: $render,
		$escapeHTML: $escapeHTML,
		$bindEventSpec: $bindEventSpec,
		$touchable: $touchable
	});

}());