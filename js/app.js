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
    var marker;
    var userinput;

    // places list model to view
    self.placesList = ko.observableArray([]);
    locations.forEach(function(placeItem) {
        self.placesList.push(new Place(placeItem));
    });

    // map markers & infowindows models to view
    self.placesList().forEach(function(placeData) {
      // create the markers from the model
      marker = new google.maps.Marker({
        title: placeData.title(),
        position: new google.maps.LatLng(placeData.location()),
        map: map,
        animation: google.maps.Animation.DROP
      });
      bounds.extend(marker.position);
      placeData.marker = marker;

      // nonGoogle API calls for infoWindows data
      var foursqUrl = 'https://api.foursquare.com/v2/venues/search';
      var foursqCI = 'L3E1LXCTPJ4ZF04M0Q4BSYL2D05ERO1CV2KXPQDLXBD2UMSU';
      var foursqCS = 'SEJXZVU250INZKAXMOTM232HX14WPGGCCSB0LEEXCEEG2U2G';
      var foursqV = '20170801';
      var foursqphotoUrl = 'https://api.foursquare.com/v2/venues/';
      var foursqPicSize = '200x200';
      $.ajax({
        url: foursqUrl,
        dataType: 'json',
        data: 'limit=1' +
          '&ll='+ placeData.location().lat +
          ',' + placeData.location().lng +
          '&query=' + placeData.title() +
          '&client_id=' + foursqCI +
          '&client_secret=' + foursqCS + '&v=' + foursqV,
        async: true,
        success: function(response) {
          var foursqVenueName = response.response.venues[0].name;
          var foursqVenueId = response.response.venues[0].id;
          $.ajax({
            url: foursqphotoUrl + foursqVenueId + '/photos',
            dataType: 'json',
            data: 'limit=1' +
              '&ll='+ placeData.location().lat +
              ',' + placeData.location().lng +
              '&query=' + placeData.title() +
              '&client_id=' + foursqCI +
              '&client_secret=' + foursqCS + '&v=' + foursqV,
            async: true,
            success: function(picresponse) {
              var foursqprefix = picresponse.response.photos.items[0].prefix;
              var foursqsuffix = picresponse.response.photos.items[0].suffix;
              var fourpic = foursqprefix + foursqPicSize + foursqsuffix;
              var venueUrl = 'https://foursquare.com/v/' + foursqVenueId + '?ref='+ foursqCI;
              placeData.contentString = '<div class="col-xs-12"><h4>' + foursqVenueName + '</h4></div>' +
              '<div class="col-xs-12"><img class="col-xs-12" src=' + fourpic + '></div>' +
              '<div class="col-xs-12"><a href="' + venueUrl + '">More Details</a><div>' +
              '<div class="col-xs-12"><p>powered by Foursquare</p><div>';
            },
            error: function(e) {
              placeData.contentString = '<p>Foursquare Photos not responding at this time</p>';
            }
          });
        },
        error: function(e) {
          placeData.contentString = '<p>Foursquare not responding at this time</p>';
        }
      });

      // create infoWindows for markers
      google.maps.event.addListener(placeData.marker, 'click', function() {
        infowindow.open(map, this);
        placeData.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          placeData.marker.setAnimation(null);
        }, 2100);

        infowindow.setContent(placeData.contentString);
      });
    });
    map.fitBounds(bounds);

    // event trigger function for a clicked place from the list
    self.viewPlace = function(clickedPlace) {
      google.maps.event.trigger(clickedPlace.marker, 'click');
    }

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
