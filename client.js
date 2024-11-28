import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@0.15/dist/vizzu.min.js';

let data = {
    series: [
        { name: 'Genre', type: 'dimension' },
        { name: 'Channel', type: 'dimension' },
        { name: 'Country', type: 'dimension' },
        { name: 'Copies', type: 'measure' },
        { name: 'Rating', type: 'measure' }
    ],
    records: [
        ['Pop', 'Online', 'USA', 30000, 4.3],
        ['Pop', 'Online', 'Canada', 15000, 3.8],
        ['Pop', 'Online', 'UK', 16000, 4.1],
        ['Pop', 'Online', 'Germany', 14000, 4.0],
        ['Pop', 'Online', 'France', 17000, 3.9],
        ['Pop', 'Online', 'Japan', 32000, 4.5],
        ['Pop', 'Store', 'USA', 20000, 4.0],
        ['Pop', 'Store', 'Canada', 14000, 3.7],
        ['Pop', 'Store', 'UK', 15000, 3.5],
        ['Pop', 'Store', 'Germany', 13000, 3.6],
        ['Pop', 'Store', 'France', 18000, 4.2],
        ['Pop', 'Store', 'Japan', 5000, 4.1],
        ['Jazz', 'Online', 'USA', 25000, 3.9],
        ['Jazz', 'Online', 'Canada', 14000, 4.1],
        ['Jazz', 'Online', 'UK', 12000, 3.5],
        ['Jazz', 'Online', 'Germany', 13000, 4.4],
        ['Jazz', 'Online', 'France', 14000, 3.6],
        ['Jazz', 'Online', 'Japan', 26000, 4.0],
        ['Jazz', 'Store', 'USA', 15000, 3.8],
        ['Jazz', 'Store', 'Canada', 11000, 4.0],
        ['Jazz', 'Store', 'UK', 12000, 3.9],
        ['Jazz', 'Store', 'Germany', 14000, 4.2],
        ['Jazz', 'Store', 'France', 17000, 3.8],
        ['Jazz', 'Store', 'Japan', 6000, 4.1],
        ['Classical', 'Online', 'USA', 8000, 4.4],
        ['Classical', 'Online', 'Canada', 12000, 4.3],
        ['Classical', 'Online', 'UK', 13000, 3.9],
        ['Classical', 'Online', 'Germany', 20000, 3.6],
        ['Classical', 'Online', 'France', 14000, 3.8],
        ['Classical', 'Online', 'Japan', 9000, 4.0],
        ['Classical', 'Store', 'USA', 4000, 4.1],
        ['Classical', 'Store', 'Canada', 6000, 4.2],
        ['Classical', 'Store', 'UK', 8000, 3.6],
        ['Classical', 'Store', 'Germany', 18000, 4.0],
        ['Classical', 'Store', 'France', 20000, 3.7],
        ['Classical', 'Store', 'Japan', 2000, 4.2],
        ['Electronic', 'Online', 'USA', 50000, 3.5],
        ['Electronic', 'Online', 'Canada', 20000, 3.8],
        ['Electronic', 'Online', 'UK', 22000, 3.9],
        ['Electronic', 'Online', 'Germany', 45000, 3.6],
        ['Electronic', 'Online', 'France', 24000, 3.9],
        ['Electronic', 'Online', 'Japan', 60000, 4.4],
        ['Electronic', 'Store', 'USA', 35000, 3.7],
        ['Electronic', 'Store', 'Canada', 14000, 3.8],
        ['Electronic', 'Store', 'UK', 17000, 3.5],
        ['Electronic', 'Store', 'Germany', 40000, 3.7],
        ['Electronic', 'Store', 'France', 28000, 3.9],
        ['Electronic', 'Store', 'Japan', 5000, 4.0]
    ]
};

let chart = new Vizzu('mychart', {
    data
});

const stackedGemoetries = ['rectangle', 'area'];

function getGeometry() {
	if (document.getElementById('circle').checked) return 'circle';
	if (document.getElementById('line').checked) return 'line';
	if (document.getElementById('area').checked) return 'area';
	return 'rectangle';
}

function channels(type) {
	return document
		.getElementById(type)
		.value
		.split('\n')
		.filter(x => x.trim() !== '')
		.map(x => {
			let [name, suffix] = x.split(':');
			return {name: name.trim(), indicators: (suffix ?? '').trim().split('')};
		});
} 

document.getElementById('refresh').addEventListener('click', () => {
	refresh();
});

function refresh() {
	let strategy = 'xy';
	if (document.getElementById('strategy-yx').checked) strategy = 'yx';
	if (document.getElementById('strategy-nocoords').checked) strategy = 'nocoords';

	const config = generateConfig(strategy);

	document.querySelector('.app__config pre').innerHTML = JSON.stringify(config, null, 2);	
	chart.animate({config});
}

function generateConfig(strategy) {
	
	const [measures, segregated, other] = [channels('measures'), channels('segregated-dimensions'), channels('other-dimensions')];
	const allChannels = [...measures, ...segregated, ...other];
	const geometry = getGeometry();
	const stackedSeries = stackedGemoetries.includes(geometry) ? other : [];

	let coordSystem = 'cartesian';
	if (document.getElementById('coords-polar').checked) coordSystem = 'polar';
	
	const colorChannelNames = allChannels.filter(x => x.indicators.includes('C')).map(x => x.name);
	const lightnessChannelNames = allChannels.filter(x => x.indicators.includes('L')).map(x => x.name);
	const sizeChannels = allChannels.filter(x => x.indicators.includes('S'));
	const sizeChannelNames = sizeChannels.map(x => x.name);

	/* 
	 * Strategy 'nocoords'
	 * Can have one measure
	 * No coordinates are used
	 * Measures are mapped to size
	 * Segregated dimensions are mapped to noop
	 * Other dimensions are mapped to size
	 */
	if (strategy === 'nocoords') {
		return {
			channels: {
				x: [],
				y: [],
				color: colorChannelNames,
				lightness: lightnessChannelNames,
				noop: segregated.map(x => x.name),
				size: ([...measures, ...sizeChannels, ...other]).map(x => x.name),
			},
			geometry: geometry,
			coordSystem: coordSystem
		};
	}

	/*
	 * Strategy 'yx'
	 * Measures are mapped to X axis
	 * Segregated dimensions are mapped to y axis
	 * Other dimensions are mapped x if the geometry is stackable
	 */ 

	if (strategy === 'yx') {
		return {
			channels: {
				y: segregated.map(x => x.name),
				x: ([...measures, ...stackedSeries]).map(x => x.name),
				color: colorChannelNames,
				lightness: lightnessChannelNames,
				size: sizeChannelNames,
			},
			geometry: geometry,
			coordSystem: coordSystem
		};
	}

	/*
	 * Default strategy 'xy'
	 * Measures are mapped to y axis
	 * Segregated dimensions are mapped to x axis
	 * Other dimensions are mapped y if the geometry is stackable
	 */ 
	
	return {
		channels: {
			x: segregated.map(x => x.name),
			y: ([...measures, ...stackedSeries]).map(x => x.name),
			color: colorChannelNames,
			lightness: lightnessChannelNames,
			size: sizeChannelNames,
		},
		geometry: geometry,
		coordSystem: coordSystem
	};


}




document.addEventListener('DOMContentLoaded', () => {
	refresh();
});