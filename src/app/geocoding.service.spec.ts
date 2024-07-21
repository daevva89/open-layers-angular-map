import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeocodingService],
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return country name from reverse geocode', (done) => {
    const mockResponse = { address: { country: 'Test Country' } };
    service.reverseGeocode(1, 1).subscribe((country) => {
      expect(country).toEqual('Test Country');
      done();
    });

    const req = httpMock.expectOne(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=1&lon=1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle errors and return "Unknown country"', (done) => {
    service.reverseGeocode(1, 1).subscribe((country) => {
      expect(country).toEqual('Unknown country');
      done();
    });

    const req = httpMock.expectOne(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=1&lon=1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });
});
