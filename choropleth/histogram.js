async function make_histogram() {

    d3.select("#upper")
        .append("svg")
        .attr("id", "histogram")
        .attr("height", params.histogram.height + params.histogram.margin.top + params.histogram.margin.bottom)
        .attr("width", params.histogram.width + params.histogram.margin.left + params.histogram.margin.right);
}


async function update_histogram(chr) {
    let hist_data = {};
    for (i = 0; i <= NTILES; i++) {
        hist_data[i] = {
            "count": 0,
            "fips": []
        };
    }

    let max_stat = arg_max(chr, "od_mortality_rate");

    Object.entries(chr).forEach(([fips, value]) => {
        bucket = ntile(max_stat, value.od_mortality_rate, NTILES);
        if (bucket) {
            hist_data[bucket].count++;
            hist_data[bucket].fips.push(fips);
        }

    });


    let data = Object.entries(hist_data).map(([key, val]) => {
        return { "bucket": +key, "count": val.count, "fips": val.fips };
    });


    let hist_x = d3.scaleBand()
        .rangeRound([0, params.histogram.width])
        .domain(data.map((d) => d.bucket))
        .padding(0.1);

    max_count = d3.max(Object.values(data), (d) => {
        return d.count;
    });

    let hist_y = d3.scaleLinear()
        .range([params.histogram.height, 0])
        .domain([max_count, 0]);

    let histogram = d3.select("#histogram");

    let g = histogram.append("g").attr("transform",
        `translate(${params.histogram.margin.left}, ${params.histogram.margin.top})`);

    g.append("g")
        .attr("transform", `translate(0,${params.histogram.height})`)
        .call(d3.axisBottom(hist_x).tickValues([]))

    d3.selectAll(".bar").remove();
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("id", (d) => "bar-" + d.bucket)
        .attr("class", "bar")
        .attr("fill", (d) => bucketColorScale(d.bucket))
        .attr("x", (d) => hist_x(d.bucket))
        .attr("y", (d) => params.histogram.height)
        .attr("width", hist_x.bandwidth())
        .on("mouseover", (d) => {
            d.fips.forEach((d) => {
                d3.select("#poly-" + d)
                    .classed("countiesHovered", true);
            });
        })
        .on("mouseout", (d) => {
            d.fips.forEach((d) => {
                d3.select("#poly-" + d)
                    .classed("countiesHovered", false);
            });
        })
        .transition()
        .duration(1000)
        .attr("height", (d) => {
            h = hist_y(d.count);
            // console.log("Count:", d.count, "Height: ", h);
            return h;
        })
        .attr("y", (d) => {
            console.log("Count:", d.count, "Height: ", hist_y(d.count));
            return params.histogram.height - hist_y(d.count);
        });

    return chr;
}