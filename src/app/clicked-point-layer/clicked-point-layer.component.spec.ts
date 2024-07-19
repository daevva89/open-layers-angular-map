import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickedPointLayerComponent } from './clicked-point-layer.component';

describe('ClickedPointLayerComponent', () => {
  let component: ClickedPointLayerComponent;
  let fixture: ComponentFixture<ClickedPointLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickedPointLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClickedPointLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
