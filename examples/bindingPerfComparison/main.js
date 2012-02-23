// Change N to change the number of drawn circles.

var N = 100;

// The Backbone implementation:
(function() {

	var Box = Backbone.Model.extend({

		defaults: {
			top: 0,
			left: 0,
			color: 0,
			content: 0
		},

		initialize: function() {
			this.count = 0;
		},

		tick: function() {
			var count = this.count += 1;
			this.set({
				top: Math.sin(count / 10) * 10,
				left: Math.cos(count / 10) * 10,
				color: (count) % 255,
				content: count % 100
			});
		}

	});


	var BoxView = Backbone.View.extend({

		className: 'box-view',

		template: _.template($('#underscore-template').html()),

		initialize: function() {
			this.model.bind('change', this.render, this);
		},

		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}

	});

	var boxes;

	var backboneInit = function() {
		boxes = _.map(_.range(N), function(i) {
			var box = new Box({number: i});
			var view = new BoxView({model: box});
			$('#grid').append(view.render().el);
			return box;
		});
	};

	var backboneAnimate = function() {
		for (var i = 0, l = boxes.length; i < l; i++) {
		  boxes[i].tick();
		}
		window.timeout = _.defer(backboneAnimate);
	};

	window.runBackbone = function() {
		reset();
		backboneInit();
		backboneAnimate();
	};

})();

// The Ember implementation:
(function(){

	var Box = Ember.Object.extend({

		top: 0,
		left: 0,
		content: 0,
		count: 0,

		tick: function() {
			var count = this.get('count') + 1;
			this.set('count', count);
			this.set('top', Math.sin(count / 10) * 10);
			this.set('left', Math.cos(count / 10) * 10);
			this.set('color', count % 255);
			this.set('content', count % 100);
		},

		style: function() {
			return 'top: ' + this.get('top') + 'px; left: ' +  this.get('left') +'px; background: rgb(0,0,' + this.get('color') + ');';
		}.property('top', 'left', 'color')

	});

	var BoxView = Ember.View.extend({
		classNames: ['box-view'],
		templateName: 'box'
	});

	var boxes;

	var emberInit = function() {
		boxes = _.map(_.range(N), function(i) {
			var box = Box.create();
			var view = BoxView.create({model: box});
			view.appendTo('#grid');
			box.set('number', i);
			return box;
		});
	};

	var emberAnimate = function() {
		for (var i = 0, l = boxes.length; i < l; i++) {
		  boxes[i].tick();
		}
		window.timeout = _.defer(emberAnimate);
	};

	window.runEmber = function() {
		reset();
		emberInit();
		emberAnimate();
	};

})();


(function() {

	var box = $speak({
		count: 0,
		top: 0,
		left: 0,
		color: 0,
		content: 0,
		number: 0,

		tick: function() {
			var count = this.count += 1;
			this.top = Math.sin(count / 10) * 10;
			this.left = Math.cos(count / 10) * 10;
			this.color = (count) % 255;
			this.content = count % 100;
			this.tell("change", count);
		}
	});

	console.log("speak start");
	var boxView = $speak({
		init: function() {
			this.el = $el("div.box");
			var that = this;
			console.log("init", this, this.model, this.test);
			this.listensTo(this.model).listen("change", function(type, msg) {
				//console.log(msg);
				that.render();
			});
		},

		model: null,

		el: null,

		render: function() {
			var el = this.el,
				box = this.model;
	
			el.id = "box-"+box.number;
			el.style.cssText = 'top: ' + box.top + 'px; left: ' +  box.left +'px; background: rgb(0,0,' + box.color + ');';
			el.innerHTML = box.content;
			return $el("div.box-view",[el]);
		}
	});
	console.log("speak done");

	var boxes = [];

	var lootInit = function() {
		var x = N;
		while (x--) {
			var bx = $make(box, {number:x});
			console.log("make start");
			var bxView = $make(boxView, {model: bx, test:"blah"});
			console.log("make end");
			$id("grid").appendChild(bxView.render());
			boxes.push(bx);
		}
	};

	var lootAnimate = function() {
		$each(boxes, function(box) {
			box.tick();
		});
		window.timeout = _.defer(lootAnimate);
	};

	window.runLoot = function() {
		reset();
		lootInit();
		lootAnimate();
	};

})();

window.timeout = null;

window.reset = function() {
	$('#grid').empty();
	clearTimeout(timeout);
};