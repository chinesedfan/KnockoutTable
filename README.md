My original intention is to draw a game schedule of World Cup. Later, I want to support more general structures.

The main algorithm is:

- analyse the topology relation and determine each cell's level
- update round and round until the diagram is nearly stable
	- update cells' x based on its children and parents
	- expand if some cells are too close
