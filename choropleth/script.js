const margin = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
}

var width = 960,
    height = 1000,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(8000)
    .translate([-15 * margin.left, 7 * margin.top]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


d3.json("https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json", function (json) {
    svg.selectAll("path")
        .attr("id", "state_fips")
        .data(topojson.feature(json, json.objects.collection).features.filter(function (d) { return d.properties.state_fips == 54; }))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("fill", "#efab7f");
});
