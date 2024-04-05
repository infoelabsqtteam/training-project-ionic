import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileViewsModalComponent } from './file-views-modal.component';

describe('FileViewsModalComponent', () => {
  let component: FileViewsModalComponent;
  let fixture: ComponentFixture<FileViewsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileViewsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
