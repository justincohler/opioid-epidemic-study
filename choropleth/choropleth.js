/* 
Source/Credit: https://bl.ocks.org/adamjanes/6cf85a4fd79e122695ebde7d41fe327f 

The above source served as the start for this SVG element in the larger visualization.
*/
async function make_choropleth([us, chr]) {
  d3.select("#wide")
    .append("svg")
    .attr("id", "choropleth")
    .attr(
      "height",
      params.choropleth.height +
        params.choropleth.margin.top +
        params.choropleth.margin.bottom
    )
    .attr(
      "width",
      params.choropleth.width +
        params.choropleth.margin.left +
        params.choropleth.margin.right
    );

  var projection = d3
    .geoMercator()
    .scale(8500)
    .center([-79.5, 39.5]);

  // Create a path generator.
  var path = d3.geoPath().projection(projection);

  const x = d3
    .scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

  let choropleth = d3.select("#choropleth");

  // County shapes
  choropleth
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(
      topojson.feature(us, us.objects.cb_2015_west_virginia_county_20m).features
    )
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", d => {
      return "poly-" + d.properties.GEOID;
    });

  let cities = [
    {
      name: "Charleston",
      lat: -81.63,
      lon: 38.35,
      shift_x: -30,
      shift_y: -10
    },
    {
      name: "Huntington",
      lat: -82.45,
      lon: 38.42,
      shift_x: -10,
      shift_y: 25
    },
    {
      name: "Parkersburg",
      lat: -81.56,
      lon: 39.27,
      shift_x: 0,
      shift_y: 25
    },
    {
      name: "Morgantown",
      lat: -79.96,
      lon: 39.63,
      shift_x: -70,
      shift_y: 25
    },
    {
      name: "Wyoming County",
      lat: -81.56,
      lon: 37.63,
      shift_x: 0,
      shift_y: -10
    }
  ];

  cities.forEach(city => {
    if (city.name === "Wyoming County") {
      choropleth
        .append("rect")
        .attr("x", projection([city.lat, city.lon])[0])
        .attr("y", projection([city.lat, city.lon])[1])
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", "#f9dc5c");
    } else {
      choropleth
        .append("circle")
        .attr("cx", projection([city.lat, city.lon])[0])
        .attr("cy", projection([city.lat, city.lon])[1])
        .attr("r", 4)
        .style("fill", "#f9dc5c");
    }
    choropleth
      .append("text")
      .attr("x", city.shift_x + projection([city.lat, city.lon])[0])
      .attr("y", city.shift_y + projection([city.lat, city.lon])[1])
      .classed("city-label", true)
      .html(city.name);
  });

  return chr;
}

async function update_choropleth(chr) {
  let choropleth = d3.select("#choropleth");

  // Tooltips
  tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .direction("n")
    .html(function(d) {
      county = chr[d.properties.GEOID].county;
      state = chr[d.properties.GEOID].state;

      text = county + ", " + state + "<br/>OD Mortality Rate: ";
      text +=
        chr[d.properties.GEOID].od_mortality_rate == ""
          ? "N/A"
          : chr[d.properties.GEOID].od_mortality_rate;
      return text;
    });
  choropleth.call(tip);
  // County shapes
  choropleth
    .selectAll("path")
    .on("mouseover", function(d, i) {
      tip.show(d, this);

      d3.select(this).style("cursor", "pointer");

      od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;

      pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

      d3.select("#bar-" + pctile).attr("fill", YELLOW);

      d3.select("#line-" + d.properties.GEOID).classed("hoverLine", true);
    })
    .on("mouseout", d => {
      tip.hide(d, this);

      od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
      pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

      d3.select("#line-" + d.properties.GEOID).classed("hoverLine", false);

      d3.select("#bar-" + pctile)
        .transition()
        .duration(200)
        .attr("fill", function(d) {
          return bucketColorScale(pctile);
        });
    })
    .on("click", function(d) {
      od_mortality_rate = chr[d.properties.GEOID].od_mortality_rate;
      pctile = ntile(MAX_STAT, od_mortality_rate, NTILES);

      if (!selected_counties.has(d.properties.GEOID)) {
        /* CLICK ON */
        selected_counties.add(d.properties.GEOID);
      } else {
        /* CLICK OFF */
        selected_counties.delete(d.properties.GEOID);
      }

      highlight_counties();
      highlight_bars(chr);
      highlight_lines(chr);
    })
    .transition()
    .duration(2000)
    .attr("fill", d => {
      fips = d.properties.GEOID;
      value =
        chr[fips] && chr[fips].od_mortality_rate != ""
          ? chr[fips].od_mortality_rate
          : 0;
      return colorScale(value);
    });

  // SOURCE
  choropleth
    .append("text")
    .attr("class", "source")
    .attr("x", params.choropleth.width / 2 - 50)
    .attr("y", params.choropleth.height - 50)
    .text("Source: CountyHealthRankings.org");

  // Summary
  summary_x = params.choropleth.width / 2 - 10;
  summary_y = params.choropleth.height / 2 + 140;

  // West Virginia's Drug Overdose Mortality Rates per 100k skyrocketed between 2014 and 2018

  // Top-Four Cities Explanation
  choropleth
    .append("text")
    .attr("x", 20 + params.choropleth.margin.left)
    .attr("y", 150 + params.choropleth.margin.top)
    .text(`Top Four WV Cities`);

  choropleth
    .append("text")
    .attr("x", 20 + params.choropleth.margin.left)
    .attr("y", 175 + params.choropleth.margin.top)
    .text(`By Population`);
}
