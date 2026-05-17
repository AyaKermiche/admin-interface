import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEmployeComponent } from './gestion-employe.component';

describe('GestionEmployeComponent', () => {
  let component: GestionEmployeComponent;
  let fixture: ComponentFixture<GestionEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
