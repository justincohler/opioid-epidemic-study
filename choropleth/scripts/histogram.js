async function make_histogram() {

    d3.select("#upper")
        .append("svg")
        .attr("id", "histogram")
        .attr("height", params.histogram.height + params.histogram.margin.top + params.histogram.margin.bottom)
        .attr("width", params.histogram.width + params.histogram.margin.left + params.histogram.margin.right);

    let histogram = d3.select("#histogram");
    let hist_x = d3.scaleBand().rangeRound([0, params.histogram.width]).padding(0.1)
    let hist_y = d3.scaleLinear().rangeRound([params.histogram.height, 0]);

    let g = histogram.append("g").attr("transform",
        `translate(${params.histogram.margin.left}, ${params.histogram.margin.top})`);

    var parseTime = d3.timeParse("%d-%b-%y");


    let max_stat = arg_max(fips, "od_mortality_rate")
    let hist_data = {};

    Object.keys(fips)
        .map((d) => pct_of_max(arg_max(fips, "od_mortality_rate"), fips[d].od_mortality_rate))
        .forEach((d) => {
            hist_data[d] ? hist_data[d]++ : hist_data[d] = 1;
        })

    let data = Object.entries(hist_data).map((d) => {
        return { "bucket": d[0], "count": d[1] };
    });

    hist_x.domain(data.map((d) => d.bucket));
    hist_y.domain(data.map((d) => d.count));

    g.append("g")
        .attr("transform", `translate(0,${params.histogram.height})`)
        .call(d3.axisBottom(hist_x).tickValues([]))

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("id", (d) => "bar-" + d.bucket)
        .attr("class", "bar")
        .attr("fill", (d) => colorScale(d.bucket))
        .attr("x", (d) => hist_x(d.bucket))
        .attr("y", (d) => hist_y(d.count))
        .attr("width", hist_x.bandwidth())
        .attr("height", (d) => params.histogram.height - hist_y(d.count));

}
