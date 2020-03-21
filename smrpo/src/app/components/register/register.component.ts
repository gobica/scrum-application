import { Component, OnInit } from '@angular/core';
import { Register } from '../../models/Register';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registers:Register[];
  Roles: any = ['Admin', 'Author', 'Reader'];

  constructor() { }

  ngOnInit(): void {
    
  }

}
