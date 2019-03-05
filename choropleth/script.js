
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

var selected_counties = [];


// Choropleth Settings
m_choro = { top: 20, right: 20, bottom: 20, left: 20 };
h_choro = 200 - m_choro.top - m_choro.bottom;
w_choro = 400 - m_choro.left - m_choro.right;


// Histogram Settings
m_hist = { top: 20, right: 10, bottom: 20, left: 500 };
h_hist = 200 - m_hist.top - m_hist.bottom;
w_hist = 300 - m_hist.right;

// TS Plot Settings
m_ts = { top: h_hist + m_hist.top + m_hist.bottom, right: 10, bottom: 20, left: 500 };
h_ts = 200 - m_ts.bottom;
w_ts = 300 - m_ts.right;


var svg = d3.select("svg");

// Data & Promises
let fips = d3.map();

var promises = [
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("./county_health_rankings.csv", function (d) {
        fips.set(d.FIPS, d3.map());
        try {
            fips.get(d.FIPS).set("od_mortality_rate", d["Drug Overdose Mortality Rate"]);
        } catch { }
    }).then(function (data) {

    })
]
Promise.all(promises).then(ready);

async function ready([us]) {

    d3.tsv("./county_fips.tsv", function (d) {
        try {
            fips.get(d.FIPS).set("county", d.Name).set("state", d.State);
        } catch { }

    });

    /*=========================================================================
    Choropleth
    =========================================================================*/
    var path = d3.geoPath();

    var x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

    var color = d3.scaleLinear().domain([0, 87])
        .range([AQUA, RED])
        .interpolate(d3.interpolateCubehelix);

    // Tooltips
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .direction('n')
        .html(function (d) {
            county = fips.get(d.id).get("county");
            state = fips.get(d.id).get("state");

            return county + "," + state + "<br/>OD Mortality Rate: " + d.od_mortality_rate;
        });
    svg.call(tip);

    svg.append("g")
        .attr("id", "choropleth");

    var choropleth = svg.select("#choropleth");

    // County shapes
    choropleth.append("g")
        .attr("class", "counties")
        .attr("width", w_choro)
        .attr("height", h_choro)
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .on("mouseover", function (d, i) {
            console.log(d);
            tip.show(d, this);
        })
        .on("click", function (d, i) {

            selected_counties.push(d.id);
            console.log(selected_counties);

            svg.selectAll(".counties")
                .attr("fill-opacity", 0.7);

            d3.select(this)
                .attr("fill-opacity", 1.0);

        })
        .attr("fill", function (d) { return color(d.od_mortality_rate = fips.get(d.id).get("od_mortality_rate")); })
        .attr("d", path)
        .append("title")
        .text(function (d) { return d.rate + "%"; });

    // State shapes
    choropleth.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);


    /*=========================================================================
    Histogram
    =========================================================================*/
    svg.append("g")
        .attr("id", "histogram")
        .attr("transform", `translate(${m_hist.left}, ${m_hist.top})`);



    var histogram = svg.select("#histogram");

    histogram.append('rect')
        .attr("width", w_hist + m_hist.right)
        .attr("height", m_hist.top + h_hist + m_hist.bottom)
        .attr("opacity", 0)


    svg.append("g")
        .attr("id", "ts")
        .attr("transform", `translate(${m_ts.left}, ${m_ts.top})`);

    var ts = svg.select("#ts");

    /*=========================================================================
    Time Series Plot
    =========================================================================*/
    ts.append('rect')
        .attr("width", w_ts + m_ts.right)
        .attr("height", m_ts.bottom + h_ts)
        .attr("opacity", 0)

}

