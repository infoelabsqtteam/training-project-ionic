import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { AlertController } from '@ionic/angular';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';

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

  public isTorchAvailable = false;
  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  constructor(
    private readonly popoverModalService: PopoverModalService,
    private router:Router,
    private readonly ngZone: NgZone,
    private alertController:AlertController
  ) {}

  public ngOnInit(): void {
    BarcodeScanner.isTorchAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }

  public ngAfterViewInit(): void {
    // setTimeout(() => {
      this.startScan();
    // }, 250);
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }

  public async closeModal(barcode?: Barcode): Promise<void> {
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
        'dismissed': true,
        'barcode':barcode
      });
    }else{        
      this.popoverModalService.dismissModal({
        barcode: barcode,
      });
    }
  }

  public async toggleTorch(): Promise<void> {
    await BarcodeScanner.toggleTorch();
  }
  listener:any;
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
        // this.ngZone.run(() => {
        //   const cornerPoints = event.barcode.cornerPoints;
        //   if (detectionCornerPoints && cornerPoints) {
        //     if (
        //       detectionCornerPoints[0][0] > cornerPoints[0][0] ||
        //       detectionCornerPoints[0][1] > cornerPoints[0][1] ||
        //       detectionCornerPoints[1][0] < cornerPoints[1][0] ||
        //       detectionCornerPoints[1][1] > cornerPoints[1][1] ||
        //       detectionCornerPoints[2][0] < cornerPoints[2][0] ||
        //       detectionCornerPoints[2][1] < cornerPoints[2][1] ||
        //       detectionCornerPoints[3][0] > cornerPoints[3][0] ||
        //       detectionCornerPoints[3][1] < cornerPoints[3][1]
        //     ) {
        //       let validateCornerPoints = {
        //         'detectionCornerPoints':detectionCornerPoints,
        //         'cornerPoints':cornerPoints
        //       }
        //       console.log("validateCornerPoints",validateCornerPoints)
        //       return;
        //     }
        //   }
        //   listener.remove();
        //   this.closeModal(event.barcode);
        // });
        let result = event.barcode.displayValue;
        if(result && result != ''){  
          console.log(result);        
          this.listener.remove();
          this.stopScan();
          this.closeModal(event.barcode);
        }
      }
    );
    await BarcodeScanner.startScan(options);
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    
    await BarcodeScanner.stopScan();
  }
  barcodes:any=[];
  public async readBarcodeFromImage(): Promise<void> {
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
    let alertType = "GPS";
    let alertHeader:string = 'Barcode result';
    let message:string;
    if(this.barcodes.length==0){
        message = `Please select Correct Image`;
        this.closeModal(this.barcodes);
      }
      else{
       message= `your Barcode value is ${barcodes[0].displayValue}`;
       this.closeModal(this.barcodes);
      }
      const alert = await this.alertController.create({
        cssClass: 'my-gps-class',
        header: alertHeader,
        message: message,
        buttons: [
          {
            text: 'CLOSE',
            role: 'confirmed',
            handler: () => {
              console.log(alertType.toUpperCase() + " alert action : ", "Confirmed");
            },
          },
        ],
      })
      this.listener.remove();
      this.stopScan();
      this.closeModal(this.barcodes[0]);
      await alert.present();
    console.log(barcodes);
  }

}
