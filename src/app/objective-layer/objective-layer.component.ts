import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { ObjectiveService, Objective } from '../objective.service';
import { GeocodingService } from '../geocoding.service';
import { getDistance } from 'ol/sphere';
import { catchError, forkJoin, of, tap } from 'rxjs';

@Component({
  selector: 'app-objective-layer',
  templateUrl: './objective-layer.component.html',
  standalone: true,
})
export class ObjectiveLayerComponent implements OnInit, AfterViewInit {
  private _map!: Map;
  @Input() set map(map: Map) {
    this._map = map;
    if (this.objectiveLayer) {
      this._map.addLayer(this.objectiveLayer);
    }
  }

  objectives: Objective[] = [];
  objectiveLayer!: VectorLayer<any>;

  constructor(
    private objectiveService: ObjectiveService,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit() {
    this.objectiveLayer = new VectorLayer({
      source: new VectorSource(),
    });
  }

  ngAfterViewInit() {
    if (this._map) {
      this._map.addLayer(this.objectiveLayer);
    }

    this.loadObjectives();
  }

  loadObjectives() {
    this.objectiveService
      .loadObjectives()
      .pipe(
        tap((objectives) => {
          this.objectives = objectives;
          this.addMarkers();
        })
      )
      .subscribe();
  }

  addMarkers() {
    const features = this.objectives.map((obj) => {
      const [latitude, longitude] = obj.coordinates;
      const transformedCoordinates = fromLonLat([longitude, latitude]);
      const feature = new Feature<Point>({
        geometry: new Point(transformedCoordinates),
        name: obj.name,
        originalCoordinates: [latitude, longitude], // Store original coordinates
      });
      feature.set('type', 'objective'); // Add unique property
      feature.setStyle(this.createMarkerStyle('map-marker.png'));
      return feature;
    });

    this.objectiveLayer.getSource()?.addFeatures(features);
  }

  createMarkerStyle(iconSrc: string) {
    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: iconSrc,
        scale: 0.05,
      }),
    });
  }

  highlightRegionAndObjectives(
    location: string,
    latitude: number,
    longitude: number
  ) {
    const highlightedFeatures: Feature<Point>[] = [];
    const features = this.objectiveLayer.getSource()?.getFeatures() || [];

    const reverseGeocodeRequests = features.map((feature) => {
      const originalCoordinates = feature.get('originalCoordinates');
      if (originalCoordinates && originalCoordinates.length === 2) {
        return this.geocodingService
          .reverseGeocode(originalCoordinates[0], originalCoordinates[1])
          .pipe(
            tap((objectiveLocation) => {
              if (objectiveLocation === location) {
                const distance = getDistance(
                  [longitude, latitude],
                  originalCoordinates
                );
                feature.set('distance', distance);
                highlightedFeatures.push(feature);
              }
            }),
            catchError((error) => {
              console.error('Geocoding error for objective:', error);
              return of(null);
            })
          );
      }
      return of(null);
    });

    forkJoin(reverseGeocodeRequests).subscribe(() => {
      this.updateObjectiveStyles(highlightedFeatures);
    });
  }

  updateObjectiveStyles(highlightedFeatures: Feature<Point>[]) {
    const defaultStyle = this.createMarkerStyle('map-marker.png');
    const highlightedStyle = this.createMarkerStyle('map-marker-red.png');

    const features = this.objectiveLayer.getSource()?.getFeatures() || [];
    features.forEach((feature) => {
      if (highlightedFeatures.includes(feature as Feature<Point>)) {
        feature.setStyle(highlightedStyle);
        console.log('Highlighted Feature:', feature);
      } else {
        feature.setStyle(defaultStyle);
      }
    });
  }
}
