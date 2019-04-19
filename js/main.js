/* ============= Leaflet setup ============== */
// var map = L.map('map', {
//   center: [38.227006, -85.756166],
//   zoom: 11,
//   zoomControl: false
// });
//
// var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
//   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//   subdomains: 'abcd',
//   minZoom: 0,
//   maxZoom: 20,
//   ext: 'png'
// }).addTo(map);
/* ========================================== */

/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1IjoibWF5dXRhbmFrYSIsImEiOiJjajhieGJ4N3gwMzgzMzNtb2tmMDFiMHJlIn0.qCJLeV-KUvxpAO38a9dPtA';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11',
center: [-79.4512, 43.6568],
zoom: 13
});

map.addControl(new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
}));
/* ========================================== */

//
// //var hexgrid= "https://raw.githubusercontent.com/zhaoanbei/practicum_data/master/newpracticum.geojson";
// //var hexgrid= "https://raw.githubusercontent.com/zhaoanbei/practicum_data/master/pred426.geojson";
// var hexgrid="https://raw.githubusercontent.com/zhaoanbei/practicum_data/master/pred0430.geojson";
// var Boundary ="https://gist.githubusercontent.com/anonymous/eb5a6386acba87e14f8f4262cb4d0488/raw/7d073e2bab2e0a2cb55e1b19e0b9439bc833c886/boundary.json";
// var ZoomAddress=null;
// var hexlayer;
// var citybdry;
//
// var zip=null;
// var cityboundary;
//
// var setview = function(){
//   map.setView([40.000, -75.1090],11);
// };
//
// function costbenefitColor(d) {
//       d = Number(d);
//     return  d > 5000   ? '#f46d43' :
//             d > 0   ?  '#fee090' :
//             d > (-10000)    ? '#e0f3f8' :
//             d > (-12000)   ? '#abd9e9' :
//             d > (-14000)   ? '#74add1' :
//                         '#4575b4';
// }
//
// function Style_default(feature) {
//     return {
//     fillColor:costbenefitColor(parseInt(feature.properties.costben15)),
//     color: "#828A8F",
//     weight: 0.1,
//     opacity: 0.3,
//     fillOpacity: 0.6
//   };
// }
//
// $(document).ready(function() {
//    $.ajax(hexgrid).done(function(data) {
//      var parsedData = JSON.parse(data);
//  hexlayer =L.geoJson(parsedData, {
//                 style: Style_default,
//                }).addTo(map);
//  hexlayer.eachLayer(defaultFunction);
//  $("#myModal").modal('show');
// });
// });
//
//   var slider = document.getElementById('myRange');
//   var output = document.getElementById("outputRange");
//   output.innerHTML = slider.value;
//   slider.oninput = function() {
//   output.innerHTML = this.value;
//   };
//
//   slider.addEventListener('input', function(e) {
//     dock = document.getElementById('myRange').value;
//     var count = "pred" + dock;
//     var cost = "cost" + dock;
//     var balance = "costben"+ dock;
//     console.log(balance);
//     console.log(cost);
//     console.log(count);
//
//     map.removeLayer(hexlayer);
//     hideResults();
//
//     function Stylecostbenefit(feature) {
//         return {
//         fillColor:costbenefitColor(parseInt(feature.properties[balance])),
//         color: "#828A8F",
//         weight: 0.2,
//         opacity: 0.3,
//         fillOpacity: 0.6
//       };
//     }
//
//      var addmap = function(){
//       $(document).ready(function() {
//        $.ajax(hexgrid).done(function(data) {
//            var parsedData = JSON.parse(data);
//            hexlayer =L.geoJson(parsedData, {
//                      style: Stylecostbenefit,
//                      }).addTo(map);
//        hexlayer.eachLayer(eachFeatureFunction);
//       });
//       });
//     };
//     addmap();
//
//   var eachFeatureFunction = function(layer) {
//     layer.on('click', function (event) {
//           console.log(5);
//           $('#tripcount-num').text(layer.feature.properties[count]);
//           $('#cost-num').text("$"+ layer.feature.properties[cost]);
//           $('#cost-benefit-num').text("$"+layer.feature.properties[balance]);
//           $('#population-num').text(layer.feature.properties.pop);
//           $('#median-age-num').text(layer.feature.properties.age);
//           $('#medincome-num').text("$"+ layer.feature.properties.income);
//           $('#dis-CBD-num').text(parseInt(layer.feature.properties.dis_cbd) + " ft");
//           $('#dis-septa-num').text(parseInt(layer.feature.properties.dis_sub) + " ft");
//           $('#dis-crime-num').text(parseInt(layer.feature.properties.dis_10crim) + " ft");
//         //  map.fitBounds(event.target.getBounds());
//         //  console.log(layer.feature.properties.pop);
//           showResults();
//     });
//   };
//   });
//
// $('.show-cost-benefit').hide();
// $('.show-nbhd-info').hide();
// $('#info').hide();
//
// //define style
// function myStyle(feature) {
//         return {
//         color: "#969696",
//         opacity: 0.7,
//         fillOpacity: 0.8};
// }
//
// var showResults = function() {
//   $('.show-cost-benefit').show();
//   $('.show-nbhd-info').show();
//   $('#info').show();
// };
//
// var hideResults = function() {
//   $('.show-cost-benefit').hide();
//   $('.show-nbhd-info').hide();
//   $('#info').hide();
// };
//
// var defaultFunction = function(layer) {
//   layer.on('click', function (event) {
//     if(document.getElementById('myRange').value==15){
//         console.log(2);
//         $('#tripcount-num').text(layer.feature.properties.pred15);
//         $('#cost-num').text(layer.feature.properties.cost15);
//         $('#cost-benefit-num').text("$"+layer.feature.properties.costben15);
//         $('#population-num').text(layer.feature.properties.pop);
//         $('#median-age-num').text(layer.feature.properties.age);
//         $('#medincome-num').text("$"+ layer.feature.properties.income);
//         $('#dis-CBD-num').text(parseInt(layer.feature.properties.dis_cbd) + " ft");
//         $('#dis-septa-num').text(parseInt(layer.feature.properties.dis_sub) + " ft");
//         $('#dis-crime-num').text(parseInt(layer.feature.properties.dis_10crim) + " ft");
//       //  map.fitBounds(event.target.getBounds());
//       //  console.log(layer.feature.properties.pop);
//         showResults();
//         }
//   });
// };
