import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard.html'
})
export class LeaderboardComponent implements OnInit {
  leaders: any[] = [];
  seasons = [2020, 2021, 2022, 2023, 2024, 2025];
  selectedSeason = 2024;
  stats = [
    { value: 'pts_avg', label: 'Points' },
    { value: 'reb_avg', label: 'Rebounds' },
    { value: 'ast_avg', label: 'Assists' },
    { value: 'ts_pct', label: 'TS%' }
  ];
  selectedStat = 'pts_avg';

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadLeaders();
  }

  loadLeaders() {
    this.playerService.getLeaders(this.selectedStat, this.selectedSeason).subscribe((data: any) => {
      this.leaders = data;
    });
  }

  onSeasonChange(season: number) {
    this.selectedSeason = season;
    this.loadLeaders();
  }

  onStatChange(stat: string) {
    this.selectedStat = stat;
    this.loadLeaders();
  }
}