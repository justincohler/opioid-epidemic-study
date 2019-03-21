/**
 * Create housing for histogram SVG.
 */
async function make_histogram() {
  d3.select("#upper")
    .append("svg")
    .attr("id", "histogram")
    .attr(
      "height",
      params.histogram.height +
        params.histogram.margin.top +
        params.histogram.margin.bottom
    )
    .attr(
      "width",
      params.histogram.width +
        params.histogram.margin.left +
        params.histogram.margin.right
    );

  d3.select("#histogram")
    .append("text")
    .attr("class", "robotic")
    .attr("y", params.histogram.height + params.histogram.margin.top + 10)
    .attr("x", params.histogram.width / 2 + 20)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Distribution of OD Mortality by County");
}

/**
 * Update histogram with bars based on N
 * n-tiles of the CHR OD-Mortality Rate data.
 *
 * @param  {} chr
 */
async function update_histogram(chr) {
  let hist_data = {};

  // Initialize Bucketed Object
  for (i = 0; i <= NTILES; i++) {
    hist_data[i] = {
      count: 0,
      fips: []
    };
  }

  // Populate Bucketed Object
  Object.entries(chr).forEach(([fips, value]) => {
    bucket = ntile(MAX_STAT, value.od_mortality_rate, NTILES);
    if (bucket) {
      hist_data[bucket].count++;
      hist_data[bucket].fips.push(fips);
    }
  });

  // Reformat Bucketed Object into a flat List
  let data = Object.entries(hist_data).map(([key, val]) => {
    return { bucket: +key, count: val.count, fips: val.fips };
  });

  // Create Scales
  let hist_x = d3
    .scaleBand()
    .rangeRound([0, params.histogram.width])
    .domain(data.map(d => d.bucket))
    .padding(0.1);

  let hist_y = d3
    .scaleLinear()
    .range([params.histogram.height, 0])
    .domain([10, 0]);

  let histogram = d3.select("#histogram");

  // Remove any pre-existing year title
  d3.select("#year-label").remove();

  // Add the current year as a title
  histogram
    .append("text")
    .attr("id", "year-label")
    .text(YEAR)
    .attr("text-anchor", "middle")
    .attr("x", params.histogram.width / 2)
    .attr("y", 75);

  // Create the bottom bar
  let g = histogram
    .append("g")
    .attr(
      "transform",
      `translate(${params.histogram.margin.left}, ${
        params.histogram.margin.top
      })`
    );

  g.append("g")
    .attr("transform", `translate(0,${params.histogram.height})`)
    .call(d3.axisBottom(hist_x).tickValues([]));

  // Remove old bars then add new bars
  d3.selectAll(".bar").remove();
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("id", d => "bar-" + d.bucket)
    .attr("class", "bar")
    .attr("fill", d => bucketColorScale(d.bucket))
    .attr("x", d => hist_x(d.bucket))
    .attr("y", d => params.histogram.height)
    .attr("width", hist_x.bandwidth())
    .on("mouseover", d => {
      d.fips.forEach(d => {
        d3.select("#poly-" + d).classed("countiesHovered", true);
      });
    })
    .on("mouseout", d => {
      d.fips.forEach(d => {
        d3.select("#poly-" + d).classed("countiesHovered", false);
      });
    })
    .transition()
    .duration(1000)
    .attr("y", d => {
      return params.histogram.height - hist_y(d.count);
    })
    .attr("height", d => {
      h = hist_y(d.count);
      return h;
    });

  return chr;
}

/**
 * Animate histogram with bars based on N
 * n-tiles of the CHR OD-Mortality Rate data.
 *
 * @param  {} chr
 */
async function animate_histogram(chr) {
  let hist_data = {};

  // Initialize Bucketed Object
  for (i = 0; i <= NTILES; i++) {
    hist_data[i] = {
      count: 0,
      fips: []
    };
  }

  // Populate Bucketed Object
  Object.entries(chr).forEach(([fips, value]) => {
    bucket = ntile(MAX_STAT, value.od_mortality_rate, NTILES);
    if (bucket) {
      hist_data[bucket].count++;
      hist_data[bucket].fips.push(fips);
    }
  });

  // Reformat Bucketed Object into a flat List
  let data = Object.entries(hist_data).map(([key, val]) => {
    return { bucket: +key, count: val.count, fips: val.fips };
  });

  // Create Scales
  let hist_x = d3
    .scaleBand()
    .rangeRound([0, params.histogram.width])
    .domain(data.map(d => d.bucket))
    .padding(0.1);

  let hist_y = d3
    .scaleLinear()
    .range([params.histogram.height, 0])
    .domain([10, 0]);

  let histogram = d3.select("#histogram");

  // Remove any pre-existing year title
  d3.select("#year-label").remove();

  // Add the current year as a title
  histogram
    .append("text")
    .attr("id", "year-label")
    .text(YEAR)
    .attr("text-anchor", "middle")
    .attr("x", params.histogram.width / 2)
    .attr("y", 75);

  data.forEach(d => {
    d3.select("#bar-" + String(d.bucket))
      .transition()
      .duration(1000)
      .attr("y", params.histogram.height - hist_y(d.count))
      .attr("height", hist_y(d.count));
  });

  return chr;
}
