import { Component, OnInit, OnDestroy,  ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import {MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';

import { AlertService } from '../../services/alert.service';

@Component({ selector: 'alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;
    public isVisible: boolean = false;
    @ViewChild('alert', { static: true }) alert: ElementRef;


    constructor(
      private alertService: AlertService,
      private _snackBar: MatSnackBar) { }

  

      openSnackBar(message: any, action: string) {
        let config = new MatSnackBarConfig();
        config.panelClass   = message.cssClass;
        config.duration = 2000;
        this._snackBar.open(message.text, action, config);
      }

    ngOnInit() {
        this.subscription = this.alertService.getAlert()
            .subscribe(message => {
                switch (message && message.type) {
                    case 'success':
                        message.cssClass = ['mat-toolbar', 'mat-primary'];
                        break;
                    case 'error':
                        message.cssClass = ['mat-toolbar', 'mat-warn'];
                        break;
                    case 'warning':
                        message.cssClass = ['mat-toolbar', 'mat-accent']
                        break;
                }

                this.message = message;
                if (this.message)
                this.openSnackBar(this.message, "Close");
                console.log
            });

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    
  showAlert() : void {
    if (this.isVisible) { // if the alert is visible return
      return;
    } 
   

    this.isVisible = true;
    setTimeout(()=> this.isVisible = false,2500); // hide the alert after 2.5s
  }

  closeAlert() {
    this.alert.nativeElement.classList.remove('show');
  }

}
