import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectiveLayerComponent } from './objective-layer.component';
import { ObjectiveService, Objective } from '../objective.service';
import { GeocodingService } from '../geocoding.service';
import { of, throwError } from 'rxjs';
import { Map, View } from 'ol';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

describe('ObjectiveLayerComponent', () => {
  let component: ObjectiveLayerComponent;
  let fixture: ComponentFixture<ObjectiveLayerComponent>;
  let objectiveService: jasmine.SpyObj<ObjectiveService>;
  let geocodingService: jasmine.SpyObj<GeocodingService>;
  let map: Map;

  beforeEach(async () => {
    const objectiveServiceSpy = jasmine.createSpyObj('ObjectiveService', [
      'loadObjectives',
    ]);
    const geocodingServiceSpy = jasmine.createSpyObj('GeocodingService', [
      'reverseGeocode',
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ObjectiveLayerComponent],
      providers: [
        { provide: ObjectiveService, useValue: objectiveServiceSpy },
        { provide: GeocodingService, useValue: geocodingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectiveLayerComponent);
    component = fixture.componentInstance;
    objectiveService = TestBed.inject(
      ObjectiveService
    ) as jasmine.SpyObj<ObjectiveService>;
    geocodingService = TestBed.inject(
      GeocodingService
    ) as jasmine.SpyObj<GeocodingService>;

    // Create a simple OpenLayers map for testing
    map = new Map({
      target: document.createElement('div'),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    component.map = map;

    // Mock the loadObjectives call before ngAfterViewInit runs
    const objectives: Objective[] = [
      { name: 'Objective 1', coordinates: [1, 2] },
      { name: 'Objective 2', coordinates: [3, 4] },
    ];
    objectiveService.loadObjectives.and.returnValue(of(objectives));

    fixture.detectChanges(); // ngAfterViewInit should be called here
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load objectives and add markers', () => {
    expect(component.objectives.length).toBe(2);
    expect(component.objectiveLayer.getSource()?.getFeatures().length).toBe(2);
  });

  it('should highlight region and objectives', (done) => {
    geocodingService.reverseGeocode.and.returnValue(of('Test Location'));

    component.highlightRegionAndObjectives('Test Location', 1, 2, [1, 2]);

    setTimeout(() => {
      const features =
        component.objectiveLayer.getSource()?.getFeatures() || [];
      console.log(
        'Number of reverseGeocode calls:',
        geocodingService.reverseGeocode.calls.count()
      );
      expect(geocodingService.reverseGeocode.calls.count()).toBe(
        features.length * 2
      ); // Adjusted expected count
      const highlightedFeatures = features.filter((feature) =>
        feature.get('distance')
      );
      expect(highlightedFeatures.length).toBe(features.length);
      done();
    }, 500); // Adjust timeout as necessary
  });

  it('should handle geocoding errors gracefully', (done) => {
    geocodingService.reverseGeocode.and.returnValue(
      throwError('Geocoding error')
    );

    component.highlightRegionAndObjectives('Test Location', 1, 2, [1, 2]);

    setTimeout(() => {
      const features =
        component.objectiveLayer.getSource()?.getFeatures() || [];
      console.log(
        'Number of reverseGeocode calls:',
        geocodingService.reverseGeocode.calls.count()
      );
      expect(geocodingService.reverseGeocode.calls.count()).toBe(
        features.length
      );
      const highlightedFeatures = features.filter((feature) =>
        feature.get('distance')
      );
      expect(highlightedFeatures.length).toBe(0);
      done();
    }, 500); // Adjust timeout as necessary
  });

  it('should handle geocoding errors in updateObjectiveDistances gracefully', (done) => {
    const features = component.objectiveLayer.getSource()?.getFeatures();
    if (features) {
      features.forEach((feature) => {
        feature.set('originalCoordinates', [1, 2]);
      });
    }
    geocodingService.reverseGeocode.and.returnValue(
      throwError('Geocoding error')
    );

    component.updateObjectiveDistances([1, 2], 'Test Location', features || []);

    setTimeout(() => {
      expect(geocodingService.reverseGeocode.calls.count()).toBe(
        features?.length || 0
      );
      features?.forEach((feature) => {
        expect(feature.get('clickedPointDistance')).toBeNull();
      });
      done();
    }, 500); // Adjust timeout as necessary
  });
});
