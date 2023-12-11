import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Map } from 'ol';
import View from 'ol/View';
import { Coordinate } from 'ol/coordinate';
import { Projection, ProjectionLike, fromLonLat, transform } from 'ol/proj';
import defaultLayers from './ol-map.layer-config';
import { Extent } from 'ol/extent';
import Feature, { FeatureLike } from 'ol/Feature';
import { Types } from 'ol/MapBrowserEventType';
import Overlay, { Options as OverlayOptions } from 'ol/Overlay';
import { Geometry, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { Options as VectorLayerOptions } from 'ol/layer/BaseVector';
import VectorSource from 'ol/source/Vector';
import BaseLayer from 'ol/layer/Base';
import { LayerDefaultKeys } from './ol-map.interfaces';
// Image layers
import { WebGLTile } from 'ol/layer';
import { GeoTIFF } from 'ol/source';
import { Options as GeoTIFFOptions } from 'ol/source/GeoTIFF';
import { Options as WebGLTileOptions } from 'ol/layer/WebGLTile';


@Component({
  selector: 'ol-map',
  templateUrl: './ol-map.component.html',
  styleUrl: './ol-map.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class OlMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  private target?: HTMLElement;
  private olMap!: Map;
  @Input() loadDefaulLayers = true;
  // View options
  @Input() projection: Projection; //Web markator
  @Input() projectionSource: Projection;
  @Input() zoom: number = 8;
  @Input() centerCoordinate: Coordinate = [-7.866111, 42.755];

  constructor() {
    this.projection = new Projection({
      code: 'EPSG:3857',
      units: 'm',
      extent: [-20037508.34, -20048966.1, 20037508.34, 20048966.1],
      worldExtent: [-180.0, -85.06, 180.0, 85.06],
      global: true,
    });
    this.projectionSource = new Projection({
      code: 'EPSG:4326',
      units: 'degrees',
    });
  }

  private defineMapTargetElement() {
    this.target = document.getElementById('ol-map') || undefined;
    if (this.target) {
      const style = this.target.style;
      style.position = 'relative';
      style.height = '100%';
      style.width = '100%';
    } else {
      console.error('Invalid target map element');
    }
  }

  private createOlMap() {
    this.olMap = new Map({
      target: this.target,
      view: new View({
        projection: this.projection.getCode(),
        zoom: this.zoom,
        center: fromLonLat(this.centerCoordinate, this.projection),
      }),
    });
  }

  private addDefaultLayers() {
    if (this.loadDefaulLayers) {
      for (const layer of defaultLayers) {
        this.olMap.addLayer(layer);
      }
    }
  }

  getTransformCoordinate(
    coordinate: Coordinate,
    sourceProjection: ProjectionLike,
    destinationProjection: ProjectionLike
  ): Coordinate {
    return transform(coordinate, sourceProjection, destinationProjection);
  }

  transformCenterCoordinate(destinationProjection: ProjectionLike) {
    this.centerCoordinate = this.getTransformCoordinate(
      this.centerCoordinate,
      this.projection,
      destinationProjection
    );
  }

  // Methods
  addOverlay(options: OverlayOptions) {
    this.olMap.addOverlay(new Overlay(options));
  }

  getView() {
    return this.olMap.getView();
  }

  // Utils geometry
  getCenterCoordFromExtent(extent: Extent): Coordinate {
    return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
  }

  /**
   *
   * @param coordinate
   * @param distanceBetweenCorners
   * @returns
   */
  createScuareFromPoint(
    coordinate: Coordinate,
    distanceBetweenCorners: number
  ) {
    return new Polygon([
      [
        [
          coordinate[0] - distanceBetweenCorners,
          coordinate[1] + distanceBetweenCorners,
        ],
        [
          coordinate[0] + distanceBetweenCorners,
          coordinate[1] + distanceBetweenCorners,
        ],
        [
          coordinate[0] + distanceBetweenCorners,
          coordinate[1] - distanceBetweenCorners,
        ],
        [
          coordinate[0] - distanceBetweenCorners,
          coordinate[1] - distanceBetweenCorners,
        ],
      ],
    ]);
  }

  // Utils Events
  onEventGetFeaturesAtPixel(
    eventType: Types,
    featureKey: string,
    callbackOnFeature: (feature: FeatureLike) => void,
    callbackOnEventPixel?: Function
  ) {
    this.olMap.on(eventType, (event) => {
      if(callbackOnEventPixel) callbackOnEventPixel();
      this.olMap.forEachFeatureAtPixel(event.pixel, (featureLike) => {
        if (featureLike.getProperties().hasOwnProperty(featureKey)) {
          callbackOnFeature(featureLike);
        }
      });
    });
  }

  // Utils Layers
  createVectorLayer(
    features: Feature<Geometry>[],
    layerOptions: (VectorLayerOptions<VectorSource<Feature<Geometry>>> | undefined) & LayerDefaultKeys,
  ) {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
      ...layerOptions,
    });
    return vectorLayer;
  }

  createGeotiffWebGLTile(name: string, type: string, webGLTileOptions: WebGLTileOptions & LayerDefaultKeys, geoTiffOptions: GeoTIFFOptions) {
    return new WebGLTile({
      ...webGLTileOptions,
      source: new GeoTIFF(geoTiffOptions)
    })

  }

  addLayer(layer: BaseLayer) {
    this.olMap.addLayer(layer);
  }

  findLayer(name: string) {
    return this.olMap
      .getLayers()
      .getArray()
      .find((layer) => layer.get('name') === name);
  }

  // Angular envents

  ngAfterViewInit(): void {
    this.defineMapTargetElement();
    this.createOlMap();
    this.addDefaultLayers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.olMap) {
      if (changes.hasOwnProperty('loadDefaulLayers')) {
        let loadDefaulLayers = changes['loadDefaulLayers'].currentValue;
        this.loadDefaulLayers = loadDefaulLayers;
      }
      if (changes.hasOwnProperty('zoom')) {
        let zoom = changes['zoom'].currentValue;
        this.zoom = zoom;
        this.olMap.getView().animate({
          zoom: this.zoom,
          duration: 1500,
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.olMap.dispose();
  }
}
