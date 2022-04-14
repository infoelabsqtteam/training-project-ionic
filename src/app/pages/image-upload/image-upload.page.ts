import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, Platform } from '@ionic/angular';

import { CameraService, ApiImage } from 'src/app/service/camera-service/camera.service';


@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.page.html',
  // styleUrls: ['./image-upload.page.scss'],
})
export class ImageUploadPage implements OnInit {

  images: ApiImage[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
 
  constructor(
    private cameraService: CameraService, 
    private plt: Platform, 
    private actionSheetCtrl: ActionSheetController
  ) 
    {
      this.cameraService.loadFiles();
    // this.loadImages();
  }

  ngOnInit(){
  }
 
  loadImages() {
    this.cameraService.getImages().subscribe(images => {
      this.images = images;
    });
  }
 
  async selectImageSource() {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addImage(CameraSource.Camera);
        }
      },
      {
        text: 'Choose From Photos Photo',
        icon: 'image',
        handler: () => {
          this.addImage(CameraSource.Photos);
        }
      }
    ];
 
    // Only allow file selection inside a browser
    if (!this.plt.is('hybrid')) {
      buttons.push({
        text: 'Choose a File',
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();
        }
      });
    }
 
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons
    });
    await actionSheet.present();
  }
 
  async addImage(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      // resultType: CameraResultType.Uri,
      resultType: CameraResultType.Base64,
      source: source,      
      correctOrientation: true,
      saveToGallery: true
    });
 
    const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
    const imageName = 'test-kc';
 
    this.cameraService.uploadImage(blobData, imageName, image.format).subscribe((newImage: ApiImage) => {
      this.images.push(newImage);
    });
  }
 
  // Used for browser direct file upload
  uploadFile(event: EventTarget) {
    const eventObj: any = event as any;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    const file: File = target.files[0];
    this.cameraService.uploadImageFile(file).subscribe((newImage: ApiImage) => {
      this.images.push(newImage);
    });
  }
 
  deleteImage(image: ApiImage, index) {
    this.cameraService.deleteImage(image._id).subscribe(res => {
      this.images.splice(index, 1);
    });
  }
 
  // Helper function
  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
 
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
 
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
 
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
 
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

}
