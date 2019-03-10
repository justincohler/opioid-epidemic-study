/* Source/Credit: https://codepen.io/zakariachowdhury/pen/JEmjwq
*/
async function make_line(chr) {

    let line_data = {};

    const MAX_STAT = arg_max(chr, "od_mortality_rate");


    Object.values(chr)
        .map((d) => {
            if (d.county in line_data) {
                line_data[d.county].push({
                    "year": d.year,
                    "county": d.county,
                    "od_mortality_rate": d.od_mortality_rate
                });
            } else {
                line_data[d.county] = [{
                    "year": d.year,
                    "county": d.county,
                    "od_mortality_rate": d.od_mortality_rate
                }];
            }

        });

    console.log("Line Data:", line_data);

    final_data = []
    Object.keys(line_data)
        .map((key) => {
            obj = {
                "name": key,
                "values": line_data[key]
            }
            final_data.push(obj);
        });

    final_data = final_data.filter((d) => {
        console.log(d);
        return d.name != "undefined";
    });

    console.log("Final Data:", final_data);

    var duration = 250;

    var lineOpacity = "0.3";
    var lineOpacityHover = ".9";
    var otherLinesOpacityHover = "0.3";
    var lineStroke = "2px";
    var lineStrokeHover = "5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.3"
    var circleRadius = 5;
    var circleRadiusHover = 10;

    /* Scale */
    var xScale = d3.scaleLinear()
        .domain([2014, 2018])
        .range([0, params.line.width - params.line.margin.left]);

    var yScale = d3.scaleLinear()
        .domain([0, MAX_STAT])
        .range([params.line.height - params.line.margin.top, 0]);

    /* Add SVG */
    var svg = d3.select("#lower").append("svg")
        .attr("width", params.line.width + params.line.margin.left)
        .attr("height", params.line.height + params.line.margin.top)
        .append('g')
        .attr("transform", `translate(${params.line.margin.left}, ${params.line.margin.top})`);


    /* Add line into SVG */
    var line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.od_mortality_rate));

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(final_data).enter()
        .append('g')
        .attr('class', 'line-group')
        .on("mouseover", function (d, i) {
            svg.append("text")
                .attr("class", "title-text")
                .style("fill", colorScale(d.values.slice(-1)[0].od_mortality_rate))
                .text(d.name)
                .attr("text-anchor", "middle")
                .attr("x", (params.line.width - params.line.margin.left) / 2)
                .attr("y", 5);
        })
        .on("mouseout", function (d) {
            svg.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr("id", d => "line-" + d.name)
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => colorScale(d.values.slice(-1)[0].od_mortality_rate))
        .style('opacity', lineOpacity)
        .on("mouseover", function (d) {
            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.selectAll(".line")
                .style('opacity', lineOpacity);
            d3.selectAll('.circle')
                .style('opacity', circleOpacity);
            d3.select(this)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(final_data).enter()
        .append("g")
        .style("fill", (d) => colorScale(d.values.slice(-1)[0].od_mortality_rate))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(`${d.od_mortality_rate}`)
                .attr("x", d => xScale(d.year) + 5)
                .attr("y", d => yScale(d.od_mortality_rate) - 10);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .transition()
                .duration(duration)
                .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.od_mortality_rate))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius);
        });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d"));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${params.line.height - params.line.margin.top})`)
        .call(xAxis);

}
