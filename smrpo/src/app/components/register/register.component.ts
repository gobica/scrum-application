import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { DataService } from '../../services/user.service';
import { User } from '../../models/user'
import { first } from 'rxjs/operators';

import { AlertService,  } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.isAdmin() == false) {
             this.router.navigate(['/']);

        }
       //     this.router.navigate(['/']);
       // }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]], 
            globalRole: ['', Validators.required],
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
/*
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})



export class RegisterComponent implements OnInit {
  data:string;
  user:User;
  resultData: respData;

  Roles: any = ['Admin', 'Author', 'Reader'];

  constructor( private dataService: DataService){
  }
  ngOnInit(): void {
  }
  sendData() {
    this.user = new User();
    this.user.email = "testing@testing.com";
    this.user.password = "testiramcedelaapi";
    this.user.firstName = "imetestinng";
    this.user.lastName = "potrebasdujes";
    
    this.dataService.register(this.user).subscribe((res : respData)=>{
        this.resultData = res;
        console.log(this.resultData.id);
        this.data =this.resultData.id + "-" + this.resultData.email;
      });
    }
}
*/