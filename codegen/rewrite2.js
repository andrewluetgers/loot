/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

	* Redistributions of source code must retain the above copyright
	  notice, this list of conditions and the following disclaimer.
	* Redistributions in binary form must reproduce the above copyright
	  notice, this list of conditions and the following disclaimer in the
	  documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint browser:true evil:true */

function sourceRewrite() {
	'use strict';

	var code, syntax, indent, code2, options;

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
		range: document.getElementById('range').checked,
		loc: document.getElementById('loc').checked
	};

	try {
		syntax = window.esprima.parse(code, options);

		code2 = window.editor2.getValue();

		var process = eval(code2);

		var newSyntax = process(syntax);

		updateTree(syntax, newSyntax);

		console.log(JSON.stringify(syntax), syntax);
		console.log(JSON.stringify(newSyntax), newSyntax);
		code = window.escodegen.generate(newSyntax, { indent: indent });

//		(function () {
			console.log(eval(code), dom, code);
//		}())

	} catch (e) {
		setText('error', e.toString());
	} finally {
		window.editor3.setValue(code);
	}
}

	/**
	 * serves as a utility method for $copy and $merge
	 * @param source (object) the object to copy properties from
	 * @param target (object) optional object to merge source's properties into
	 * @param filter (function) optional function(key, source, target) { return boolean; }
	 * the filter function returns true if a property should be copied and false if it should be ignored
	 * filter can also be provided as the last of two arguments when omitting a target
	 * filter example: to deep copy only owned properties from objA to objB
	 * 	$copy(objA, objB, function(key, source) {
	 * 		return source.hasOwnProperty(key);
	 * 	});
	 */
//
//if ($isString(source) || $isBoolean(source) || $isNumber(source)) {
//	throw new Error("copy source must be an object");
//}
//
//if (target && ($isString(source) || $isBoolean(source) || $isNumber(source))) {
//	throw new Error("optional copy target must be an object");
//}
//
//// support (source, filter) signature
//if (arguments.length === 2 && $isFunction(target)) {
//	filter = target;
//	target = {};
//} else {
//	filter = ($isFunction(filter)) ? filter : false;
//	target = target || {};
//}

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


function traverse(state) {
	var queue = [],
		next = state;

	while (next) {
		if (typeof sourceProp === "object" && !$isNull(sourceProp)) {
			$each(next.possibleMoves, function(i, possibleMove) {
				queue.push(possibleMove);
			});
		}
		next = queue.shift();
	}
}


function parse(obj, process) {

	var result, key, sourceProp, resultProp, processed, type,
		depth = -1,
		current,
		root = {root: obj};

	var resultType = $typeOf(root);

	if (resultType == "array") {
		result = [];
	} else if (resultType !== "object") {
		result = {};
	} else {
		throw new Error("root must be an object or array");
	}

	var next = [{
		key: "root",
		parent: root,
		target: result
	}];

	process = $isFunciton(process) ? process : function(val) { return val;};

	while (current = next.shift()) {
		depth++;
		for (key in current.parent[root]) {

			// skip this property if filter returns undefined
			processed = process(key, current, result);
			if (processed === undefined) {
				continue;
			} else {
				sourceProp = processed;
			}

			// Prevent infinite loop
			if (sourceProp === result || sourceProp === root || sourceProp === current) {
				continue;
			}

			type = $typeof(sourceProp);

			if (type === "array" || type === "object") {
				result[key] = (type == "array") ? [] : {};
				next.push({
					key: key,
					parent: current,
					target: result[key]
				});
			} else {
				result[key] = sourceProp;
			}
		}
	}

	return result;
}


// todo: paternmatchers, rewrite rules,
// todo: node methods, getSiblings, getChildren, getParent
//
