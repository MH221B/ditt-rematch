// frontend/my-tool-platform/src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home">
      <h1>DITT</h1>
      <div class="status">
        <span>API Status: </span>
        <span [class]="connected ? 'connected' : 'disconnected'">
          {{ connected ? '✅ Connected' : '❌ Disconnected' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .connected { color: green; }
    .disconnected { color: red; }
  `]
})
export class HomeComponent implements OnInit {
  connected = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHealth().subscribe({
      next: () => this.connected = true,
      error: () => this.connected = false
    });
  }
}