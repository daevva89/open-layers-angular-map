import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ObjectiveService } from './objective.service';

describe('ObjectiveService', () => {
  let service: ObjectiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ObjectiveService],
    });
    service = TestBed.inject(ObjectiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
