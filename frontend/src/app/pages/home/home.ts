import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  pointsLeader: any = null;
  reboundsLeader: any = null;
  recentGames: any[] = [];
  allStandings: any[] = [];
  viewFilter: 'all' | 'East' | 'West' = 'all';
  topOffense: any[] = [];
  topDefense: any[] = [];
  top3pt: any[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getTopPlayer('pts_avg', 2025).subscribe((data: any) => {
      this.pointsLeader = data[0];
    });
    this.playerService.getTopPlayer('reb_avg', 2025).subscribe((data: any) => {
      this.reboundsLeader = data[0];
    });
    this.playerService.getRecentGames().subscribe((data: any) => {
      this.recentGames = data;
    });
    this.playerService.getStandings(2025).subscribe((data: any) => {
      this.allStandings = data;
    });
    this.playerService.getTeamRatings(2025).subscribe((data: any) => {
      const valid = data.filter((t: any) => t.off_rating != null);
      this.topOffense = [...valid].sort((a, b) => b.off_rating - a.off_rating).slice(0, 3);
      this.topDefense = [...valid].sort((a, b) => a.def_rating - b.def_rating).slice(0, 3);
      this.top3pt = [...valid].sort((a, b) => b.three_pct - a.three_pct).slice(0, 3);
    });
  }
  get filteredStandings() {
    const data = this.viewFilter === 'all'
      ? this.allStandings
      : this.allStandings.filter((t: any) => t.conference === this.viewFilter);

    return [...data].sort((a, b) => b.pct - a.pct);
  }

  setFilter(filter: 'all' | 'East' | 'West') {
    this.viewFilter = filter;
  }

  getLogoAbbr(abbr: string): string {
    const overrides: Record<string, string> = {
      NOP: 'no',
      UTA: 'utah'
    };
    return overrides[abbr] || abbr.toLowerCase();
  }

  getTeamLogo(teamName: string): string {
    const logos: { [key: string]: string } = {
      'Atlanta Hawks': 'atl',
      'Boston Celtics': 'bos',
      'Brooklyn Nets': 'bkn',
      'Charlotte Hornets': 'cha',
      'Chicago Bulls': 'chi',
      'Cleveland Cavaliers': 'cle',
      'Dallas Mavericks': 'dal',
      'Denver Nuggets': 'den',
      'Detroit Pistons': 'det',
      'Golden State Warriors': 'gs',
      'Houston Rockets': 'hou',
      'Indiana Pacers': 'ind',
      'Los Angeles Clippers': 'lac',
      'Los Angeles Lakers': 'lal',
      'Memphis Grizzlies': 'mem',
      'Miami Heat': 'mia',
      'Milwaukee Bucks': 'mil',
      'Minnesota Timberwolves': 'min',
      'New Orleans Pelicans': 'no',
      'New York Knicks': 'ny',
      'Oklahoma City Thunder': 'okc',
      'Orlando Magic': 'orl',
      'Philadelphia 76ers': 'phi',
      'Phoenix Suns': 'phx',
      'Portland Trail Blazers': 'por',
      'Sacramento Kings': 'sac',
      'San Antonio Spurs': 'sa',
      'Toronto Raptors': 'tor',
      'Utah Jazz': 'utah',
      'Washington Wizards': 'wsh'
    };
    

    const abbreviation = logos[teamName];

    return abbreviation
      ? `https://a.espncdn.com/i/teamlogos/nba/500/${abbreviation}.png`
      : '';
  }
}