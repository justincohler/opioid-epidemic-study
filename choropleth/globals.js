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
        height: 550,
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

let fips = {};
let selected_counties = new Set();
let promises = [
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("./county_health_rankings.csv", function (d) {
        try {
            fips[d.FIPS] = {
                "od_mortality_rate": d["Drug Overdose Mortality Rate"],
                "county": d.County,
                "state": d.State
            };
        } catch { }
    }),
    d3.tsv("./county_fips.tsv", function (d) {
        try {
            fips[d.FIPS]["state"] = d.State;
        } catch { }
    })
]

Promise.all(promises).then(make_choropleth).then(make_histogram);

arg_max = (data, arg) => {
    const max_key = Object.keys(data).reduce((acc, d) => {
        a = Number(data[acc][arg]);
        b = Number(data[d][arg]);
        return a > b ? acc : d;
    });

    return data[max_key][arg];
}

pct_of_max = (max, val) => Math.trunc(val / max * 100);

