import { StorageService } from '@core/web-core';
import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { InputCustomEvent } from '@ionic/angular';
import { AppModelService } from '@core/ionic-core';

@Component({
  selector: 'app-barcode-scanning',
  templateUrl: './barcode-scanning.component.html',
  styleUrls: ['./barcode-scanning.component.scss'],
})
export class BarcodeScanningComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  public formats: BarcodeFormat[] = [];
  @Input()
  public lensFacing: LensFacing = LensFacing.Back;
  @Input()
  public modal:any;

  @ViewChild('square',{ static: false})
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  readBarCodeImageFromDevice = false;
  listener:any;
  public isTorchAvailable = false;
  public minZoomRatio: number | undefined;
  public maxZoomRatio: number | undefined;
  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  constructor(
    private appModelService: AppModelService,
    private readonly ngZone: NgZone,
    private storageService : StorageService
  ) {}

  // Angular LifeCycle Function Handling Start--------------------
  public ngOnInit(): void {
    this.checkisTorchAvailable();
    this.checkReadBarcodeOrQRCodeFromDevice();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan();
    }, 500);
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }
  // Angular LifeCycle Function Handling End-----------------

  // Click Function Handling Start--------------------
  public async closeModal(barcode?: Barcode): Promise<void> {
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
        'dismissed': true,
        'barcode':barcode
      });
    }else{        
      this.appModelService.dismiss({
        barcode: barcode,
      });
    }
  }
  public async toggleTorch(): Promise<void> {
    await BarcodeScanner.toggleTorch();
  }
  barcodes:any=[];
  public async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ limit: 1 });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    const formats = this.formGroup.get('formats')?.value || [];
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path,
      formats,
    });
    this.listener.remove();
    // this.stopScan();
    this.closeModal(barcodes[0]);
    // await alert.present();
  }
  public setZoomRatio(event: InputCustomEvent): void {
    if (!event.detail.value) {
      return;
    }
    BarcodeScanner.setZoomRatio({
      zoomRatio: parseInt(event.detail.value as any, 10),
    });
  }
  // Click Function Handling End--------------------
  // Dependency Function Handling Start--------------------
  async checkisTorchAvailable(){
    await BarcodeScanner.isTorchAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }
  checkReadBarcodeOrQRCodeFromDevice(){
    const mobileAppSettings:any = this.storageService.getApplicationValueByKey("mobileAppSettings");
    this.readBarCodeImageFromDevice = mobileAppSettings?.readBarCodeImageFromDevice ?? false;
  }
  private async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: this.formats,
      lensFacing: this.lensFacing,
    };

    const squareElementBoundingClientRect = this.squareElement.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right:
            squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom:
            squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width:
            squareElementBoundingClientRect.width * window.devicePixelRatio,
          height:
            squareElementBoundingClientRect.height * window.devicePixelRatio,
        }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [
            scaledRect.left + scaledRect.width,
            scaledRect.top + scaledRect.height,
          ],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;
    this.listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      async (event) => {
        this.ngZone.run(() => {
          const cornerPoints = event.barcode.cornerPoints;
          if (detectionCornerPoints && cornerPoints) {
            if (
              detectionCornerPoints[0][0] > cornerPoints[0][0] ||
              detectionCornerPoints[0][1] > cornerPoints[0][1] ||
              detectionCornerPoints[1][0] < cornerPoints[1][0] ||
              detectionCornerPoints[1][1] > cornerPoints[1][1] ||
              detectionCornerPoints[2][0] < cornerPoints[2][0] ||
              detectionCornerPoints[2][1] < cornerPoints[2][1] ||
              detectionCornerPoints[3][0] > cornerPoints[3][0] ||
              detectionCornerPoints[3][1] < cornerPoints[3][1]
            ) {
              // let validateCornerPoints = {
              //   'detectionCornerPoints':detectionCornerPoints,
              //   'cornerPoints':cornerPoints
              // }
              // console.log("validateCornerPoints",validateCornerPoints)
              return;
            }
          }
          // listener.remove();
          // this.closeModal(event.barcode);
        });
        let result = event.barcode.displayValue;
        if(result && result != ''){
          this.listener.remove();
          this.closeModal(event.barcode);
        }
      }
    );
    await BarcodeScanner.startScan(options);
    void BarcodeScanner.getMinZoomRatio().then((result) => {
      this.minZoomRatio = result.zoomRatio;
    });
    void BarcodeScanner.getMaxZoomRatio().then((result) => {
      this.maxZoomRatio = result.zoomRatio;
    });
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    
    await BarcodeScanner.stopScan();
  }
  // Dependency Function Handling End--------------------

}
