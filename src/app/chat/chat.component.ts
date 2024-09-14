import { Component, OnInit, Input, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ChatApiService, User, Group, Channel, Message } from '../chat-api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @ViewChild('messageInput', {static: false}) private messageInputElement!: ElementRef<HTMLInputElement>;
  private serverID = "";
  private channelID = "";
  chatTitle = "";
  messages: Message[][] = []; // Convert this to a group of groups of messages, so that we can do discord style without too much trouble

  // Bind the input box so we can clear it later.
  message = "";
  fileInput = "";
  blobURL = "";
  toUpload: File | null = null;

  // For larger image view.
  modalRef: NgbModalRef | null = null;
  imageURL = "";

  // Get human friendly date from Date.now().
  getDate(date: number) {
    return(new Date(date).toLocaleString('en-GB'));
  }

  // On file input change.
  onFileChange(event: any) {
    let files = event.target.files as FileList;

    if (files.length > 0) {
      let _file = URL.createObjectURL(files[0]);
      this.blobURL = _file;
      this.toUpload = files[0];
      this.fileInput = "";
    }

    this.messageInputElement.nativeElement.focus();
    return;
  }

  // Clear the upload.
  clearUpload() {
    this.toUpload = null;
    this.blobURL = "";
  }

  // Send message.
  sendMessage(newMessage: string) {
    if (!this.toUpload) {
      this.chatApiService.emitMessage(
        +this.serverID,
        +this.channelID,
        this.chatApiService.getUser().id,
        this.message,
        null
      );
    } else {
      // Upload the image first.
      let toSend = this.message;
      if (this.toUpload) {
        this.chatApiService.uploadImage(this.toUpload).subscribe((data: any) => {
          this.chatApiService.emitMessage(
            +this.serverID,
            +this.channelID,
            this.chatApiService.getUser().id,
            toSend,
            data.filename
          );
        });

        this.clearUpload();
      }
    }

    this.message = "";
    return;
  }

  openImageViewer(url: string, content: TemplateRef<any>) {
    this.imageURL = url;
    this.modalRef = this.modalService.open(content, {
      centered: true,
      modalDialogClass: "image-viewer-modal"
    });

    document.querySelector(".viewer-container")?.addEventListener('click', (event) => {
      if (this.modalRef) {
        this.modalRef?.dismiss();
      }
    })
    return;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      let path: string[] = params.get('path' as string)?.split("::") || [];
      if (path.length === 2) {
        this.serverID = path[0];
        this.channelID = path[1];

        this.chatTitle = this.chatApiService.getChatTitle(+this.serverID, +this.channelID);
        this.messages = [];
        
        if (this.chatTitle === "") {
          this.router.navigateByUrl("/home");
        }
      }
    });

    this.chatApiService.onMessage().subscribe((data: Message) => {
      if (`${data.group}` === this.serverID && `${data.channel}` === this.channelID) {
        if (this.messages.length === 0) {
          this.messages.push([data]);
          return;
        }

        let lastGroup = this.messages[this.messages.length - 1];
        if (
          data.date - lastGroup[lastGroup.length - 1].date <= 90000 && data.author &&
          data.author?.id === lastGroup[lastGroup.length - 1].author?.id &&
          data.author?.image === lastGroup[lastGroup.length - 1].author?.image
        ) {
          this.messages[this.messages.length - 1].push(data);
        } else {
          this.messages.push([data]);
        }
        return;
      }
    });
  }

  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private chatApiService: ChatApiService,
    private modalService: NgbModal
  ) { }
}
