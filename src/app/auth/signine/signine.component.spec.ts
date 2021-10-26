/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SignineComponent } from './signine.component';

describe('SignineComponent', () => {
  let component: SignineComponent;
  let fixture: ComponentFixture<SignineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
