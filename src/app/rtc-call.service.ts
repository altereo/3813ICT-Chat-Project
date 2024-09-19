import { Injectable, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, interval } from 'rxjs';

import type { MediaConnection } from 'peerjs';
import Peer from 'peerjs';

import { ChatApiService } from './chat-api.service';

export type RTCUser = {
  user: number;
  peer: string;
}

export type RTCStream = {
  id: number;
  peer: string;
  stream: MediaStream;
}

export type CameraState = {
  video: boolean;
  audio: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RtcCallService implements OnInit {
  private readonly callUsers$: BehaviorSubject<RTCUser[]> = new BehaviorSubject<RTCUser[]>([]);
  private isDestroyed: boolean = false;
  private peer: Peer | null = null;
  private peerID: string = "";
  private userID: number = 0;
  private group: number = 0;
  private channel: number = 0;

  private localStream$: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
  private peerConnections$: BehaviorSubject<MediaConnection[]> = new BehaviorSubject<MediaConnection[]>([]);
  private peerStreams$: BehaviorSubject<RTCStream[]> = new BehaviorSubject<RTCStream[]>([]);

  private pendingCalls: MediaConnection[] = [];

  public cameraState: CameraState = {
    video: true,
    audio: true
  };

  public initPeer(userID: number, groupID: number, channelID: number): void {
    this.userID = userID;
    this.group = groupID;
    this.channel = channelID;

    if (!this.peer || this.peer.disconnected) {
      const options: any = {
        debug: 0,
        host: "localhost",
        port: 3000,
        path: "/peerserv",
        secure: false,
        config: {
          iceServers: [
            { urls: "stun:stun1.l.google.com:3478" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:3478" },
            { urls: "stun:stun4.l.google.com:19302" },
          ]
        },
      };

      try {
        this.peer = new Peer(options);

        this.peer.on('open', (id: string) => {
          this.peerID = id;
          console.debug("Connected to peer server with ID", this.peerID);

          this.chatApiService.associatePeer(id, userID, groupID, channelID).subscribe((data: any) => {
            if (data.status === "OK") {
              this.callUsers$.next(data.peers);
              if (data.peers.length == 1) {
                this.chatApiService.announceCall(+channelID, true);
              }
              return;
            }

            console.error("Peer association failed:", data.message);
            return;
          });
        });

        this.peer.on('disconnected', () => {
          console.debug("Connection with peer server closed.");
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.peer?.reconnect();
            }
          }, 1000)
        });

        this.peer.on('call', (connection: MediaConnection) => {
          if (this.localStream$.value instanceof MediaStream) {
            connection.answer(this.localStream$.value);

            connection.on('stream', (remoteStream: MediaStream) => {
              this.appendStream(remoteStream, connection.peer, connection.metadata.caller);
              return;
            });

            connection.on('close', () => {
              this.peerStreams$.next(this.peerStreams$.value.filter((stream: RTCStream) => {
                return(stream.peer !== connection.peer);
              }));
            });
          } else {
            this.pendingCalls.push(connection);
          }

          this.updateCallPeers();
          return;
        });

        return;
      } catch (err) {
        throw(err);
      }
    }

    return;
  }

  public close(): void {
    if (this.peer) {
      this.isDestroyed = true;
      try {
        if (this.peerStreams$.value.length === 0) {
          this.chatApiService.announceCall(+this.channel, false);
        }

        this.peer.disconnect();
        this.peer.destroy();

        if (this.localStream$.value instanceof MediaStream) {
          let tracks = this.localStream$.value?.getTracks();
          tracks.forEach(track => track.stop());
        }

        this.peerStreams$.next([]);
        this.peerConnections$.value.forEach((con: MediaConnection) => {
          con.close();
        });
        this.peerConnections$.next([]);
        this.callUsers$.next([]);

      } catch (err) {
        throw(err);
      }
    }
    return; 
  }

  private updateCallPeers(): void {
    this.chatApiService.getPeers(this.group, this.channel).subscribe((data: any) => {
      if (data.status === "OK") {
        this.callUsers$.next(data.peers);
        return;
      }
    });
  }

  public submitLocalStream(stream: MediaStream | null): Observable<MediaStream | null> {
    if (stream === null) throw("Stream not real error.");

    this.localStream$.next(stream);
    return(this.localStream$.asObservable());
  }

  public call() {
    this.callUsers$.value.forEach((user: RTCUser) => {
      this.callPeer(user.peer);
    })
  }

  private callPeer(id: string) {
    if (!this.peer || !this.localStream$.value) throw("Peer service not initialised.");
    if (id !== this.peerID) {
      let callInstance: MediaConnection = this.peer.call(id, this.localStream$.value, {
        metadata: {
          caller: this.userID
        }
      });

      callInstance.on('stream', (remoteStream: MediaStream) => {
        let remoteUser: RTCUser | undefined = this.callUsers$.value.find((user: RTCUser) => user.peer === id);
        
        if (remoteUser) {
          this.appendStream(remoteStream, id, remoteUser.user);
        }
        return;
      });

      callInstance.on('close', () => {
        this.peerStreams$.next(this.peerStreams$.value.filter((stream: RTCStream) => {
          return(stream.peer !== id);
        }));
      });

      this.peerConnections$.next([...this.peerConnections$.value, callInstance]);
    }
  }

  private appendStream(remoteStream: MediaStream, peerID: string, remoteUser: number) {
    let existingStreams = this.peerStreams$.value;

    if (existingStreams.findIndex((rtcStream: RTCStream) => rtcStream.stream.id === remoteStream.id) === -1) {
      if (remoteUser) {
        this.peerStreams$.next([...this.peerStreams$.value, {
          id: remoteUser,
          peer: peerID,
          stream: remoteStream
        }]);
      }
    }
    return;
  }

  public toggleVideo(): CameraState {
    if (this.localStream$.value instanceof MediaStream) {
      let tracks = this.localStream$.value?.getVideoTracks();
      this.cameraState.video = !this.cameraState.video;
      tracks.forEach(track => track.enabled = this.cameraState.video);
    }
    return(this.cameraState)
  }

  public toggleAudio(): CameraState {
    if (this.localStream$.value instanceof MediaStream) {
      let tracks = this.localStream$.value?.getAudioTracks();
      this.cameraState.audio = !this.cameraState.audio;
      tracks.forEach(track => track.enabled = this.cameraState.audio);
    }
    return(this.cameraState);
  }

  get remoteStreams(): Observable<RTCStream[]> {
    return(this.peerStreams$.asObservable());
  }

  ngOnInit() {

    return;
  }

  constructor(private chatApiService: ChatApiService) {  }
}
