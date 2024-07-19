import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retryWhen, delay, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  reverseGeocode(latitude: number, longitude: number): Observable<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        const country = response.address?.country || 'Unknown country';
        return country;
      }),
      catchError((error) => {
        console.error('Geocoding error', error);
        return of('Unknown country');
      }),
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, i) => {
            if (i < 2 && error.status === 429) {
              // Retry up to 2 times with a delay of 1 second
              return of(error).pipe(delay(1000));
            }
            return throwError(error);
          })
        )
      )
    );
  }
}
