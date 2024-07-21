import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayComponent } from './overlay.component';
import { GeocodingService } from '../geocoding.service';
import { of, throwError } from 'rxjs';
import { Map, View } from 'ol';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

describe('OverlayComponent', () => {
  let component: OverlayComponent;
  let fixture: ComponentFixture<OverlayComponent>;
  let geocodingService: jasmine.SpyObj<GeocodingService>;
  let map: Map;

  beforeEach(async () => {
    const geocodingServiceSpy = jasmine.createSpyObj('GeocodingService', [
      'reverseGeocode',
    ]);

    await TestBed.configureTestingModule({
      imports: [OverlayComponent],
      providers: [{ provide: GeocodingService, useValue: geocodingServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayComponent);
    component = fixture.componentInstance;
    geocodingService = TestBed.inject(
      GeocodingService
    ) as jasmine.SpyObj<GeocodingService>;

    // Create and attach the container and content elements
    const container = document.createElement('div');
    container.id = 'popup';
    const content = document.createElement('div');
    content.id = 'popup-content';
    container.appendChild(content);
    document.body.appendChild(container);

    // Assign the container and content to the component
    component['container'] = container;
    component['content'] = content;

    // Create a simple OpenLayers map for testing
    map = new Map({
      target: document.createElement('div'),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    component.map = map;
    component.geocodingService = geocodingService;

    // Trigger ngOnInit lifecycle hook
    component.ngOnInit();

    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up DOM elements if they still exist
    const container = document.getElementById('popup');
    if (container) {
      container.parentNode?.removeChild(container);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize overlay', () => {
    spyOn(component, 'initializeOverlay').and.callThrough();
    component.ngOnInit();
    expect(component.initializeOverlay).toHaveBeenCalled();
  });

  it('should show overlay with location and distance', () => {
    const feature = new Feature({
      geometry: new Point([0, 0]),
      name: 'Test Location',
      type: 'objective',
      clickedPointDistance: 10,
    });
    geocodingService.reverseGeocode.and.returnValue(of('Test Country'));

    component.showOverlay(feature);

    expect(geocodingService.reverseGeocode).toHaveBeenCalledWith(0, 0);
    expect(component['content'].innerHTML).toContain('Test Location');
    expect(component['content'].innerHTML).toContain('Test Country');
    expect(component['content'].innerHTML).toContain('10.00 km');
  });

  it('should hide overlay', () => {
    component.hideOverlay();
    expect(component['container'].style.display).toBe('none');
  });

  it('should handle geocoding error and show unknown location', () => {
    const feature = new Feature({
      geometry: new Point([0, 0]),
      name: 'Test Location',
      type: 'objective',
      clickedPointDistance: 10,
    });
    geocodingService.reverseGeocode.and.returnValue(
      throwError('Geocoding error')
    );

    component.showOverlay(feature);

    expect(geocodingService.reverseGeocode).toHaveBeenCalledWith(0, 0);
    expect(component['content'].innerHTML).toContain('Test Location');
    expect(component['content'].innerHTML).toContain('Unknown location');
    expect(component['content'].innerHTML).toContain('10.00 km');
  });
});
