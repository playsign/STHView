/* code that draws the graph, 
    to separate from the ui widgets and url parsing for date selection etc in index.js */

const scaleForType = {
    't': [12, 30],
    'c': [0, 3000],
    'v': [0, 500],
    'h': [0, 100],
    's': [0, 100],
    'eq': [0, 100],
    'peak': [0, 100]    
}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var tempprobe_line = d3.line()
    .x( function(d) { return x(d.timestamp); })
    .y( function(d) { return y(d.tempprobe); });

var high_threshold_line = d3.line()
    .x(function(d){ return x(d.timestamp); })
    .y(function(d){ return y(d.threshold_high); });

var low_threshold_line = d3.line()
    .x(function(d){
        return x(d.timestamp);
    })
    .y(function(d){
        return y(d.threshold_low);
    })

var ambient_line = d3.line()
    .x(function(d)
        { return x(d.timestamp);}
    )
    .y( function(d) {
        return y(d.ambient);
    });


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


function drawRaw(vals) {
    var data = vals;
    data.forEach(function(d, i) {
        d.timestamp = parseDate(d.recvTime);
        d.tempprobe = +d.attrValue;
        //d.ambient = +1 //d.ambient;
    });

    console.log(data);

    data.sort(function(a, b){
        return a["timestamp"]-b["timestamp"];
    });

    // scale the range of data
    x.domain(d3.extent(data, function(d){
        return d.timestamp;
    }));
    /*y.domain([0, d3.max(data, function(d){
        return d.tempprobe; //Math.max(d.tempprobe, d.ambient);
    })]);*/
    /*y.domain(d3.extent(data, function(d){
        return d.tempprobe;
    }));*/
    //some margin to y, https://stackoverflow.com/questions/34888205/insert-padding-so-that-points-do-not-overlap-with-y-or-x-axis
    // get extents and range
    yExtent = d3.extent(data, function(d) { return d.tempprobe; }),
                yRange = yExtent[1] - yExtent[0];
    // set domain to be extent +- 5%
    y.domain([yExtent[0] - (yRange * .05), yExtent[1] + (yRange * .05)]);
    //y.domain([0, 20]);

    //clear drawing in case there was previous. NOTE: might be interesting to draw multiple for comparisons somehow
    svg.selectAll("*").remove();

    // Add the tempprobe path.
    svg.append("path")
        .data([data])
        .attr("class", "line temp-probe temperature")
        .attr("d", tempprobe_line);

    // Add the ambient path
    /*svg.append("path")
        .data([data])
        .attr("class", "line ambient temperature")
        .attr("d", ambient_line);*/

    /*svg.append("path")
        .data([data])
        .attr("class", "line high-threshold")
        .attr("d", high_threshold_line)

    svg.append("path")
        .data([data])
        .attr("class", "line low-threshold")
        .attr("d", low_threshold_line)*/

    // add the X Axis
    svg.append("g")
        .attr("transform", "translate(0,"+ height + ")")
        .call(d3.axisBottom(x));

    // add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}

function setScales(data, endHour, dataType) {
    // scale the range of data
    xExtent = d3.extent(data, function(d){
        return d.timestamp;
    });
    xExtent[1] = Math.max(xExtent[1], 16, endHour); //we want to continue at least till 4pm for prev day comparison to make sense
    x.domain(xExtent);
    /* now fixed for data type (only temperature, wip)
    yExtent = d3.extent(data, function(d) { return d.tempprobe; }),
                yRange = yExtent[1] - yExtent[0];
    // set domain to be extent +- 5%
    y.domain([yExtent[0] - (yRange * .05), yExtent[1] + (yRange * .05)]);*/
    y.domain(scaleForType[dataType]); //temperature expedted minimum & maximum + margins
}

function addAxes() {
    // add the X Axis
    const format = d3.format(",.0d");
    svg.append("g")
        .attr("transform", "translate(0,"+ height + ")")
        .call(d3.axisBottom(x)
                .tickFormat(d => format(d) + ":00")
                );

    // add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));    
}

function addPaths(data, cssClass) {
    // Add the tempprobe path.
    svg.append("path")
        .data([data])
        .attr("class", cssClass)
        .attr("d", tempprobe_line);

    // Add the ambient path
    /*svg.append("path")
        .data([data])
        .attr("class", "line ambient temperature")
        .attr("d", ambient_line);*/
}

function drawAggr(data) { //vals) {
    //var data = vals[0]["points"];
    //prepareData(data);
    
    svg.selectAll("*").remove();

    addPaths(data, "line temp-probe temperature");
    addAxes();
}

/*function addAggr(data) { //vals) {
    //var data = vals[0]["points"];
    //prepareData(data);
    //oops this would result in wrong vis: setExtents(data);
    //now earlier UpdateDataView has already set the scales
    addPaths(data, "line temp-compare temperature");
}*/
