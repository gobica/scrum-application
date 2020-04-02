import { Component, OnInit } from '@angular/core';
import { Home } from '../../models/Home';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  home:Home[];
  constructor() { }

  ngOnInit(): void {

  }


}

