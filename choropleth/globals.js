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

const colorScale = d3.scaleLinear().domain([0, 87])
    .range([AQUA, RED])

const params = {
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

let chr_data = [];
let fips = {};
let selected_counties = new Set();
let year = 2018;


arg_max = (data, arg) => {
    const max_key = Object.keys(data).reduce((acc, d) => {
        a = Number(data[acc][arg]);
        b = Number(data[d][arg]);
        return a > b ? acc : d;
    });

    return data[max_key][arg];
}

pct_of_max = (max, val) => Math.trunc(val / max * 100);


async function filter_year(data, year) {
    console.log("Data: ", data);
    let reformed = {};
    await data.filter((d) => d.year == year).forEach((d) => {
        console.log(d);
        reformed[d.FIPS] = {
            county: d.county,
            state: d.state,
            od_mortality_rate: d.od_mortality_rate
        };
    });

    return reformed;
};

let promises = [
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("./od_2014_2018.csv", (d) => {
        return {
            year: +d.Year,
            county: d.County,
            state: d.State,
            od_mortality_rate: d["Drug Overdose Mortality Rate"]
        };
    })
];

Promise.all(promises)
    .then(([us_json, chr]) => {

        chr_data = chr;
        console.log("Finished reformatting all years' chr_data.");
        console.log("CHR Data[0]: ", chr_data[0]);

        return [us_json, chr];
    }).then(([us_json, chr]) => {
        make_choropleth([us_json, chr]).then((chr) => {
            make_choropleth_interactive(chr);
        });
        make_histogram(chr)
    });
    //     return [d3json, chr, fips];
    // })
    // .then(([d3json, chr, fips]) => {
    //     make_choropleth([d3json]);
    //     make_histogram([fips]);
    // });