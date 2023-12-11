import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';

// Exporting default layers

const pnoa = new TileLayer({
  source: new XYZ({
    url: 'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg',
    attributions: 'CC BY 4.0 scne.es',
    crossOrigin: 'anonymous',
  }),
  zIndex: -1,
});

const osm = new TileLayer({
  source: new OSM(),
});

export default [pnoa];
