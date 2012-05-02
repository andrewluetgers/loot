(function() {
	// define the model schema
	$define("todo", {
		defaults: {
			content: "Nothing todo? Double-click to edit me.",
			done: false
		},
		// an example helper function
		toggle: function() {
			this.set({done: !this.get("done")});
		}
	});

	// define our view
	$view("todoItem", {
		node: "li",		// accepts nodes or selector string as first arg to $el()
		model: "todo", 	// the type of model we will be using

		// render functions return an html string or a dom node
		render: function(data, changes, view) {

			var el = $dom([
				"div", {className: "todo" + data.done ? " done" : ""}, [
					"div.display", [
						"input.check", {type: "checkbox", checked: data.done},
						"label.todo-content", data.content,
						"span.todo-destroy"
					],
					"div.edit", [
						"input.todo-input", {type: "text", value: data.content}
					]
				]
			]);

			this.input = $('.todo-input', el);
			console.log(this.input, el);
			return el;
		},

		// event delegation setup for each item
		events: {
			"click .check": 				"toggleDone",
			"dblclick label.todo-content": 	"edit",
			"click span.todo-destroy": 		"drop",
			"keypress .todo-input": 		"updateOnEnter",
			"blur .todo-input": 			"close"
		},

		toggleDone: function() {
			this.model.toggle();
		},
		edit: function() {
			$(this.node).addClass("editing");
			this.input.focus();
		},
		drop: function() {
			// in this case removing the view == deleting item from the database
			this.model.drop();
		},
		updateOnEnter: function(e) {
			if (e.keyCode == 13) this.close();
		},
		close: function() {
			this.model.set({content: this.input.val()});
			$(this.node).removeClass("editing");
		}
	});


	$view("todoApp", {
		// this view renders to an existing dom node
		node: $("#todoapp"),

		init: function() {
			this.input = $("#new-todo");
			this.allCheckbox = $(".mark-all-done")[0];

		},

		render: function() {
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			this.$('#todo-stats').html(this.statsTemplate({
				total: 		Todos.length,
				done: 		done,
				remaining: 	remaining
			}));

			this.allCheckbox.checked = !remaining;
		},

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			"keypress #new-todo": 	"createOnEnter",
			"keyup #new-todo": 		"showTooltip",
			"click .todo-clear a":  "clearCompleted",
			"click .mark-all-done": "toggleAllComplete"
		}

	});















}());