/**
 * Source/Credit: https://twitter.github.io/typeahead.js/examples/
 * @param {List[String]} strs
 */

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    q = q.toLowerCase();
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, "i");

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str.toLowerCase())) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

load_counties = new Promise(resolve => {
  resolve(d3.tsv("county_fips.tsv"));
});

load_counties
  .then(data =>
    data
      .filter(d => d.State === "WV")
      .reduce((acc, d) => {
        acc[d.Name.toLowerCase()] = d.FIPS;
        return acc;
      })
  )
  .then(counties => {
    console.log(counties);
    $(".typeahead").typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: "counties",
        source: substringMatcher(Object.keys(counties))
      }
    );

    $(".typeahead").on("keydown", function search(e) {
      // If "Enter" key pressed
      if (e.keyCode == 13) {
        county = $(this)
          .val()
          .toLowerCase();
        fips = counties[county];
        console.log(fips);
        if (fips) {
          selected_counties.add(fips);
          highlight_counties();
        }
      }
    });
  });
