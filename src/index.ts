// @ts-ignore
import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@0.15/dist/vizzu.min.js';
import {
	Geometry,
	NocoordsStrategy,
	Series,
	SeriesMappingStrategies,
	XYStrategy,
	YXStrategy
} from './series';

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
	return radioValue('geometry') ?? 'rectangle';
}

function seriesFromArea(id: string): Series[] {
	const textarea = document.querySelector(`textarea#${id}`);
	if (textarea instanceof HTMLTextAreaElement) {
		return textarea.value
			.split('\n')
			.filter((x) => x.trim() !== '')
			.map((x) => {
				let [name, suffix] = x.split(':');
				return {
					name: name.trim(),
					indicators: (suffix ?? '')
						.trim()
						.split('')
						.filter((x) => x.trim() !== '')
				};
			});
	}
	return [];
}

function refresh() {
	let strategy: SeriesMappingStrategies = SeriesMappingStrategies.XY;
	if (radioValue('strategy') === 'yx') strategy = SeriesMappingStrategies.YX;
	if (radioValue('strategy') === 'nocoords')
		strategy = SeriesMappingStrategies.NOCOORDS;

	const config = generateConfig(strategy);

	const pre = document.querySelector('.app__config pre');
	if (pre !== null) pre.innerHTML = JSON.stringify(config, null, 2);

	chart.animate({ config });
}

function radioValue(name: string): string | undefined {
	const radio = document.querySelector(
		`input[type="radio"][name="${name}"]:checked`
	);
	console.log(radio);
	if (radio instanceof HTMLInputElement) return radio.value;
	return undefined;
}

function generateConfig(strategy: string) {
	const [measures, segregated, other] = [
		seriesFromArea('measures'),
		seriesFromArea('segregated-dimensions'),
		seriesFromArea('other-dimensions')
	];
	const geometry = getGeometry();
	let coordSystem = 'cartesian';
	if (radioValue('coords') === 'polar') coordSystem = 'polar';

	/**
	 * Generic rule:
	 * Lightness and color can have only one measure or multiple dimensions
	 * You cannot mix measures and dimensions in color and lightness
	 */

	/* Scatter XY
	 * 1 measure on x, 1 measure on y
	 * Categories must go on noop or color/lightess
	 * Categories which are not on color or lightnes must go on noop
	 */

	/**
	 * Strategy 'waterfall' xy
	 * 1 measure on y
	 * Segregated dimensions on x
	 * non-deg x and on y
	 */

	// Strategy 'nocoords'

	if (strategy === 'nocoords') {
		const strat = new NocoordsStrategy(
			geometry as Geometry,
			measures,
			segregated,
			other
		);
		return {
			...strat.generateConfig(),
			coordSystem: coordSystem,
			geometry: geometry
		};
	}

	// Strategy 'yx'

	if (strategy === 'yx') {
		const strat = new YXStrategy(
			geometry as Geometry,
			measures,
			segregated,
			other
		);
		return {
			...strat.generateConfig(),
			coordSystem: coordSystem,
			geometry: geometry
		};
	}

	// Default strategy 'xy'

	const strat = new XYStrategy(
		geometry as Geometry,
		measures,
		segregated,
		other
	);
	return {
		...strat.generateConfig(),
		coordSystem: coordSystem,
		geometry: geometry
	};
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('refresh')?.addEventListener('click', () => {
		refresh();
	});

	document.querySelectorAll('input[type="radio"]').forEach((radio) => {
		radio.addEventListener('change', () => {
			refresh();
		});
	});
	refresh();
});
