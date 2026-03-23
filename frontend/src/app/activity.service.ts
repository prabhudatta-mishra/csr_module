import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8080/api';

export interface SystemActivity {
  id: string;
  type: 'project' | 'volunteer' | 'employee' | 'budget' | 'booking';
  icon: string;
  iconClass: string;
  title: string;
  meta: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly KEY = 'system.activities';
  readonly activities = signal<SystemActivity[]>([]);

  constructor(private readonly http: HttpClient) {
    // Load from backend first
    this.http.get<any[]>(`${API}/audit`).subscribe({
      next: (list) => {
        if (!list || list.length === 0) { this.loadFromLocalStorage(); return; }
        const mapped: SystemActivity[] = list.slice(0, 20).map(a => ({
          id: String(a.id),
          type: (a.entityType?.toLowerCase() || 'project') as any,
          icon: a.action || 'info',
          iconClass: 'sky',
          title: a.details || a.action,
          meta: a.userEmail || 'System',
          timestamp: new Date(a.occurredAt || Date.now()).getTime()
        }));
        this.activities.set(mapped);
        localStorage.setItem(this.KEY, JSON.stringify(mapped));
      },
      error: () => this.loadFromLocalStorage()
    });
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      try { this.activities.set(JSON.parse(saved)); } catch { this.activities.set([]); }
    } else {
      const seed: SystemActivity[] = [
        { id: 's1', type: 'project', icon: 'add_circle', iconClass: 'sky', title: 'System initialized', meta: 'Initial setup completed', timestamp: Date.now() - 3600000 }
      ];
      this.activities.set(seed);
      localStorage.setItem(this.KEY, JSON.stringify(seed));
    }
  }

  recordActivity(type: SystemActivity['type'], icon: string, iconClass: string, title: string, meta: string) {
    const item: SystemActivity = {
      id: Math.random().toString(36).slice(2, 9),
      type, icon, iconClass, title, meta,
      timestamp: Date.now()
    };
    const current = this.activities();
    const next = [item, ...current].slice(0, 20);
    this.activities.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    // Sync to backend
    this.http.post(`${API}/audit`, {
      action: icon,
      entityType: type,
      details: `${title} — ${meta}`
    }).subscribe({ error: () => {} });
  }
}
