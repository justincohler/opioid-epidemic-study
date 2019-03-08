async function make_choropleth([us, chr]) {

    d3.select("#wide")
        .append("svg")
        .attr("id", "choropleth")
        .attr("height", params.choropleth.height + params.choropleth.margin.top + params.choropleth.margin.bottom)
        .attr("width", params.choropleth.width + params.choropleth.margin.left + params.choropleth.margin.right);

    let choropleth = d3.select("#choropleth");

    var projection = d3.geoMercator().scale(7500).center([-80.4549, 39.0]);

    // Create a path generator.
    var path = d3.geoPath()
        .projection(projection);

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

    console.log(us);

    // County shapes
    choropleth.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.cb_2015_west_virginia_county_20m).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", (d) => {
            return d.properties.GEOID
        });

    return [us, chr]
}

async function make_choropleth_interactive([us, chr]) {

    let choropleth = d3.select("#choropleth");

    d3.selectAll("path")
        .data(chr)
        .enter()
        .attr("hello", (d) => {
            console.log(d);
        })
        .on("mouseover", function (d, i) {
            console.log(d);
            tip.show(d, this);

            pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);
            d3.select("#bar-" + pctile)
                .attr("fill", YELLOW);

            d3.select
        })
        .on("mouseout", (d) => {
            pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);
            d3.select("#bar-" + pctile)
                .transition()
                .duration(200)
                .attr("fill", function (d) { return colorScale(pctile); })
        })
        .on("click", function (d) {
            console.log(d);
            pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);

            // This is the first county clicked
            if (selected_counties.size == 0) {
                choropleth.selectAll(".counties")
                    .attr("fill-opacity", 0.7);

                d3.selectAll(".bar")
                    .attr("fill-opacity", 0.3);
            }
            // Click "ON"
            if (!selected_counties.has(d.id)) {
                selected_counties.add(d.id);

                d3.select("#bar-" + pctile)
                    .attr("fill-opacity", 1.0);

                d3.select(this)
                    .attr("fill-opacity", 1.0);

            }
            // Click "OFF"
            else {
                selected_counties.delete(d.id);
                // This is the last county unclicked
                if (selected_counties.size == 0) {
                    choropleth.selectAll(".counties")
                        .attr("fill-opacity", 1.0);

                    d3.selectAll(".bar")
                        .attr("fill-opacity", 1.0);
                } else {
                    d3.select(this)
                        .attr("fill-opacity", 0.7);

                    d3.select("#bar-" + pctile)
                        .attr("fill-opacity", 0.3);

                }
            }
        })
        .attr("fill", function (d) {
            console.log(d);
            return colorScale(d.od_mortality_rate = fips[d.id]["od_mortality_rate"]);
        });

}

