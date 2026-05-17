import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPaiementComponent } from './gestion-paiement.component';

describe('GestionPaiementComponent', () => {
  let component: GestionPaiementComponent;
  let fixture: ComponentFixture<GestionPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
