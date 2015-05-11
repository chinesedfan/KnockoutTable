function KnockoutTable(container, options) {
	this.container = container || $('<div></div>').appendTo($('body'));
	this.canvas = $('<canvas></canvas>').appendTo(this.container);

	this.options = $.extend({
		orient: 'horizontal', // or 'vertical'
		expansion: 'single',  // or 'double'
		padding: 0, // or { left: 0, right: 0, top: 0, bottom: 0 }
		cell: {
			width: 120,
			height: 90,
			padding: 30, // the distance between 2 cells
			template: '<div class="match-item"><%- name %></div>'
		},
		linker: {
			color: 'black',
			borderWidth: 5,
			bus: {},
			input: {
				width: 50
			},
			output: {
				width: 50
			}
		}
	}, options || {});
}

KnockoutTable.prototype = {
	findRoot: function() {
		var root;
		_.each(this.options.data, function(value, key) {
			if (!value.parent) {
				root = value;
				return true;
			}
		});
		return root;
	},

	refreshRefrence: function() {
		var self = this;

		_.each(this.options.data, function(value, key) {
			if (!value.children) return true;

			_.each(value.children, function(str, i) {
				value.children[i] = self.options.data[str];
				value.children[i].parent = value;
			});
		});
	},
	refreshCoordinate: function() {
		var self = this,
			root = self.findRoot(), q = [root], cell,
			level = 0, count = 1, index = 0,
			linkerWidth = self.options.linker.input.width + self.options.linker.output.width,
			first, last;

		while(q.length) {
			cell = q.shift();
			if (cell.children && cell.children.length) q = q.concat(cell.children);

			cell.level = level;
			cell.index = index++;
			if (index == count) {
				level++;
				index = 0;
				count = q.length;
			}
		}
		level--;

		self.canvas.width((self.options.cell.width + linkerWidth) * (level + 1) - linkerWidth);
		self.canvas.height((self.options.cell.height + self.options.cell.padding) * Math.pow(2, level) - self.options.cell.padding);
		self.context2d = this.canvas.get(0).getContext('2d');

		_.each(self.options.data, function(cell, key) {
			if (!cell.children) {
				cell.left = (level - cell.level) * (self.options.cell.width + linkerWidth);
				cell.top = cell.index * (self.options.cell.height + self.options.cell.padding);
			} else {
				first = cell.children[0];
				last = cell.children[cell.children.length - 1];

				cell.left = first.left + self.options.cell.width + linkerWidth;
				cell.top = (first.top + last.top) / 2;
			}
		});
	},
	doDraw: function() {
		var self = this,
			html,
			busStartX, busStartY, busEndX, busEndY;

		self.container.css('position', 'relative');
		_.each(this.options.data, function(value, key) {
			html = self.cellTemplate(value.data);
			$(html).css({
				position: 'absolute',
				top: value.top,
				left: value.left,
				width: self.options.cell.width,
				height: self.options.cell.height
			}).appendTo(self.container);

			if (!value.children || !value.children.length) return true;

			_.each(value.children, function(child, i) {
				x = child.left + self.options.cell.width;
				y = child.top + self.options.cell.height / 2;
				self.drawLine(x, y, self.options.linker.input.width, 0);

				if (i == 0) {
					busStartX = x + self.options.linker.input.width;
					busStartY = y;
				} else if (i == value.children.length - 1) {
					busEndX = x + self.options.linker.input.width;
					busEndY = y;
				}
			});

			self.drawLine(busStartX, busStartY, busEndX - busStartX, busEndY - busStartY);
			self.drawLine(busStartX, (busStartY + busEndY) / 2, self.options.linker.output.width, 0);
		});
	},
	drawLine: function(x, y, xDelta, yDelta) {
		this.context2d.moveTo(x, y);
		this.context2d.lineTo(x + xDelta, y + yDelta);
		this.context2d.stroke();
	},

	constructor: KnockoutTable,
	config: function(options) {
		this.options = $.extend(this.options, options || {});
	},
	draw: function() {
		if (!this.options.data || !_.keys(this.options.data).length) return;

		this.cellTemplate = _.template(this.options.cell.template);

		// turn string reference into object reference
		this.refreshRefrence();

		// calculate coordinates
		this.refreshCoordinate();

		// draw each cell and linker
		this.doDraw();
	}
}