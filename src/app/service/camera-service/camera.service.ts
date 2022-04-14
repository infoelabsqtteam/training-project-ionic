import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';

export interface ApiImage {
  _id: string;
  name: string;
  createdAt: Date;
  url: string;
}

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})

export class CameraService {

  url = 'http://localhost:3000';
  images: LocalFile[] = [];

  constructor(
    private plt: Platform,
    private http: HttpClient,    
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
    ) { }
 
  getImages() {
    return this.http.get<ApiImage[]>(`${this.url}/image`);
  }

  async loadFiles() {
    this.images = [];
 
    const loading = await this.loadingCtrl.create({
      message: 'Loading Images...',
    });
    await loading.present();
 
    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {
      this.loadFileData(result.files);
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
  // base on the name of the file
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;
 
      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });
 
      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
        createdAt: new Date(),
      });
    }
  }
 
  // Little helper
  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
    });
    toast.present();
  }
 
  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      // resultType: CameraResultType.Uri,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,      
      correctOrientation: true,
      saveToGallery: true
      // source: CameraSource.Photos // Camera, Photos or Prompt!
    });

    if (image) {
        this.saveImage(image)
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
 
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
        directory: Directory.Data
    });
 
    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    this.loadFiles();
}
 
  // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
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
 
  // Upload the formData to our API
async uploadData(formData: FormData) {
  const loading = await this.loadingCtrl.create({
      message: 'Uploading image...',
  });
  await loading.present();

  // Use your own API!
  const url = 'http://localhost:8888/images/upload.php';

  this.http.post(url, formData)
      .pipe(
          finalize(() => {
              loading.dismiss();
          })
      )
      .subscribe(res => {
          if (res['success']) {
              this.presentToast('File upload complete.')
          } else {
              this.presentToast('File upload failed.')
          }
      });
}

// async deleteImage(file: LocalFile) {
//   await Filesystem.deleteFile({
//       directory: Directory.Data,
//       path: file.path
//   });
//   this.loadFiles();
//   this.presentToast('File removed.');
// }
 

  // ------2nd method
  uploadImage(blobData, name, ext) {
    const formData = new FormData();
    formData.append('file', blobData, `myimage.${ext}`);
    formData.append('name', name);
 
    return this.http.post(`${this.url}/image`, formData);
  }
 
  uploadImageFile(file: File) {
    const ext = file.name.split('.').pop();
    const formData = new FormData();
    formData.append('file', file, `myimage.${ext}`);
    formData.append('name', file.name);
 
    return this.http.post(`${this.url}/image`, formData);
  }
 
  deleteImage(id) {
    return this.http.delete(`${this.url}/image/${id}`);
  }
}
