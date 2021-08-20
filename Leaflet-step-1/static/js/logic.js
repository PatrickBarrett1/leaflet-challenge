// Store our API endpoint inside queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // create popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup('<h3>' + feature.properties.place +
      '</h3><hr><p>' + new Date(feature.properties.time) + '</p>');
  }

  // create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 18000;
  }

  // set circle color based on the depth of earthquake - greater depth = darker color
  function circleColor(depth) {
    if (depth < 10) {
      return '#7cfc00'
    }
    else if (depth < 30) {
      return '#32cd32'
    }
    else if (depth < 50) {
      return '#ffd700'
    }
    else if (depth < 70) {
      return '#ffa500'
    }
    else if (depth < 90) {
      return '#ff6633'
    }
    else {
      return '#da3e3e'
    }
  }

  // create a GeoJSON layer - array earthquakeData object - run oneach
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.geometry.coordinates[2]),
        fillOpacity: 1,
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // create tile layer - background of map  
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // create map - streetmap earthquakes display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  }); 

  // color function to be used when creating the legend
  function getColor(d) {
    return d > 90 ?  '#da3e3e' :
           d > 70  ? '#ff6633' :
           d > 50  ? '#ffa500' :
           d > 30  ? '#ffd700' :
           d > 10  ? '#32cd32' :
                     '#7cfc00';
  }

  // Add legend to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          depths = [-10, 10, 30, 50, 70, 90],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depths.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
              depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}