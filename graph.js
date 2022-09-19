// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
//"https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv"
//var url = "http://localhost:8080/ouka/energydata?&quantity=Electricity&dateFrom=2020-07-31T21:00:00.000Z&dateTo=2021-02-17T12:29:00.000Z";
/*d3.json(url,
  function(error, data) {
    if (error) {
        console.log("an error has occurred in d3 JSON");
        throw error;
    }*/

function graphSetup(data) {
  svg.selectAll("*").remove();

  data.forEach(function(d, i) {
    //d.timestamp = d.offset - hourOffset;
    d.date = d3.isoParse(d.UTC_Timestamp) //has also UTC_Timestamp
    d.value = d.value;
  });

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.value; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  return y;
}

function drawGraph(data) {
  const y = graphSetup(data);

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(d.value) })
      )
}

function drawBarChart(data) {
  const y = graphSetup(data);

  //match hack
  /* tr 40
  22 -> 40, 1.07
  10 -> 60, 1.13
   6 -> 100, 1.25 # 
   8 -> 1.2

  >>> w = lambda n: 1 + (1.5/n)
  >>> w(6)
  1.25
  >>> w(10)
  1.15
  >>> w(22)
  1.0681818181818181
  */
  let n = data.length;
  tr_x = 140 - (n * 7);
  wdiv = 1 + (1.7 / n)

  const xBand = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.date; }))
    .padding(0.2);

  //tried to get the month names to x axis legend also for bars but failed so far - got month names, but then wrong bar widths / positioning
  var x = d3.scaleTime()
  .range([ 0, width / wdiv])
  .domain(d3.extent(data, function(d) { return d.date; }));

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(" + tr_x + ",10)rotate(0)")
    .style("text-anchor", "end");

  /*
  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 100000])
    .range([ height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));*/

  // Bars
  svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return xBand(d.date); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", xBand.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", "#69b3a2")

    svg.selectAll("mybar")
    .data(data)
    .enter()    
    .append("text")
      .attr("x", function(d) { 
        return (width - (xBand(d.date) + (xBand.bandwidth() / 2)))
      })
      .attr("y", -3)
      .attr("width", xBand.bandwidth())
      .attr("fill", "#000000")
      .text(function(d) {
        //console.log(d.date);
        let m = d.date.getMonth();
        return m + 1;
      })
      .style("font-size", "12pt")
}
