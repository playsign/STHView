
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

function prepareData(data) {
    //queries seem to handle timezones ok now but we need this for display
    const hourOffset = new Date().getTimezoneOffset() / 60;

    data.forEach(function(d, i) {
        d.timestamp = d.offset - hourOffset;
        d.tempprobe = d.max;
        //d.ambient = 21.40 + (i / 24);
    });

    console.log(data);

    data.sort(function(a, b){
        return a["timestamp"]-b["timestamp"];
    });  
}

function setExtents(data) {
    // scale the range of data
    x.domain(d3.extent(data, function(d){
        return d.timestamp;
    }));
    yExtent = d3.extent(data, function(d) { return d.tempprobe; }),
                yRange = yExtent[1] - yExtent[0];
    // set domain to be extent +- 5%
    y.domain([yExtent[0] - (yRange * .05), yExtent[1] + (yRange * .05)]);    
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

function drawAggr(vals) {
    var data = vals[0]["points"];
    prepareData(data);
    setExtents(data);

    svg.selectAll("*").remove();

    addPaths(data, "line temp-probe temperature");
    addAxes();
}

function addAggr(vals) {
    var data = vals[0]["points"];
    prepareData(data);
    //oops this would result in wrong vis: setExtents(data);
    addPaths(data, "line temp-compare temperature");
}

function makeUrl(roomCode, dataType, start_string, end_string) {
    //var url = "http://localhost:8080/sth?";
    var url = "https://playsign-151522.appspot.com/sth?";
    url += `id=${roomCode}`;
    url += `&datatype=${dataType}`;
    if (start_string) {
        url += `&dateFrom=${start_string}&dateTo=${end_string}`;
    }
    console.log(url);
    return url;
}

queryHandler = {
    "raw": [
        makeUrl, 
        drawRaw
    ],
    "aggr": [
        function(roomCode, dataType, start_string, end_string) {
            var url = makeUrl(roomCode, dataType, start_string, end_string);
            url += `&querytype=aggr`;
            //maybe we should have the comet params here, and not this self invented one that is passed to the proxy
            //the backend / proxy does however helpful work in mapping the room codes to the sensor naming pattern
            return url;
        },
        drawAggr
    ]
}

function getParams(start_date, end_date) {
    var roomCode = "202"; //tk03_te23";
    var urlParams = new URLSearchParams(location.search.slice(1));
    var urlRoomCode = urlParams.get("roomcode");
    if (urlRoomCode)
        roomCode = urlRoomCode;

    var queryType = "aggr";
    var urlQueryType = urlParams.get("querytype");
    if (urlQueryType)
        queryType = urlQueryType;

    var dataType = "t";
    var urlDataType = urlParams.get("datatype");
    if (urlDataType)
        dataType = urlDataType;

    if (start_date) {
        var start_string = start_date.toISOString();
        var end_string = end_date.toISOString();
    }

    return {
        roomCode: roomCode,
        queryType: queryType,
        dataType: dataType,
        start_date: start_date,
        end_date: end_date,
        start_string: start_string,
        end_string: end_string
    }
}

function updateDataView(start_date, end_date, draw) {
    //dateFrom=2016-01-01T00:00:00.000Z&dateTo=2016-01-31T23:59:59.999Z

    params = getParams(start_date, end_date);
    handler = queryHandler[params.queryType];
    const url = handler[0](params.roomCode, params.dataType, params.start_string, params.end_string);
    if (!draw)
        draw = handler[1];

    console.log("STH request: " + url);
    //d3.json("tk2_k2s0323.json",
    //d3.json("http://pan0107.panoulu.net:8666/STH/v1/contextEntities/type/AirQualityObserved/id/k2s0323/attributes/tk03_te23?lastN=10",
    //d3.json("weektemp.json",
    d3.json(url,
        function(error, data) {
            if (error) {
                console.log("an error has occurred in d3 JSON");
                throw error;
            }
            var vals = data["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
            //debugger;
            draw(vals);
        });
}

var gettime = document.getElementById("gettime")
const day = 1000 * 60 * 60 * 24; //24h in milliseconds

function nowDate(dayOffset) {
    var now = new Date();
    var daynum = now.getDate();
    now.setDate(daynum + dayOffset);
 
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var today = now.getFullYear()+"-"+(month)+"-"+(day);
    return today;
}

var start_date = document.getElementById("start_date");
var end_date = document.getElementById("end_date");
var today = nowDate(0);
//var yesterday = nowDate(-1);
start_date.value = today; //yesterday;
end_date.value = today;

const start_time = document.getElementById("start_time");
const end_time = document.getElementById("end_time");
start_time.value = "08:00"
end_time.value = "16:00"
//start_time.value = "00:00"
//end_time.value = "23:59"

function dateFromInput(prefix) {
    var date = document.getElementById(prefix + "_date").value;
    var time = document.getElementById(prefix + "_time").value;

    var datetime = new Date(date + " " + time);
    return datetime;
}

function updateWithDateRange() {
    var start_date = dateFromInput("start");
    var end_date = dateFromInput("end");    

    updateDataView(start_date, end_date);
}

function updateCompare(el) {
    const dayOffset = parseInt(el.value);
    console.log("updateCompare: " + el.value);
    //params = getParams(start_date, end_date);
    //handler = queryHandler[params.queryType];
    var start_date = dateFromInput("start");
    var end_date = dateFromInput("end");

    const offsetMs = dayOffset * day;
    comp_start = new Date(start_date.getTime() - offsetMs);
    comp_end = new Date(end_date.getTime() - offsetMs);

    updateDataView(comp_start, comp_end, addAggr);;
}

gettime.addEventListener("click", updateWithDateRange);

updateWithDateRange();
