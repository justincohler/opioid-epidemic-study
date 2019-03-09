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

    console.log("Final Data:", final_data);

    var data = [
        {
            name: "USA",
            values: [
                { date: "2000", price: "100" },
                { date: "2001", price: "110" },
                { date: "2002", price: "145" },
                { date: "2003", price: "241" },
                { date: "2004", price: "101" },
                { date: "2005", price: "90" },
                { date: "2006", price: "10" },
                { date: "2007", price: "35" },
                { date: "2008", price: "21" },
                { date: "2009", price: "201" }
            ]
        },
        {
            name: "Canada",
            values: [
                { date: "2000", price: "200" },
                { date: "2001", price: "120" },
                { date: "2002", price: "33" },
                { date: "2003", price: "21" },
                { date: "2004", price: "51" },
                { date: "2005", price: "190" },
                { date: "2006", price: "120" },
                { date: "2007", price: "85" },
                { date: "2008", price: "221" },
                { date: "2009", price: "101" }
            ]
        },
        {
            name: "Maxico",
            values: [
                { date: "2000", price: "50" },
                { date: "2001", price: "10" },
                { date: "2002", price: "5" },
                { date: "2003", price: "71" },
                { date: "2004", price: "20" },
                { date: "2005", price: "9" },
                { date: "2006", price: "220" },
                { date: "2007", price: "235" },
                { date: "2008", price: "61" },
                { date: "2009", price: "10" }
            ]
        }
    ];

    var width = 250;
    var height = 250;
    var margin = 50;
    var duration = 250;

    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;


    /* Format Data */
    var parseDate = d3.timeParse("%Y");
    data.forEach(function (d) {
        d.values.forEach(function (d) {
            d.date = parseDate(d.date);
            d.price = +d.price;
        });
    });


    /* Scale */
    var xScale = d3.scaleLinear()
        .domain([2014, 2018])
        .range([0, width - margin]);

    var yScale = d3.scaleLinear()
        .domain([0, MAX_STAT])
        .range([height - margin, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select("#lower").append("svg")
        .attr("width", (width + margin) + "px")
        .attr("height", (height + margin) + "px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);


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
                .style("fill", color(i))
                .text(d.name)
                .attr("text-anchor", "middle")
                .attr("x", (width - margin) / 2)
                .attr("y", 5);
        })
        .on("mouseout", function (d) {
            svg.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
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
        .style("fill", (d, i) => color(i))
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
    var xAxis = d3.axisBottom(xScale).ticks(5);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height - margin})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .text("Total values");
}
