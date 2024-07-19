import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Stroke, Fill } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { HttpClient } from '@angular/common/http';
import { GeocodingService } from '../geocoding.service';
import { OverlayComponent } from '../overlay/overlay.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ObjectiveLayerComponent } from '../objective-layer/objective-layer.component';
import { ClickedPointLayerComponent } from '../clicked-point-layer/clicked-point-layer.component';
import { CountryBordersLayerComponent } from '../country-borders-layer/country-borders-layer.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [
    OverlayComponent,
    ObjectiveLayerComponent,
    ClickedPointLayerComponent,
    CountryBordersLayerComponent,
  ],
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild(OverlayComponent) overlayComponent!: OverlayComponent;
  @ViewChild(ObjectiveLayerComponent)
  objectiveLayerComponent!: ObjectiveLayerComponent;
  @ViewChild(ClickedPointLayerComponent)
  clickedPointLayerComponent!: ClickedPointLayerComponent;
  @ViewChild(CountryBordersLayerComponent)
  countryBordersLayerComponent!: CountryBordersLayerComponent;

  map!: Map;
  regionLayer!: VectorLayer<any>;
  markedPoint!: Feature<Point> | null;

  private pointerMoveSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private geocodingService: GeocodingService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializeMap();
    this.objectiveLayerComponent.map = this.map; // Set map after view initialization
    this.clickedPointLayerComponent.map = this.map; // Set map after view initialization
    this.countryBordersLayerComponent.map = this.map; // Set map after view initialization

    this.pointerMoveSubject.pipe(debounceTime(300)).subscribe((event) => {
      this.handlePointerMove(event);
    });

    // Add right-click event listener
    this.map.getViewport().addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.revertActions();
    });
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

    this.map.addLayer(this.regionLayer);

    this.overlayComponent.setMap(this.map);
    this.overlayComponent.setGeocodingService(this.geocodingService);

    this.map.on('click', (event) => this.handleMapClick(event));
    this.map.on('pointermove', (event) => {
      this.pointerMoveSubject.next(event);
    });
  }

  handleMapClick(event: any) {
    const coordinates = event.coordinate;
    const [longitude, latitude] = toLonLat(coordinates);

    this.geocodingService.reverseGeocode(latitude, longitude).subscribe(
      (location) => {
        if (this.objectiveLayerComponent) {
          this.objectiveLayerComponent.highlightRegionAndObjectives(
            location,
            latitude,
            longitude,
            coordinates // Pass clicked coordinates to ObjectiveLayerComponent
          );
        } else {
          console.error('ObjectiveLayerComponent is not available');
        }
        if (this.clickedPointLayerComponent) {
          this.clickedPointLayerComponent.markClickedLocation(coordinates);
        } else {
          console.error('ClickedPointLayerComponent is not available');
        }
        if (this.countryBordersLayerComponent) {
          this.countryBordersLayerComponent.highlightCountryBorders(
            coordinates
          );
        } else {
          console.error('CountryBordersLayerComponent is not available');
        }
      },
      (error) => {
        console.error('Geocoding error:', error);
      }
    );
  }

  handlePointerMove(event: any) {
    const features = this.map.getFeaturesAtPixel(event.pixel);
    const hoveredFeature = features && features.length > 0 ? features[0] : null;

    this.ngZone.run(() => {
      if (hoveredFeature && hoveredFeature !== this.markedPoint) {
        this.overlayComponent.showOverlay(hoveredFeature);
      } else {
        this.overlayComponent.hideOverlay();
      }
    });
  }

  revertActions() {
    // Clear distance metadata from overlay
    this.overlayComponent.hideOverlay();

    // Remove highlighted objectives and return to normal marker
    if (this.objectiveLayerComponent) {
      const defaultStyle =
        this.objectiveLayerComponent.createMarkerStyle('map-marker.png');
      const features = this.objectiveLayerComponent.objectiveLayer
        .getSource()
        ?.getFeatures();
      if (features) {
        features.forEach((feature) => {
          feature.setStyle(defaultStyle);
          feature.set('distance', null); // Clear distance metadata
          feature.set('clickedPointDistance', null); // Clear clickedPointDistance metadata
        });
      }
    }

    // Remove the marked point
    if (this.clickedPointLayerComponent) {
      if (this.clickedPointLayerComponent.markedPoint) {
        this.clickedPointLayerComponent.clickedPointLayer
          .getSource()
          ?.removeFeature(this.clickedPointLayerComponent.markedPoint);
        this.clickedPointLayerComponent.markedPoint = null;
      }
    }

    // Clear country borders highlight
    if (this.countryBordersLayerComponent) {
      const features = this.countryBordersLayerComponent.countryLayer
        .getSource()
        ?.getFeatures();
      if (features) {
        features.forEach((feature) => {
          feature.setStyle(
            new Style({
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0)', // Transparent border
                width: 0,
              }),
              fill: new Fill({
                color: 'rgba(0, 0, 0, 0)', // No fill color
              }),
            })
          );
        });
      }
    }
  }
}
