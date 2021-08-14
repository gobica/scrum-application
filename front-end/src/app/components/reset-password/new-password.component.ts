import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
    resetForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {
        // // redirect to home if already logged in
        // if (this.authenticationService.currentUserValue) {
        //     this.router.navigate(['/']);
        // }
    }

    ngOnInit() {
        this.resetForm = this.formBuilder.group({
          password: ['', Validators.required],
          confirmPassword: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.resetForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        if (this.resetForm.invalid) {
            return;
        }

        const password = this.f.password.value;
        const confirmPassword = this.f.confirmPassword.value;
        if( password.length > 5) {
          if(password === confirmPassword) {

            const resetToken = this.route.snapshot.paramMap.get('token');
            this.userService.resetPassword(resetToken, password)
              .pipe(first())
              .subscribe(
                  data => {
                    this.alertService.success(data["message"]);
                  },
                  error => {
                    this.alertService.error(error);
                    this.loading = false;
                  });

            this.loading = false;
          } else {
            this.alertService.error('Passwords must match');
          }
        } else {
          this.alertService.error('Password must be at least 6 characters');
        }


    }
}
