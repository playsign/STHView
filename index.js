
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
//var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
var formatTime = d3.timeFormat("%e %B");
console.log(parseDate("2018-09-05T05:27:54.212Z")); //2017-09-11 18:35:10"))
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


function draw(data, tempdata) {

    var data = data[tempdata];

    data.forEach(function(d, i) {

        d.timestamp = parseDate(d.recvTime);
        d.tempprobe = +d.attrValue;
        d.ambient = +1 //d.ambient;

    });

    console.log(data);

    data.sort(function(a, b){
        return a["timestamp"]-b["timestamp"];
    });

    // scale the range of data
    x.domain(d3.extent(data, function(d){
        return d.timestamp;
    }));
    y.domain([0, d3.max(data, function(d){
        return Math.max(d.tempprobe, d.ambient);
    })]);

    // Add the tempprobe path.
    svg.append("path")
        .data([data])
        .attr("class", "line temp-probe temperature")
        .attr("d", tempprobe_line);

    // Add the ambient path
    svg.append("path")
        .data([data])
        .attr("class", "line ambient temperature")
        .attr("d", ambient_line);

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

d3.json("weather_sth.json",
        function(error, data){
    if (error){
        console.log("an error has occurred in d3 JSON");
        throw error;
    }
    draw(data["contextResponses"][0]["contextElement"]["attributes"][0], "values");
});
