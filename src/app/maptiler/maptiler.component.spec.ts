import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaptilerComponent } from './maptiler.component';

describe('MaptilerComponent', () => {
  let component: MaptilerComponent;
  let fixture: ComponentFixture<MaptilerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaptilerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaptilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
