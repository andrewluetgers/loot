(function() {


	var parseId;

	function updateTree(syntax, syntax2) {

		if (window.tree) {
			window.tree.destroy();
			window.tree = null;
		}

		if (typeof syntax === 'undefined' && syntax2 === 'undefined') {
			return;
		}

		window.tree = new YAHOO.widget.TreeView("treeview");
		$id('collapse').onclick = function () { window.tree.collapseAll(); };
		$id('expand').onclick = function () { window.tree.expandAll(); };

		window.tree2 = new YAHOO.widget.TreeView("treeview2");
		$id('collapse2').onclick = function () { window.tree2.collapseAll(); };
		$id('expand2').onclick = function () { window.tree2.expandAll(); };



		function isArray(o) {
			return (typeof Array.isArray === 'function') ? Array.isArray(o) :
				Object.prototype.toString.apply(o) === '[object Array]';
		}

		function convert(name, node) {
			var result, i, key, value, child;

			switch (typeof node) {
			case 'string':
				return {
					type: 'Text',
					label: name + ': ' + node
				};

			case 'number':
			case 'boolean':
				return {
					type: 'Text',
					label: name + ': ' + String(node)
				};

			case 'object':
				if (!node) {
					return {
						type: 'Text',
						label: name + ': null'
					};
				}
				if (node instanceof RegExp) {
					return {
						type: 'Text',
						label: name + ': ' + node.toString()
					};
				}
				result = {
					type: 'Text',
					label: name,
					expanded: true,
					children: []
				};
				if (isArray(node)) {
					if (node.length === 2 && name === 'range') {
						result.label = name + ': [' + node[0] + ', ' + node[1] + ']';
					} else {
						result.label = result.label + ' [' + node.length + ']';
						for (i = 0; i < node.length; i += 1) {
							key = String(i);
							value = node[i];
							child = convert(key, value);
							if (isArray(child.children) && child.children.length === 1) {
								result.children.push(child.children[0]);
							} else {
								result.children.push(convert(key, value));
							}
						}
					}
				} else {
					if (typeof node.type !== 'undefined') {
						result.children.push({
							type: 'Text',
							label: node.type,
							expanded: true,
							children: []
						});
						for (key in node) {
							if (Object.prototype.hasOwnProperty.call(node, key)) {
								if (key !== 'type') {
									value = node[key];
									result.children[0].children.push(convert(key, value));
								}
							}
						}
					} else {
						for (key in node) {
							if (Object.prototype.hasOwnProperty.call(node, key)) {
								value = node[key];
								result.children.push(convert(key, value));
							}
						}
					}
				}
				return result;

			default:
				break;
			}

			return {
				type: 'Text',
				label: '?'
			};
		}

		if(syntax){
			tree.buildTreeFromObject(convert('Program body', syntax.body));
			tree.render();
			tree.subscribe("focusChanged", sourceTreeNodeHilightHandler);
		}


		if(syntax2){
			tree2.buildTreeFromObject(convert('Program body', syntax2.body));
			tree2.render();
//		tree2.subscribe("clickEvent", sourceTreeNodeClickHandler);
		}


		// json views

//		$("#json1").html(JSON.stringify(syntax.body, null, 4));
//		$("#json2").html(JSON.stringify(syntax2.body, null, 4));
	}

	var hilight;

	function sourceTreeNodeHilightHandler(e) {
		console.log(e.newNode);
		window.n = e.newNode;
		nc = null;

		if (hilight && hilight.clear) {
			hilight.clear();
		}

		if (n.children && (nc = n.children[n.children.length - 1]) && nc.label == "loc") {
			var start = nc.children[0];
			var end = nc.children[1];
			var startSel = {line: parseInt(start.children[0].label.split(" ")[1])-1, ch: parseInt(start.children[1].label.split(" ")[1])};
			var endSel = {line: parseInt(end.children[0].label.split(" ")[1])-1, ch: parseInt(end.children[1].label.split(" ")[1])};
			console.log("loc", nc, startSel, endSel);
			hilight = editor.markText(startSel, endSel, "hilight");
		} else {
			console.log("clickEvent", n, arguments);
		}
	}

	window.logAST = true;

	function sourceRewrite() {
		'use strict';

		var code, syntax, indent, code2, options, afterMacroExpandSyntax;

		function setText(id, str) {
			var el = document.getElementById(id);
			if (typeof el.innerText === 'string') {
				el.innerText = str;
			} else {
				el.textContent = str;
			}
		}

		setText('error', '');
		if (typeof window.editor !== 'undefined') {
			// Using CodeMirror.
			code = window.editor.getValue();
		} else {
			// Plain textarea, likely in a situation where CodeMirror does not work.
			code = document.getElementById('code').value;
		}

		indent = '';
		if (document.getElementById('onetab').checked) {
			indent = '\t';
		} else if (document.getElementById('twospaces').checked) {
			indent = '  ';
		} else if (document.getElementById('fourspaces').checked) {
			indent = '    ';
		}

		options = {
			comment: document.getElementById('comment').checked,
			raw: document.getElementById('raw').checked,
			range: false,
			loc: false
		};

		try{
			syntax = window.esprima.parse(code, options);
			code2 = window.editor2.getValue();
			var process = eval(code2);
			var newSyntax = process(syntax);
			
			if (logAST) {
				console.log("original AST", JSON.stringify(syntax), syntax);
				console.log("generated AST", JSON.stringify(newSyntax), newSyntax);
				console.log("to disable logging: window.logAST = false");
			}
			code = window.escodegen.generate(newSyntax, { indent: indent });
		}catch(e){
			//swallow if first attempt fails
		}

		try{ //regardless of status of first attempt, try with macros expanded
			afterMacroExpandSyntax = window.esprima.parse( window.editor4.getValue() + code, options);
			updateTree(syntax, afterMacroExpandSyntax);
		}catch(e){ //no can do, display error
			setText('error', e.toString());
		}finally {
			code = window.escodegen.generate(afterMacroExpandSyntax, { indent: indent });
			window.editor3.setValue(code);
		}


	//		(function () {
				console.log(eval(code), code);
	//		}())
	}


	function parse(source, result, process, depth) {
		var key, sourceProp, resultProp, processed;

		if ($isString(source) || $isBoolean(source) || $isNumber(source)) {
			throw new Error("parse source must be an object or array");
		}

		if (target && ($isString(source) || $isBoolean(source) || $isNumber(source))) {
			throw new Error("result target must be an object or array");
		}

		process = $isFunction(process) ? process : false;

		depth = depth || 0;

		for (key in source) {
			// skip this property if filter returns false
			if (process) {
				processed = process(key, source, result);
				if (processed === undefined) {
					continue;
				} else {
					sourceProp = processed;
				}
			} else {
				sourceProp = source[key];
			}

			// Prevent infinite loop
			if (sourceProp === result) {
				continue;
			}

			if (typeof sourceProp === "object" && !$isNull(sourceProp)) {
				resultProp = $isArray(sourceProp) ? [] : {};
				result[key] = parse(sourceProp, resultProp, filter, depth+1);
			} else {
				result[key] = sourceProp;
			}
		}

		return result;
	}


//	function traverse(state) {
//		var queue = [],
//			next = state;
//
//		while (next) {
//			if (typeof sourceProp === "object" && !$isNull(sourceProp)) {
//				$each(next.possibleMoves, function(i, possibleMove) {
//					queue.push(possibleMove);
//				});
//			}
//			next = queue.shift();
//		}
//	}

	// yes these are not generic, abstracted tabs, so shoot me
	function initTabs() {
		$(".tabs a").click(function() {
			var active = this.parentNode.className;
			refreshEditor(active);
			this.parentNode.parentNode.parentNode.className = "layout "+active;
			return false;
		});
	}

	function refreshEditor(id) {
		setTimeout(function() {
			switch (id) {
				case "src":
					editor.refresh();
					break;
				case "mod":
					editor2.refresh();
					break;
				case "sweetmod":
					editor4.refresh();
					break;
				case "gen":
					editor3.refresh();
					break;
			}
		}, 100);
	}

	function initEditors() {
		try {
			window.checkEnv();

			window.editor = CodeMirror.fromTextArea($id("code"), {
				lineNumbers: true,
				matchBrackets: true,
				onChange: function() {
					console.log("rewrite");
					sourceRewrite();
				}
			});

			window.editor2 = CodeMirror.fromTextArea($id("code2"), {
				lineNumbers: true,
				matchBrackets: true,
				onChange: function() {
					console.log("rewrite");
					sourceRewrite();
				}
			});

			window.editor4 = CodeMirror.fromTextArea($id("code3"), {
				lineNumbers: true,
				matchBrackets: true,
				onChange: function() {
					console.log("rewrite");
					sourceRewrite();
				}
			});

			window.editor3 = CodeMirror.fromTextArea($id("result"), {
				lineNumbers: true,
				matchBrackets: true
			});




		} catch (e) {
			// CodeMirror failed to initialize, possible in e.g. old IE.
			$id('codemirror').innerHTML = '';
		}
	}

	// main init;
	$(function() {
		initTabs();
		initEditors();
		sourceRewrite();
	});

}());
