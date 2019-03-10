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
        hist_data[i] = 0;
    }

    let max_stat = arg_max(chr, "od_mortality_rate");

    Object.values(chr)
        .map(d => ntile(max_stat, d.od_mortality_rate, NTILES))
        .forEach((d) => {
            // console.log("Bucket: ", d)
            hist_data[d] ? hist_data[d]++ : hist_data[d] = 1;
        });

    let data = Object.entries(hist_data).map((d) => {
        return { "bucket": d[0], "count": d[1] };
    });


    let hist_x = d3.scaleBand()
        .rangeRound([0, params.histogram.width])
        .domain(data.map((d) => d.bucket))
        .padding(0.1);

    let hist_y = d3.scaleLinear()
        .range([params.histogram.height, 0])
        .domain(data.map((d) => d.count));

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
        .attr("y", (d) => params.histogram.height - hist_y(d.count))
        .attr("width", hist_x.bandwidth())
        .transition()
        .duration(1000)
        .attr("height", (d) => {
            h = hist_y(d.count);
            // console.log("Count:", d.count, "Height: ", h);
            return h;
        });
    return chr;
}