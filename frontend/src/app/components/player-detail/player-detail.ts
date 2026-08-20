import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-detail.html'
})
export class PlayerDetailComponent implements OnInit {
  player: any = null;

  constructor(private route: ActivatedRoute, private playerService: PlayerService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.playerService.getPlayer(Number(id)).subscribe((data: any) => {
      this.player = data;
    });
  }
}