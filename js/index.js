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
			bus: {
				color: 'black'
			},
			input: { // child's side
				offset: 0,
				color: 'green',
				height: 50
			},
			output: { // parent's side
				color: 'blue',
				height: 40
			}
		}
	};
	this.config(options);
}

KnockoutTable.prototype = {
	constructor: KnockoutTable,
	config: function(options) {
		this.options = $.extend(true, this.options, options || {});

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
	},

	refreshRefrence: function() {
		var self = this, child;

		_.each(this.options.data, function(value, key) {
			if (!value.children) return true;

			_.each(value.children, function(str, i) {
				child = self.options.data[str];
				if (!child.parents) child.parents = [];
				child.parents.push(value);

				value.children[i] = child;
			});
		});
	},

	refreshCoordinate: function() {
		var self = this,
			roots = self.roots = self.findRoots();

		// calculate the width of each cell
		_.each(roots, function(root, i) {
			self.travelByPostOrder(root);
		});

		// calculate the x/y by BFS
		self.travelByBFS(roots[0]);
	},
	findRoots: function() {
		var roots = [];
		_.each(this.options.data, function(value, key) {
			if (!value.parents || !value.parents.length) {
				roots.push(value);
			}
		});
		return roots;
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
	travelByBFS: function(root) {
		var self = this;

		root.x = root.y = 0;
		
		self.travelByLevel(root);
		self.optimizeCoordinate();

		self.minX = _.min(self.options.data, 'x').x;
		self.maxX = _.max(self.options.data, 'x').x;
		self.minY = _.min(self.options.data, 'y').y;
		self.maxY = _.max(self.options.data, 'y').y;

		self.width = (self.maxX - self.minX + self.options.cell.width);
		self.height = (self.maxY - self.minY + self.options.cell.height);
		self.canvas.attr(self.isHorizontal ? 'width' : 'height', self.width + 'px');
		self.canvas.attr(self.isHorizontal ? 'height' : 'width', self.height + 'px');
		self.context2d = self.canvas.get(0).getContext('2d');
		self.container.css('width', self.canvas.attr('width'));
		self.container.css('height', self.canvas.attr('height'));
	},
	travelByLevel: function(root) {
		var q =[root], cell;

		while(q.length) {
			cell = q.shift();
			if (cell.children && cell.children.length) {
				q = q.concat(cell.children);
				this.refreshChildrenXY(cell);
			}
			if (cell.parents && cell.parents.length > 1) {
				this.refreshParentsXY(cell);
			}
		}
	},
	refreshChildrenXY: function(cell) {
		var self = this,
			x = cell.x + self.options.cell.width / 2 - cell.width / 2,
			y = cell.y + (self.options.cell.height + self.linkerHeight);

		_.each(cell.children, function(child, i) {
			x += child.width / 2 - self.options.cell.width / 2;

			if (_.isUndefined(child.x)) {
				child.x = x;
				child.y = y;
			}

			x += self.options.cell.width / 2 + child.width / 2 + self.options.cell.padding;
		});
	},
	refreshParentsXY: function(cell) {
		var self = this,
			startX = cell.x;

		if (!cell.parents || !cell.parents.length) {
			self.travelByLevel(cell);
			return;
		}

		// use confirmed parents' max x as the start point
		_.each(cell.parents, function(parent, i) {
			if (_.isUndefined(parent.x)) return true;

			var width = _.reduce(parent.children, function(memo, child) {
				memo += child.width + self.options.cell.padding;
			}, -self.options.cell.padding);
			var temp = parent.x + self.options.cell.width / 2 + width / 2 + self.options.cell.padding;
			if (temp > startX) startX = temp;
		});

		// update those non-confirmed
		_.each(cell.parents, function(parent, i) {
			if (!_.isUndefined(parent.x)) return true;

			parent.x = startX + parent.width / 2 - self.options.cell.width / 2;
			parent.y = cell.y - self.linkerHeight - self.options.cell.height;
			self.refreshParentsXY(parent);

			startX += parent.width + self.options.cell.padding;
		});
	},
	refreshMinMax: function(cell) {
		if (cell.x > this.maxX) this.maxX = cell.x;
		if (cell.x < this.minX) this.minX = cell.x;
		if (cell.y > this.maxY) this.maxY = cell.y;
		if (cell.y < this.minY) this.minY = cell.y;
	},
	optimizeCoordinate: function() {
		var self = this;

		// in the middle of children
		_.each(self.roots, function(root, i) {
			var stack = [root], cell;

			while (stack.length) {
				cell = stack.pop();

				if (!cell.children || !cell.children.length) {
					continue;
				} else if (!cell.visited) {
					cell.visited = true;
					stack.push(cell);
					stack = stack.concat(cell.children);
				} else {
					cell.visited = false;
					cell.x = (_.min(cell.children, 'x').x + _.max(cell.children, 'x').x) / 2;
				}
			}
		});

		// not lower than children
		_.each(self.options.data, function(cell, key) {
			var minY = cell.y + self.options.cell.height + self.linkerHeight,
				offset;

			_.each(cell.children, function(child, i) {
				offset = child.y - minY; 
				if (isNaN(offset) || offset > 0) return true;

				self.adjustRecursively(child, 0, -offset);
			});
		});

		// but not too low
		_.each(self.roots, function(root, i) {
			var q =[root], cell;

			while(q.length) {
				cell = q.shift();
				if (cell.children && cell.children.length) {
					q = q.concat(cell.children);
				}
				if (cell.parents && cell.parents.length > 1) {
					minY = _.max(cell.parents, 'y').y + self.options.cell.height + self.linkerHeight;
					offset = cell.y - minY;
					if (offset > 0) self.adjustRecursively(cell, 0, -offset);
				}
			}
		});
	},
	adjustRecursively: function(root, xDelta, yDelta) {
		var q =[root], cell;

		while(q.length) {
			cell = q.shift();
			cell.x += xDelta;
			cell.y += yDelta;

			if (cell.children && cell.children.length) {
				q = q.concat(cell.children);
			}
		}
	},

	doDraw: function() {
		var self = this,
			html, css,
			busStartX, busStartY, busEndX, busEndY;

		self.container.css('position', 'relative');
		_.each(this.options.data, function(value, key) {
			// draw the cell
			css = $.extend({
				position: 'absolute',
				width: self.isHorizontal ? self.options.cell.width : self.options.cell.height,
				height: self.isHorizontal ? self.options.cell.height : self.options.cell.width
			}, self.translateXY(value.x, value.y));

			html = self.cellTemplate(value.data);
			$(html).css(css).appendTo(self.container);

			// draw the line between the cell and its parent's bus
			_.each(_.sortBy(value.parents, 'x'), function(parent, i) {
				var busY = parent.y + self.options.cell.height + self.options.linker.output.height,
					y = busY < value.y ? value.y : value.y + self.options.cell.height;

				self.context2d.beginPath();
				self.context2d.strokeStyle = self.options.linker.input.color;
				self.drawLine(
					value.x + self.options.cell.width / 2 + (i - value.parents.length / 2) * self.options.linker.input.offset,
					y,
					0,
					busY - y
				);
			});

			// draw the bus and connect the cell with the bus
			if (!value.children || !value.children.length) return true;

			busStartX = busEndX = value.x + self.options.cell.width / 2;
			busStartY = busEndY = value.y + self.options.cell.height + self.options.linker.output.height;

			_.each(value.children, function(child, i) {
				var x = child.x + self.options.cell.width / 2;

				if (x < busStartX) busStartX = x;
				if (x > busEndX) busEndX = x;
			});

			self.context2d.beginPath();
			self.context2d.strokeStyle = self.options.linker.bus.color;
			self.drawLine(busStartX, busStartY, busEndX - busStartX, busEndY - busStartY);

			self.context2d.beginPath();
			self.context2d.strokeStyle = self.options.linker.output.color;
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
	}
}