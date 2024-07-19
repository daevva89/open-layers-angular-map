import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

@Component({
  selector: 'app-country-borders-layer',
  templateUrl: './country-borders-layer.component.html',
  standalone: true,
})
export class CountryBordersLayerComponent implements OnInit, AfterViewInit {
  private _map!: Map;
  countryLayer!: VectorLayer<any>;

  @Input() set map(map: Map) {
    this._map = map;
    if (this.countryLayer) {
      this._map.addLayer(this.countryLayer);
      this.loadCountryBorders(); // Ensure this is called after the map is set
    }
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.countryLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0)', // Transparent border
          width: 0,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)', // No fill color
        }),
      }),
    });
  }

  ngAfterViewInit() {
    if (this._map) {
      this._map.addLayer(this.countryLayer);
    }
  }

  loadCountryBorders() {
    const geojsonUrl = '/countries.geojson'; // URL for public folder
    console.log('Loading GeoJSON from:', geojsonUrl);
    this.http.get(geojsonUrl).subscribe(
      (data: any) => {
        console.log('GeoJSON data:', data); // Debugging line
        const features = new GeoJSON().readFeatures(data, {
          featureProjection: 'EPSG:3857',
        });
        console.log('Loaded features:', features); // Debugging line
        this.countryLayer.getSource()?.addFeatures(features);
        console.log(
          'Features in source after adding:',
          this.countryLayer.getSource()?.getFeatures().length
        ); // Debugging line

        // Log coordinates of all features
        this.countryLayer
          .getSource()
          ?.getFeatures()
          .forEach((feature: Feature<Geometry>) => {
            const geom = feature.getGeometry();
            if (geom) {
              console.log('Feature geometry:', geom);
            }
          });
      },
      (error) => {
        console.error('Error loading GeoJSON:', error);
      }
    );
  }

  highlightCountryBorders(coordinates: Coordinate) {
    const features = this.countryLayer.getSource()?.getFeatures() || [];
    console.log('Highlighting country borders at coordinates:', coordinates);
    console.log('Number of features:', features.length);

    let foundFeature = false;

    features.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry && geometry.intersectsCoordinate(coordinates)) {
        foundFeature = true;
        console.log('Highlighting feature:', feature);
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'rgba(255, 0, 0, 0.8)',
              width: 2,
            }),
            fill: new Fill({
              color: 'rgba(255, 0, 0, 0.2)',
            }),
          })
        );
      } else {
        feature.setStyle(null); // Remove style for non-highlighted features
      }
    });

    if (!foundFeature) {
      console.warn('No feature found for coordinates:', coordinates);
    }
  }
}
