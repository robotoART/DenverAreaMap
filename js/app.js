var map;

// Model data of all places
var locations = []


// View of Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 39.4, lng: -104.990251},
          zoom: 9,
          mapTypeControl: false
        });
    ko.applyBindings(new ViewModel());
}


// ViewModel
var ViewModel = function() {
    var self = this;
    var infowindow = new google.maps.InfoWindow({
      maxWidth: 250
    });
    var bounds = new google.maps.LatLngBounds();
};

var mapError = ko.observable(false);
var googleMapError = () => {
  document.getElementById("map").innerHTML = "<h1>There was an unknown problem loading the google map.</h1>";
};
