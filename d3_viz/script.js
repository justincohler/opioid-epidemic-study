d3.queue()
    .defer(d3.json, 'data/rx_data.json')
    .awaitAll(function (error, results) {
        if (error) { throw error; }

        scatter = new ScatterPlot(results[0]);
        scatter.update(results[0]);

    });
// d3.json('data/rx_data.json')
//     .then(results => {
//     scatter = new ScatterPlot(results[0]);
//     scatter.update(results[0]);
// }, err => {
//     throw err;
// })


const margin = {
    left: 75,
    right: 50,
    top: 50,
    bottom: 75,
    yaxis: 50,
    xaxis: 50
};

const width = 625 - margin.left - margin.right;
const height = 625 - margin.top - margin.bottom;
const colors = {
    "KADIAN": "#ff0000",
    "FENTANYL": "#ff00ff",
    "OXYCODONE": "#ffff00",
    "OXYCONTIN": "#00ffff"
};

function ScatterPlot(data) {

    let chart = this;

    chart.SVG = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.svg = d3.select("svg")
        .append("g")

    chart.xScale = d3.scaleLinear()
        .domain([100000, 1000000])
        .range([width, 0])
        .nice();

    chart.yScale = d3.scaleLinear()
        .domain([0, 500])
        .range([0, height]);

    chart.xAxis = d3.axisTop(chart.xScale).ticks(5, "s");
    chart.yAxis = d3.axisRight(chart.yScale).ticks(5, "s");


};

ScatterPlot.prototype.update = function (data) {

    let chart = this;
    chart.full = data.slice();

    chart.svg.selectAll("*").interrupt();

    chart.svg.selectAll(".axisLabelMin").remove();
    chart.svg.selectAll(".circ").remove();
    chart.svg.selectAll("path").remove();
    chart.svg.selectAll(".annotation").remove();
    chart.svg.selectAll("#followPoint").remove();

    chart.SVG
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.svg.append("g")
        .attr("transform", () => `translate(0, ${margin.top})`)
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.svg.append("g")
        .attr("transform", () => `translate(${width}, ${margin.top})`)
        .attr("class", "axis")
        .call(chart.yAxis);

    chart.svg
        .append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", width + margin.right * 1.25)
        .style("text-anchor", "middle")
        .html("Total Amount Reimbursed ($ Millions)");

    chart.svg
        .append("text")
        .attr("class", "xAxisLabel")
        .attr("x", width / 2)
        .attr("y", 0 + margin.top * .5)
        .style("text-anchor", "middle")
        .html("Number of Prescriptions");

    chart.svg.selectAll(".circ")
        .data(chart.full, (d) => d["Group.1"]).enter()
        .append("circle")
        .attr("transform", () => `translate(-${margin.right}, ${margin.top})`)
        .attr("class", "circ")
        .attr("r", 0)
        .attr("cx", (d) => chart.xScale(d["Number of Prescriptions"]))
        .attr("cy", (d) => chart.yScale(d["Total Amount Reimbursed"]))
        .style("fill", (d) => colors[d["Drug Name"]])
        .transition()
        .delay(function (d, i) { return (i * 50) })
        .duration(500)
        .attr("r", 8);
};
