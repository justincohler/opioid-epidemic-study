async function make_choropleth([us, chr]) {

    d3.select("#wide")
        .append("svg")
        .attr("id", "choropleth")
        .attr("height", params.choropleth.height + params.choropleth.margin.top + params.choropleth.margin.bottom)
        .attr("width", params.choropleth.width + params.choropleth.margin.left + params.choropleth.margin.right);

    let choropleth = d3.select("#choropleth");

    var projection = d3.geoMercator().scale(8500).center([-79.5, 39.5]);

    // Create a path generator.
    var path = d3.geoPath()
        .projection(projection);

    const x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

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
    choropleth.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.cb_2015_west_virginia_county_20m).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", (d) => {
            return d.properties.GEOID
        })
        .attr("fill", (d) => {
            fips = d.properties.GEOID;
            value = chr[fips] && chr[fips].od_mortality_rate != "" ? chr[fips].od_mortality_rate : 0;
            return colorScale(value);
        })
        .on("mouseover", function (d, i) {
            tip.show(d, this);

            d3.select(this)
                .style("cursor", "pointer");

            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;

            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);
            console.log(pctile);
            d3.select("#bar-" + pctile)
                .attr("fill", YELLOW);

            lineID = "path#line-" + chr[d.properties.GEOID].county;
            console.log("LINE ID: ", lineID);

            d3.select(".line")
                .attr("stroke-opacity", 0.3);

            d3.select(lineID + ".line")
                .attr("fill", AQUA)
                .attr("stroke", YELLOW);
        })
        .on("mouseout", (d) => {
            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

            d3.select("#bar-" + pctile)
                .transition()
                .duration(200)
                .attr("fill", function (d) { return bucketColorScale(pctile); })
        })
        .on("click", function (d) {
            od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
            pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

            d3.selectAll(".line")
                .attr("fill", YELLOW)
                .attr("stroke", YELLOW);

            // This is the first county clicked
            if (selected_counties.size == 0) {
                choropleth.selectAll(".counties")
                    .attr("fill-opacity", 0.7);

                d3.selectAll(".bar")
                    .attr("fill-opacity", 0.3);
            }
            // Click "ON"
            if (!selected_counties.has(d.properties.GEOID)) {
                selected_counties.add(d.properties.GEOID);

                d3.select("#bar-" + pctile)
                    .attr("fill-opacity", 1.0);

                d3.select(this)
                    .attr("fill-opacity", 1.0);

            }
            // Click "OFF"
            else {
                selected_counties.delete(d.properties.GEOID);
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
        });

    return chr
}
