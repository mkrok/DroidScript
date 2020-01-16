const activity = 'Running';
const folder = 'Runner';
const maxRunningSpeed = 20;     // unit: m/s
var year, month, day, hours, minutes, seconds;
var startMilliseconds, previousMilliseconds;
var internalStorage = app.GetInternalFolder();
var start;

const secs = minutes => parseInt((minutes - parseInt(minutes, 10)) * 60, 10);
const setTime = time => {
  // side effect - to be rewritten
  year = (time.getFullYear()).toString();
  month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1).toString() : (time.getMonth() + 1).toString();
  day = time.getDate() < 10 ? '0' + (time.getDate ()).toString() : (time.getDate()).toString();
  hours = time.getHours() < 10 ? '0' + (time.getHours()).toString() : (time.getHours()).toString();
  minutes = time.getMinutes() < 10 ? '0' + (time.getMinutes()).toString() : (time.getMinutes()).toString();
  seconds = time.getSeconds() < 10 ? '0' + (time.getSeconds()).toString() : (time.getSeconds()).toString();  
};

const applicationStarted = new Date();
setTime(applicationStarted);

if (!app.FolderExists(internalStorage + '/' + folder)) {
  app.MakeFolder(internalStorage + '/' + folder);
}
var log = internalStorage + '/' + folder + '/' + year + month + day + '-' + hours + minutes + seconds + '.gpx';    
var started = false;
var paused = false;
var distance = 0;
var lat = '';
var lon = '';
var lapTime = 0;
var lap = 0;
var lapDistance = 1000;
var pace = 0;
var startPressed = false;
var startCounter = 5;

const say = message => {
  app.TextToSpeech(message, 1.0, 1.0 );
};

const writeGpxHeader = (log, activity) => {
  const naglowek = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
    '<gpx version=\"1.1\" creator=\"Run.apk mk12ok\" ' +
    'xsi:schemaLocation=\"http://www.topopgrafix.com/GPX/1/1 ' +
    'http://www.topografix.com/GPX/1/1/gpx.datStringxsd ' +
    'http://www.garmin.com/xmlschemas/GpxExtensions/v3 ' +
    'http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd ' +
    'http://www.garmin.com/xmlschemas/TrackPointExtension/v1 ' +
    'http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd\" ' +
    'xmlns=\"http://www.topografix.com/GPX/1/1\" ' +
    'xmlns:gpxtpx=\"http://www.garmin.com/xmlschemas/TrackPointExtension/v1\" ' +
    'xmlns:gpxx=\"http://www.garmin.com/xmlschemas/GpxExtensions/v3\" ' +
    'xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n';
   app.WriteFile( log, naglowek, 'Append' );
   app.WriteFile( log, '  <trk>\n' + '    <type>' + activity.toUpperCase() + '</type>\n' + 
   '    <trkseg>\n', 'Append');
};

const loc_OnChange = data => {
  if (startCounter >= 0) {
    startCounter--;
  }
  if (startCounter > 0) return -2;   // we are not ready yet
  if (startCounter === 0) {
    say('GPS found');
  };

  if (!startPressed) {
    document.getElementById('startButton').style.color = 'red';
    document.getElementById('startButton').addEventListener('click', () => {    
      document.getElementById('startButton').style.display = 'none';
      document.getElementById('stopButton').style.display = 'inline-block';
      app.EnableBackKey (false);
      startPressed = true;
    });  // startButton click 
  }  

  const myPosition = {lat: data.latitude, lng: data.longitude};
  
  if (typeof google !== 'undefined') {
    map.setCenter (myPosition);
    const newLatLng = new google.maps.LatLng(data.latitude, data.longitude);
    if (startPressed) {
      myTrackCoordinates.push (newLatLng);
    }
    marker.setPosition(newLatLng);
    // newMarker = new google.maps.Marker({
        // position: newLatLng,
        // map: map
   // });
    
    // marker.setMap(null);
   // marker = newMarker;
   // marker.setMap(map);
  }

  if (!startPressed) return -3;       // do nothing
    
  const time = new Date ();
  setTime(time);
  const currentMilliseconds = time.getTime();
  const timeGap = parseInt((currentMilliseconds - startMilliseconds)/1000, 10);
  const lastTick = currentMilliseconds - previousMilliseconds;
  const s = Number.isNaN(timeGap%60) ? 0 : timeGap%60;
  const m = Number.isNaN(parseInt((timeGap / 60) % 60)) ? 0 : parseInt((timeGap / 60) % 60, 10);
  const h = Number.isNaN(parseInt((timeGap / 3600))) ? 0 : parseInt((timeGap / 3600), 10);
  const ss = s < 10 ? '0' + s.toString() : s.toString();
  const mm = m < 10 ? '0' + m.toString() : m.toString();
  const hh = h.toString();

  if (!started) {
    say('go');
    start = new Date();
    setTime(start);
    startMilliseconds = start.getTime();
    previousMilliseconds = startMilliseconds;
    writeGpxHeader(log, activity);
    lat = data.latitude;
    lon = data.longitude;
    started = true;
  }

  const dist = loc.GetDistanceTo (lat, lon);
  const lastSpeed = 1000 * dist / lastTick;
  
  if (lastSpeed > maxRunningSpeed ) return -1;   // something went wrong with the GPS

  msg = '      <trkpt lat="' + data.latitude + '" lon="' +
      data.longitude + '">\n' + '      <ele>' + data.altitude +
      '</ele>\n' + '      <spd>' + data.speed + '</spd>\n' +
      '      <time>' + year + '-' + month + '-' + day +
      'T' + hours + ':' + minutes + ':' + seconds + 'Z</time>\n' +
      '      </trkpt>\n';

  app.WriteFile (log, msg, 'Append');
  distance += dist;
  lap += dist;
  pace = (1000/(data.speed*60)).toFixed (2);
  if (lap >= lapDistance) {
    lap = 0;
    lapTime = ((currentMilliseconds - previousMilliseconds)/60000).toFixed (2);
    previousMilliseconds = currentMilliseconds;
    document.getElementById('lap').innerHTML = 'Lap time: ' + lapTime + ' min/km';
    document.getElementById('pace').innerHTML = 'Pace: ' + ((1000*timeGap)/(60*distance)).toFixed(2) + ' min/km';
    say('distance: ' + (distance/1000).toFixed(0) + ' km\naverage pace: ' + 
      ((1000*timeGap)/(60*distance)).toFixed(2) + ' min/km\nlast kilometer: ' + 
      parseInt(lapTime, 10) + 'minutes' + secs(lapTime) + 'seconds'); 
  }   
  lat = data.latitude;
  lon = data.longitude;
  document.getElementById('distance').innerHTML = 'Distance: ' + (distance/ 1000).toFixed(2) + ' km';
  document.getElementById('time').innerHTML = 'Time: ' + hh + ':' + mm + ':' + ss;
}; 

window.addEventListener('load', () => {
  loc.SetOnChange(loc_OnChange); 
  loc.SetRate(0);    //as often as possible
  loc.Start();
  document.getElementById('stopButton').addEventListener('click', function () {
    if (started) {
      if (!paused) {
        loc.Stop();
        paused = true;
      }
      app.WriteFile(log, '    </trkseg>\n' + '  </trk>\n' + '</gpx>', 'Append' );
    }
    setTimeout(() => {
      app.Exit();
    }, 200); // we need time to write data and only then to exit
  });
});
