import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadWhatsappPage } from './lead-whatsapp.page';

describe('LeadWhatsappPage', () => {
  let component: LeadWhatsappPage;
  let fixture: ComponentFixture<LeadWhatsappPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadWhatsappPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadWhatsappPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
