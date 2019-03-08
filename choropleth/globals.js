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

const params = {
    // Choropleth Settings
    choropleth: {
        height: 740,
        width: 920,
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    histogram: {
        height: 250,
        width: 250,
        margin: { top: 20, right: 20, bottom: 30, left: 40 }
    }
}

const colorScale = d3.scaleLinear().domain([0, 87])
    .range([AQUA, RED])

let YEAR = 2015;
let fips = {};
let selected_counties = new Set();
let promises = [
    d3.json("wv_county_topo.json"),
    d3.csv("./od_2014_2018_wv.csv", function (d) {
        return {
            "FIPS": d.FIPS,
            "year": +d.Year,
            "od_mortality_rate": +d["Drug Overdose Mortality Rate"],
            "county": d.County,
            "state": d.State

        }
    })
]

filter_year = ([geojson, chr]) => {
    fips_wise = chr.filter(d => d.year === YEAR).reduce(function (obj, d) {
        obj[d.FIPS] = { "state": d.state, "county": d.county, "od_mortality_rate": d.od_mortality_rate };
        return obj;
    })
    return [geojson, fips_wise];
}

arg_max = (data, arg) => {
    const max = d3.max(data, (d) => {
        return d.od_mortality_rate
    });

    return max;
}

pct_of_max = (max, val) => Math.trunc(val / max * 100);

Promise.all(promises)
    .then(filter_year)
    .then(make_choropleth)
    .then(make_histogram);
