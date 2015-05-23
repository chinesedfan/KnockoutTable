function generateSimCityData() {
	var building = {
		factory: {
			slot: 5,
			product: {
				metal: { minute: 1 },
				wood: { minute: 3 },
				plastic: { minute: 9 },
				seed: { minute: 20 },
				mine: { minute: 30 },
				chemical: { minute: 120 },
				textile: { minute: 180 },
				sugar: { minute: 240 },
				glass: { minute: 300 },
				feed: { minute: 360 },
				chip: { minute: 420 }
			}
		},
		market: {
			slot: 5,
			product: {
				vegatable: { minute: 20, requires:{ seed: 2 } },
				flour: { minute: 30, requires:{ seed: 2, textile: 2} },
				watermelon: { minute: 90, requires:{ seed: 2, tree: 1 } },
				butter: { minute: 75, requires:{ feed: 1 } },
				cheese: { minute: 105, requires:{ feed: 2 } },
				beef: { minute: 150, requires:{ feed: 3 } }
			}
		},
		materialsStore: {
			slot: 6,
			product: {
				nail: { minute: 5, requires:{ metal: 2 } },
				board: { minute: 30, requires:{ wood: 2 } },
				brick: { minute: 20, requires:{ mine: 2 } },
				cement: { minute: 50, requires:{ mine: 2, chemical: 1 } },
				glue: { minute: 60, requires:{ plastic: 1, chemical: 2 } }
			}
		},
		furnitureStore: {
			slot: 3,
			product: {
				chair: { minute: 20, requires: { wood: 2, nail: 1, hammer: 1} },
				desk: { minute: 30, requires: { board: 1, nail: 2, hammer: 1} },
				household: { minute: 75, requires: { textile: 2, rule: 1 } },
				sofa: { minute: 150, requires: { textile: 3, drill: 1 } },
			}
		},
		hardwareStore: {
			slot: 6,
			product: {
				hammer: { minute: 14, requires: { metal: 1, wood: 1 } },
				rule: { minute: 20, requires: { metal: 1, plastic: 1 } },
				shovel: { minute: 30, requires: { metal: 1, wood: 1, plastic: 1 } },
				kitchenware: { minute: 45, requires: { metal: 2, wood: 2, plastic: 2 } },
				drill: { minute: 120, requires: { metal: 2, plastic: 2, chip: 1 } }
			}
		},
		dessertShop: {
			slot: 3,
			product: {
				sweetRing: { minute: 45, requires: { flour: 1, sugar: 1 } },
				sorbet: { minute: 30, requires: { vegatable: 1, watermelon: 1 } },
				roll: { minute: 60, requires: { flour: 2, butter: 1 } },
				cake: { minute: 90, requires: { flour: 1, watermelon: 1, cheese: 1 } },
				yogurt: { minute: 240, requires: { watermelon: 1, butter: 1, sugar: 1 } }
			}
		},
		gardenShop: {
			slot: 4,
			product: {
				grass: { minute: 30, requires: { seed: 1, shovel: 1 } },
				tree: { minute: 90, requires: { seed: 2, shovel: 1 } },
				furniture: { minute: 135, requires: { board: 2, plastic: 2, textile: 2 } },
				well: { minute: 240, requires: { brick: 2, shovel: 1, cement: 2 } },
				statue: { minute: 90, requires: { cement: 2, glue: 1 } }
			}
		},
		fastFoodShop: {
			slot: 2,
			product: {
				sandish: { minute: 14, requires: { roll: 1, butter: 1 } },
				pizza: { minute: 24, requires: { flour: 1, cheese: 1, beef: 1 } },
				hamburger: { minute: 35, requires: { beef: 1, roll: 1, barbecue: 1 } },
				fries: { minute: 20, requires: { vegatable: 1, cheese: 1} },
				juice: { minute: 60, requires: { glass: 2, sugar: 2, watermelon: 1 } }
			}
		},
		fashionShop: {
			slot: 4,
			product: {
				hat: { minute: 60, requires: { textile: 2, rule: 1 } },
				shoe: { minute: 75, requires: { textile: 2, plastic: 1, glue: 1 } },
				watch: { minute: 90, requires: { plastic: 2, glass: 1, chemical: 1 } },
				suit: { minute: 210, requires: { textile: 3, rule: 1, glue: 1 } }
			}
		},
		applianceShop: {
			slot: 3,
			product: {
				barbecue: { minute: 165, requires: { metal: 3, kitchenware: 1 } },
				fridge: { minute: 210, requires: { plastic: 2, chemical: 2, chip: 2 } },
				bulb: { minute: 105, requires: { chemical: 1, chip: 1, glass: 1} },
				tv: { minute: 150, requires: { plastic: 2, glass: 2, chip: 2} }
			}
		}
	};

	var data = {};
	_.each(building, function(bo, b) {
		_.each(bo.product, function(po, p) {
			data[p] = {
				data: { name: p },
				children: []
			};
			_.each(po.requires, function(count, name) {
				data[p].children.push(name);
			});
		});
	});

	return data;
}

var SimCityData = generateSimCityData();
