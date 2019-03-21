window.addEventListener("load", function() {
  new Promise(function(resolve) {
    setTimeout(() => resolve(), 500);
  }).then(show_year_info());
});

show_year_info = () => {
  d3.select("#dropdownMenuButton")
    .append("a")
    .classed("instruction", true)
    .append("span")
    .attr("top", "55")
    .attr("left", "-40")
    .text("Jump to a given year");

  setTimeout(() => {
    d3.selectAll(".instruction").remove();
    show_prediction_info();
  }, 3000);
};

show_prediction_info = () => {
  d3.select("#animate")
    .append("a")
    .classed("instruction", true)
    .append("span")
    .attr("top", "55")
    .attr("left", "-40")
    .text("Click to animate 2014-2018 data");

  setTimeout(() => {
    d3.selectAll(".instruction").remove();
    show_reset_info();
  }, 3000);
};

show_reset_info = () => {
  d3.select("#reset")
    .append("a")
    .classed("instruction", true)
    .append("span")
    .attr("top", "55")
    .attr("left", "-40")
    .text("Click to de-select all selected counties");

  setTimeout(() => {
    d3.selectAll(".instruction").remove();
  }, 3000);
};
