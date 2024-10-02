import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';
import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [{ provide: ChatApiService, useClass: MockChatApiService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have defined modal template', () => {
    expect(component.groupModal).toBeDefined();
    expect(component.groupModal).toBeInstanceOf(TemplateRef);
  });

  it('should start with empty user', () => {
    expect(component.user).toEqual(null);
    expect(component.userID).toEqual(-1);
    expect(component.groups).toBeInstanceOf(Observable);
  });

  it('should start with no modal target', () => {
    expect(component.targetID).toEqual(-1);
  });

  it('should start with empty form defaults', () => {
    expect(component.groupName).toEqual("");
    expect(component.channelName).toEqual("");
    expect(component.newGroupName).toEqual("");
    expect(component.joinCode).toEqual("");
  });

  it('should return TRUE when isMe() argument equals userID', () => {
    expect(component.isMe(-1)).toBeTruthy();
  });

  it('should return FALSE on hasAdminRole()', () => {
    expect(component.hasAdminRole()).toBeFalsy();
  });

  it('should return 0 on getHighestRole()', () => {
    expect(component.getHighestRole(component.targetID)).toEqual(0);
  });

  it('should return correct \'Join Code\' for each ID', () => {
    expect(component.convertGroupIdToCode(32768)).toEqual("PA8");
    expect(component.convertGroupIdToCode(0)).toEqual("0");
    expect(component.convertGroupIdToCode(9999999999999999999)).toEqual("23Z405FZ79TDS");
  });
});
