import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-detail.html'
})
export class TeamDetailComponent implements OnInit {
  team: any = null;
  roster: any[] = [];
  seasons = [2020, 2021, 2022, 2023, 2024, 2025];
  selectedSeason = 2024;
  teamId!: number;

  constructor(private route: ActivatedRoute, private playerService: PlayerService) {}

  ngOnInit() {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    this.playerService.getTeam(this.teamId).subscribe((data: any) => {
      this.team = data;
    });
    this.loadRoster();
  }

  loadRoster() {
    this.playerService.getTeamRoster(this.teamId, this.selectedSeason).subscribe((data: any) => {
      this.roster = data;
    });
  }

  onSeasonChange(season: number) {
    this.selectedSeason = season;
    this.loadRoster();
  }
}