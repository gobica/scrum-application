import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';


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

        // preveri ce je mail v bazi?????? --> vrne napako ce ni?

        this.loading = true;

        //posreduje naprej na mail

        this.alertService.success('Check your email');

    }
}
