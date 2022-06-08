/* eslint-disable no-undef */
/**
 * geoJSON simple
 */
// Variable for GeoJSON data
let addedGeoJSON;

// config map
let config = {
    minZoom: 1,
    maxZoom: 18,
    maxBoundsViscosity: 0.9,
};

// calling map
const map = L.map("map", config);

// marker icon big
var bigIcon = L.icon({
    iconUrl: '/assets/containerIcon.svg',
    iconSize: [100, 100],
    iconAnchor: [50, 50],
    popupAnchor: [0, -5],
    /*shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]*/
});

// marker icon small
var smallIcon = L.icon({
    iconUrl: '/assets/smallIcon.svg',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5],
    /*shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]*/
});

// PopUp
var popup = L.popup();

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
//https://api.mapbox.com/styles/v1/anikolov/cl1c3uy3k001s14s9lr4p3kvp/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYW5pa29sb3YiLCJhIjoiY2wxYzNraGFjMDF2ODNnbjFwN2FoenI2eiJ9.v5X2PYctWmudRI_xdVGb8w

L.tileLayer("https://api.mapbox.com/styles/v1/anikolov/cl1c3uy3k001s14s9lr4p3kvp/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYW5pa29sb3YiLCJhIjoiY2wxYzNraGFjMDF2ODNnbjFwN2FoenI2eiJ9.v5X2PYctWmudRI_xdVGb8w", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);


// adding geojson by fetch
// of course you can use jquery, axios etc.
fetch("https://raw.githubusercontent.com/lagerregalec/Einetonne/main/assets/data/containers.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // use geoJSON
        addedGeoJSON = L.geoJSON(data, {

            pointToLayer: function(geoJsonPoint, latlng){
                return L.marker(latlng,{
                    icon: smallIcon
                });
            },

            onEachFeature: function(feature, layer){
                if(feature.geometry.type ==='Point'){
                    layer.bindPopup(feature.properties.gefaess_art);
                }
            }

        }).addTo(map);
        // console.log(data);
        //Dynamically adjust Viewport properties based on geoJSON data
        map.fitBounds(addedGeoJSON.getBounds(),{
            padding:[20,20]
        });
        map.setMinZoom(map.getZoom());
        map.setMaxBounds(addedGeoJSON.getBounds().pad(0.1));
        map.on('zoomend', onZoomend);
    });

function onZoomend(feature, layer) {
    var currentZoom = map.getZoom();
    if (currentZoom >= 18) {
        addedGeoJSON.eachLayer(function(layer) {
            layer.setIcon(bigIcon);
        });
    }
    else{
        addedGeoJSON.eachLayer(function(layer) {
            layer.setIcon(smallIcon);
        });
    }
}

/*

// --------------------------------------------------

// create custom button
const customControl = L.Control.extend({
    // button position
    options: {
        position: "topleft",
        className: "locate-button leaflet-bar",
        html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
        style:
            "margin-top: 0; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
    },

    // method
    onAdd: function (map) {
        this._map = map;
        const button = L.DomUtil.create("div");
        L.DomEvent.disableClickPropagation(button);

        button.title = "locate";
        button.innerHTML = this.options.html;
        button.className = this.options.className;
        button.setAttribute("style", this.options.style);

        L.DomEvent.on(button, "click", this._clicked, this);

        return button;
    },
    _clicked: function (e) {
        L.DomEvent.stopPropagation(e);

        // this.removeLocate();

        this._checkLocate();

        return;
    },
    _checkLocate: function () {
        return this._locateMap();
    },

    _locateMap: function () {
        const locateActive = document.querySelector(".locate-button");
        const locate = locateActive.classList.contains("locate-active");
        // add/remove class from locate button
        locateActive.classList[locate ? "remove" : "add"]("locate-active");

        // remove class from button
        // and stop watching location
        if (locate) {
            this.removeLocate();
            this._map.stopLocate();
            return;
        }

        // location on found
        this._map.on("locationfound", this.onLocationFound, this);
        // locataion on error
        this._map.on("locationerror", this.onLocationError, this);

        // start locate
        this._map.locate({ setView: true, enableHighAccuracy: true });
    },
    onLocationFound: function (e) {
        // add circle
        this.addCircle(e).addTo(this.featureGroup()).addTo(map);

        // add marker
        this.addMarker(e).addTo(this.featureGroup()).addTo(map);

        // add legend
    },
    // on location error
    onLocationError: function (e) {
        this.addLegend("Location access denied.");
    },
    // feature group
    featureGroup: function () {
        return new L.FeatureGroup();
    },
    // add legend
    addLegend: function (text) {
        const checkIfDescriotnExist = document.querySelector(".description");

        if (checkIfDescriotnExist) {
            checkIfDescriotnExist.textContent = text;
            return;
        }

        const legend = L.control({ position: "bottomleft" });

        legend.onAdd = function () {
            let div = L.DomUtil.create("div", "description");
            L.DomEvent.disableClickPropagation(div);
            const textInfo = text;
            div.insertAdjacentHTML("beforeend", textInfo);
            return div;
        };
        legend.addTo(this._map);
    },
    addCircle: function ({ accuracy, latitude, longitude }) {
        return L.circle([latitude, longitude], accuracy / 2, {
            className: "circle-test",
            weight: 2,
            stroke: false,
            fillColor: "#136aec",
            fillOpacity: 0.15,
        });
    },
    addMarker: function ({ latitude, longitude }) {
        return L.marker([latitude, longitude], {
            icon: L.divIcon({
                className: "located-animation",
                iconSize: L.point(17, 17),
                popupAnchor: [0, -15],
            }),
        }).bindPopup("Your are here :)");
    },
    removeLocate: function () {
        this._map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                const { icon } = layer.options;
                if (icon?.options.className === "located-animation") {
                    map.removeLayer(layer);
                }
            }
            if (layer instanceof L.Circle) {
                if (layer.options.className === "circle-test") {
                    map.removeLayer(layer);
                }
            }
        });
    },
});

// adding new button to map control
map.addControl(new customControl());

*/

