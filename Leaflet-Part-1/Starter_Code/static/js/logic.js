// We create the tile layer that will be the background of our map.
console.log('step_1')
let basemap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });
// We create the map object with options.
let map = L.map('map', {center:[40.7, -94.5], zoom: 3});

// Then we add our 'basemap' tile layer to the map.
basemap.addTo(map);

// Here we make an AJAX call that retrieves our earthquake geoJSON data.
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(function(data){

  // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into two separate functions
    // to calculate the color and radius.
  function styleInfo(feature){
      return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: '#00000',
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: .05
      };
  }
  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(depth){
    switch(true){
      case depth>90:
        return "#1f005c";
      case depth>70:
        return "#5b1060";
      case depth>50:
        return "#ac255e";
      case depth>30:
        return "#ca485c";
      case depth>10:
        return "#e16b5c";
      default:
        return "#ffb56b";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude){
    return magnitude === 0 ? 1 : magnitude * 4;
  }
  
  

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {

  // We turn each feature into a circleMarker on the map.
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng);
  },
  // We set the style for each circleMarker using our styleInfo function.
  style: styleInfo,
  // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
onEachFeature: function (feature, layer) {
    layer.bindPopup(
      "Magnitude: " +
        feature.properties.mag +
        "<br>Depth: " +
        feature.geometry.coordinates[2] +
        "<br>Location: " +
        feature.properties.place
    );
  },
}).addTo(map);
  // Here we create a legend control object.
  let legend = L.control({
    position : "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depthLevels = [-10, 10, 30, 50, 70, 90];
    const colors = ["#ffb56b", "#e16b5c", "#ca485c", "#ac255e", "#5b1060", "#1f005c"];

  // Looping through our intervals to generate a label with a colored square for each interval.
  for (let i = 0; i < depthLevels.length; i++) {
    div.innerHTML +=
      "<i style='background: " +
      colors[i] +
      "'></i> " +
      depthLevels[i] +
      (depthLevels[i + 1] ? "&ndash;" + depthLevels[i + 1] + "<br>" : "+");
  }
  return div;
};
  // Finally, we our legend to the map.
  legend.addTo(map);
});