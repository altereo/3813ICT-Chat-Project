import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ChatApiService } from './chat-api.service';
import { TemplateRef } from '@angular/core';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [ChatApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have the '3813ICT-Chat' title`, () => {
    expect(app.title).toEqual('3813ICT-Chat');
  });

  it(`should start Logged Out`, () => {
    expect(app.isLoggedIn).toEqual(false);
    expect(app.userID).toEqual(-1);
  });

  it('should have defined Edit Dialog', () => {
    const editDialog = app.getEditDialogRef();
    expect(editDialog).toBeDefined();
    expect(editDialog).toBeInstanceOf(TemplateRef);
  });
});
