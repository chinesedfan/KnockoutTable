function KnockoutTable(container, options) {
	this.container = container || $('<div></div>').appendTo($('body'));
	this.canvas = $('<canvas></canvas>').appendTo(this.container);

	this.options = {
		orient: 'top', // or 'bottom, left, right', means the position of the root node
		expansion: 'single',  // or 'double'
		padding: 0, // or { left: 0, right: 0, top: 0, bottom: 0 }
		cell: {
			width: 120,
			height: 90,
			padding: 30, // the distance between 2 sibling cells
			template: '<div class="match-item"><%- name %></div>'
		},
		linker: {
			bus: {},
			input: {
				height: 50
			},
			output: {
				height: 50
			}
		}
	};
	this.config(options);
}

KnockoutTable.prototype = {
	findRoots: function() {
		var roots = [];
		_.each(this.options.data, function(value, key) {
			if (!value.parent) {
				roots.push(value);
			}
		});
		return roots;
	},
	travelByLevel: function(root) {
		var q =[root], cell,
			level = 0, count = 1, index = 0;

		while(q.length) {
			cell = q.shift();
			if (cell.children && cell.children.length) {
				q = q.concat(cell.children);
				this.refreshChildrenXY(cell);
			}

			cell.level = level;
			cell.index = index++;
			if (index == count) {
				level++;
				index = 0;
				count = q.length;
			}
		}
	},
	refreshChildrenXY: function(cell) {
		var self = this,
			x = cell.x - (self.options.cell.width + self.options.cell.padding) * (cell.children.length - 1) / 2,
			y = cell.y + (self.options.cell.height + self.linkerHeight);

		_.each(cell.children, function(child, i) {
			child.x = x;
			child.y = y;
			if (x > self.maxX) self.maxX = x;
			if (x < self.minX) self.minX = x;
			if (y > self.maxY) self.maxY = y;
			if (y < self.minY) self.minY = y;

			x += (self.options.cell.width + self.options.cell.padding);
		});
	},
	translateXY: function(x, y) {
		var obj = {};
		switch (this.options.orient) {
			case 'top':
				obj.left = x - this.minX;
				obj.top = y - this.minY;
				break;
			case 'bottom':
				obj.left = this.width - (x -  this.minX);
				obj.top = this.height - (y - this.minY);
				break;
			case 'left':
				obj.left = y - this.minY;
				obj.top = this.height - (x - this.minX);
				break;
			case 'right':
				obj.left = this.width - (y - this.minY);
				obj.top = x - this.minX;
				break;
		}
		return obj;
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
			root = self.findRoots()[0];

		self.minX = self.maxX = root.x = 0;
		self.minY = self.maxY = root.y = 0;
		self.travelByLevel(root);

		self.width = (self.maxX - self.minX + self.options.cell.width);
		self.height = (self.maxY - self.minY + self.options.cell.height);
		self.canvas.attr(self.isHorizontal ? 'width' : 'height', self.width + 'px');
		self.canvas.attr(self.isHorizontal ? 'height' : 'width', self.height + 'px');
		self.context2d = self.canvas.get(0).getContext('2d');
	},
	doDraw: function() {
		var self = this,
			html, css,
			busStartX, busStartY, busEndX, busEndY;

		self.container.css('position', 'relative');
		_.each(this.options.data, function(value, key) {
			css = $.extend({
				position: 'absolute',
				width: self.isHorizontal ? self.options.cell.width : self.options.cell.height,
				height: self.isHorizontal ? self.options.cell.height : self.options.cell.width
			}, self.translateXY(value.x, value.y));

			html = self.cellTemplate(value.data);
			$(html).css(css).appendTo(self.container);

			if (!value.children || !value.children.length) return true;

			_.each(value.children, function(child, i) {
				x = child.x + self.options.cell.width;
				y = child.y + self.options.cell.height / 2;
				self.drawLine(x, y, self.options.linker.input.height, 0);

				if (i == 0) {
					busStartX = x + self.options.linker.input.height;
					busStartY = y;
				} else if (i == value.children.length - 1) {
					busEndX = x + self.options.linker.input.height;
					busEndY = y;
				}
			});

			self.drawLine(busStartX, busStartY, busEndX - busStartX, busEndY - busStartY);
			self.drawLine(busStartX, (busStartY + busEndY) / 2, self.options.linker.output.height, 0);
		});
	},
	drawLine: function(x, y, xDelta, yDelta) {
		var obj1 = this.translateXY(x, y),
			obj2 = this.translateXY(x + xDelta, y + yDelta);

		this.context2d.moveTo(obj1.left, obj2.top);
		this.context2d.lineTo(obj2.left, obj2.top);
		this.context2d.stroke();
	},

	constructor: KnockoutTable,
	config: function(options) {
		this.options = $.extend(this.options, options || {});

		// the orientation of the same level cells
		this.isHorizontal = this.options.orient == 'top' || this.options.orient == 'bottom';
		// the total height of the linker
		this.linkerHeight = this.options.linker.input.height + this.options.linker.output.height;
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