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
$("#buffer").slider({
  orientation: "horizontal",
  range: "min",
  max: 4,
  value: 2,
  slide: function(event, ui) {
    $("#buffer-text").val((ui.value/4)+" miles");
  }
});
$("#buffer-text").val($('#buffer').slider('value')/4+" miles");

/* ============= Global variables ============== */
var mapOptions, hoverCell;
var churchesChecked, schoolsChecked = false;
var popup = new mapboxgl.Popup({
  closeButton: false
});
var riskLayers = ["predictions-all","predictions-q1","predictions-q2","predictions-q3","predictions-q4",
                  "predictions-q5","predictions-q6","predictions-q7","predictions-q8","predictions-q9","predictions-q10",
                  "facparks","facschools","faclibraries"];

/* ============= Helper Functions ============== */
// Compile inputs from sidebar into a dictionary.
var readInput = function() {
  var inputs = {
    riskLow : $('#risk-threshold').slider('values', 0),
    riskHigh : $('#risk-threshold').slider('values', 1),
    schools : $('#schools').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    libraries : $('#libraries').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    parks : $('#parks').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
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
    var type;
    switch(layerName) {
      case 'facschools':
        type='School'
        break;
      case 'facparks':
        type='Park';
        break;
      default:
        type='Library';
    }
    if (locations.length>0) {
      popup.setLngLat(e.lngLat)
      .setHTML("<b>Facility type:</b> "+type+"<br><b>Name:</b> "+locations[0].properties.FACNAME+'<br><b>Address:</b> '+locations[0].properties.ADDRESS)
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

// Reset map to just fishnet outline.
var resetMap = function() {
  riskLayers.forEach(function(layer) {
    map.setLayoutProperty(layer, 'visibility', "none");
  });
}

// Find total population within user-defined buffer of a clicked facility.
var findImpact = function() {
  map.addSource('fac-buffer', {
    "type": "vector",
    "url": "mapbox://mayutanaka.ddcc56um"
  });
  map.addLayer({
    "id": "fac-in-buffer",
    "type": "fill",
    "source": "fac-buffer",
    "source-layer": "predictions-dwcy4o",
    "paint": {
      "fill-outline-color": "#000000",
      "fill-opacity": 1
    },
    "filter": ["in", "COUNTY", ""] //CHANGE HERE
  }, 'poi-label');
    map.on('click', function(e) {
  var facFeatures = map.queryRenderedFeatures(e.point, { layers: riskLayers.slice(riskLayers.length-3) });
  if (!facFeatures.length) { return; }
  var facility = facFeatures[0];

  // Using Turf, find the nearest hospital to library clicked
  var inBuffer = turf.nearest(facility, hospitals);

  // If a nearest library is found
  if (nearestHospital !== null) {
    // Update the 'nearest-library' data source to include
    // the nearest library
    map.getSource('nearest-hospital').setData({
      type: 'FeatureCollection',
      features: [
        nearestHospital
      ]
    });
    // Create a new circle layer from the 'nearest-library' data source
    map.addLayer({
      id: 'nearest-hospital',
      type: 'circle',
      source: 'nearest-hospital',
      paint: {
        'circle-radius': 12,
        'circle-color': '#486DE0'
      }
    }, 'hospitals');
  }
});
}

// Updates the map based on user input when the Update Map button is clicked.
var updateMap = function() {
  resetMap();

  addOption(librariesChecked, "faclibraries");
  addOption(parksChecked, "facparks");
  addOption(schoolsChecked, "facschools");

  map.getCanvas().style.cursor = 'default';
  includeRisk();

  map.on('mousemove', function(e) {
    hoverOptions(librariesChecked, "faclibraries", e);
    hoverOptions(parksChecked, "facparks", e);
    hoverOptions(schoolsChecked, "facschools", e);

    var gridcells = map.queryRenderedFeatures(e.point, { layers: riskLayers.slice(0, riskLayers.length-3) });
    if (gridcells.length>0) {
      $('.map-overlay').css('display','table');
      var thisRiskLevel = gridcells[0].properties.quantile;
      var thisRisk = Math.round(gridcells[0].properties.predEnsemble*100);
      var wall;
      switch(gridcells[0].properties.WALL_TYPE) {
        case '1':
          wall='Frame';
          break;
        case '2':
          wall='Brick';
          break;
        default:
          wall='Other';
      }
      var distElec = Math.round(gridcells[0].properties['dist.elec']);
      document.getElementById('info-box').innerHTML = '<h3 class="center title">LOCAL VIEW</h3><br>Local fire risk: <em>'+thisRisk
                                                      +'%</em><br>'+'Risk category: <em>'+thisRiskLevel+'</em>'
                                                      +'</em><br>'+'Count of past fires: <em>'+gridcells[0].properties.countFire+'</em>'
                                                      +'</em><br>'+'Distance to nearest electrical permit: <em>'+distElec+' feet</em>'
                                                      +'</em><br>'+'Median household income: <em>$'+gridcells[0].properties.MedHHInc+'</em>'
                                                      +'</em><br>'+'Majority property wall type: <em>'+wall+'</em>';

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
  });
}

/* ============= User Interactivity ============== */
$(document).ready(function() {
  $('#exampleModal').modal('show');
  $('#collapseExample').collapse('in');
});

$('#update-map').click(function() {
  mapOptions = readInput();
  librariesChecked = mapOptions.libraries;
  parksChecked = mapOptions.parks;
  schoolsChecked = mapOptions.schools;
  updateMap();
});

$('#resetbutton').click(function() {
  resetMap();
});
