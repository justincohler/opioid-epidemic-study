async function make_choropleth([us]) {

    d3.select("#wide")
        .append("svg")
        .attr("id", "choropleth")
        .attr("height", params.choropleth.height + params.choropleth.margin.top + params.choropleth.margin.bottom)
        .attr("width", params.choropleth.width + params.choropleth.margin.left + params.choropleth.margin.right);

    let choropleth = d3.select("#choropleth");

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
            tip.show(d, this);

            pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);
            d3.select("#bar-" + pctile)
                .attr("fill", YELLOW);
        })
        .on("mouseout", (d) => {
            pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);
            d3.select("#bar-" + pctile)
                .transition()
                .duration(200)
                .attr("fill", function (d) { return colorScale(pctile); })
        })
        .on("click", function (d) {
            if (!selected_counties.has(d.id)) {
                selected_counties.add(d.id);
                console.log(selected_counties);

                choropleth.selectAll(".counties")
                    .attr("fill-opacity", 0.7);

                pctile = pct_of_max(arg_max(fips, "od_mortality_rate"), d.od_mortality_rate);

                d3.selectAll(".bar")
                    .attr("fill-opacity", 0.3);

                d3.select("#bar-" + pctile)
                    .attr("fill-opacity", 1.0);


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

