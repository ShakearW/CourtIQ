import { Routes } from '@angular/router';
import { LeaderboardComponent } from './components/leaderboard/leaderboard';
import { PlayerDetailComponent } from './components/player-detail/player-detail';
import { TeamDetailComponent } from './components/team-detail/team-detail';
import { TeamsListComponent } from './components/teams-list/teams-list';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'leaders', component: LeaderboardComponent },
  { path: 'player/:id' , component: PlayerDetailComponent },
  {path: 'teams' , component: TeamsListComponent},
  { path: 'team/:id' , component: TeamDetailComponent }
];