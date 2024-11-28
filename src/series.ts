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
	WATERFALL = 'waterfall'
}

abstract class SeriesMappingStrategy {
	constructor(
		protected readonly geometry: Geometry,
		protected readonly measures: Series[],
		protected readonly stackerDimensions: Series[],
		protected readonly stackedDimensions: Series[]
	) {}

	get allSeries(): Series[] {
		return [
			...this.measures,
			...this.stackerDimensions,
			...this.stackedDimensions
		];
	}

	get colorSeries(): Series[] {
		return this.unique(
			this.allSeries.filter((s) => s.indicators.includes('C'))
		);
	}

	get lightnessSeries(): Series[] {
		return this.unique(
			this.allSeries.filter((s) => s.indicators.includes('L'))
		);
	}

	get sizeSeries(): Series[] {
		return this.unique(
			this.allSeries.filter((s) => s.indicators.includes('S'))
		);
	}

	unique<T>(arr: T[]): T[] {
		return Array.from(new Set(arr).values());
	}

	abstract generateConfig: () => ConfigLike;
}

/**
 * This strategy is used for bubble and treemap charts
 * - No coordinates are used
 * - Must have one measure on size, first measure is mapped to it
 * - Other measures must be on color or lightness channels, otherwise they are not contributing to the chart
 * - Stacker dimensions are mapped to noop
 * - Stacked dimensions are mapped to size
 */
export class NocoordsStrategy extends SeriesMappingStrategy {
	generateConfig = (): ConfigLike => {
		return {
			channels: {
				x: [],
				y: [],
				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				noop: this.stackerDimensions.map((s) => s.name),
				size: [...this.measures.slice(0, 1), ...this.stackedDimensions].map(
					(s) => s.name
				)
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
export class XYStrategy extends SeriesMappingStrategy {
	generateConfig = (): ConfigLike => {
		const stackable = StackableGeometries.includes(this.geometry);
		return {
			channels: {
				x: this.stackerDimensions.map((s) => s.name),
				y: [
					...this.measures.slice(0, 1),
					...(stackable ? this.stackedDimensions : [])
				].map((s) => s.name),

				noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),

				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				size: this.sizeSeries.map((s) => s.name)
			}
		};
	};
}

/**
 * Classic YX strategy (flipped orientation classic)
 * - First measure is mapped to x
 * - Stacker dimensions are mapped to y
 * - Other dimensions are mapped to x if the geometry is stackable, otherwise noop
 * - Orientation is flipped by defining y as the first channel
 */
export class YXStrategy extends SeriesMappingStrategy {
	generateConfig = (): ConfigLike => {
		const stackable = StackableGeometries.includes(this.geometry);
		return {
			channels: {
				y: this.stackerDimensions.map((s) => s.name),
				x: [
					...this.measures.slice(0, 1),
					...(stackable ? this.stackedDimensions : [])
				].map((s) => s.name),

				noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),

				color: this.colorSeries.map((s) => s.name),
				lightness: this.lightnessSeries.map((s) => s.name),
				size: this.sizeSeries.map((s) => s.name)
			}
		};
	};
}
