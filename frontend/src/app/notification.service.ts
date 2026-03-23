import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface NotificationItem {
  id: number;
  message: string;
  time: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  readonly items = signal<NotificationItem[]>([]);
  private readonly api = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  async load(email?: string) {
    try {
      const list = await this.http.get<any[]>(`${this.api}${email ? `?email=${encodeURIComponent(email)}` : ''}`).toPromise();
      const mapped: NotificationItem[] = (list || []).map(n => ({ id: n.id, message: n.message, time: new Date(n.createdAt || Date.now()), read: !!n.readFlag }));
      // derive seq from max id to avoid collisions for local additions
      this.seq = Math.max(0, ...mapped.map(m => m.id || 0));
      this.items.set(mapped);
    } catch {
      // ignore backend failure
    }
  }

  async push(message: string, userEmail?: string) {
    const temp: NotificationItem = { id: ++this.seq, message, time: new Date(), read: false };
    this.items.set([temp, ...this.items()]);
    try {
      await this.http.post(this.api, { message, userEmail }).toPromise();
    } catch {
      // best-effort
    }
  }

  unreadCount() {
    return this.items().filter(i => !i.read).length;
  }

  async markAllRead(email?: string) {
    // optimistic update
    this.items.set(this.items().map(i => ({ ...i, read: true })));
    try {
      await this.http.post(`${this.api}/mark-all-read`, { email }).toPromise();
    } catch {
      // ignore
    }
  }

  clear() {
    this.items.set([]);
  }
}
