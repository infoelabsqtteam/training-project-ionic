import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeadTabsPage } from './lead-tabs.page';

describe('LeadTabsPage', () => {
  let component: LeadTabsPage;
  let fixture: ComponentFixture<LeadTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadTabsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
