// @ts-ignore
import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@0.15/dist/vizzu.min.js';
import {
	Geometry,
	NocoordsMappingStrategy,
	ScatterMappingStrategy,
	Series,
	SeriesMappingStrategies,
	SeriesMappingStrategy,
	XYMappingStrategy,
	YXMappingStrategy
} from './series';
import { data } from './data';
import { get } from 'http';

let chart = new Vizzu('mychart', {
	data
});

function radioValue(name: string): string | undefined {
	const radio = document.querySelector(`input[type="radio"][name="${name}"]:checked`);
	if (radio instanceof HTMLInputElement) return radio.value;
	return undefined;
}

function getGeometry() {
	return (radioValue('geometry') ?? 'rectangle') as Geometry;
}

function getCoordSystem() {
	return radioValue('coords') ?? 'cartesian';
}

function getStrategy(): SeriesMappingStrategies {
	if (radioValue('strategy') === 'nocoords') return SeriesMappingStrategies.NOCOORDS;
	if (radioValue('strategy') === 'yx') return SeriesMappingStrategies.YX;
	if (radioValue('strategy') === 'scatter') return SeriesMappingStrategies.SCATTER;
	return SeriesMappingStrategies.XY;
}

function seriesFromTextArea(id: string): Series[] {
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
	const config = generateConfig(getStrategy());

	const pre = document.querySelector('.app__config pre');
	if (pre !== null) pre.innerHTML = JSON.stringify(config, null, 2);

	chart.animate({ config });
}

function generateConfig(strategy: SeriesMappingStrategies) {
	const [measures, stacker, stacked] = [
		seriesFromTextArea('measures'),
		seriesFromTextArea('segregated-dimensions'),
		seriesFromTextArea('other-dimensions')
	];
	const geometry = getGeometry();
	const coordSystem = getCoordSystem();

	const mappingStrategies: { [key in SeriesMappingStrategies]: SeriesMappingStrategy } = {
		[SeriesMappingStrategies.NOCOORDS]: NocoordsMappingStrategy,
		[SeriesMappingStrategies.YX]: YXMappingStrategy,
		[SeriesMappingStrategies.XY]: XYMappingStrategy,
		[SeriesMappingStrategies.SCATTER]: ScatterMappingStrategy
	};

	const mapper = new mappingStrategies[strategy](geometry, measures, stacker, stacked);

	return {
		...mapper.generateConfig(),
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
