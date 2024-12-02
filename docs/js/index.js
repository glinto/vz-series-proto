// src/index.ts
import Vizzu from "https://cdn.jsdelivr.net/npm/vizzu@0.15/dist/vizzu.min.js";

// src/series.ts
var StackableGeometries = ["rectangle", "area"];
var SeriesMappingStrategyBase = class {
  constructor(geometry, measures, stackerDimensions, stackedDimensions) {
    this.geometry = geometry;
    this.measures = measures;
    this.stackerDimensions = stackerDimensions;
    this.stackedDimensions = stackedDimensions;
  }
  get allSeries() {
    return [...this.measures, ...this.stackerDimensions, ...this.stackedDimensions];
  }
  get colorSeries() {
    return this.unique(this.allSeries.filter((s) => s.indicators.includes("C")));
  }
  get lightnessSeries() {
    return this.unique(this.allSeries.filter((s) => s.indicators.includes("L")));
  }
  get sizeSeries() {
    return this.unique(this.allSeries.filter((s) => s.indicators.includes("S")));
  }
  unique(arr) {
    return Array.from(new Set(arr).values());
  }
};
var RatioMappingStrategy = class extends SeriesMappingStrategyBase {
  generateConfig = () => {
    const stackable = StackableGeometries.includes(this.geometry);
    return {
      channels: {
        x: [...this.measures.slice(0, 1), ...this.stackerDimensions].map((s) => s.name),
        y: [...this.measures.slice(1, 2), ...stackable ? this.stackedDimensions : []].map((s) => s.name),
        color: this.colorSeries.map((s) => s.name),
        lightness: this.lightnessSeries.map((s) => s.name),
        noop: []
      }
    };
  };
};
var ScatterMappingStrategy = class extends SeriesMappingStrategyBase {
  generateConfig = () => {
    if (this.measures.length < 2) {
      throw new Error("Scatter chart must have at least 2 measures");
    }
    return {
      channels: {
        x: [this.measures[0].name],
        y: [this.measures[1].name],
        color: this.colorSeries.map((s) => s.name),
        lightness: this.lightnessSeries.map((s) => s.name),
        noop: [...this.stackerDimensions, ...this.stackedDimensions].filter((s) => !s.indicators.includes("C") && !s.indicators.includes("L")).map((s) => s.name),
        size: this.sizeSeries.map((s) => s.name)
      }
    };
  };
};
var NocoordsMappingStrategy = class extends SeriesMappingStrategyBase {
  generateConfig = () => {
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
};
var XYMappingStrategy = class extends SeriesMappingStrategyBase {
  generateConfig = () => {
    const stackable = StackableGeometries.includes(this.geometry);
    return {
      channels: {
        x: this.stackerDimensions.map((s) => s.name),
        y: [...this.measures.slice(0, 1), ...stackable ? this.stackedDimensions : []].map((s) => s.name),
        noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),
        color: this.colorSeries.map((s) => s.name),
        lightness: this.lightnessSeries.map((s) => s.name),
        size: this.sizeSeries.map((s) => s.name)
      }
    };
  };
};
var YXMappingStrategy = class extends SeriesMappingStrategyBase {
  generateConfig = () => {
    const stackable = StackableGeometries.includes(this.geometry);
    return {
      channels: {
        y: this.stackerDimensions.map((s) => s.name),
        x: [...this.measures.slice(0, 1), ...stackable ? this.stackedDimensions : []].map((s) => s.name),
        noop: stackable ? [] : this.stackedDimensions.map((s) => s.name),
        color: this.colorSeries.map((s) => s.name),
        lightness: this.lightnessSeries.map((s) => s.name),
        size: this.sizeSeries.map((s) => s.name)
      }
    };
  };
};

// src/data.ts
var data = {
  series: [
    { name: "Genre", type: "dimension" },
    { name: "Channel", type: "dimension" },
    { name: "Country", type: "dimension" },
    { name: "Copies", type: "measure" },
    { name: "Rating", type: "measure" }
  ],
  records: [
    ["Pop", "Online", "USA", 3e4, 4.3],
    ["Pop", "Online", "Canada", 15e3, 3.8],
    ["Pop", "Online", "UK", 16e3, 4.1],
    ["Pop", "Online", "Germany", 14e3, 4],
    ["Pop", "Online", "France", 17e3, 3.9],
    ["Pop", "Online", "Japan", 32e3, 4.5],
    ["Pop", "Store", "USA", 2e4, 4],
    ["Pop", "Store", "Canada", 14e3, 3.7],
    ["Pop", "Store", "UK", 15e3, 3.5],
    ["Pop", "Store", "Germany", 13e3, 3.6],
    ["Pop", "Store", "France", 18e3, 4.2],
    ["Pop", "Store", "Japan", 5e3, 4.1],
    ["Jazz", "Online", "USA", 25e3, 3.9],
    ["Jazz", "Online", "Canada", 14e3, 4.1],
    ["Jazz", "Online", "UK", 12e3, 3.5],
    ["Jazz", "Online", "Germany", 13e3, 4.4],
    ["Jazz", "Online", "France", 14e3, 3.6],
    ["Jazz", "Online", "Japan", 26e3, 4],
    ["Jazz", "Store", "USA", 15e3, 3.8],
    ["Jazz", "Store", "Canada", 11e3, 4],
    ["Jazz", "Store", "UK", 12e3, 3.9],
    ["Jazz", "Store", "Germany", 14e3, 4.2],
    ["Jazz", "Store", "France", 17e3, 3.8],
    ["Jazz", "Store", "Japan", 6e3, 4.1],
    ["Classical", "Online", "USA", 8e3, 4.4],
    ["Classical", "Online", "Canada", 12e3, 4.3],
    ["Classical", "Online", "UK", 13e3, 3.9],
    ["Classical", "Online", "Germany", 2e4, 3.6],
    ["Classical", "Online", "France", 14e3, 3.8],
    ["Classical", "Online", "Japan", 9e3, 4],
    ["Classical", "Store", "USA", 4e3, 4.1],
    ["Classical", "Store", "Canada", 6e3, 4.2],
    ["Classical", "Store", "UK", 8e3, 3.6],
    ["Classical", "Store", "Germany", 18e3, 4],
    ["Classical", "Store", "France", 2e4, 3.7],
    ["Classical", "Store", "Japan", 2e3, 4.2],
    ["Electronic", "Online", "USA", 5e4, 3.5],
    ["Electronic", "Online", "Canada", 2e4, 3.8],
    ["Electronic", "Online", "UK", 22e3, 3.9],
    ["Electronic", "Online", "Germany", 45e3, 3.6],
    ["Electronic", "Online", "France", 24e3, 3.9],
    ["Electronic", "Online", "Japan", 6e4, 4.4],
    ["Electronic", "Store", "USA", 35e3, 3.7],
    ["Electronic", "Store", "Canada", 14e3, 3.8],
    ["Electronic", "Store", "UK", 17e3, 3.5],
    ["Electronic", "Store", "Germany", 4e4, 3.7],
    ["Electronic", "Store", "France", 28e3, 3.9],
    ["Electronic", "Store", "Japan", 5e3, 4]
  ]
};

// src/index.ts
var chart = new Vizzu("mychart", {
  data
});
function innerHTML(selector, html) {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) element.innerHTML = html;
}
function radioValue(name) {
  const radio = document.querySelector(`input[type="radio"][name="${name}"]:checked`);
  if (radio instanceof HTMLInputElement) return radio.value;
  return void 0;
}
function getGeometry() {
  return radioValue("geometry") ?? "rectangle";
}
function getCoordSystem() {
  return radioValue("coords") ?? "cartesian";
}
function getStrategy() {
  if (radioValue("strategy") === "nocoords") return "nocoords" /* NOCOORDS */;
  if (radioValue("strategy") === "yx") return "yx" /* YX */;
  if (radioValue("strategy") === "scatter") return "scatter" /* SCATTER */;
  if (radioValue("strategy") === "ratio") return "ratio" /* RATIO */;
  if (radioValue("strategy") === "waterfall") return "waterfall" /* WATERFALL */;
  return "xy" /* XY */;
}
function seriesFromTextArea(id) {
  const textarea = document.querySelector(`textarea#${id}`);
  if (textarea instanceof HTMLTextAreaElement) {
    return textarea.value.split("\n").filter((x) => x.trim() !== "").map((x) => {
      let [name, suffix] = x.split(":");
      return {
        name: name.trim(),
        indicators: (suffix ?? "").trim().split("").filter((x2) => x2.trim() !== "")
      };
    });
  }
  return [];
}
function refresh() {
  innerHTML(".app__status", "");
  try {
    const config = generateConfig(getStrategy());
    innerHTML(".app__config pre", JSON.stringify(config, null, 2));
    chart.animate({ config }).then(() => {
      chart.feature("tooltip", true);
    });
  } catch (e) {
    innerHTML(".app__status", e.toString());
  }
}
function generateConfig(strategy) {
  const [measures, stacker, stacked] = [
    seriesFromTextArea("measures"),
    seriesFromTextArea("stacker-dimensions"),
    seriesFromTextArea("stacked-dimensions")
  ];
  const geometry = getGeometry();
  const coordSystem = getCoordSystem();
  const mappingStrategies = {
    ["nocoords" /* NOCOORDS */]: NocoordsMappingStrategy,
    ["yx" /* YX */]: YXMappingStrategy,
    ["xy" /* XY */]: XYMappingStrategy,
    ["scatter" /* SCATTER */]: ScatterMappingStrategy,
    ["waterfall" /* WATERFALL */]: XYMappingStrategy,
    ["ratio" /* RATIO */]: RatioMappingStrategy
  };
  const mapper = new mappingStrategies[strategy](geometry, measures, stacker, stacked);
  return {
    ...mapper.generateConfig(),
    coordSystem,
    geometry
  };
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refresh")?.addEventListener("click", () => {
    refresh();
  });
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      refresh();
    });
  });
  refresh();
});
