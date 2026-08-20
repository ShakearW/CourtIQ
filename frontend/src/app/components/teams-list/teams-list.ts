import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teams-list.html'
})
export class TeamsListComponent implements OnInit {
  teams: any[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getTeams().subscribe((data: any) => {
      this.teams = data;
    });
  }
}