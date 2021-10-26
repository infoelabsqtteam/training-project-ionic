/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SignupeComponent } from './signupe.component';

describe('SignupeComponent', () => {
  let component: SignupeComponent;
  let fixture: ComponentFixture<SignupeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
