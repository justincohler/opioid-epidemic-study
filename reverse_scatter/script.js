/**
 * The format of this initial d3 v4 ScatterPlot utilized the following
 * repository for reference. Style structure in style.css also utilized
 * reference styles in:
 * 
 * https://github.com/alexcengler/tanf-exploration
 */
d3.queue()
    .defer(d3.json, 'data/rx_data.json')
    .awaitAll(function (error, results) {
        if (error) { throw error; }

        scatter = new ScatterPlot(results[0]);
        scatter.update(results[0]);
    });

const margin = {
    left: 75,
    right: 50,
    top: 125,
    bottom: 75,
    yaxis: 150,
    xaxis: 40,
    legendBox: 9
};

const radius = 6;
const width = 800 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;
const colors = {
    "KADIAN": "#F9DC5c",    // YELLOW
    "FENTANYL": "#55BCC9",  // BLUE
    "OXYCODONE": "#0F7173", // AQUA
    "OXYCONTIN": "#FC4445"  // RED
};

function ScatterPlot(data) {

    var chart = this;

    chart.svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")

    // Title
    chart.svg
        .append("text")
        .attr("class", "title")
        .attr("transform", `translate(50, 50)`)
        .html("Oxycodone Appears to Most Closely Correlate Prescriptions to Reimbursements")

    // Legend Line #1
    chart.svg
        .append("rect")
        .attr("class", "legendBox")
        .attr('x', margin.left)
        .attr('y', margin.top + margin.xaxis)
        .attr('fill', colors["OXYCODONE"]);

    chart.svg
        .append("text")
        .attr("class", "legendText")
        .attr("x", margin.left + 2 * margin.legendBox)
        .attr("y", margin.top + margin.xaxis + margin.legendBox)
        .html("OXYCODONE")

    // Legend Line #2
    chart.svg
        .append("rect")
        .attr("class", "legendBox")
        .attr('x', margin.left)
        .attr('y', margin.top + 1.5 * margin.xaxis)
        .attr('fill', colors["OXYCONTIN"]);

    chart.svg
        .append("text")
        .attr("class", "legendText")
        .attr("x", margin.left + 2 * margin.legendBox)
        .attr("y", margin.top + 1.5 * margin.xaxis + margin.legendBox)
        .html("OXYCONTIN")

    // Legend Line #3
    chart.svg
        .append("rect")
        .attr("class", "legendBox")
        .attr('x', margin.left)
        .attr('y', margin.top + 2 * margin.xaxis)
        .attr('fill', colors["FENTANYL"]);

    chart.svg
        .append("text")
        .attr("class", "legendText")
        .attr("x", margin.left + 2 * margin.legendBox)
        .attr("y", margin.top + 2 * margin.xaxis + margin.legendBox)
        .html("FENTANYL")

    // Legend Line #4
    chart.svg
        .append("rect")
        .attr("class", "legendBox")
        .attr('x', margin.left)
        .attr('y', margin.top + 2.5 * margin.xaxis)
        .attr('fill', colors["KADIAN"]);

    chart.svg
        .append("text")
        .attr("class", "legendText")
        .attr("x", margin.left + 2 * margin.legendBox)
        .attr("y", margin.top + 2.5 * margin.xaxis + margin.legendBox)
        .html("KADIAN");

    // SOURCE
    chart.svg
        .append("text")
        .attr("class", "source")
        .attr("x", width - 3 * margin.left)
        .attr("y", margin.top + height)
        .html("Source: Data.Medicaid.gov");

    chart.xScale = d3.scaleLinear()
        .domain([0, 10000000])
        .range([width, margin.left])
        .nice();

    chart.yScale = d3.scaleLinear()
        .domain([0, 600])
        .range([0, height]);

    chart.xAxis = d3.axisTop(chart.xScale).ticks(5, "s");
    chart.yAxis = d3.axisRight(chart.yScale).ticks(5, "s");

};

ScatterPlot.prototype.update = function (data) {

    let chart = this;
    chart.full = data.slice();
    chart.svg.selectAll(".circ").remove();

    chart.svg.append("g")
        .attr("transform", `translate(0, ${margin.top})`)
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.svg.append("g")
        .attr("transform", `translate(${width}, ${margin.top})`)
        .attr("class", "axis")
        .call(chart.yAxis);

    chart.svg
        .append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -((height) / 2 + margin.yaxis))
        .attr("y", width + margin.right)
        .style("text-anchor", "middle")
        .html("Total Amount Reimbursed ($ Millions)");

    chart.svg
        .append("text")
        .attr("class", "xAxisLabel")
        .attr("x", width / 2)
        .attr("y", 0 + margin.top - margin.xaxis)
        .style("text-anchor", "middle")
        .html("Number of Prescriptions");

    chart.svg.selectAll(".circ")
        .data(chart.full, (d) => d["Group.1"]).enter()
        .append("circle")
        .attr("transform", () => `translate(0, ${margin.top})`)
        .attr("class", "circ")
        .attr("r", 0)
        .attr("cx", (d) => chart.xScale(d["Number of Prescriptions"]))
        .attr("cy", (d) => chart.yScale(d["Total Amount Reimbursed"]))
        .attr("xValue", (d) => d["Number of Prescriptions"])
        .attr("yValue", (d) => d["Total Amount Reimbursed"])
        .style("fill", (d) => colors[d["Drug Name"]])
        .style("stroke", (d) => colors[d["Drug Name"]])
        .on("mouseover", function (d, i) {

            let x = this.cx.baseVal.value - margin.left - 10;
            let y = this.cy.baseVal.value + margin.top - 15;
            let xValue = this.getAttribute("xValue")
            let yValue = this.getAttribute("yValue")
            let id = `i${Math.trunc(xValue)}-${Math.trunc(yValue)}`;

            // Bump up circle size
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", radius * 2);

            // Hover Tooltips
            chart.svg
                .append("text")
                .attr("x", x)
                .attr("y", y - 8)
                .attr("id", `${id}-Prescriptions`)
                .attr("class", "hoverLabel")
                .html(`# Prescriptions: ${Number(xValue).toLocaleString()}`);

            chart.svg
                .append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("id", `${id}-Reimbursements`)
                .attr("class", "hoverLabel")
                .html(`$ Reimbursed: ${Math.trunc(Number(yValue)).toLocaleString()}M`);
        })
        .on("mouseout", function (d, i) {
            let xValue = this.getAttribute("xValue")
            let yValue = this.getAttribute("yValue")
            let id = `i${Math.trunc(xValue)}-${Math.trunc(yValue)}`;


            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", radius);

            console.log(`Deleting ${id}`);
            chart.svg.selectAll(`#${id}-Prescriptions`)
                .remove();
            chart.svg.selectAll(`#${id}-Reimbursements`)
                .remove();
        })
        .transition()
        .delay(function (d, i) { return (i * 50) })
        .duration(500)
        .attr("r", radius);
};