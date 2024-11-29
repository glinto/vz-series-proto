// @ts-ignore
import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@0.15/dist/vizzu.min.js';
import {
	Geometry,
	NocoordsMappingStrategy,
	RatioMappingStrategy,
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

function innerHTML(selector: string, html: string) {
	const element = document.querySelector(selector);
	if (element instanceof HTMLElement) element.innerHTML = html;
}

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
	if (radioValue('strategy') === 'ratio') return SeriesMappingStrategies.RATIO;
	if (radioValue('strategy') === 'waterfall') return SeriesMappingStrategies.WATERFALL;
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
	innerHTML('.app__status', '');

	try {
		const config = generateConfig(getStrategy());
		innerHTML('.app__config pre', JSON.stringify(config, null, 2));
		chart.animate({ config });
	} catch (e) {
		innerHTML('.app__status', (e as Error).toString());
	}
}

function generateConfig(strategy: SeriesMappingStrategies) {
	const [measures, stacker, stacked] = [
		seriesFromTextArea('measures'),
		seriesFromTextArea('stacker-dimensions'),
		seriesFromTextArea('stacked-dimensions')
	];
	const geometry = getGeometry();
	const coordSystem = getCoordSystem();

	const mappingStrategies: { [key in SeriesMappingStrategies]: SeriesMappingStrategy } = {
		[SeriesMappingStrategies.NOCOORDS]: NocoordsMappingStrategy,
		[SeriesMappingStrategies.YX]: YXMappingStrategy,
		[SeriesMappingStrategies.XY]: XYMappingStrategy,
		[SeriesMappingStrategies.SCATTER]: ScatterMappingStrategy,
		[SeriesMappingStrategies.WATERFALL]: XYMappingStrategy,
		[SeriesMappingStrategies.RATIO]: RatioMappingStrategy
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
