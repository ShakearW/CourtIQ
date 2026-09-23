import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player';
import { RouterLink } from '@angular/router';
import { getTeamColor, getLogoAbbr, getTeamSecondaryColor } from '../../utils/team-helpers';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.css'
})


export class TeamDetailComponent implements OnInit {
  team: any = null;
  roster: any[] = [];
  seasons = [
  { value: 2020, label: '2020-2021' },
  { value: 2021, label: '2021-2022' },
  { value: 2022, label: '2022-2023' },
  { value: 2023, label: '2023-2024' },
  { value: 2024, label: '2024-2025' },
  { value: 2025, label: '2025-2026' }
  ];
  selectedSeason = 2025;
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

  getTeamSecondaryColor(abbr: string) { return getTeamSecondaryColor(abbr); }

  getTeamColor(abbr: string) { return getTeamColor(abbr); }
  
  getLogoAbbr(abbr: string) { return getLogoAbbr(abbr); }

  onSeasonChange(season: number) {
    this.selectedSeason = season;
    this.loadRoster();
  }

  activeTab: 'overview' | 'stats' | 'schedule' | 'roster' | 'history' = 'roster';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }
}