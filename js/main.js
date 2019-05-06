/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1IjoibWF5dXRhbmFrYSIsImEiOiJjajhieGJ4N3gwMzgzMzNtb2tmMDFiMHJlIn0.qCJLeV-KUvxpAO38a9dPtA';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mayutanaka/cjuyfpqbc02ae1fny2s8uqcnp',
center: [-85.746,38.213],
zoom:10.98
});

map.addControl(new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl,
placeholder: "search"
}));

/* ============= Interactive Elements setup ============== */
$("#risk-threshold").slider({
  range: true,
  min: 1,
  max: 10,
  values: [5, 10],
  slide: function(event, ui) {
    $("#threshold").val(ui.values[0]+" - "+ui.values[1]);
  }
});
$("#threshold").val($('#risk-threshold').slider('values', 0)+" - "+$('#risk-threshold').slider('values', 1));
$("#buffer").slider({ });

/* ============= Global variables ============== */
var mapOptions, hoverCell;
var churchesChecked, schoolsChecked = false;
var overlay = document.getElementById('popbox');
var popup = new mapboxgl.Popup({
  closeButton: false
});
var riskLayers = ["predictions-all","predictions-q1","predictions-q2","predictions-q3","predictions-q4",
                  "predictions-q5","predictions-q6","predictions-q7","predictions-q8","predictions-q9","predictions-q10",
                  "churches","schools"];

/* ============= Helper Functions ============== */
// Compile inputs from sidebar into a dictionary.
var readInput = function() {
  var inputs = {
    riskLow : $('#risk-threshold').slider('values', 0),
    riskHigh : $('#risk-threshold').slider('values', 1),
    schools : $('#schools').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    churches : $('#worship').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    buffer : $("#buffer").slider('option', 'value')
  };
  return inputs;
}

// When the checkbox for an option is selected, that layer will be shown on the map.
var addOption = function(checkedTrue, layerName) {
  if(checkedTrue) {
    map.setLayoutProperty(layerName, 'visibility', "visible");
  }
};

// Hovering over a location shows you information about that point.
var hoverOptions = function(checkedTrue, layerName, e) {
  if (checkedTrue) {
    var locations = map.queryRenderedFeatures(e.point, { layers: [layerName] });
    if (locations.length>0) {
      popup.setLngLat(e.lngLat)
      .setText(locations[0].properties.amenity)
      .addTo(map);
    }
  }
};

// Include risk category layers within user-defined threshold.
// Highlight hover functionality from: https://docs.mapbox.com/mapbox-gl-js/example/query-similar-features/
var includeRisk = function() {
  if(mapOptions) {
    var include = mapOptions.riskLow;
    while(include <= mapOptions.riskHigh) {
      console.log(include);
      map.setLayoutProperty(riskLayers[include], 'visibility', "visible");
      include++;
    }
  }
}

// Updates the map based on user input when the Update Map button is clicked.
var updateMap = function() {
  resetMap();
  addOption(churchesChecked, "churches");
  addOption(schoolsChecked, "schools");

  map.getCanvas().style.cursor = 'default';
  includeRisk();
  map.on('mousemove', function(e) {
    hoverOptions(churchesChecked, "churches", e);
    hoverOptions(schoolsChecked, "schools", e);

    var features = map.queryRenderedFeatures(e.point, { layers: riskLayers });
    if (features.length>0) {
      $('.map-overlay').css('display','table');
      var thisRiskLevel = features[0].properties.quantile;
      var thisRisk = Math.round(features[0].properties.predEnsemble*100);
      document.getElementById('info-box').innerHTML = '<h2 class="title all-caps">LOCAL VIEW</h2><br>Local fire risk: <em>'+thisRisk
                                                      +'%</em><br>'+'Risk category: <em>'+thisRiskLevel+'</em>';
      overlay.innerHTML = '';
      var title = document.createElement('strong');
      title.textContent = 'Risk category: '+thisRiskLevel;
      overlay.appendChild(title);
      overlay.style.display = 'block';

      map.setFilter('predictions-all', ['==', 'quantile', thisRiskLevel]);
      map.setLayoutProperty("predictions-all", 'visibility', "visible");
    } else {
      $('.map-overlay').css('display','none');
    }
  });

  map.on('mouseleave', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
    map.setFilter("predictions-all", ['==', 'quantile', '']);
    map.setLayoutProperty('predictions-all', 'visibility', "none");
    overlay.style.display = 'none';
  });
}

// Reset map to just fishnet outline.
var resetMap = function() {
  riskLayers.forEach(function(layer) {
    map.setLayoutProperty(layer, 'visibility', "none");
  });
}

/* ============= User Interactivity ============== */
$('#update-map').click(function() {
  mapOptions = readInput();
  churchesChecked = mapOptions.churches;
  schoolsChecked = mapOptions.schools;
  updateMap();
});
$('#resetbutton').click(function() {
  resetMap();
});
