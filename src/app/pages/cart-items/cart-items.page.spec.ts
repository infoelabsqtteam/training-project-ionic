import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CartItemsPage } from './cart-items.page';

describe('CartItemsPage', () => {
  let component: CartItemsPage;
  let fixture: ComponentFixture<CartItemsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartItemsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
