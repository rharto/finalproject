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

var popup = new mapboxgl.Popup({
  closeButton: false
});

var overlay = document.getElementById('popbox');
var schools, churches, hoverCell;

/* ============= JQuery sliders ============== */
$( "#risk-threshold" ).slider({
  range: true
});
$( "#buffer" ).slider({ });

/* ============= Mapbox options ============== */
map.on('load', function() {
  map.setPaintProperty("predictions", 'fill-opacity', ["case",["boolean",["feature-state","hover"],false],1,0.5]);
  // schools = map.querySourceFeatures('composite', { 'sourceLayer': 'schools-a3mzwl' });
  // churches = map.querySourceFeatures('composite', { 'sourceLayer': 'churches-2dd7vq' });

  map.addSource('predictions', {
    "type": "vector",
    "url": "mapbox://mayutanaka.1xmca989/"
  });
  map.addLayer({
    "id": "predictions-highlighted",
    "type": "fill",
    "source": "predictions",
    "source-layer": "predEnsembling-860fuy",
    "paint": {
      "fill-opacity": 1
    },
    "filter": ["==", "quantile", ""]
  }, 'poi-label'); // Place polygon under these labels.

  // Highlight hover: https://docs.mapbox.com/mapbox-gl-js/example/query-similar-features/
  map.on('mousemove', function(e) {
    map.getCanvas().style.cursor = 'pointer';

    var locations = map.queryRenderedFeatures(e.point, { layers: ['schools', 'churches'] });
    if (locations.length>0) {
      popup.setLngLat(e.lngLat)
      .setText(locations[0].properties.amenity)
      .addTo(map);
    }

    var features = map.queryRenderedFeatures(e.point, { layers: ['predictions'] });
      if (features.length>0) {
      var risklevel = features[0].properties.quantile;
      var relatedFeatures = map.querySourceFeatures('predictions', {
        sourceLayer: 'predEnsembling-860fuy',
        filter: ['==', 'quantile', risklevel]
      });

      $('.map-overlay').css('display','table');
      var localrisk = Math.round(features[0].properties.predEnsemble*100);
      document.getElementById('info-box').innerHTML = '<h2 class="title all-caps">LOCAL VIEW</h2><br>Local fire risk: <em>'+localrisk
                                                      +'%</em><br>'+'Risk category: <em>'+risklevel+'</em>';

      overlay.innerHTML = '';
      var title = document.createElement('strong');
      title.textContent = 'Risk category: '+risklevel+' ('+relatedFeatures.length+'other cells)';
      overlay.appendChild(title);
      overlay.style.display = 'block';

      map.setFilter('predictions-highlighted', ['==', 'quantile', risklevel]);
    } else {
      $('.map-overlay').css('display','none');
    }
  });

  map.on('mouseleave', 'predictions', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
    map.setFilter('predictions-highlighted', ['==', 'quantile', '']);
    overlay.style.display = 'none';
  });
});
