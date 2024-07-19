import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

@Component({
  selector: 'app-clicked-point-layer',
  templateUrl: './clicked-point-layer.component.html',
  standalone: true,
})
export class ClickedPointLayerComponent implements OnInit, AfterViewInit {
  private _map!: Map;
  clickedPointLayer!: VectorLayer<any>;
  markedPoint!: Feature<Point> | null;

  @Input() set map(map: Map) {
    this._map = map;
    if (this.clickedPointLayer) {
      this._map.addLayer(this.clickedPointLayer);
    }
  }

  ngOnInit() {
    this.clickedPointLayer = new VectorLayer({
      source: new VectorSource(),
    });
  }

  ngAfterViewInit() {
    if (this._map) {
      this._map.addLayer(this.clickedPointLayer);
    }
  }

  createClickedPointStyle() {
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 1)',
        }),
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 0.8)',
          width: 2,
        }),
      }),
    });
  }

  markClickedLocation(coordinates: [number, number]) {
    if (this.markedPoint) {
      this.clickedPointLayer.getSource()?.removeFeature(this.markedPoint);
    }

    this.markedPoint = new Feature<Point>({
      geometry: new Point(coordinates),
    });

    this.markedPoint.setStyle(this.createClickedPointStyle());
    this.clickedPointLayer.getSource()?.addFeature(this.markedPoint);
  }
}
