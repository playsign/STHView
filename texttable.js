function drawTextTable(points)
{
    const datatable = document.getElementById("datatable");
    points.forEach(element => {
        //console.log(element);
        const tbodyRef = datatable;

        var newRow = tbodyRef.insertRow();
        var newCell = newRow.insertCell();

        // Append a text node to the cell
        var t = element.timestamp + " : " + element.tempprobe;
        var newText = document.createTextNode(t);
        newCell.appendChild(newText);
    });
}