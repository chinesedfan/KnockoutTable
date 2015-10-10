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
		this.buildCellRelations();

		// calculation
		this.calculateLevel();
		this.calculateCoordinate();
		this.calculateSize();

		// draw each cell and linker
		this.doDraw();
	},

	buildCellRelations: function() {
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

	calculateLevel: function() {
		var self = this,
			minLevel = 0,
			roots = self.findRoots(), leafs = self.findLeafs();

		// calculate all possible levels of each root
		_.each(leafs, function(leaf, i) {
			leaf.levels = [0];
			self.travelByLevel(leaf, function(cell) {
				self.updateFieldLevels(cell, 'parents', cell.levels[cell.levels.length - 1] - 1);
			}, 'parents');
		});

		// only pick the smallest level
		_.each(roots, function(root, i) {
			self.travelByLevel(root, function(cell) {
				cell.level = _.min(cell.levels);
				if (cell.level < minLevel) minLevel = cell.level;

				self.updateFieldLevels(cell, 'children', cell.level + 1);
			});
		});

		// generate the level map with 0 as the base level
		self.levelMap = {};
		_.each(self.options.data, function(cell, i) {
			cell.level -= minLevel;
			cell.levels = null;

			if (!self.levelMap[cell.level]) self.levelMap[cell.level] = [];
			self.levelMap[cell.level].push(cell);
		});
	},
	updateFieldLevels: function(cell, field, level) {
		if (!cell[field] || !cell[field].length) return;

		_.each(cell[field], function(other, i) {
			if (!other.levels) other.levels = [];
			other.levels.push(level);
		});
	},
	
	calculateCoordinate: function() {
		var self = this,
			x, y;

		_.each(self.levelMap, function(list, level) {
			y = level * (self.options.cell.height + self.linkerHeight) + self.options.cell.height;
			x = 0;

			_.each(list, function(cell, i) {
				cell.x = x;
				cell.y = y;

				x += self.options.cell.width + self.options.cell.padding;
			});
		});
	},
	
	calculateSize: function() {
		var self = this;

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

	findRoots: function() {
		var roots = [];
		_.each(this.options.data, function(value, key) {
			if (!value.parents || !value.parents.length) {
				roots.push(value);
			}
		});
		return roots;
	},
	findLeafs: function() {
		var leafs = [];
		_.each(this.options.data, function(value, key) {
			if (!value.children || !value.children.length) {
				leafs.push(value);
			}
		});
		return leafs;
	},
	travelByPostOrder: function(root, iteratee) {
		var self = this,
			stack = [root], cell;

		while (stack.length) {
			cell = stack.pop();
			if (!cell.visited) {
				cell.visited = true;
				stack.push(cell);
				stack = stack.concat(cell.children);
			} else {
				cell.visited = false;
				iteratee(cell);
			}
		}
	},
	travelByLevel: function(root, iteratee, field) {
		var q = [root], cell;

		field = field || 'children';
		while(q.length) {
			cell = q.shift();
			if (cell[field] && cell[field].length) {
				q = q.concat(cell[field]);
			}

			iteratee(cell);
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