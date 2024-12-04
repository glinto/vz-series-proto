interface ConfigLike {
	channels: {
		x?: string[];
		y?: string[];
		color?: string[];
		lightness?: string[];
		noop?: string[];
		size?: string[];
	};
}

export type Geometry = 'rectangle' | 'circle' | 'line' | 'area';

export const StackableGeometries: Geometry[] = ['rectangle', 'area'];

export interface Series {
	name: string;
	indicators: string[];
}

export enum SeriesMappingStrategies {
	XY = 'xy',
	YX = 'yx',
	NOCOORDS = 'nocoords',
	SCATTER = 'scatter',
	WATERFALL = 'waterfall',
	RATIO = 'ratio'
}

abstract class SeriesMappingStrategyBase {
	constructor(
		protected readonly geometry: Geometry,
		protected readonly measures: Series[],
		protected readonly stackerDimensions: Series[],
		protected readonly stackedDimensions: Series[]
	) {}

	get allSeries(): Series[] {
		return [...this.measures, ...this.stackerDimensions, ...this.stackedDimensions];
	}

	get colorSeries(): Series[] {
		return this.unique(this.allSeries.filter((s) => s.indicators.includes('C')));
	}

	get lightnessSeries(): Series[] {
		return this.unique(this.allSeries.filter((s) => s.indicators.includes('L')));
	}

	get sizeSeries(): Series[] {
		return this.unique(this.allSeries.filter((s) => s.indicators.includes('S')));
	}

	unique<T>(arr: T[]): T[] {
		return Array.from(new Set(arr).values());
	}

	abstract generateConfig: () => ConfigLike;
}

export type SeriesMappingStrategy =
	| typeof XYMappingStrategy
	| typeof YXMappingStrategy
	| typeof NocoordsMappingStrategy;

/*
 * Generic rule:
 * Lightness and color can have only one measure or multiple dimensions
 * You cannot mix measures and dimensions in color and lightness
 *
 * Color indicators are bound to position, not to series> when moving series indicators must stay in their places
 * The only way to move indicator positions is to drag / swap the indicators
 * THe order of color and lihgtness channels must be defined in the same order in the config and must be read out as so
 */

/**
 * The ratio startegy is used for pie charts
 * - First measure is mapped to x
 * - Second mesaure is optional, mapped to y
 * - Stacker dimensions are mapped to x
 * - Stacked dimensions are mapped to y
 */
export class RatioMappingStrategy extends SeriesMappingStrategyBase {
	generateConfig = (): ConfigLike => {
		const stackable = StackableGeometries.includes(this.geometry);
		return {
			channels: {
				x: [...this.measures.slice(0, 1), ...this.stackerDimensions].map((s) => s.name),
				y: [...this.measures.slice(1, 2), ...(stackable ? this.stackedDimensions : [])].map((s) => s.name),
				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				noop: []
			}
		};
	};
}

/**
 * The scatter strategy is used for scatter charts
 * - First measure is mapped to x
 * - Second measure is mapped to y
 * - Stackable dimensions are mapped to noop unless they are mapped to color or lightness
 * - Stacked dimensions are mapped to noop unless they are mapped to color or lightness
 */
export class ScatterMappingStrategy extends SeriesMappingStrategyBase {
	generateConfig = (): ConfigLike => {
		if (this.measures.length < 2) {
			throw new Error('Scatter chart must have at least 2 measures');
		}
		return {
			channels: {
				x: [this.measures[0].name],
				y: [this.measures[1].name],
				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				noop: [...this.stackerDimensions, ...this.stackedDimensions]
					.filter((s) => !s.indicators.includes('C') && !s.indicators.includes('L'))
					.map((s) => s.name),
				size: this.sizeSeries.map((s) => s.name)
			}
		};
	};
}

/**
 * Strategy 'waterfall' xy
 * 1 measure on y
 * Segregated dimensions on x
 * non-deg x and on y
 */

/**
 * This strategy is used for bubble and treemap charts
 * - No coordinates are used
 * - Must have one measure on size, first measure is mapped to it
 * - Other measures must be on color or lightness channels, otherwise they are not contributing to the chart
 * - Stacker dimensions are mapped to noop
 * - Stacked dimensions are mapped to size
 */
export class NocoordsMappingStrategy extends SeriesMappingStrategyBase {
	generateConfig = (): ConfigLike => {
		return {
			channels: {
				x: [],
				y: [],
				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				noop: this.stackerDimensions.map((s) => s.name),
				size: [...this.measures.slice(0, 1), ...this.stackedDimensions].map((s) => s.name)
			}
		};
	};
}

/**
 * Classic XY strategy
 * - First measure is mapped to y
 * - Stacker dimensions are mapped to x
 * - Other dimensions are mapped to y if the geometry is stackable, otherwise noop
 */
export class XYMappingStrategy extends SeriesMappingStrategyBase {
	generateConfig = (): ConfigLike => {
		const stackable = StackableGeometries.includes(this.geometry);
		return {
			channels: {
				x: this.stackerDimensions.map((s) => s.name),
				y: [...this.measures.slice(0, 1), ...(stackable ? this.stackedDimensions : [])].map((s) => s.name),

				noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),

				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				size: this.sizeSeries.map((s) => s.name)
			}
		};
	};
}

/**
 * Classic YX strategy (or flipped orientation classic)
 * - First measure is mapped to x
 * - Stacker dimensions are mapped to y
 * - Other dimensions are mapped to x if the geometry is stackable, otherwise noop
 * - Orientation is flipped by defining y as the first channel
 */
export class YXMappingStrategy extends SeriesMappingStrategyBase {
	generateConfig = (): ConfigLike => {
		const stackable = StackableGeometries.includes(this.geometry);
		return {
			channels: {
				y: this.stackerDimensions.map((s) => s.name),
				x: [...this.measures.slice(0, 1), ...(stackable ? this.stackedDimensions : [])].map((s) => s.name),

				noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),

				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				size: this.sizeSeries.map((s) => s.name)
			}
		};
	};
}
