import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadCallsPage } from './lead-calls.page';

describe('LeadCallsPage', () => {
  let component: LeadCallsPage;
  let fixture: ComponentFixture<LeadCallsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadCallsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadCallsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
