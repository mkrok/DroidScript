var zum = 15;
var map;
var initialPos = {lat: 50.061667, lng: 19.937222};
var myTrackCoordinates;
var myTrack;
var marker;
var newMarket;

function initMap() {
  if (typeof google !== "undefined") {
  // Create an array of styles.
  var styles = [
    {
      stylers: [
          { hue: '#B3E9FF' },
          { saturation: -80 },
          { gamma: 0.30 }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
          { lightness: 100 },
          { visibility: 'simplified' }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [
          { visibility: 'on' }
      ]
    }
  ],
  // Create a new StyledMapType object, passing it the array of styles,
  // as well as the name to be displayed on the map type control.
  styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'});

  map = new google.maps.Map(document.getElementById('mapa'), {
    center: initialPos,
    zoom: zum,
    streetViewControl: false,
    zoomControl: false,
    mapTypeControl: false,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  });

  myTrack = new google.maps.Polyline({
    strokeColor: 'red',
    strokeOpacity: 1.0,
    strokeWeight: 6
  });
  myTrackCoordinates = myTrack.getPath();
  myTrack.setMap(map);
    
  var startLatLng = new google.maps.LatLng(50.061667, 19.937222);
  
  marker = new google.maps.Marker({
    position: startLatLng,
    //icon: ikona,
    map: map
  });
  //marker.setMap(map);
      
  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  map.setCenter(initialPos);
  }  // if (google)
} // function initMap
