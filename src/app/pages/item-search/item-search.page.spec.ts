import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemSearchPage } from './item-search.page';

describe('ItemSearchPage', () => {
  let component: ItemSearchPage;
  let fixture: ComponentFixture<ItemSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSearchPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
