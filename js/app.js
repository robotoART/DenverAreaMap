var map;

// Model data of all places
var locations = [
    {
        title: 'Garden of the Gods',
        location: {lat: 38.878446, lng: -104.869788},
        city: 'Colorado Springs',
        state: 'CO',
        country: 'US'
    },
    {
        title: 'Red Rocks Amphitheatre',
        location: {lat: 39.665425, lng: -105.205711},
        city: 'Morrison',
        state: 'CO',
        country: 'US'
    },
    {
        title: 'Cheyenne Mountain Zoo',
        location: {lat: 38.771818, lng: -104.853352},
        city: 'Colorado Springs',
        state: 'CO',
        country: 'US'
    },
    {
        title: 'Park Meadows Mall',
        location: {lat: 39.564306, lng: -104.87474},
        city: 'Lone Tree',
        state: 'CO',
        country: 'US'
    },
    {
        title: 'Confluence Park',
        location: {lat: 39.754654, lng: -105.007346},
        city: 'Denver',
        state: 'CO',
        country: 'US'
    },
    {
        title: 'Lookout Mountain Park',
        location: {lat: 39.732909, lng: -105.238919},
        city: 'Lakewood',
        state: 'CO',
        country: 'US'
    }];


// View of Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 39.4, lng: -104.990251},
          zoom: 9,
          mapTypeControl: false
        });
    ko.applyBindings(new ViewModel());
}


// Model of a place
var Place = function(data) {
    var self = this;
    self.title = ko.observable(data.title);
    self.location = ko.observable(data.location);
    self.contentString = ko.observable('');
    self.city = ko.observable(data.city);
    self.state = ko.observable(data.state);
    self.country = ko.observable(data.country);
};


// ViewModel
var ViewModel = function() {
    var self = this;
    var infowindow = new google.maps.InfoWindow({
      maxWidth: 250
    });
    var bounds = new google.maps.LatLngBounds();
    var location;
    var userinput;

    // places list model to view
    self.placesList = ko.observableArray([]);
    locations.forEach(function(placeItem) {
        self.placesList.push(new Place(placeItem));
    });

    // search filter results observableArray
    self.visiblePlace = ko.observableArray();

    // put all markers in 'visiblePlace' observableArray
    self.placesList().forEach(function(place) {
      self.visiblePlace.push(place);
    });

    // placeholder for user search filter input
    self.userFilter = ko.observable('');

    // function to filter places based on 'userFilter' input
    self.filterPlaces = function() {
      userinput = self.userFilter().toLowerCase();
      infowindow.close();
      self.visiblePlace.removeAll();

      self.placesList().forEach(function(place) {
        place.marker.setVisible(false);
        if (place.title().toLowerCase().indexOf(userinput) !== -1) {
          self.visiblePlace.push(place);
        }
      });
      self.visiblePlace().forEach(function(place) {
        place.marker.setVisible(true);
      });
    };
};

var mapError = ko.observable(false);
var googleMapError = () => {
  document.getElementById("map").innerHTML = "<h1>There was an unknown problem loading the google map.</h1>";
};
