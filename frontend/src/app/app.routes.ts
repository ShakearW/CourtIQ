import { Routes } from '@angular/router';
import { LeaderboardComponent } from './components/leaderboard/leaderboard';
import { PlayerDetailComponent } from './components/player-detail/player-detail';
import { TeamDetailComponent } from './components/team-detail/team-detail';
import { TeamsListComponent } from './components/teams-list/teams-list';
import { HomeComponent } from './pages/home/home';
import { GameListComponent } from './components/game-list/game-list';
import { PlayerListComponent } from './components/player-list/player-list';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'leaders', component: LeaderboardComponent },
  { path: 'players', component: PlayerListComponent },
  { path: 'players/:id' , component: PlayerDetailComponent },
  {path: 'games' , component: GameListComponent},
  {path: 'teams' , component: TeamsListComponent},
  { path: 'teams/:id' , component: TeamDetailComponent }
];