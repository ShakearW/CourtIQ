import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player';
import { getTeamColor, getLogoAbbr } from '../../utils/team-helpers';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css'
})

export class PlayerListComponent implements OnInit {
  players: any[] = [];
  currentPage = 1;
  pageSize = 25;

  searchTerm = '';


  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getAllPlayers(2025).subscribe((data: any) => {
      this.players = data;
    });
  }

  get filteredPlayers() {
  if (!this.searchTerm.trim()) return this.players;
  const term = this.searchTerm.toLowerCase();
  return this.players.filter((p: any) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
  );
  }

  
  get totalPages() {
    return Math.ceil(this.filteredPlayers.length / this.pageSize);
  }

  get pagedPlayers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPlayers.slice(start, start + this.pageSize);
  }

  onSearchChange() {
  this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getLogoAbbr(abbr: string) { return getLogoAbbr(abbr); }
}