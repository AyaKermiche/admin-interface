import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningMoniteurComponent } from './planning-moniteur.component';

describe('PlanningMoniteurComponent', () => {
  let component: PlanningMoniteurComponent;
  let fixture: ComponentFixture<PlanningMoniteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningMoniteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningMoniteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
