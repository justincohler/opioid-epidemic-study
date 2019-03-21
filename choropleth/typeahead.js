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

var states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

load_counties = new Promise(resolve => {
  resolve(d3.tsv("county_fips.tsv"));
});

load_counties
  .then(data => data.filter(d => d.State === "WV").map(d => d.Name))
  .then(counties => {
    $(".typeahead").typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: "counties",
        source: substringMatcher(counties)
      }
    );
  });
