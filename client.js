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
        ['Pop', 'Online', 'USA', 15000, 2.5],
        ['Jazz', 'Store', 'Canada', 8000, 2.6],
        ['Classical', 'Online', 'UK', 12000, 4.7],
        ['Electronic', 'Store', 'Germany', 9500, 3.2],
        ['Pop', 'Online', 'France', 18000, 3.0],
        ['Jazz', 'Store', 'USA', 7500, 2.6],
        ['Classical', 'Online', 'Canada', 13500, 3.5],
        ['Electronic', 'Store', 'Japan', 10500, 2.0],
        ['Pop', 'Online', 'UK', 20000, 3.5],
        ['Jazz', 'Store', 'Germany', 8800, 4.6],
        ['Classical', 'Online', 'France', 12500, 2.8],
        ['Electronic', 'Store', 'USA', 7200, 2.0],
        ['Pop', 'Online', 'Canada', 16500, 3.4],
        ['Jazz', 'Store', 'UK', 8200, 3.8],
        ['Classical', 'Online', 'Germany', 11000, 3.1],
        ['Electronic', 'Store', 'France', 9300, 2.4],
        ['Pop', 'Online', 'USA', 17500, 4.8],
        ['Jazz', 'Store', 'Canada', 7800, 4.0],
        ['Classical', 'Online', 'UK', 13000, 1.6],
        ['Electronic', 'Store', 'Germany', 9600, 1.6],
        ['Pop', 'Online', 'France', 18500, 4.0],
        ['Jazz', 'Store', 'USA', 7400, 1.8],
        ['Classical', 'Online', 'Canada', 14000, 1.3],
        ['Electronic', 'Store', 'Japan', 10200, 3.8],
        ['Pop', 'Online', 'UK', 19500, 2.8],
        ['Jazz', 'Store', 'Germany', 8500, 4.0],
        ['Classical', 'Online', 'France', 11500, 3.8],
        ['Electronic', 'Store', 'USA', 7100, 2.7],
        ['Pop', 'Online', 'Canada', 16000, 4.6],
        ['Jazz', 'Store', 'UK', 8000, 4.3],
        ['Classical', 'Online', 'Germany', 11300, 4.9],
        ['Electronic', 'Store', 'France', 9400, 1.7],
        ['Pop', 'Online', 'USA', 18100, 2.0],
        ['Jazz', 'Store', 'Canada', 7700, 4.2],
        ['Classical', 'Online', 'UK', 13400, 4.9],
        ['Electronic', 'Store', 'Japan', 10600, 4.9],
        ['Pop', 'Online', 'UK', 20300, 1.7],
        ['Jazz', 'Store', 'Germany', 8700, 2.2],
        ['Classical', 'Online', 'France', 12100, 3.8],
        ['Electronic', 'Store', 'USA', 7400, 4.5],
        ['Pop', 'Online', 'Canada', 15800, 1.6],
        ['Jazz', 'Store', 'UK', 8300, 4.7],
        ['Classical', 'Online', 'Germany', 11300, 2.2],
        ['Electronic', 'Store', 'France', 9300, 4.5],
        ['Pop', 'Online', 'USA', 17800, 4.3],
        ['Jazz', 'Store', 'Canada', 7600, 3.4],
        ['Classical', 'Online', 'UK', 13300, 3.2],
        ['Electronic', 'Store', 'Japan', 10400, 2.9],
        ['Pop', 'Online', 'UK', 19700, 2.8],
        ['Jazz', 'Store', 'Germany', 8500, 2.9],
        ['Classical', 'Online', 'France', 11800, 3.4],
        ['Electronic', 'Store', 'USA', 7100, 2.6],
        ['Pop', 'Online', 'Canada', 16400, 4.0],
        ['Jazz', 'Store', 'UK', 8000, 2.1],
        ['Classical', 'Online', 'Germany', 11000, 1.5],
        ['Electronic', 'Store', 'France', 9600, 1.1],
        ['Pop', 'Online', 'USA', 18100, 3.6],
        ['Jazz', 'Store', 'Canada', 7700, 2.7],
        ['Classical', 'Online', 'UK', 13400, 2.6],
        ['Electronic', 'Store', 'Japan', 10600, 4.7]
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