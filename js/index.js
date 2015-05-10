function KnockoutTable(container, options) {
	this.container = container || $('<div></div>').appendTo($('body'));
	this.options = $.extend({
		orient: 'horizontal', // or 'vertical'
		expansion: 'single',  // or 'double'
		padding: 0, // or { left: 0, right: 0, top: 0, bottom: 0 }
		cell: {
			width: 120,
			heigth: 90,
			padding: 30, // the distance between 2 cells
			template: '<div class="match-item"><%- team %></div>'
		},
		linker: {
			color: 'black',
			borderWidth: 5,
			bus: {},
			input0: {},
			input1: {},
			output0: {},
			output1: {}
		}
	}, options || {});
}

KnockoutTable.prototype = {
	constructor: KnockoutTable,
	config: function(options) {
		this.options = $.extend(this.options, options || {});
	},
	draw: function() {
		if (!this.options.data || !this.options.data.length) return;

		// turn string reference into object reference

		// calculate coordinates

		// draw each cell and linker
	}
}