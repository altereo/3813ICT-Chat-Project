import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbPopoverModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import * as $ from 'jquery';
import Cropper from 'cropperjs';

import { ChatApiService, User } from './chat-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    HttpClientModule,
    NgbPopoverModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = '3813ICT-Chat';

  @ViewChild('imgEditDialog') private editDialog!: TemplateRef<any>;
  private cropperInstance!: Cropper;
  private editDialogRef: NgbModalRef | null = null;

  user: Observable<User>;
  isLoggedIn: boolean = false;

  fileInput: string = "";
  profileImage: string = "";


  onFileChange(event: any) {
    let files = event.target.files as FileList;

    if (files.length > 0) {
      let _file = URL.createObjectURL(files[0]);
      this.profileImage = _file;
      this.fileInput = "";

      this.editDialogRef = this.modalService.open(this.editDialog);
      this.initCropper();
    }
  }

  triggerLogout() {
    this.chatApiService.clearUser();
    this.router.navigateByUrl('/login');
    return;
  }

  changeProfilePicture() {
    if (this.editDialogRef) {
      

      this.profileImage = "";
      this.editDialogRef.close();
    }
    return;
  }

  resetCropper() {
    let cImage = this.cropperInstance.getCropperImage();
    let selection = this.cropperInstance.getCropperSelection();

    if (cImage && selection) {
      cImage.$center('contain');
      selection.$reset();
    }
    return;
  }

  initCropper() {
    const inSelection = (selection: any, maxSelection: any) => {
      return (
        selection.x >= maxSelection.x
        && selection.y >= maxSelection.y
        && (selection.x + selection.width) <= (maxSelection.x + maxSelection.width)
        && (selection.y + selection.height) <= (maxSelection.y + maxSelection.height)
      );
    }


    let image: HTMLImageElement = new Image();

    image.src = this.profileImage;
    image.className = "profile-cropper";

    this.cropperInstance = new Cropper(image, {
      container: '.cropper-container'
    });

    let canvas = this.cropperInstance.getCropperCanvas();
    let cImage = this.cropperInstance.getCropperImage();
    let selection = this.cropperInstance.getCropperSelection();
    let handle = this.cropperInstance.container.querySelector("cropper-handle");

    if (canvas && cImage && selection && handle) {
      canvas.style.height = `500px`;
      cImage.style.height = `100%`;
      cImage.style.width = `100%`;

      canvas.removeAttribute("background");
      handle.setAttribute("action", "move");
      selection.setAttribute("aspect-ratio", "1");

      canvas.addEventListener('change', (e: any) => {
        let canvasRect = canvas.getBoundingClientRect();
        const maxSelection = {
          x: 0,
          y: 0,
          width: canvasRect.width,
          height: canvasRect.height
        }

        if (!inSelection(e.detail, maxSelection)) {
          e.preventDefault();
        }
        return;
      })
    } 
    return;
  }

  ngOnInit() {
    if (!this.chatApiService.isLoggedIn()) {
      this.router.navigateByUrl("/login");
    }
      
    return;
  }

  constructor (private router:Router, private modalService: NgbModal, private chatApiService: ChatApiService) {
    this.user = this.chatApiService.user;
  }
}
