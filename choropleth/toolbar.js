/* 
    Source/Credit: https://www.w3schools.com/html/html5_draganddrop.asp

    The above source offers a starting point for drag and drop of features
    into the visualization toolbar. 

    TODO - This still requires implementation.

*/

regressors = [];

function drag(event) {
  // console.log(event.target.id);
  let text = regressors.length == 0 ? event.target.id : "," + event.target.id;
  regressors.push(event.target.id);
  event.dataTransfer.setData("text", text);
  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.dropEffect = "copy";
}

regress_bkp = () => {
  d3.select("#calculator").on("input", () => {
    console.log(this.value);
  });

  regressor = "FAKE";
  switch (regressor) {
    case "Unemployed":
      console.log("Unemployed");
      break;
    case "Food_Insecure":
      console.log("Food Insecure");
      break;
    case "Preventable_Hosp":
      console.log("Preventable_Hosp");
      break;
    case "Graduation_Rate":
      console.log("Graduation_Rate");
      break;
    case "Household_Income":
      console.log("Household_Income");
      break;
    case "Limited_Access":
      console.log("Limited_Access");
      break;
    default:
      break;
  }

  return;
};
