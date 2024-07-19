import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Objective {
  name: string;
  coordinates: [number, number];
}

@Injectable({
  providedIn: 'root',
})
export class ObjectiveService {
  constructor(private http: HttpClient) {}

  loadObjectives(): Observable<Objective[]> {
    return this.http.get<Objective[]>('objectives.json');
  }
}
