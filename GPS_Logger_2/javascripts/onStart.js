var czas;
var godz0, min0,sec0, godz1, min1,sec1;
var year, month, day, hours, minutes, seconds;
var top=0.01;
var left=0.02;
var internalStorage = app.GetInternalFolder();
var plik="";
var aktywnosc="Running";
var started = false;
var SMSnumber = "+48502552895";
var alarmSMS = false;
var btnPause;
var paused = false;
var polozenie = "";
var dystans=0;
var szer="";
var dlug="";
var configFile;
var lapTime=0;
var lap=0;
var startMilliseconds;
var previousMilliseconds;
var lapDistance=1000;
var pace = 0;
var ikona = 'images/fbmarker.png';
    
$(window).on ("load", function () {
    document.getElementById('startButton').style.color = 'red';
    function set_dimensions() {
        var windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            $mapa = document.getElementById('mapa'),
            $stats = document.getElementById('stats'),
            $app = document.getElementById('app');     
        $app.style.height = windowHeight  - 50 + 'px';
        $app.style.width = windowWidth + 'px';
        //$mapa.style.height = windowHeight - 50 + 'px';
        //$mapa.style.width = windowWidth + 'px';
        //$stats.style.height = windowHeight - 50 + 'px';
        //$stats.style.width = windowWidth + 'px';
    }  //  function set_dimensions
    
    //setting max height of some elements
    $(window).bind('resize', function () {
        set_dimensions();
    });
    $(window).trigger('resize');
    
    function datString (czas) {
        year = (czas.getFullYear ()).toString ();

        if (czas.getMonth () + 1 < 10) {
            month = "0" + (czas.getMonth () + 1).toString ();
        } else { 
            month = (czas.getMonth () + 1).toString ();
        }
    
        if (czas.getDate()<10) {
            day = "0" + (czas.getDate ()).toString ();
        } else {
            day = (czas.getDate ()).toString ();
        }
    
        if (czas.getHours()<10) {
            hours = "0" + (czas.getHours ()).toString ();
        } else {
            hours = (czas.getHours ()).toString ();
        }
        
        if (czas.getMinutes()<10) {
            minutes = "0" + (czas.getMinutes ()).toString ();
        } else {
            minutes = (czas.getMinutes ()).toString ();
        }
    
        if (czas.getSeconds() < 10) {
            seconds = "0" + (czas.getSeconds ()).toString ();
        } else {
            seconds = (czas.getSeconds ()).toString ();
        }    
    }  // datString (czas)
    
    
    function Wyswietl (message) {
        app.TextToSpeech (message, 1.0, 0.9 );
    }
    
    function gpxHeader () {
        var naglowek = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<gpx version=\"1.1\" creator=\"mKrok GPS logger\" " +
                "xsi:schemaLocation=\"http://www.topopgrafix.com/GPX/1/1 " +
                "http://www.topografix.com/GPX/1/1/gpx.datStringxsd " +
                "http://www.garmin.com/xmlschemas/GpxExtensions/v3 " +
                "http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd " +
                "http://www.garmin.com/xmlschemas/TrackPointExtension/v1 " +
                "http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd\" " +
                "xmlns=\"http://www.topografix.com/GPX/1/1\" " +
                "xmlns:gpxtpx=\"http://www.garmin.com/xmlschemas/TrackPointExtension/v1\" " +
                "xmlns:gpxx=\"http://www.garmin.com/xmlschemas/GpxExtensions/v3\" " +
                "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n";
       app.WriteFile( plik, naglowek, "Append" );
       app.WriteFile( plik, "  <trk>\n"+"    <type>"+aktywnosc.toUpperCase()+"</type>\n"+"    <trkseg>\n", "Append");
    }   // gpxHeader ()
  
  //******************************************************************************************
  
    var loc_OnChange = function (data) {
        czas = new Date ();
        datString (czas);
        var currentMilliseconds = czas.getTime ();
        var timeGap = parseInt ((currentMilliseconds - startMilliseconds)/1000);
        var sekundy = timeGap%60;
        var minuty = parseInt ((timeGap/60)% 60);
        var godziny = parseInt ((timeGap/3600));
        var myPosition = {lat: data.latitude, lng: data.longitude};
        if (typeof google !== "undefined") {
            map.setCenter (myPosition);
            var newLatLng = new google.maps.LatLng(data.latitude, data.longitude);
            myTrackCoordinates.push (newLatLng);
            marker.setMap(null);
            marker = new google.maps.Marker({
                position: newLatLng,
                // icon: ikona,
                map: map
            });
            marker.setMap(map);
        }
            
            if (minuty < 10) {
                minuty = "0" + minuty;
            }
    
            if (sekundy < 10) {
                sekundy = "0" + sekundy;  
            }    

            if (!started) {
                Wyswietl ("GPS found, starting application");
                gpxHeader ();
                szer = data.latitude;
                dlug = data.longitude;
                started = true;
            }
    
            msg = '      <trkpt lat="' + data.latitude + '" lon="' +
                data.longitude + '">\n' + "      <ele>" + data.altitude +
                "</ele>\n" + "      <spd>" + data.speed + "</spd>\n" +
                "      <time>" + year + "-" + month + "-" + day +
                "T" + hours + ":" + minutes + ":" + seconds + "Z</time>\n" +
                "      </trkpt>\n";

            app.WriteFile (plik, msg, "Append");
            polozenie = data.latitude + "," + data.longitude;
            dystans += loc.GetDistanceTo (szer, dlug);
            lap += loc.GetDistanceTo (szer, dlug);
            pace = (1000/(data.speed*60)).toFixed (2);
            if (lap >= lapDistance) {
                lap = 0;
                lapTime = ((currentMilliseconds - previousMilliseconds)/60000).toFixed (2);
                previousMilliseconds = currentMilliseconds;
                document.getElementById('lap').innerHTML = "Lap time: " + lapTime + " min/km";
                document.getElementById('pace').innerHTML = "Pace: " + ((1000*timeGap)/(60*dystans)).toFixed(2) + " min/km";
                Wyswietl ("distance: " + (dystans/1000).toFixed(0) + " km\naverage pace: " + 
                    ((1000*timeGap)/(60*dystans)).toFixed(2) + " min/km\nlast lap: " + 
                    lapTime + " min/km"); 
            }   // if (lap >= lapDistance) 
            szer = data.latitude;
            dlug = data.longitude;
            document.getElementById('distance').innerHTML = "Distance: " + (dystans / 1000).toFixed(2) + " km";
            document.getElementById('time').innerHTML = "Time: " + godziny + ":" + minuty + ":" + sekundy;
        }; // loc_OnChange
        
    document.getElementById('stopButton').addEventListener('click', function () {
        if (started) {
            if (!paused) {
                loc.Stop();
                paused = true;
            }
            app.WriteFile (plik, "    </trkseg>\n"+"  </trk>\n"+"</gpx>", "Append" );
        }
        setTimeout (function () {
            app.Exit ();
        }, 200); // we need time to write data and only then to exit
    });
        
    document.getElementById('startButton').addEventListener('click', function () {
        app.EnableBackKey (false);
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('stopButton').style.display = 'inline-block';
        var poczatek = new Date();
        startMilliseconds = poczatek.getTime();
        previousMilliseconds = startMilliseconds;
        datString(poczatek);
        godz0 = poczatek.getHours();
        min0 = poczatek.getMinutes();
        sec0 = poczatek.getSeconds();
     
        if (!app.FolderExists(internalStorage + "/GPS Logger")) {
            app.MakeFolder(internalStorage + "/GPS Logger");
        }
        plik = internalStorage + "/GPS Logger/" + year + month + day + "-" + 
            hours + minutes + seconds + ".gpx";    
        if (!app.FolderExists(internalStorage + "/Android/data/com.mkrok.gpslogger")) {
            app.MakeFolder(internalStorage + "/Android/data/com.mkrok.gpslogger");
        }
        if (!app.FileExists(internalStorage + "/Android/data/com.mkrok.gpslogger/config.txt")) {
            configFile = app.CreateFile(internalStorage + "/Android/data/com.mkrok.gpslogger/config.txt", "rw" );
            configFile.WriteText(SMSnumber, "Chars");
        } else {
            SMSnumber = app.ReadFile(internalStorage + "/Android/data/com.mkrok.gpslogger/config.txt", "UTF-8" );
        }
                    
         
        loc.SetOnChange (loc_OnChange); 
        loc.SetRate (0); //as often as possible
        loc.Start ();
        
    });  // startButton click    
});     // $(window).on("load"
