import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CallLogsComponent } from './call-logs.component';

describe('CallLogsComponent', () => {
  let component: CallLogsComponent;
  let fixture: ComponentFixture<CallLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallLogsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CallLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
