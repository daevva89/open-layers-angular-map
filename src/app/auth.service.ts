import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private credentialsUrl = 'credentials.json';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .get<
        { name: string; username: string; email: string; password: string }[]
      >(this.credentialsUrl)
      .pipe(
        tap((credentials) => console.log('Loaded credentials:', credentials)),
        map((credentials) => {
          const user = credentials.find(
            (cred) => cred.username === username && cred.password === password
          );
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          return !!user;
        }),
        catchError((error) => {
          console.error('Error loading credentials:', error);
          return of(false);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
