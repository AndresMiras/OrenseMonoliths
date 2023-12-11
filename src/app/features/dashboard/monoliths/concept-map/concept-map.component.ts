import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { monolithId$, monolithFeatures } from '../monoliths.config';
import { OlMapComponent } from '../../../../shared/components/ol-map/ol-map.component';
import { Coordinate } from 'ol/coordinate';
import { Geometry, Point, Polygon } from 'ol/geom';
import Style, { StyleLike } from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';

@Component({
  selector: 'app-concept-map',
  templateUrl: './concept-map.component.html',
  styleUrl: './concept-map.component.scss',
})
export class ConceptMapComponent implements AfterViewInit {
  @ViewChild(OlMapComponent) olMapComponent!: OlMapComponent;
  selectedRock?: number;
  centerMapCoord: Coordinate = [0, 0];
  groupFeatureKey = 'groupKeyMonolith';
  selectedFeatureId?: number;
  selectedFeatureClickId?: number;
  layerVectorMonolithName = 'Monolitos';
  layerVectorType = 'Capas Vectoriales';

  constructor(private router: Router) {}

  getLayerStyleMonolith(): StyleLike {
    return (feature) => {
      let fillColor = 'rgb(250, 200, 85, 0.20)';
      if (this.selectedFeatureId === feature.getId()) {
        fillColor = 'rgb(250, 200, 85, 0.65)';
        document.documentElement.style.cursor = 'pointer';
      }

      const polygonStyle = new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: 'rgb(33, 33, 33, 0.35)', width: 0.5 }),
      });

      const polygonStyleClicked = new Style({
        fill: new Fill({ color: 'rgb(219, 250, 135, 0.65)' }),
        stroke: new Stroke({ color: 'rgb(33, 33, 33, 0.5)', width: 0.75 }),
      });

      return feature.getId() === this.selectedFeatureClickId ? polygonStyleClicked : polygonStyle;
    };
  }

  rebuildMonolithFeatures() {
    for (let i = 0; i < monolithFeatures.length; i++) {
      const geom = monolithFeatures[i].getGeometry() as Point;
      const properties = monolithFeatures[i].getProperties();
      // Change projection of points to metters in Web markator
      const coordWebMarkator = this.olMapComponent.getTransformCoordinate(
        geom.getCoordinates(),
        this.olMapComponent.projectionSource,
        this.olMapComponent.projection
      );
      monolithFeatures[i].setProperties({
        ...properties,
        [this.groupFeatureKey]: 'monolith',
      });
      // Rebuild using square geometry
      monolithFeatures[i].setGeometry(
        this.olMapComponent.createScuareFromPoint(coordWebMarkator, 2.5)
      );
    }
  }

  loadLayerMonolith() {
    this.rebuildMonolithFeatures();
    // Create map layer
    const monolithVectorLayer = this.olMapComponent.createVectorLayer(
      monolithFeatures,
      {
        name: this.layerVectorMonolithName,
        type: this.layerVectorType,
        style: this.getLayerStyleMonolith(),
      }
    );
    const extent = monolithVectorLayer.getSource()?.getExtent();
    if (extent) {
      this.olMapComponent.getView().animate({
        center: this.olMapComponent.getCenterCoordFromExtent(extent),
        duration: 0,
        zoom: 19, // Maximum 19 min 2 aprox
      });
    }

    this.olMapComponent.addLayer(monolithVectorLayer);
  }

  loadMapEvents() {
    this.olMapComponent.onEventGetFeaturesAtPixel(
      'pointermove',
      this.groupFeatureKey,
      (feature) => {
        this.selectedFeatureId = feature.getId() as number;
        const layerMonolith = this.olMapComponent.findLayer(
          this.layerVectorMonolithName
          ) as VectorLayer<VectorSource<Feature<Polygon>>>;
          layerMonolith.setStyle(this.getLayerStyleMonolith());
        },
        () => {
          this.selectedFeatureId = undefined;
          const layerMonolith = this.olMapComponent.findLayer(
            this.layerVectorMonolithName
            ) as VectorLayer<VectorSource<Feature<Polygon>>>;
          layerMonolith.setStyle(this.getLayerStyleMonolith());
          document.documentElement.style.cursor = 'auto';
        }
    );
    this.olMapComponent.onEventGetFeaturesAtPixel(
      'click',
      this.groupFeatureKey,
      (feature) => {
        this.selectedFeatureId = feature.getId() as number;
        this.selectedFeatureClickId = this.selectedFeatureId;
        const layerMonolith = this.olMapComponent.findLayer(this.layerVectorMonolithName) as VectorLayer<VectorSource<Feature<Polygon>>>;
        layerMonolith.setStyle(this.getLayerStyleMonolith());
        // Redirect to load children description.
        this.router.navigate(['dashboard/monoliths/description', this.selectedFeatureClickId]);
        monolithId$.next(this.selectedFeatureClickId);
      },
    );
  }

  ngAfterViewInit(): void {
    this.loadLayerMonolith();
    this.loadMapEvents();
  }
}
