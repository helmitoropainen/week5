import "./styles.css";
import L from "leaflet";

let positives;
let negatives;

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();

  const urlPos =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const resPos = await fetch(urlPos);
  const dataPos = await resPos.json();

  const urlNeg =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const resNeg = await fetch(urlNeg);
  const dataNeg = await resNeg.json();

  positives = dataPos.dataset;
  negatives = dataNeg.dataset;

  makeMap(data);
};

const makeMap = (data) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJson = L.geoJSON(data, {
    style: getStyle,
    onEachFeature: getFeature
  }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getStyle = (feature) => {
  if (!feature.properties.kunta)
    return {
      weight: 2
    };
  const id = feature.properties.kunta;
  const kuntaid = "KU" + id;
  const listaindex = positives.dimension.Tuloalue.category.index[kuntaid];
  const pos = positives.value[listaindex];
  const neg = negatives.value[listaindex];
  const hue = (pos / neg) ** 3 * 60;
  if (hue > 120)
    return {
      weight: 2
    };
  return {
    weight: 2,
    color: `hsl(${hue}, 75%, 50%)`
  };
};

const getFeature = (feature, layer, index) => {
  if (!feature.properties.kunta) return;
  const id = feature.properties.kunta;
  const kuntaid = "KU" + id;
  const listaindex = positives.dimension.Tuloalue.category.index[kuntaid];
  layer.bindPopup(
    `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Positive migration: ${positives.value[listaindex]}</li>
        <li>Negative migration: ${negatives.value[listaindex]}</li>
    </ul>`
  );

  layer.bindTooltip(feature.properties.name);
};

fetchData();
