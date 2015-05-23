var WC2014Data = {
	// 16
	'r1_1': {
		data: { name: 'Brazil' }
	},
	'r1_2': {
		data: { name: 'Chile' }
	},
	'r1_3': {
		data: { name: 'Columbia' }
	},
	'r1_4': {
		data: { name: 'Uruguay' }
	},
	'r1_5': {
		data: { name: 'France' }
	},
	'r1_6': {
		data: { name: 'Nigeria' }
	},
	'r1_7': {
		data: { name: 'Germany' }
	},
	'r1_8': {
		data: { name: 'Algeria' }
	},
	'r1_9': {
		data: { name: 'Netherlands' }
	},
	'r1_10': {
		data: { name: 'Mexico' }
	},
	'r1_11': {
		data: { name: 'Costa Rica' }
	},
	'r1_12': {
		data: { name: 'Greece' }
	},
	'r1_13': {
		data: { name: 'Argentina' }
	},
	'r1_14': {
		data: { name: 'Switzerland' }
	},
	'r1_15': {
		data: { name: 'Belgium' }
	},
	'r1_16': {
		data: { name: 'America' }
	},
	// 8
	'r2_1': {
		data: { name: 'Brazil' },
		children: ['r1_1', 'r1_2']
	},
	'r2_2': {
		data: { name: 'Columbia' },
		children: ['r1_3', 'r1_4']
	},
	'r2_3': {
		data: { name: 'France' },
		children: ['r1_5', 'r1_6']
	},
	'r2_4': {
		data: { name: 'Germany' },
		children: ['r1_7', 'r1_8']
	},
	'r2_5': {
		data: { name: 'Netherlands' },
		children: ['r1_9', 'r1_10']
	},
	'r2_6': {
		data: { name: 'Costa Rica' },
		children: ['r1_11', 'r1_12']
	},
	'r2_7': {
		data: { name: 'Argentina' },
		children: ['r1_13', 'r1_14']
	},
	'r2_8': {
		data: { name: 'Belgium' },
		children: ['r1_15', 'r1_16']
	},
	// 4
	'r3_1': {
		data: { name: 'Brazil' },
		children: ['r2_1', 'r2_2']
	},
	'r3_2': {
		data: { name: 'Germany' },
		children: ['r2_3', 'r2_4']
	},
	'r3_3': {
		data: { name: 'Netherlands' },
		children: ['r2_5', 'r2_6']
	},
	'r3_4': {
		data: { name: 'Argentina' },
		children: ['r2_7', 'r2_8']
	},
	// 2
	'r4_1': {
		data: { name: 'Germany' },
		children: ['r3_1', 'r3_2']
	},
	'r4_2': {
		data: { name: 'Argentina' },
		children: ['r3_3', 'r3_4']
	},
	// 1
	'r5_1': {
		data: { name: 'Germany' },
		children: ['r4_1', 'r4_2']
	}
};
