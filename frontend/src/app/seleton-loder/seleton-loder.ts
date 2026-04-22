import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleton-loder.html',
  styleUrls: ['./seleton-loder.css'],
})
export class SeletonLoder {
  @Input() type: 'card' | 'chart-line' | 'chart-donut' | 'activity' | 'chat' | 'table' = 'card';
 //  ONLY ONE for rows & col
 @Input() rows!: number;
 @Input() cols!: number;

  //  generate rows
get rowArray() {
  return Array(this.rows || 0).fill(0);
}

//  generate columns
get colArray() {
  return Array(this.cols || 0).fill(0);
}

}