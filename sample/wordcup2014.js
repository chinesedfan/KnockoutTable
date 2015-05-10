var data = {
	'1': {
		data: {
			name: 'Brazil',
			value: 4
		}
	},
	'2': {
		data: {
			name: 'Chile',
			value: 3
		}
	},
	'3': {
		children: ['1', '2'],
		data: {
			name: 'Brazil',
			value: 2
		}
	},
];

var table = new KnockoutTable($('.J_container'), {
	data: data
});
table.draw();