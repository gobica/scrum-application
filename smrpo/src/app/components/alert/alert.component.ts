import { Component, OnInit, OnDestroy,  ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Base, inject } from 'angular-util';
import { AlertService } from '../../services/alert.service';

@Component({ selector: 'alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;
    public isVisible: boolean = false;
    @ViewChild('alert', { static: true }) alert: ElementRef;


    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getAlert()
            .subscribe(message => {
                switch (message && message.type) {
                    case 'success':
                        message.cssClass = 'alert alert-success';
                        break;
                    case 'error':
                        message.cssClass = 'alert alert-danger';
                        break;
                }

                this.message = message;
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