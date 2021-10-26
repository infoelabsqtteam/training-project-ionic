import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadReminderPage } from './lead-reminder.page';

describe('LeadReminderPage', () => {
  let component: LeadReminderPage;
  let fixture: ComponentFixture<LeadReminderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadReminderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadReminderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
