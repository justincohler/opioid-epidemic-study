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
      highlight_lines(chr);
      return filter_year([geojson, chr, year]);
    })
    .then(([geojson, chr]) => {
      animate_histogram(chr);
      update_choropleth(chr);
      highlight_counties();
      highlight_bars(chr);
    });
};

/**
 * Sweep through years from 2014 to 2018 across charts.
 */
animate_years = () => {
  if (!AUTOPLAY) {
    return;
  }
  reanimate(YEAR);
  setTimeout(() => {
    YEAR = YEAR === 2018 ? 2014 : YEAR + 1;
    animate_years();
  }, 1500);
};

AUTOPLAY = false;

auto_animate = () => {
  if (!AUTOPLAY) {
    AUTOPLAY = true;
    d3.select("#animate").text("Stop");
    animate_years();
  } else {
    AUTOPLAY = !AUTOPLAY;
    d3.select("#animate").text("Animate");
  }
};

render();

/**
 * Remove all selected_counties and reanimate
 */
clear_selected = () => {
  selected_counties.clear();
  reanimate(YEAR);
};

/**
 * Highlight all selected counties on choropleth.
 */
highlight_counties = () => {
  d3.selectAll(".counties path").classed("inactiveCounty", d => {
    if (selected_counties.size === 0) {
      return false;
    } else {
      return !selected_counties.has(d.properties.GEOID);
    }
  });
};

/**
 * Given the selected county set, higlight the associated bars for
 * each time interval.
 */
highlight_bars = chr => {
  d3.selectAll(".bar").classed("inactiveCounty", d => {
    selected_buckets = new Set();
    selected_counties.forEach(selected_county => {
      pctile = ntile(MAX_STAT, chr[selected_county].od_mortality_rate, NTILES);
      selected_buckets.add(pctile);
    });
    if (selected_buckets.size === 0) {
      return false;
    } else {
      return !selected_buckets.has(d.bucket);
    }
  });
};

/**
 * Given the selected county set, highlight the associated lines for
 * each time interval
 */
highlight_lines = chr => {
  d3.selectAll(".line")
    .classed("activeLine", d => {
      if (selected_counties.size === 0) {
        return false;
      } else {
        return selected_counties.has(d.values.slice(-1)[0].fips);
      }
    })
    .classed("inactiveLine", d => {
      if (selected_counties.size === 0) {
        return false;
      } else {
        return !selected_counties.has(d.values.slice(-1)[0].fips);
      }
    });
};
