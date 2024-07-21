import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate with correct credentials', () => {
    const mockResponse = [
      {
        name: 'John Doe',
        username: 'johnny_boy',
        email: 'john_doe@yahoo.com',
        password: 'justMe32s2',
      },
    ];

    service.login('johnny_boy', 'justMe32s2').subscribe((isAuthenticated) => {
      expect(isAuthenticated).toBe(true);
    });

    const req = httpMock.expectOne('credentials.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should not authenticate with incorrect credentials', () => {
    const mockResponse = [
      {
        name: 'John Doe',
        username: 'johnny_boy',
        email: 'john_doe@yahoo.com',
        password: 'justMe32s2',
      },
    ];

    service
      .login('johnny_boy', 'wrongPassword')
      .subscribe((isAuthenticated) => {
        expect(isAuthenticated).toBe(false);
      });

    const req = httpMock.expectOne('credentials.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error response', () => {
    service.login('johnny_boy', 'justMe32s2').subscribe((isAuthenticated) => {
      expect(isAuthenticated).toBe(false);
    });

    const req = httpMock.expectOne('credentials.json');
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('Network error'));
  });

  it('should return true if the user is logged in', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ name: 'John Doe', username: 'johnny_boy' })
    );
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false if the user is not logged in', () => {
    localStorage.removeItem('user');
    expect(service.isLoggedIn()).toBe(false);
  });
});
