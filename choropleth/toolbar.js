/* 
    Source/Credit: https://www.w3schools.com/html/html5_draganddrop.asp

    The above source offers a starting point for drag and drop of features
    into the visualization toolbar. 

    TODO - This still requires implementation.

*/

regressors = []

function drag(event) {
    // console.log(event.target.id);
    let text = regressors.length == 0 ? event.target.id : ", " + event.target.id;
    regressors.push(event.target.id);
    event.dataTransfer.setData("text", text);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.dropEffect = "copy";
}
