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
        ['Pop', 'Online', 'USA', 15000, 4.3],
        ['Pop', 'Online', 'Canada', 17000, 3.8],
        ['Pop', 'Online', 'UK', 19000, 4.1],
        ['Pop', 'Online', 'Germany', 16500, 4.0],
        ['Pop', 'Online', 'France', 18000, 3.9],
        ['Pop', 'Online', 'Japan', 17500, 4.5],
        ['Pop', 'Store', 'USA', 12000, 4.0],
        ['Pop', 'Store', 'Canada', 13000, 3.7],
        ['Pop', 'Store', 'UK', 14500, 3.5],
        ['Pop', 'Store', 'Germany', 11000, 3.6],
        ['Pop', 'Store', 'France', 12500, 4.2],
        ['Pop', 'Store', 'Japan', 14000, 4.1],
        ['Jazz', 'Online', 'USA', 15500, 3.9],
        ['Jazz', 'Online', 'Canada', 16000, 4.1],
        ['Jazz', 'Online', 'UK', 13000, 3.5],
        ['Jazz', 'Online', 'Germany', 14000, 4.4],
        ['Jazz', 'Online', 'France', 12500, 3.6],
        ['Jazz', 'Online', 'Japan', 15000, 4.0],
        ['Jazz', 'Store', 'USA', 8000, 3.8],
        ['Jazz', 'Store', 'Canada', 7500, 4.0],
        ['Jazz', 'Store', 'UK', 8700, 3.9],
        ['Jazz', 'Store', 'Germany', 8500, 4.2],
        ['Jazz', 'Store', 'France', 9200, 3.8],
        ['Jazz', 'Store', 'Japan', 9000, 4.1],
        ['Classical', 'Online', 'USA', 14000, 4.4],
        ['Classical', 'Online', 'Canada', 14500, 4.3],
        ['Classical', 'Online', 'UK', 12000, 3.9],
        ['Classical', 'Online', 'Germany', 11500, 3.6],
        ['Classical', 'Online', 'France', 12500, 3.8],
        ['Classical', 'Online', 'Japan', 13000, 4.0],
        ['Classical', 'Store', 'USA', 11000, 4.1],
        ['Classical', 'Store', 'Canada', 9000, 4.2],
        ['Classical', 'Store', 'UK', 8500, 3.6],
        ['Classical', 'Store', 'Germany', 8900, 4.0],
        ['Classical', 'Store', 'France', 9500, 3.7],
        ['Classical', 'Store', 'Japan', 10200, 4.2],
        ['Electronic', 'Online', 'USA', 12800, 3.5],
        ['Electronic', 'Online', 'Canada', 12000, 3.8],
        ['Electronic', 'Online', 'UK', 11000, 3.9],
        ['Electronic', 'Online', 'Germany', 9000, 3.6],
        ['Electronic', 'Online', 'France', 9500, 3.9],
        ['Electronic', 'Online', 'Japan', 10400, 4.4],
        ['Electronic', 'Store', 'USA', 7200, 3.7],
        ['Electronic', 'Store', 'Canada', 7600, 3.8],
        ['Electronic', 'Store', 'UK', 8400, 3.5],
        ['Electronic', 'Store', 'Germany', 9100, 3.7],
        ['Electronic', 'Store', 'France', 8600, 3.9],
        ['Electronic', 'Store', 'Japan', 9400, 4.0]
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

	/* 
	 * Strategy 'nocoords'
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
				color: allChannels.filter(x => x.indicators.includes('C')).map(x => x.name),
				lightness: allChannels.filter(x => x.indicators.includes('L')).map(x => x.name),
				noop: segregated.map(x => x.name),
				size: ([...measures, ...other]).map(x => x.name),
			},
			geometry: getGeometry()
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
			color: allChannels.filter(x => x.indicators.includes('C')).map(x => x.name),
			lightness: allChannels.filter(x => x.indicators.includes('L')).map(x => x.name),
			size: allChannels.filter(x => x.indicators.includes('S')).map(x => x.name),
		},
		geometry: getGeometry()
	};


}




document.addEventListener('DOMContentLoaded', () => {
	refresh();
});