datatype2unit = {
    "Electricity": "kWh",
    "DistrictHeating": "kWh",
    "DistrictHeatingWater": "kWh",
    "Water": "l"
};

function drawTextTable(datatype, points)
{
    const datatable = document.getElementById("datatable");
    const tbodyRef = datatable;
    tbodyRef.innerHTML = "";

    //TODO: datatype otsikkoon, html-puolella on jo optionseissa suomennettu

    //could make a reusable func for creating these rows, here and in loop, but they may yet get different styles and logic so leaving like this now for further dev. maybe refactor after more features are in.
    const titleRow = tbodyRef.insertRow();        
    const titleCell1 = titleRow.insertCell();
    const titleCell2 = titleRow.insertCell();
    
    const titleText1 = document.createTextNode("Kuukausi");
    const unitText = `Kulutus (${datatype2unit[datatype]})`;
    const titleText2 = document.createTextNode(unitText);
    
    titleCell1.appendChild(titleText1);
    titleCell2.appendChild(titleText2);
 
    points.forEach(element => {
        //console.log(element);

        const newRow = tbodyRef.insertRow();
        
        const newCell1 = newRow.insertCell();
        const newCell2 = newRow.insertCell();

        // Append a text node to the cell
        //var text = element.timestamp + " : " + element.tempprobe;
        //var text = element.timestamp_EET + " : " + element.value;        
        //for hourly: 
        //var newText1 = document.createTextNode(element.timestamp_EET);
        //debugger
        const newText1 = document.createTextNode(element.Month);
        const newText2 = document.createTextNode(element.value);
 
        newCell1.appendChild(newText1);
        newCell2.appendChild(newText2);
        newCell2.className = "datavalue";
    });
}