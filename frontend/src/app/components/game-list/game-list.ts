import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';
import { getTeamColor, getLogoAbbr } from '../../utils/team-helpers';



@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-list.html',
  styleUrl: './game-list.css'
})


export class GameListComponent {
    games: any[] = [];
}
