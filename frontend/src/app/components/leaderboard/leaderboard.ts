import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';
import { getLogoAbbr } from '../../utils/team-helpers';



@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class LeaderboardComponent implements OnInit {
  leaders: any[] = [];
  seasons = [
  { value: 2020, label: '2020-2021' },
  { value: 2021, label: '2021-2022' },
  { value: 2022, label: '2022-2023' },
  { value: 2023, label: '2023-2024' },
  { value: 2024, label: '2024-2025' },
  { value: 2025, label: '2025-2026' }
  ];
  selectedSeason = 2025;
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

  get statLabel(): string {
    const found = this.stats.find(s => s.value === this.selectedStat);
    return found ? found.label : '';
  }

  getLogoAbbr(abbr: string) { return getLogoAbbr(abbr); }
}