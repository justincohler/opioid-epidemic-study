/* 
Source/Credit: https://codepen.io/zakariachowdhury/pen/JEmjwq

The above source was invaluable in getting a starting point for how to create the
many elements involved in the below line graph (the lines themselves, the 
data points as circles, the informative text revealed on hover, etc.)

*/
async function make_line() {
  /* Scale */
  var xScale = d3
    .scaleLinear()
    .domain([2014, 2018])
    .range([0, params.line.width - params.line.margin.left]);

  var yScale = d3
    .scaleLinear()
    .domain([0, MAX_STAT])
    .range([params.line.height - params.line.margin.top, 0]);

  /* Add SVG */
  var svg = d3
    .select("#lower")
    .append("svg")
    .attr("id", "linePlot")
    .attr("width", params.line.width + params.line.margin.left)
    .attr("height", params.line.height + params.line.margin.top)
    .append("g")
    .attr(
      "transform",
      `translate(${params.line.margin.left}, ${params.line.margin.top})`
    );

  let lines = svg.append("g").attr("class", "lines");

  /* Add Axis into SVG */
  var xAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.format("d"));

  svg
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(0, ${params.line.height - params.line.margin.top})`
    )
    .call(xAxis);
}

async function update_line(chr) {
  let line_data = {};

  let lines = d3.selectAll(".lines");

  let svg = d3.select("#linePlot");

  /* Scale */
  var xScale = d3
    .scaleLinear()
    .domain([2014, 2018])
    .range([0, params.line.width - params.line.margin.left]);

  var yScale = d3
    .scaleLinear()
    .domain([0, MAX_STAT])
    .range([params.line.height - params.line.margin.top, 0]);

  /* Add line into SVG */
  var line = d3
    .line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.od_mortality_rate));

  Object.values(chr).map(d => {
    if (d.county in line_data) {
      line_data[d.county].push({
        year: d.year,
        county: d.county,
        od_mortality_rate: d.od_mortality_rate,
        fips: d.FIPS
      });
    } else {
      line_data[d.county] = [
        {
          year: d.year,
          county: d.county,
          od_mortality_rate: d.od_mortality_rate,
          fips: d.FIPS
        }
      ];
    }
  });

  final_data = [];
  Object.keys(line_data).map(key => {
    obj = {
      name: key,
      values: line_data[key]
    };
    final_data.push(obj);
  });

  final_data = final_data.filter(d => d.name != "undefined");

  lines
    .selectAll(".line-group")
    .data(final_data)
    .enter()
    .append("g")
    .attr("class", "line-group")
    .on("mouseover", function(d, i) {
      svg
        .append("text")
        .attr("class", "title-text")
        .style("fill", colorScale(d.values.slice(-1)[0].od_mortality_rate))
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", params.line.width / 2)
        .attr("y", 25);
    })
    .on("mouseout", function(d) {
      svg.select(".title-text").remove();
    })
    .append("path")
    .attr("class", "line")
    .attr("id", d => ("line-" + d.values.slice(-1)[0].fips).toLowerCase())
    .on("mouseover", function(d) {
      d3.selectAll(".line").style("opacity", 0.3);
      d3.selectAll(".circle").style("opacity", 0.3);
      d3.select(this)
        .style("opacity", 0.9)
        .style("stroke-width", "5px")
        .style("cursor", "pointer");
    })
    .on("mouseout", function(d) {
      d3.selectAll(".circle").style("opacity", 0.9);
      d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 0.3)
        .style("stroke-width", "1")
        .style("cursor", "none");
    })
    .transition()
    .duration(2000)
    .attr("d", d => line(d.values))
    .style("stroke", (d, i) =>
      colorScale(d.values.slice(-1)[0].od_mortality_rate)
    )
    .style("opacity", 0.3);

  /* Add circles in the line */
  lines.selectAll("circle-group").remove();
  lines.selectAll("circle").remove();

  lines
    .selectAll("circle-group")

    .data(final_data)
    .enter()
    .append("g")
    .style("fill", d => colorScale(d.values.slice(-1)[0].od_mortality_rate))
    .style("fill-opacity", 0.6)
    .style("stroke-opacity", 1.0)
    .style("stroke", d => colorScale(d.values.slice(-1)[0].od_mortality_rate))
    .selectAll("circle")
    .data(d => d.values)
    .enter()
    .append("g")
    .attr("class", "circle")
    .on("mouseover", function(d) {
      d3.select(this)
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.od_mortality_rate}`)
        .attr("x", d => xScale(d.year) + 5)
        .attr("y", d => yScale(d.od_mortality_rate) - 10);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")
        .transition()
        .duration(500)
        .selectAll(".text")
        .remove();
    })
    .append("circle")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.od_mortality_rate))
    .attr("r", 5)
    .style("fill", d => {
      try {
        return d.year == YEAR
          ? YELLOW
          : colorScale(d.values.slice(-1)[0].od_mortality_rate);
      } catch {
        return d;
      }
    })
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration(250)
        .attr("r", 10);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .transition()
        .duration(250)
        .attr("r", 5);
    });
}
