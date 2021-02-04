function drawTextTable(points)
{
    const datatable = document.getElementById("datatable");
    points.forEach(element => {
        //console.log(element);
        const tbodyRef = datatable;

        var newRow = tbodyRef.insertRow();
        
        var newCell1 = newRow.insertCell();
        var newCell2 = newRow.insertCell();

        // Append a text node to the cell
        //var text = element.timestamp + " : " + element.tempprobe;
        //var text = element.timestamp_EET + " : " + element.value;        
        var newText1 = document.createTextNode(element.timestamp_EET);
        var newText2 = document.createTextNode(element.value);
        newCell1.appendChild(newText1);
        newCell2.appendChild(newText2);
    });
}