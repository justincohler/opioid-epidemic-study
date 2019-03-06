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

console.log(fips);

// for (const key of fips.entries()) {
//     console.log(key);
// }

async function make_histogram(data) {
    let max_metric = 0;
    const nbuckets = 100;

    buckets = new Map();

}


d3.tsv("../data/morley.tsv").then(function (data) {
    hist_x.domain(data.map(function (d) {
        return d.Run;
    }));
    hist_y.domain([0, d3.max(data, function (d) {
        return Number(d.Speed);
    })]);

    g.append("g")
        .attr("transform", `translate(0,${params.histogram.height})`)
        .call(d3.axisBottom(hist_x))

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function (d) {
            return colorScale(Number(d.Run));
        })
        .attr("x", function (d) {
            return hist_x(d.Run);
        })
        .attr("y", function (d) {
            return hist_y(Number(d.Speed));
        })
        .attr("width", hist_x.bandwidth())
        .attr("height", function (d) {
            return params.histogram.height - hist_y(Number(d.Speed));
        });
});
