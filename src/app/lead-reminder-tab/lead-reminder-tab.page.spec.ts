import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadReminderTabPage } from './lead-reminder-tab.page';

describe('LeadReminderTabPage', () => {
  let component: LeadReminderTabPage;
  let fixture: ComponentFixture<LeadReminderTabPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadReminderTabPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadReminderTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
