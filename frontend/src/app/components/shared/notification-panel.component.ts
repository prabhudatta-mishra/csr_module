import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Notifications</h2>
    <div mat-dialog-content class="content">
      <div *ngIf="!notifications.items().length" class="empty">No notifications</div>
      <div class="item" *ngFor="let n of notifications.items()">
        <div class="msg">{{ n.message }}</div>
        <div class="meta">{{ n.time | date:'short' }}</div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="clearAll()" *ngIf="notifications.items().length">Clear All</button>
      <button mat-button (click)="dialogRef.close()">Close</button>
    </div>
  `,
  styles: [`
    .content { min-width: 300px; max-height: 400px; overflow-y: auto; }
    .empty { text-align: center; color: #666; padding: 20px; }
    .item { padding: 12px 0; border-bottom: 1px solid #eee; }
    .item:last-child { border-bottom: none; }
    .msg { margin-bottom: 4px; }
    .meta { font-size: 12px; color: #666; }
  `]
})
export class NotificationPanelComponent {
  constructor(
    public notifications: NotificationService,
    public dialogRef: MatDialogRef<NotificationPanelComponent>
  ) {}

  clearAll() {
    this.notifications.clear();
  }
}
