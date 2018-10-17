
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

function updateDataView(start_date, end_date) {
    //dateFrom=2016-01-01T00:00:00.000Z&dateTo=2016-01-31T23:59:59.999Z
    var url = "https://playsign-151522.appspot.com/sth?"; //we append params here

    var id = "202"; //tk03_te23";
    var playsignParams = new URLSearchParams(location.search.slice(1));
    var playsignRoomCode = playsignParams.get("roomcode");
    if (playsignRoomCode)
        id = playsignRoomCode;

    url += `id=${id}`;

    if (start_date) {
        var start_string = start_date.toISOString();
        var end_string = end_date.toISOString();

        url += `&dateFrom=${start_string}&dateTo=${end_string}`
    }

    //d3.json("tk2_k2s0323.json",
    //d3.json("http://pan0107.panoulu.net:8666/STH/v1/contextEntities/type/AirQualityObserved/id/k2s0323/attributes/tk03_te23?lastN=10",
    //d3.json("https://playsign-151522.appspot.com/sth?id=weather",
    d3.json(url,
        function(error, data) {
            if (error) {
                console.log("an error has occurred in d3 JSON");
                throw error;
            }
            draw(data["contextResponses"][0]["contextElement"]["attributes"][0], "values");
        });
        //}).header('Fiware-Service', 'tal').header('Fiware-ServicePath', '/f/2/202');
}

var gettime = document.getElementById("gettime")

function dateFromInput(prefix) {
    var date = document.getElementById(prefix + "_date").value;
    var time = document.getElementById(prefix + "_time").value;

    var datetime = new Date(date + " " + time);
    return datetime;
}

gettime.addEventListener("click", function() {
    var start_date = dateFromInput("start");
    var end_date = dateFromInput("end");    

    updateDataView(start_date, end_date);
    
    //console.log()
})

updateDataView(); //playsignRoomName);
