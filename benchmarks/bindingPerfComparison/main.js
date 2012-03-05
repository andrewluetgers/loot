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
//			this.$el.html(this.template(this.model.attributes));
			return this;
		}

	});

	var boxes;

	var backboneInit = function() {
		boxes = _.map(_.range(N), function(i) {
			var box = new Box({number: i});
			var view = new BoxView({model: box});
//			$('#grid').append(view.render().el);
			return box;
		});
	};


	var frame = 0;
	var start;

	var backboneAnimate = function() {
		!frame && (start = $now());
		frame++;

		$each(boxes, function(box) {
			box.tick();
		});
		$id("frameRate").innerHTML = frame / (($now() - start)/1000);
		window.timeout = _.defer(backboneAnimate);

		if (frame > 30) {
			frame = 0;
		}
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
		}

//		style: function() {
//			return 'top: ' + this.get('top') + 'px; left: ' +  this.get('left') +'px; background: rgb(0,0,' + this.get('color') + ');';
//		}.property('top', 'left', 'color')

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
//			view.appendTo('#grid');
			box.set('number', i);
			return box;
		});
	};


	var frame = 0;
	var start;

	var emberAnimate = function() {
		!frame && (start = $now());
		frame++;
		$each(boxes, function(box) {
			box.tick();
		});
		$id("frameRate").innerHTML = frame / (($now() - start)/1000);
		window.timeout = _.defer(emberAnimate);

		if (frame > 30) {
			frame = 0;
		}
	};

	window.runEmber = function() {
		reset();
		emberInit();
		emberAnimate();
	};

})();


(function() {

	$define("box", {
		defaults: {
			count: 0,
			top: 0,
			left: 0,
			color: 0,
			content: 0,
			number: 0
		},
		tick: function() {
			var count = this.get("count");
			count += 1;
			this.set({
				count:		count,
				top: 		Math.sin(count / 10) * 10,
				left: 		Math.cos(count / 10) * 10,
				color: 		count % 255,
				content: 	count % 100
			});
		}
	});

	var boxView = $speak({
		init: function() {
			this.el = $el("div.box");
			var that = this;
			this.listensTo(this.model).listen("change", function(type, msg) {
				that.render();
			});
		},

		model: null,

		el: null,

		render: function() {
			var el = this.el,
				box = this.model.get();

//
//			el.id = "box-"+box.number;
//			el.style.cssText = 'top: ' + box.top + 'px; left: ' +  box.left +'px; background: rgb(0,0,' + box.color + ');';
//			el.innerHTML = box.content;
//
//			if (!this.rendered) {
//				this.rendered = true;
//				return $el("div.box-view",[el]);
//			}
		}
	}); 

	var boxes;

	var lootInit = function() {
		var x = N;
		boxes = [];
		while (x--) {
			var bx = $model("box", {number:x});
			boxes.push(bx);
			var bxView = $make(boxView, {model: bx});
//			$id("grid").appendChild(bxView.render());
		}
	};

	var frame = 0;
	var start;

	var lootAnimate = function() {
		!frame && (start = $now());
		frame++;

		$each(boxes, function(box) {
			box.tick();
		});

		$id("frameRate").innerHTML = frame / (($now() - start)/1000);
		window.timeout = _.defer(lootAnimate);

		if (frame > 30) {
			frame = 0;
		}
	};

	window.runLoot = function() {
		reset();
		lootInit();
		lootAnimate();
	};

})();

window.timeout = null;

window.reset = function() {
	console.log("reset");
	$('#grid').empty();
	clearTimeout(timeout);
};