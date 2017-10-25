/**
 * Created by wesselklijnsma on 07-10-17.
 */

function initMap() {
//        var csv = readTextFile("/Users/wesselklijnsma/Documents/CLS/Large-scale_data_enigeering/visualization/ships.csv");
//        var ships = $.csv.toObjects(csv);
    //  48.746792, 4.493420
    var center = {lat: 48.746792, lng: 4.493420};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: center
    });
    var markers = [];

    function CenterControl(controlDiv, map, text, inc) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';

        controlUI.width = '50%';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = text;
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function(){increment(inc)});
    }

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map, 'Next week', 7);
    centerControlDiv.index = 1;

    var centerControlDiv2 = document.createElement('div');
    var centerControl2 = new CenterControl(centerControlDiv, map, 'Next day', 1);
    centerControlDiv2.index = 1;

    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv2);

    function addShip(ship) {
        var loc = {lat: ship.lat, lng: ship.lng};
        var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h1 id="firstHeading" class="firstHeading">' + ship.mmsi + '</h1>' +
            '<div id="bodyContent">' +
            '<div id="ship_name"></div>' +
            '<img id=ship_img_' + ship.mmsi + ' src="tanker.png" width=200px> <br><br>' +
            '<a href=https://www.marinetraffic.com/en/ais/details/ships/mmsi:' + ship.mmsi + ' target="new"> Marine traffic link' +
            '</a>' +

            '</div>' +
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: loc,
            map: map,
            title: ship.mmsi,
            //icon: {
            //    anchor: google.maps.Point(10,10),
            //    url: 'data:image/svg+xml;utf-8, \
            //          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" overflow="auto"> \
            //          <path fill="red" stroke="none" d="M 6 15 L 10 5 L 14 15 z" transform="rotate(' + Math.random() * 360 +
            //          ', 10, 10)"></path> \
            //          </svg>',
            //
            //}
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 2,
                strokeWeight: 0,
                fillColor: 'red',
                fillOpacity: Math.random() + ((0.75 - 0.3) - 0.3),
                rotation: Math.random() * 360,
                optimized: true
            }
        });


        markers.push(marker);
        marker.addListener('click', function () {
            infowindow.open(map, marker);
            $.getJSON("https://allorigins.us/get?url=" +
                encodeURIComponent("https://www.marinetraffic.com/en/ais/details/ships/mmsi:") + ship.mmsi,
                function (data) {
                    //var elements = $("<div>").html(data)[0].$("center-block");
                    //for(var i = 0; i < elements.length; i++) {
                    //    var theText = elements[i].firstChild.nodeValue;
                    //    // Do something here
                    //}
                    var imgs = $('.big_image', data.contents);
                    if (typeof imgs != 'undefined') {
                        var src = imgs.attr('src').replace("//", "");
                        //console.log(src);
                        $('#ship_img_' + ship.mmsi).attr('src', 'https://' + src)
                    }
                }
            );
        });
        //markers = markers.push(marker);
        //console.log("ship_added")

    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
        markers = [];
    }

    var days = [];
    $.getJSON("positions.json", function (data) {
        var groups = Object.create(null);
        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            if (!groups[item.date]) {
                groups[item.date] = [];
            }

            groups[item.date].push({
                mmsi: item.mmsi,
                lat: parseFloat(item['avg(lat)']),
                lng: parseFloat(item['avg(lng)'])
            });
        }
        var result = [];

        for (var x in groups) {
            var obj = {};
            obj[x] = groups[x];
            result.push(obj);
        }

        plot_ships(result, 0);
        days = result;
    });

    function plot_ships(days, index) {
        var day = days[index];
        for (var d in day) {
            //console.log(d);
            for (var i = 0; i < day[d].length; i++) {
                addShip(day[d][i])
            }
        }
    }

    var counter = 1;
    function increment(inc) {
        clearMarkers();
        if (counter < days.length) {
            plot_ships(days, counter);
            counter += inc;
            updateWindow(days[counter])
        } else {
            //alert('starting over');
            counter = 0;
            plot_ships(days, counter);
            updateWindow(days[counter])
        }
    }
    $(document).keypress(function(){increment(7)});

    function updateWindow(date) {
        //var start_date = date.replace(/\//g, '-');
        var start_date = Object.keys(date)[0].replace(/\//g, '-');
        var end_date1 = new Date(start_date);
        var start_window = end_date1.toISOString();
        end_date1.setDate(end_date1.getDate() + 1);
        var end_date = end_date1.toISOString();
        end_date1.setDate(end_date1.getDate() + 29);
        var end_date_window = end_date1.toISOString();

        //console.log(start_date);

        var range = document.getElementById('wind-speed').layout.xaxis.range;
        if (new Date(start_date) > new Date(range[1])) {
            range = [start_window, end_date_window];
        }
        var update = {
            xaxis: {range: range},
            shapes: [
                {
                    type: 'rect',
                    // x-reference is assigned to the x-values
                    xref: 'x',
                    // y-reference is assigned to the plot paper [0,1]
                    yref: 'paper',
                    x0: start_date,
                    y0: 0,
                    x1: end_date,
                    y1: 1,
                    fillcolor: '#FF5733',
                    opacity: 0.6,
                    line: {
                        width: 0
                    }
                }
            ]
        };
        Plotly.relayout(document.getElementById('wind-speed'), update)
        Plotly.relayout(document.getElementById('oil-price'), update)

    }

    //d3.json('http://127.0.0.1:8080/sample.json', function (error, dataset) {
    //    dataset.forEach(function (d) {
    //            d.lng = parseFloat(d.lng);
    //            d.lat = parseFloat(d.lat);
    //            d.cog = parseFloat(d.cog);
    //            addShip(d);
    //        });
    //    json_data = dataset;
    //    console.log(dataset)
    //});
}

$( "#opener" ).on( "click", function() {
    $( "#dialog" ).dialog( "open" );
});

$( function() {
    $( "#dialog" ).dialog();
} );






