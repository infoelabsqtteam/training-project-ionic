import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo, GalleryImageOptions, GalleryPhoto, GalleryPhotos} from '@capacitor/camera';
import { ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CameraService, ApiImage } from 'src/app/service/camera-service/camera.service';
import { finalize } from 'rxjs';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { FormGroup, FormControl } from '@angular/forms';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { BarcodeScanningComponent } from 'src/app/m-core/modal/barcode-scanning/barcode-scanning.component';
import { NotificationService } from '@core/ionic-core';


const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
  createdAt: Date;
}

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.page.html',
  // styleUrls: ['./image-upload.page.scss'],
})
export class ImageUploadPage implements OnInit {

  /* --------Image upload variables------------------------------------------- */
  images: ApiImage[] = [];
  files: LocalFile[] = [];
  selectedphotos:any= [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  /* --------Image upload variables End------------------------------------------- */
  
  /* --------BarCode Scanning Variables------------------------------------------- */
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new FormGroup({
    formats: new FormControl([]),
    lensFacing: new FormControl(LensFacing.Back),
    // googleBarcodeScannerModuleInstallState: new FormControl(0),
    // googleBarcodeScannerModuleInstallProgress: new FormControl(0),
  });
  public barcodes: Barcode[] = [];
  public isSupported = false;
  public isPermissionGranted = false;
  // ngZone: any;
  /* --------BarCode Scanning Variables End------------------------------------------- */
 
  constructor(
    private cameraService: CameraService, 
    private plt: Platform, 
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private popoverModalService: PopoverModalService,    
    private readonly ngZone: NgZone,
    private notificationService: NotificationService
  ) 
    {
      this.loadFiles();
      
    // this.loadImages();
  }

  ngOnInit(){
    // barcode Scanner Initialize
    this.checkBarcodeScannerSupportedorNot();
  }
 
  // method 2
  async loadFiles() {
    this.files = [];
 
    const loading = await this.loadingCtrl.create({
      message: 'Loading Images...',
    });
    await loading.present();
 
    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {
      // console.log('Result Derectory : ' , result );
      let files:any = [];
      files=result.files
      this.loadFileData(files);
    },
      async (err) => {
        // Folder does not yet exists!
        await Filesystem.mkdir({
          path: IMAGE_DIR,
          directory: Directory.Data,
        });
      }
    ).then(_ => {
      loading.dismiss();
    });
  }

  // Get the actual base64 data of an image
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;
 
      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });
 
      this.files.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
        createdAt: new Date(),
      });
    }
  }

  async selectMultipleImages(){
    
    const multipleImagesOption:GalleryImageOptions = {
      quality: 100,
      limit:5,     
      correctOrientation: true,
    } 
    const multipleImages = await Camera.pickImages(multipleImagesOption).then(res => {
      console.log(res);
      let arrayimages = res.photos;
      if(arrayimages && arrayimages.length > 0) {
        for (let i = 0; i < arrayimages.length; i++) {
          this.selectedphotos.push(arrayimages[i].webPath);
        }

        console.log(this.selectedphotos);
        // this.getImageData();
      }
      this.saveImages(arrayimages)
    },
    error => {
         console.log(error)
      });
  }

  async saveImages(photos:any) {
    let base64Data:any;
    let fileName:any;
    let savedFile:any;
    photos.forEach((photo:any) => {
      base64Data = this.readAsBase64(photo); 
      console.log('Base64Data: ', base64Data);

      fileName = new Date().getTime() + '.jpeg';
      savedFile = Filesystem.writeFile({
          path: `${IMAGE_DIR}/${fileName}`,
          data: base64Data,
          directory: Directory.Data
      });
    });
    
    
    console.log("saved: ", savedFile)
    this.cameraService.presentToast("Image Added");
    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    await this.loadFiles();
  }
  
  async selectImage(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      // resultType: CameraResultType.Base64,
      source: source,      
      correctOrientation: true,
      saveToGallery: true
    });

    console.log('Selected Image : ', image);

    if (image) {
        this.saveImage(image)
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo); 
    console.log('Base64Data: ', base64Data);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
        directory: Directory.Data
    });
    
    console.log("saved: ", savedFile)
    this.cameraService.presentToast("Image Added");
    // Improve by only loading for the new image and unshifting array!
    await this.loadFiles();
  }
 
  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
            path: photo.path
        });
 
        return file.data;
    }
    else {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath);
        const blob = await response.blob(); 
        return await this.convertBlobToBase64(blob) as string;
    }
  }
 
  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
          resolve(reader.result);
      };
      reader.readAsDataURL(blob);
  });
 
  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.name);
    this.uploadData(formData);
  }
 
  // Upload the formData to your API
  async uploadData(formData: FormData) {
    const loading = await this.loadingCtrl.create({
        message: 'Uploading image...',
    });
    await loading.present();

    // Use your own API!
    const url = 'http://192.168.1.22:8100/images/upload.php';

    this.http.post(url, formData)
      .pipe(
          finalize(() => {
              loading.dismiss();
          })
      )
      .subscribe(res => {
          if (res['success']) {
              this.cameraService.presentToast('File upload complete.')
          } else {
              this.cameraService.presentToast('File upload failed.')
          }
    });
  }

  async deleteSelectedImage(file: LocalFile) {
    await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path
    });
    this.loadFiles();
    this.cameraService.presentToast('File removed.');
  }
 
  // loadImages() {
  //   this.cameraService.getImages().subscribe(images => {
  //     this.images = images;
  //   });
  // }
  // selectImage(){
  //   this.cameraService.selectImage(CameraSource.Camera);
  // }
  // startupload(file:any){
  //   this.cameraService.startUpload(file);
  // }
  // deleteimage(file:any){
  //   this.cameraService.deleteSelectedImage(file);
  // }
  

 
  // method 1
  async selectImageSource() {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          // this.addImage(CameraSource.Camera);
          this.selectImage(CameraSource.Camera);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'images',
        handler: () => {
          // this.addImage(CameraSource.Photos);
          // this.selectImage(CameraSource.Photos);
          this.selectMultipleImages();
        }
      }
    ];
 
    // Only allow file selection inside a browser
    // if (!this.plt.is('hybrid')) {
    //   buttons.push({
    //     text: 'Choose a File',
    //     icon: 'attach',
    //     handler: () => {
    //       this.fileInput.nativeElement.click();
    //     }
    //   });
    // }
 
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons
    });
    await actionSheet.present();
  }
 
  async addImage(source: CameraSource) {
    // const image = await Camera.getPhoto({
    //   quality: 90,
    //   allowEditing: false,
    //   // resultType: CameraResultType.Uri,
    //   resultType: CameraResultType.Base64,
    //   source: source,      
    //   correctOrientation: true,
    //   saveToGallery: true
    // });
 
    // const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
    // const time = new Date().getTime();
    // const imageName = 'Give a Name';
 
    // this.cameraService.uploadImage(blobData, imageName, image.format).subscribe((newImage: ApiImage) => {
    //   this.images.push(newImage);
    //   // let img:any = newImage;
    // });

    // --------------------------
    var options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source,      
      correctOrientation: true,
      saveToGallery: true
    }

    Camera.getPhoto(options).then((result:any) => {
      this.images.push(result.dataUrl);
      console.log(this.images);
    },(err) => {
      alert(JSON.stringify(err))
    })
  }
 
  // Used for browser direct file upload
  uploadFile(event: any) {
    // const eventObj: any = event as any;
    // const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    const file: File = event.files[0];
    this.cameraService.uploadImageFile(file).subscribe((newImage: ApiImage) => {
      this.images.push(newImage);
      // let img:any = newImage;
    });
  }
 
  deleteImage(index) {
    this.cameraService.deleteImage(index).subscribe(res => {
      this.images.splice(index, 1);
    });
  }
 
  // Helper function
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
  /*----BarCode Functions------------------------------------------------------------------------- */
  checkBarcodeScannerSupportedorNot(){
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    }).catch(err => {
      console.log('checkBarcodeScannerSupportedorNot Error', err);
    });
  }
  checkCameraPermissionToSacn(){
    if(this.isSupported){
      BarcodeScanner.checkPermissions().then((result) => {
        if(result.camera === 'granted' || result.camera === 'limited'){
          this.isPermissionGranted = true;
          // this.removeAllBarCodeListeners();
          BarcodeScanner.removeAllListeners().then(() => {
            console.log("removeAllListeners");
            this.startScan();
          });          
        }else{
          if(result.camera === 'denied'){
            this.presentsettingAlert();
          }
          this.isPermissionGranted = false;
        }
      }).catch(err => {
        console.log('checkCameraPermissionToSacn Error', err);
      });
    }else{
      let alertOpt = {
        'header': "Alert",
        'message':"Your device doesn't support barcode scanning.",
        'buttons' : [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }
      this.popoverModalService.showErrorAlert(alertOpt);
    }
  }
  removeAllBarCodeListeners(){
    BarcodeScanner.removeAllListeners().then(() => {
      console.log("removeAllListeners")
      BarcodeScanner.addListener(
        'barcodeScanned',
        (event) => {
          this.ngZone.run(() => {
            console.log('barcodeScanned', event);
            // const { state, progress } = event;
            // this.formGroup.patchValue({
            //   googleBarcodeScannerModuleInstallState: state,
            //   googleBarcodeScannerModuleInstallProgress: progress,
            // });
          });
        }
      );
    });
  }
  async startScan(): Promise<void> {
    const formats = this.formGroup.get('formats')?.value || [];
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;
    const modal = await this.popoverModalService.showModal({
      component: BarcodeScanningComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: formats,
        lensFacing: lensFacing,
      },
    });
    modal.onDidDismiss().then((result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.barcodes = [barcode];
      }
    });
  }

  async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: false });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    const formats = this.formGroup.get('formats')?.value || [];
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path,
      formats,
    });
    this.barcodes = barcodes;
  }
  async openSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }
  async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }
  async presentsettingAlert(): Promise<void> {
    let openSetting:any = await this.notificationService.confirmAlert('Permission denied','Please grant camera permission to use the barcode scanner. And try again.');
    if(openSetting == "confirm"){
      this.openSettings();
    }
  }

}
