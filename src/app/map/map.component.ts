import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import Overlay from 'ol/Overlay';
import { GeocodingService } from '../geocoding.service';

interface Objective {
  name: string;
  coordinates: [number, number];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeocodingService],
})
export class MapComponent implements OnInit {
  map!: Map;
  objectives: Objective[] = [];
  lastFeature: Feature | null = null;

  constructor(
    private http: HttpClient,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit() {
    this.loadObjectives();
  }

  loadObjectives() {
    this.http
      .get<Objective[]>('objectives.json')
      .pipe(tap((objectives) => (this.objectives = objectives)))
      .subscribe(() => this.initializeMap());
  }

  initializeMap() {
    const vectorSource = new VectorSource({
      features: this.objectives.map((obj) => {
        const [latitude, longitude] = obj.coordinates;
        console.log('Original coordinates:', { latitude, longitude });
        const transformedCoordinates = fromLonLat([longitude, latitude]);
        console.log('Transformed coordinates:', transformedCoordinates);
        const feature = new Feature({
          geometry: new Point(transformedCoordinates),
          name: obj.name,
          originalCoordinates: [latitude, longitude], // Store original coordinates
        });
        feature.setStyle(this.createMarkerStyle());
        return feature;
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    this.initializeOverlay();
  }

  createMarkerStyle() {
    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'map-marker.png',
        scale: 0.05,
      }),
    });
  }

  initializeOverlay() {
    const container = document.getElementById('popup')!;
    const content = document.getElementById('popup-content')!;
    const overlay = new Overlay({
      element: container,
      autoPan: false,
    });
    this.map.addOverlay(overlay);

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat as Feature
      );

      if (feature !== this.lastFeature) {
        this.lastFeature = feature || null;

        if (feature) {
          const geometry = feature.getGeometry();
          if (geometry instanceof Point) {
            const coordinates = geometry.getCoordinates();
            overlay.setPosition(coordinates);
            const [longitude, latitude] = toLonLat(coordinates); // Convert back to latitude and longitude
            console.log('Coordinates for geocoding:', { latitude, longitude });
            const name = feature.get('name');
            this.geocodingService.reverseGeocode(latitude, longitude).subscribe(
              (location) => {
                console.log(`Geocoded location for ${name}: ${location}`);
                content.innerHTML = `<b>${name}</b><br>${location}`;
                container.style.display = 'block';
              },
              (error) => {
                console.error(`Geocoding error for ${name}:`, error);
                content.innerHTML = `<b>${name}</b><br>Unknown location`;
                container.style.display = 'block';
              }
            );
          }
        } else {
          container.style.display = 'none';
        }
      }
    });
  }
}
