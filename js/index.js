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
			template: '<div class="match-item" style="text-align: center; border: solid 1px red;"><%- name %></div>'
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
	travelByPostOrder: function(root) {
		var self = this,
			stack = [root], cell;

		while (stack.length) {
			cell = stack.pop();
			if (cell.width) continue;

			if (!cell.children || !cell.children.length) {
				cell.width = self.options.cell.width;
			} else if (!cell.visited) {
				cell.visited = true;
				stack.push(cell);
				stack = stack.concat(cell.children);
			} else {
				cell.visited = false;
				cell.width = 0;
				_.each(cell.children, function(child, i) {
					cell.width += child.width + self.options.cell.padding;
				});
				cell.width -= self.options.cell.padding;
			}
		}
	},
	refreshChildrenXY: function(cell) {
		var self = this,
			x = cell.x + self.options.cell.width / 2 - cell.width / 2,
			y = cell.y + (self.options.cell.height + self.linkerHeight);

		_.each(cell.children, function(child, i) {
			x += child.width / 2 - self.options.cell.width / 2;

			child.x = x;
			child.y = y;
			if (x > self.maxX) self.maxX = x;
			if (x < self.minX) self.minX = x;
			if (y > self.maxY) self.maxY = y;
			if (y < self.minY) self.minY = y;

			x += self.options.cell.width / 2 + child.width / 2 + self.options.cell.padding;
		});
	},
	travelByBFS: function(root) {
		var self = this;
		
		self.minX = self.maxX = root.x = 0;
		self.minY = self.maxY = root.y = 0;
		self.travelByLevel(root);

		self.width = (self.maxX - self.minX + self.options.cell.width);
		self.height = (self.maxY - self.minY + self.options.cell.height);
		self.canvas.attr(self.isHorizontal ? 'width' : 'height', self.width + 'px');
		self.canvas.attr(self.isHorizontal ? 'height' : 'width', self.height + 'px');
		self.context2d = self.canvas.get(0).getContext('2d');
		self.container.css('width', self.canvas.attr('width'));
		self.container.css('height', self.canvas.attr('height'));
	},
	translateXY: function(x, y) {
		var obj = {};
		x -= this.minX;
		y -= this.minY;

		// for elements, use top/bottom/left/right
		// for points, use x/y
		switch (this.options.orient) {
			case 'top':
				obj.left = obj.x = x;
				obj.top = obj.y = y;
				break;
			case 'bottom':
				obj.right = x;
				obj.bottom = y;
				obj.x = this.width - x;
				obj.y = this.height - y;
				break;
			case 'left':
				obj.left = obj.x = y;
				obj.bottom = x;
				obj.y = this.width - x;
				break;
			case 'right':
				obj.top = obj.y = x;
				obj.right = y;
				obj.x = this.height - y;
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
			roots = self.findRoots();

		// calculate the width of each cell
		_.each(roots, function(root, i) {
			self.travelByPostOrder(root);
		});

		// calculate the x/y by BFS
		self.travelByBFS(roots[0]);
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

			busStartX = busEndX = value.x + self.options.cell.width / 2;
			busStartY = busEndY = value.y + self.options.cell.height + self.options.linker.input.height;

			_.each(value.children, function(child, i) {
				x = child.x + self.options.cell.width / 2;
				y = child.y;
				self.drawLine(x, y, 0, busStartY - y);

				if (x < busStartX) busStartX = x;
				if (x > busEndX) busEndX = x;
			});

			self.drawLine(busStartX, busStartY, busEndX - busStartX, busEndY - busStartY);
			self.drawLine(value.x + self.options.cell.width / 2, busStartY, 0, -self.options.linker.output.height);
		});
	},
	drawLine: function(x, y, xDelta, yDelta) {
		var obj1 = this.translateXY(x, y),
			obj2 = this.translateXY(x + xDelta, y + yDelta);

		this.context2d.moveTo(obj1.x, obj1.y);
		this.context2d.lineTo(obj2.x, obj2.y);
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