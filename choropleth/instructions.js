window.addEventListener("load", function() {
  new Promise(function(resolve) {
    setTimeout(() => resolve(), 500);
  }).then(show_regressor_info());
});

show_regressor_info = () => {
  d3.select("#Unemployed")
    .append("a")
    .classed("instruction", true)
    .append("span")
    .attr("top", 60)
    .attr("left", "-40")
    .text("Drag items into the toolbar to add regressors");

  setTimeout(show_prediction_info(), 3000);
  return;
};

show_prediction_info = () => {
  d3.select(".instruction").remove();
  d3.select("#regress")
    .append("a")
    .classed("instruction", true)
    .append("span")
    .attr("top", "55")
    .attr("left", "-40")
    .text("Click to predict 2019 OD Mortality Rates");

  setTimeout(() => {
    d3.select(".instruction").remove();
  }, 3000);
};
