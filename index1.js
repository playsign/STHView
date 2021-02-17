// parse the date / time
var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
//var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
var formatTime = d3.timeFormat("%e %B");
//console.log(parseDate("2018-09-05T05:27:54.212Z")); //2017-09-11 18:35:10"))

function prepareData(data) {
    //queries seem to handle timezones ok now but we need this for display
    //const hourOffset = new Date().getTimezoneOffset() / 60;

    data.forEach(function(d, i) {
        //d.timestamp = d.offset - hourOffset;
        d.timestamp = d.timestamp_EET //has also UTC_Timestamp
        d.tempprobe = 0.5; //d.value;
        //d.ambient = 21.40 + (i / 24);
    });

    console.log(data);

    data.sort(function(a, b){
        return a["timestamp"]-b["timestamp"];
    });
}

function makeUrl(roomCode, dataType, start_string, end_string) {
    //var url = "https://playsign-151522.appspot.com/sth?";
    //var url = "http://localhost:8080/h?";
    //var url = "http://localhost:8000/temp_data.json";
    var url = "http://localhost:8080/ouka/energydata?";

    /*url += `id=${roomCode}`;*/
    url += `&quantity=${dataType}`; // ouka energy has quantityName
    
    //omitting time def not supported anymore
    //if (start_string) {
    url += `&dateFrom=${start_string}&dateTo=${end_string}`;
    
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
            //url += `&querytype=aggr`;
            //maybe we should have the comet params here, and not this self invented one that is passed to the proxy
            //the backend / proxy does however helpful work in mapping the room codes to the sensor naming pattern
            return url;
        },
        drawAggr
    ]
}

//https://stackoverflow.com/questions/24281937/update-parameters-in-url-with-history-pushstate
function setQueryStringParameter(name, value) {
    const params = new URLSearchParams(location.search); //how does this work inside iframe? uses document.location which is correct?
    params.set(name, value);
    window.history.pushState({}, "", decodeURIComponent(`${location.pathname}?${params}`));
}

function changeHandler(selectName) {
    return function changeSpaceHandler(event) {
        setQueryStringParameter(selectName, event.target.value);
        updateWithDateRange();
    }
}

//https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function getParams(start_date, end_date) {
    var roomCode = "hiirihaukkatalo"; //"202"; //tk03_te23";

    var querystring;
    if (!inIframe()) { //is this really necessary? seemed to fix the bug? but how does setQueryStringParameter work without this, with just 'location'?
        querystring = location.search;
    } else {
        querystring = document.location.search;
    }

    var urlParams = new URLSearchParams(querystring.slice(1));
    var urlRoomCode = urlParams.get("roomcode");
    if (urlRoomCode)
        roomCode = urlRoomCode;

    var queryType = "aggr";
    var urlQueryType = urlParams.get("querytype");
    if (urlQueryType)
        queryType = urlQueryType;

    var dataType = "Electricity"; //"t";
    var urlDataType = urlParams.get("datatype");
    if (urlDataType)
        dataType = urlDataType;

    if (!start_date) { //override for previous day comparison   
        var urlStartDate = urlParams.get("dateFrom");
        if (urlStartDate) {
            start_date = new Date(urlStartDate);
        } else {
            //NOW: monthly, a few months back
            const monthMs = 2629800000;

            const now = new Date();
            const monthsAgo = new Date(now.getTime() - (6 * monthMs));
            start_date = new Date(monthsAgo.getFullYear(), monthsAgo.getMonth(), 1);
            /* WAS: current day since morning, for e.g. hourly realtime data at office/school
            start_date = new Date();
            start_date.setHours(8);
            start_date.setMinutes(0);*/
        }
    }
    var start_string = start_date.toISOString(); //UTC and passed as such to the STH server query

    if (!end_date) {    
        var urlEndDate = urlParams.get("dateTo");
        if (urlEndDate) {
            end_date = new Date(urlEndDate);
        } else {
            //OuKa Energy has 2d delay, so this actually is correct to get latest monthly data
            end_date = new Date();
            
            /* WAS: end of work day, for e.g. hourly realtime data at office/school
            end_date.setHours(16);
            end_date.setMinutes(0);*/
        }
    }
    var end_string = end_date.toISOString();

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

function updateDataView(start_date, end_date, updateScales, draw) {
    //dateFrom=2016-01-01T00:00:00.000Z&dateTo=2016-01-31T23:59:59.999Z

    params = getParams(start_date, end_date);
    handler = queryHandler[params.queryType];
    const url = handler[0](params.roomCode, params.dataType, params.start_string, params.end_string);
    if (!draw)
        draw = handler[1];

    const endHour = end_date.getHours();

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
            //FIWARE STH-COMET:
            //var vals = data["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
            //var vals = data[0]; //original temp_data.json in d3 example
            var points = data; //root level list from ouka azure
            //debugger
            //var points = vals["tempdata"]; //FIWARE: vals[0]["points"]; //aggr only, breaks raw, we are not using that now anyhow - fix later? XXX TODO
            //also aggr specific
            //prepareData(points);

            /*if (updateScales) {
                setScales(points, endHour, params.dataType);
            }*/
            console.log(draw);
            draw(points);
            //console.log(points);
            //drawTextTable(params.dataType, points);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const spaceSelect = document.querySelector('select[name="space"]');
    spaceSelect.onchange = changeHandler("roomcode");
    
    const typeSelect = document.querySelector('select[name="datatype"]');
    typeSelect.onchange = changeHandler("datatype");

    const params = getParams();
    spaceSelect.value = params.roomCode;
    typeSelect.value = params.dataType;

    /*
    getParams sets also the default values for time, if they are not given in URL.
    here we apply those values to the calendar UI, similar to how space & type are set above
    */
    const start_date_input = document.getElementById("start_date");
    const end_date_input = document.getElementById("end_date");

    //https://stackoverflow.com/questions/12346381/set-date-in-input-type-date
    const startAsLocal = dateToISOLikeButLocal(params.start_date);
    const startpair = startAsLocal.split('T');

    const endAsLocal = dateToISOLikeButLocal(params.end_date);
    const endpair = endAsLocal.split('T');
    start_date_input.value = startpair[0];
    end_date_input.value = endpair[0];

    const start_time_input = document.getElementById("start_time");
    const end_time_input = document.getElementById("end_time");
    start_time_input.value = startpair[1].substr(0, 5); //"08:00"
    end_time_input.value = endpair[1].substr(0, 5); //"16:00"

    updateWithDateRange();
}, false);

function dateFromInput(prefix) {
    var date = document.getElementById(prefix + "_date").value;
    var time = document.getElementById(prefix + "_time").value;

    var datetime = new Date(date + " " + time);
    return datetime;
}

function dateToISOLikeButLocal(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal =  date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
}

function updateWithDateRange() {
    var start_date = dateFromInput("start");
    var end_date = dateFromInput("end");

    setQueryStringParameter("dateFrom", dateToISOLikeButLocal(start_date));
    setQueryStringParameter("dateTo", dateToISOLikeButLocal(end_date));

    updateDataView(start_date, end_date, true);
}

function updateCompare(el) {
    const day = 1000 * 60 * 60 * 24; //24h in milliseconds

    const dayOffset = parseInt(el.value);
    console.log("updateCompare: " + el.value);
    //params = getParams(start_date, end_date);
    //handler = queryHandler[params.queryType];
    var start_date = dateFromInput("start");
    var end_date = dateFromInput("end");

    const offsetMs = dayOffset * day;
    comp_start = new Date(start_date.getTime() - offsetMs);
    comp_end = new Date(end_date.getTime() - offsetMs);

    updateDataView(comp_start, comp_end, false, addAggr);;
}

const gettime = document.getElementById("gettime")
gettime.addEventListener("click", updateWithDateRange);
