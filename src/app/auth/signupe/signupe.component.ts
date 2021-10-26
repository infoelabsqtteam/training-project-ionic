import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService, StorageService } from '@core/ionic-core';

@Component({
  selector: 'lib-signupe',
  templateUrl: './signupe.component.html',
  styleUrls: ['./signupe.component.scss']
})
export class SignupeComponent implements OnInit {


  userForm: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      password: ['', [Validators.required]],
    });
  }

  get f() { return this.userForm.controls; }

  onSubmit() {    
    if (this.userForm.invalid) {
      return;
    }
    let loginObj = this.userForm.value;
    const phone_number = "+91" + String(loginObj.mobileNo);
    this.authService.signup(loginObj.email, loginObj.password, loginObj.name, phone_number,'/auth/signine');
    this.userForm.reset();
    this.router.navigate(['/auth/signine']);
  }

}
