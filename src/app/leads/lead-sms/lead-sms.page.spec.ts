import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadSmsPage } from './lead-sms.page';

describe('LeadSmsPage', () => {
  let component: LeadSmsPage;
  let fixture: ComponentFixture<LeadSmsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadSmsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadSmsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
