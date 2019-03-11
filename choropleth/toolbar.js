/* 
    Source/Credit: https://www.w3schools.com/html/html5_draganddrop.asp

    The above source offers a starting point for drag and drop of features
    into the visualization toolbar. 

    TODO - This still requires implementation.

*/
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    console.log(event.target.id);
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.dropEffect = "copy";
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    console.log("Dropped:", data);
    event.target.appendChild(document.getElementById(data));
}