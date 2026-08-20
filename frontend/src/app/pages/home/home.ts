import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}