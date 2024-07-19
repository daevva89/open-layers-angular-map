import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryBordersLayerComponent } from './country-borders-layer.component';

describe('CountryBordersLayerComponent', () => {
  let component: CountryBordersLayerComponent;
  let fixture: ComponentFixture<CountryBordersLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryBordersLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryBordersLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
