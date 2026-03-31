import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-dark text-white p-3 text-center">
      <p class="container">DITT &copy; <span>{{ year }}</span></p>
    </footer>
  `,
})
export class FooterComponent implements OnInit {
  year: number = 0;

  ngOnInit(): void {
    this.year = new Date().getFullYear();
  }
}
