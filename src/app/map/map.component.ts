import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { GeocodingService } from '../geocoding.service';
import { ObjectiveService, Objective } from '../objective.service';
import { OverlayComponent } from '../overlay/overlay.component';
import { getDistance } from 'ol/sphere';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [OverlayComponent],
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild(OverlayComponent) overlayComponent!: OverlayComponent;

  map!: Map;
  objectives: Objective[] = [];
  objectiveLayer!: VectorLayer<any>;
  regionLayer!: VectorLayer<any>;
  clickedPointLayer!: VectorLayer<any>; // Separate layer for clicked point
  markedPoint!: Feature<Point> | null;

  constructor(
    private http: HttpClient,
    private geocodingService: GeocodingService,
    private objectiveService: ObjectiveService
  ) {}

  ngOnInit() {
    this.loadObjectives();
  }

  ngAfterViewInit() {
    this.initializeMap();
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

  initializeMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    this.objectiveLayer = new VectorLayer({
      source: new VectorSource(),
    });

    this.regionLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 0.8)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)',
        }),
      }),
    });

    this.clickedPointLayer = new VectorLayer({
      source: new VectorSource(),
    });

    this.map.addLayer(this.objectiveLayer);
    this.map.addLayer(this.regionLayer);
    this.map.addLayer(this.clickedPointLayer);

    this.overlayComponent.setMap(this.map);
    this.overlayComponent.setGeocodingService(this.geocodingService);

    this.map.on('click', (event) => this.handleMapClick(event));
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

  handleMapClick(event: any) {
    const coordinates = event.coordinate;
    const [longitude, latitude] = toLonLat(coordinates);

    this.geocodingService.reverseGeocode(latitude, longitude).subscribe(
      (location) => {
        console.log('Clicked location:', location);
        this.highlightRegionAndObjectives(location, latitude, longitude);
        this.markClickedLocation(coordinates);
      },
      (error) => {
        console.error('Geocoding error:', error);
      }
    );
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
