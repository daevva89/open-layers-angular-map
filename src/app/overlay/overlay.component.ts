import { Component, Input, OnInit } from '@angular/core';
import Overlay from 'ol/Overlay';
import { Map } from 'ol';
import { GeocodingService } from '../geocoding.service';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { toLonLat } from 'ol/proj';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  standalone: true,
})
export class OverlayComponent implements OnInit {
  @Input() map!: Map;
  @Input() geocodingService!: GeocodingService;

  private container!: HTMLElement;
  private content!: HTMLElement;
  private overlay!: Overlay;
  private lastFeature: Feature | null = null;

  ngOnInit(): void {
    this.container = document.getElementById('popup')!;
    this.content = document.getElementById('popup-content')!;
    this.overlay = new Overlay({
      element: this.container,
      autoPan: false,
    });

    if (this.map) {
      this.map.addOverlay(this.overlay);
      this.initializeOverlay();
    }
  }

  setMap(map: Map): void {
    this.map = map;
    this.map.addOverlay(this.overlay);
    this.initializeOverlay();
  }

  showOverlay(feature: any) {
    const geometry = feature.getGeometry();
    if (geometry instanceof Point) {
      const coordinates = geometry.getCoordinates();
      this.overlay.setPosition(coordinates);
      const [longitude, latitude] = toLonLat(coordinates);
      const name = feature.get('name');
      this.geocodingService.reverseGeocode(latitude, longitude).subscribe(
        (location) => {
          this.content.innerHTML = `<b>${name}</b><br>${location}`;
          this.container.style.display = 'block';
        },
        (error) => {
          this.content.innerHTML = `<b>${name}</b><br>Unknown location`;
          this.container.style.display = 'block';
        }
      );
    }
  }

  hideOverlay() {
    this.container.style.display = 'none';
  }

  setGeocodingService(geocodingService: GeocodingService): void {
    this.geocodingService = geocodingService;
  }

  initializeOverlay() {
    if (!this.map) {
      throw new Error('Map reference is missing');
    }

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat as Feature
      );

      if (feature !== this.lastFeature) {
        this.lastFeature = feature || null;

        if (feature) {
          this.showOverlay(feature);
        } else {
          this.hideOverlay();
        }
      }
    });
  }
}
