import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getLeaders(stat: string, season: number) {
    return this.http.get(`${this.baseUrl}/leaders?stat=${stat}&season=${season}`);
  }

  getPlayer(id: number) {
    return this.http.get(`${this.baseUrl}/players/${id}`);
  }

  getTeam(id: number) {
  return this.http.get(`${this.baseUrl}/teams/${id}`);
  }

  getTeams() {
  return this.http.get(`${this.baseUrl}/teams`);
  }

  getTeamRoster(id: number, season: number) {
  return this.http.get(`${this.baseUrl}/teams/${id}/roster?season=${season}`);
  }
}