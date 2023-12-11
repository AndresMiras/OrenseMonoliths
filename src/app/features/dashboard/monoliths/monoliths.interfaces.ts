import { Feature } from "ol";
import { Geometry } from "ol/geom";

export interface IMonolith {
  author: string;
  name: string;
  n: number;
  technique:string;
  dimension: number[];
  units: string;
  vulnerability: string;
  material: string;
  rockPrintType: string;
  modelType: 'png' | 'glb';
  images?: string[];
}

export class MonolithFeature extends Feature {
[x: string]: any;
  constructor(geom: Geometry,properties: IMonolith, id:number) {
    super();
    this.setGeometry(geom);
    this.setProperties(properties);
    this.setId(id);
  }
}



