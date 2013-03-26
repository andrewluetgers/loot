
var app = {
	initRegions: function() {
		var regions = $dom([
			"div#header.layout", "header content yo!",
			"div#main.layout", [
				"div#listView.layout"
			],
			"div#footer.layout", "footer content yo!"
		]);

		$("body").append(regions);
	},

	initListView: function() {
		var lv = $listView($("#listView"), {
			lazy: function() {
				console.log("lazy", arguments, this);
			}
		});

		lv.append($dom(
			$map(100, function(v) {
				return ["div.li", "list item " + v];
			})
		));
	},

	init: function() {
		this.initRegions();
		this.initListView();
	}
};


$(function() {
	app.init();
});