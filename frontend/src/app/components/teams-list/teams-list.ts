import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';
import { getTeamColor, getLogoAbbr } from '../../utils/team-helpers';



@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.css'
})


export class TeamsListComponent implements OnInit{
  teams: any[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getTeams().subscribe((data: any) => {
      this.teams = data;
    });
  }

  getTeamColor(abbr: string) { return getTeamColor(abbr); }
  
  getLogoAbbr(abbr: string) { return getLogoAbbr(abbr); }
}

