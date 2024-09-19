import { Component, OnInit, Input, TemplateRef, ViewChild, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { RouterModule, RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';

import { GetUsernameByIDPipe } from '../pipes/get-username-by-id.pipe';
import { ChatApiService, User, Group, Channel, Message, ChannelUpdate } from '../chat-api.service';
import { RtcCallService, RTCStream } from '../rtc-call.service';

@Component({
  selector: 'app-call',
  standalone: true,
  imports: [CommonModule, FormsModule, GetUsernameByIDPipe],
  templateUrl: './call.component.html',
  styleUrl: './call.component.css'
})
export class CallComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', {static: false}) remoteVideos!: QueryList<ElementRef>;

  private serverID: string = "";
  private channelID: string = "";
  private callConnected: number = 0;

  public elapsedTime$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public chatTitle: string = "";
  public participantCount: number = 0;

  public remoteStreams: BehaviorSubject<RTCStream[]> = new BehaviorSubject<RTCStream[]>([]);

  terminateCall() {
    if (this.serverID && this.channelID) {
      this.rtcCallService.close();
      this.router.navigateByUrl(`/home/channel/${this.serverID}::${this.channelID}`)
    }
  }

  onCallConnected() {
    this.callConnected = Date.now();
    return;
  }

  convertTimeToString(seconds: number | null) {
    if (seconds === null) return;

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainder = seconds % 60;

    let hString = hours > 0 ? String(hours).padStart(2, '0') + ":" : '';
    let mString = String(minutes).padStart(2, '0');
    let sString = String(remainder).padStart(2, '0');

    return(`${hString}${mString}:${sString}`);
  }

  toggleVideo() {
    this.rtcCallService.toggleVideo();
    return;
  }

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localVideo.nativeElement.srcObject = stream;
        this.localVideo.nativeElement.play();

        this.rtcCallService.submitLocalStream(this.localVideo.nativeElement.srcObject)
          .subscribe((data: MediaStream | null) => {
            if (data instanceof MediaStream) {
              this.onCallConnected();
              this.rtcCallService.call();
            }
          })
      }).catch((err) => {
        console.error("Failed to access camera:", err);
      })
    
    this.rtcCallService.remoteStreams.subscribe((streams: RTCStream[]) => {
      this.remoteStreams.next(streams);
      this.participantCount = streams.length;
      this.cdr.detectChanges();
      
      let targets = Array.from(document.getElementsByClassName("remote-video"))
      .forEach((videoElement: any, index: number) => {
        let video = videoElement;
        if (this.remoteStreams.value[index]) {
          video.srcObject = this.remoteStreams.value[index].stream;
        }
      })
    });

    this.route.paramMap.subscribe((params) => {
      let path: string[] = params.get('path' as string)?.split("::") || [];
      if (path.length === 2) {
        this.serverID = path[0];
        this.channelID = path[1];

        this.chatTitle = this.chatApiService.getChatTitle(+this.serverID, +this.channelID);

        if (this.chatTitle === "") {
          this.router.navigateByUrl("/home");
        }
      }
    });

    this.rtcCallService.initPeer(
      this.chatApiService.getUser()?.id || -1,
      +this.serverID,
      +this.channelID
    );

    interval(1000).subscribe(() => {
      this.elapsedTime$.next(Math.floor((Date.now() - this.callConnected) / 1000));
    });
  }

  constructor (
    private router:Router,
    private route: ActivatedRoute,
    private chatApiService: ChatApiService,
    private rtcCallService: RtcCallService,
    private cdr: ChangeDetectorRef
  ) {}
}
