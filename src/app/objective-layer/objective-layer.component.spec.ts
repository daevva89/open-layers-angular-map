import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveLayerComponent } from './objective-layer.component';

describe('ObjectiveLayerComponent', () => {
  let component: ObjectiveLayerComponent;
  let fixture: ComponentFixture<ObjectiveLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectiveLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectiveLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
