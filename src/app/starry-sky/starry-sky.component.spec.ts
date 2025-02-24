import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarrySkyComponent } from './starry-sky.component';

describe('StarrySkyComponent', () => {
  let component: StarrySkyComponent;
  let fixture: ComponentFixture<StarrySkyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StarrySkyComponent]
    });
    fixture = TestBed.createComponent(StarrySkyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
