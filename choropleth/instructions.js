window.addEventListener("load", function () {

    new Promise(function (resolve, reject) {

        setTimeout(() => resolve(), 500);

    }).then(function () { // (**)

        console.log("step 1");
        d3.select("#Median_Income")
            .append("a")
            .classed("instruction", true)
            .append("span")
            .attr("top", 60)
            .attr("left", "-40")
            .text("Drag items into the toolbar to add regressors");

        setTimeout(() => {
            d3.select(".instruction").remove();
            console.log("step 2");
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
        }, 3000);
        return;
    });
});