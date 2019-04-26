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

/* ============= JQuery sliders ============== */
$( "#risk-threshold" ).slider({
  range: true
});
// var range = $( "#risk-threshold" ).slider( "option", "range" );
$( "#buffer" ).slider({ });
