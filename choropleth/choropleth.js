async function make_choropleth([us, chr]) {

    d3.select("#wide")
        .append("svg")
        .attr("id", "choropleth")
        .attr("height", params.choropleth.height + params.choropleth.margin.top + params.choropleth.margin.bottom)
        .attr("width", params.choropleth.width + params.choropleth.margin.left + params.choropleth.margin.right);

    var projection = d3.geoMercator().scale(8500).center([-79.5, 39.5]);

    // Create a path generator.
    var path = d3.geoPath()
        .projection(projection);

    const x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

    let choropleth = d3.select("#choropleth");

    // County shapes
    choropleth.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.cb_2015_west_virginia_county_20m).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", (d) => {
            return d.properties.GEOID
        })

    return chr
}

async function update_choropleth(chr) {

    let choropleth = d3.select("#choropleth");

    const MAX_STAT = arg_max(chr, "od_mortality_rate");

    // Tooltips
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .direction('n')
        .html(function (d) {
            county = chr[d.properties.GEOID].county;
            state = chr[d.properties.GEOID].state;

            text = county + ", " + state + "<br/>OD Mortality Rate: ";
            text += chr[d.properties.GEOID].od_mortality_rate == "" ? "N/A" : chr[d.properties.GEOID].od_mortality_rate;
            return text;
        });
    choropleth.call(tip);

    // County shapes
    choropleth.selectAll("path")
        .on("mouseover", function (d, i) {
            tip.show(d, this);

            d3.select(this)
                .style("cursor", "pointer");

            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;

            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

            d3.select("#bar-" + pctile)
                .attr("fill", YELLOW);

            lineID = ("#line-" + chr[d.properties.GEOID].county).toLowerCase();

            d3.select(lineID)
                .classed("hoverLine", true);

        })
        .on("mouseout", (d) => {
            tip.hide(d, this);

            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

            lineID = ("#line-" + chr[d.properties.GEOID].county).toLowerCase();

            d3.select(lineID)
                .classed("hoverLine", false);

            d3.select("#bar-" + pctile)
                .transition()
                .duration(200)
                .attr("fill", function (d) { return bucketColorScale(pctile); })
        })
        .on("click", function (d) {
            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

            /* CLICK OFF */
            if (selected_counties.has(d.properties.GEOID)) {
                selected_counties.delete(d.properties.GEOID);
                // This is the last county unclicked
                if (selected_counties.size == 0) {
                    choropleth.selectAll(".counties")
                        .classed("activeCounty", false)
                        .classed("inactiveCounty", false);

                    choropleth.select(this)
                        .classed("activeCounty", false)
                        .classed("inactiveCounty", false);

                    d3.selectAll(".bar")
                        .attr("fill-opacity", 0.9);
                } else {
                    d3.select(this)
                        .classed("inactiveCounty", true)
                        .classed("activeCounty", false);

                    d3.select("#bar-" + pctile)
                        .attr("fill-opacity", 0.3);

                }
            }
            /* CLICK ON */
            else {
                // This is the first county clicked
                if (selected_counties.size == 0) {
                    choropleth.selectAll(`.counties`)
                        .classed("inactiveCounty", true);

                    d3.selectAll(".bar")
                        .attr("fill-opacity", 0.3);
                }
                // Click "ON"
                selected_counties.add(d.properties.GEOID);

                d3.select("#bar-" + pctile)
                    .attr("fill-opacity", 1.0);

                d3.select(this)
                    .classed("activeCounty", true);
            }
        })
        .transition()
        .duration(1000)
        .attr("fill", (d) => {
            fips = d.properties.GEOID;
            value = chr[fips] && chr[fips].od_mortality_rate != "" ? chr[fips].od_mortality_rate : 0;
            return colorScale(value);
        });

    // SOURCE
    choropleth
        .append("text")
        .attr("class", "source")
        .attr("x", params.choropleth.width / 2 - 50)
        .attr("y", params.choropleth.height - 50)
        .html("Source: CountyHealthRankings.org");
}
