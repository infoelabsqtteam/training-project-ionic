import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuotationAmountComponent } from './quotation-amount.component';

describe('QuotationAmountComponent', () => {
  let component: QuotationAmountComponent;
  let fixture: ComponentFixture<QuotationAmountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationAmountComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuotationAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
