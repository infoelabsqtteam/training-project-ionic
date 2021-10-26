import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewReminderComponent } from './new-reminder.component';

describe('NewReminderComponent', () => {
  let component: NewReminderComponent;
  let fixture: ComponentFixture<NewReminderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewReminderComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
