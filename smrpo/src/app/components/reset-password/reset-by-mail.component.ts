import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-reset-by-mail',
  templateUrl: './reset-by-mail.component.html',
  styleUrls: ['./reset-by-mail.component.css']
})
export class ResetByMailComponent implements OnInit {
    resetForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        // // redirect to home if already logged in
        // if (this.authenticationService.currentUserValue) {
        //     this.router.navigate(['/']);
        // }
    }

    ngOnInit() {
        this.resetForm = this.formBuilder.group({
          email: ['', Validators.required]
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

        this.userService.sendResetRequest(this.resetForm.get('email').value);
        this.loading = true;

        this.alertService.success('If an account with that e-mail address exists, a message with further information on resetting the password will be available in the inbox soon');
    }
}
