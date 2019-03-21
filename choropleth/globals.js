const RED = "#FC4445";
const BLUE = "#5E2BFF";
const YELLOW = "#F9DC5c";
const AQUA = "#0F7173";
const LIGHT_GREEN = "#56E39F";
const ORANGE = "#F18F01";
const BRIGHT_GREEN = "#4CB944";
const WHITE = "#CAFAFE";
const SKY = "#55BCC9";
const MIDNIGHT = "#0B132B";
const NTILES = 20;
const MAX_STAT = 93; // Maximum value of OD Mortality Rate

/**
 * SVG Size Parameters
 */
const params = {
  choropleth: {
    height: 740,
    width: 900,
    margin: { top: 20, right: 0, bottom: 20, left: 20 }
  },
  histogram: {
    height: 300,
    width: 400,
    margin: { top: 20, right: 20, bottom: 30, left: 20 }
  },
  line: {
    height: 300,
    width: 400,
    margin: { top: 20, right: 20, bottom: 20, left: 20 }
  }
};
const colorScale = d3
  .scaleLinear()
  .domain([0, 82])
  .range([AQUA, RED]);
const bucketColorScale = d3
  .scaleLinear()
  .domain([0, NTILES])
  .range([AQUA, RED]);

var YEAR = 2014;

let selected_counties = new Set();
let promises = [
  d3.json("wv_county_topo.json"),
  d3.csv("./od_2014_2018_wv.csv", function(d) {
    return {
      FIPS: d.FIPS,
      year: +d.Year,
      od_mortality_rate: +d["Drug Overdose Mortality Rate"],
      county: d.County,
      state: d.State
    };
  })
];

filter_year = ([geojson, chr, year]) => {
  console.log("YEAR:", year);
  fips_wise = chr
    .filter(d => d.year === year)
    .reduce(function(obj, d) {
      obj[d.FIPS] = {
        state: d.state,
        county: d.county,
        od_mortality_rate: d.od_mortality_rate
      };
      return obj;
    });
  return [geojson, fips_wise];
};
/**
 * Return the maimum value of the given data object's value argument.
 *
 * @param  {} data
 * @param  {} arg
 */
arg_max = (data, arg) => {
  const max = d3.max(Object.values(data), d => {
    return d[arg];
  });

  return max;
};
/**
 * Return the NTILE for a given data point.
 *
 * @param  {} max
 * @param  {} val
 * @param  {} buckets=100
 */
ntile = (max, val, buckets = 100) => Math.trunc((val / max) * buckets);

/**
 * Read GeoJSON and CHR data, then populate all SVG plots.
 *
 * The below line plot utilizes all years' data.
 * The below histogram and choropleth use a given year's data.
 *
 * @param  {} year=2018
 */
render = (year = 2014) => {
  Promise.all(promises)
    .then(([geojson, chr]) => {
      make_histogram();
      make_choropleth([geojson, chr]);
      make_line();
      return [geojson, chr];
    })
    .then(([geojson, chr]) => {
      update_line(chr);
      return filter_year([geojson, chr, year]);
    })
    .then(([geojson, chr]) => {
      update_choropleth(chr);
      update_histogram(chr);
    });
};
/**
 * Update the line plot, choropleth, and histogram
 * for the given year.
 *
 * @param  {} year
 */
reanimate = year => {
  YEAR = +year;
  Promise.all(promises)
    .then(([geojson, chr]) => {
      update_line(chr);
      return filter_year([geojson, chr, year]);
    })
    .then(([geojson, chr]) => {
      update_histogram(chr);
      update_choropleth(chr);
    });
};

render();

AUTOPLAY = true;

animate_years = () => {
  reanimate(2014);
  setTimeout(() => {
    reanimate(2015);
    setTimeout(() => {
      reanimate(2016);
      setTimeout(() => {
        reanimate(2017);
        setTimeout(() => {
          reanimate(2018);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 2000);
};

animate_years();
