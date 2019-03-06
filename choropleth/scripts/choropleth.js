d3.select("#wide")
    .append("svg")
    .attr("id", "choropleth")
    .attr("height", params.choropleth.height + params.choropleth.margin.top + params.choropleth.margin.bottom)
    .attr("width", params.choropleth.width + params.choropleth.margin.left + params.choropleth.margin.right);

let choropleth = d3.select("#choropleth");

let promises = [
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("../data/county_health_rankings.csv", function (d) {
        try {
            fips[d.FIPS] = {
                "od_mortality_rate": d["Drug Overdose Mortality Rate"],
                "county": d.County,
                "state": d.State
            };
        } catch { }
    })
]
Promise.all(promises).then(make_choropleth)

async function make_choropleth([us]) {

    d3.tsv("../data/county_fips.tsv", function (d) {
        try {
            fips[d.FIPS]["state"] = d.State;
        } catch { }
    });

    let path = d3.geoPath();

    const x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

    // Tooltips
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .direction('n')
        .html(function (d) {
            county = fips[d.id]["county"];
            state = fips[d.id]["state"];

            text = county + ", " + state + "<br/>OD Mortality Rate: ";
            text += d.od_mortality_rate == "" ? "0" : d.od_mortality_rate;
            return text;
        });
    choropleth.call(tip);

    // County shapes
    choropleth.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .on("mouseover", function (d, i) {
            console.log(d);
            tip.show(d, this);
        })
        .on("click", function (d, i) {

            if (!selected_counties.has(d.id)) {
                selected_counties.add(d.id);
                console.log(selected_counties);

                choropleth.selectAll(".counties")
                    .attr("fill-opacity", 0.7);

                d3.selectAll(".bar")
                    .attr("fill-opacity", 0.7);

                d3.select(this)
                    .attr("fill-opacity", 1.0);

            } else {
                selected_counties.delete(d.id);
                if (selected_counties.size == 0) {
                    choropleth.selectAll(".counties")
                        .attr("fill-opacity", 1.0);

                    d3.selectAll(".bar")
                        .attr("fill-opacity", 1.0);
                } else {
                    d3.select(this)
                        .attr("fill-opacity", 0.7);
                }
            }



        })
        .attr("fill", function (d) { return colorScale(d.od_mortality_rate = fips[d.id]["od_mortality_rate"]); })
        .attr("d", path)
        .append("title")
        .text(function (d) { return d.rate + "%"; });

    // State shapes
    choropleth.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);
}

