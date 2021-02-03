function drawTextTable(points)
{
    const datatable = document.getElementById("datatable");
    points.forEach(element => {
        //console.log(element);
        const tbodyRef = datatable;

        var newRow = tbodyRef.insertRow();
        var newCell = newRow.insertCell();

        // Append a text node to the cell
        //var text = element.timestamp + " : " + element.tempprobe;
        var text = element.timestamp_EET + " : " + element.value;        
        var newText = document.createTextNode(text);
        newCell.appendChild(newText);
    });
}