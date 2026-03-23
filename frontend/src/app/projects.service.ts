import { Injectable, signal } from '@angular/core';
import { ActivityService } from './activity.service';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8080/api';

export type ProjectStatus = 'Planned' | 'Ongoing' | 'Completed';
export interface Project {
  id: number;
  projectName: string;
  department: string;
  budget: number;
  usedBudget?: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  seats?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly KEY = 'projects.data';
  private seq = 3;
  readonly projects = signal<Project[]>([]);

  constructor(private readonly activity: ActivityService, private readonly http: HttpClient) {
    this.loadFromBackend();
  }

  private loadFromBackend() {
    this.http.get<any[]>(`${API}/projects`).subscribe({
      next: (list) => {
        if (!list || list.length === 0) { this.loadFromLocalStorage(); return; }
        const projects: Project[] = list.map(p => ({
          id: p.id,
          projectName: p.projectName || '',
          department: p.department || 'General',
          budget: p.budget || 0,
          usedBudget: p.usedBudget || 0,
          startDate: p.startDate || '',
          endDate: p.endDate || '',
          status: (p.status as ProjectStatus) || 'Planned',
          description: p.description || '',
          location: p.location || '',
          latitude: p.latitude,
          longitude: p.longitude,
          seats: p.seats ?? 0
        }));
        this.seq = projects.reduce((m, p) => Math.max(m, p.id), 0);
        this.projects.set(projects);
        localStorage.setItem(this.KEY, JSON.stringify(projects));
      },
      error: () => this.loadFromLocalStorage()
    });
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      const list = JSON.parse(saved) as Project[];
      this.projects.set(list);
      this.seq = list.reduce((m, p) => Math.max(m, p.id), 0);
    } else {
      const seed: Project[] = [
        { id: 1, projectName: 'Tree Plantation Drive', department: 'Environment', budget: 500000, usedBudget: 120000, startDate: '2025-01-10', endDate: '2025-12-20', status: 'Ongoing', description: 'City-wide plantation of saplings.', location: 'City Park', latitude: 19.0760, longitude: 72.8777, seats: 25 },
        { id: 2, projectName: 'School Education Program', department: 'Education', budget: 800000, usedBudget: 300000, startDate: '2025-02-01', endDate: '2025-10-30', status: 'Planned', description: 'After-school coaching for underserved communities.', location: 'Community School', latitude: 28.6139, longitude: 77.2090, seats: 10 },
        { id: 3, projectName: 'Health Camp', department: 'Healthcare', budget: 300000, usedBudget: 50000, startDate: '2025-03-15', endDate: '2025-07-15', status: 'Completed', description: 'Free medical checkups and medicines.', location: 'Town Hall', latitude: 13.0827, longitude: 80.2707, seats: 0 }
      ];
      this.projects.set(seed);
      localStorage.setItem(this.KEY, JSON.stringify(seed));
      // Seed backend too if empty
      seed.forEach(p => this.http.post(`${API}/projects`, p).subscribe({ error: () => {} }));
    }
  }

  list(): Project[] { return this.projects(); }

  add(p: Omit<Project, 'id'>): Project {
    const tempId = ++this.seq;
    const item: Project = { id: tempId, ...p };
    // Save to backend and get real ID
    this.http.post<any>(`${API}/projects`, { ...p }).subscribe({
      next: (saved) => {
        const realId = saved.id;
        const list = this.projects();
        const updated = list.map(x => x.id === tempId ? { ...x, id: realId } : x);
        this.seq = Math.max(this.seq, realId);
        this.projects.set(updated);
        localStorage.setItem(this.KEY, JSON.stringify(updated));
      },
      error: () => {}
    });
    const next = [...this.projects(), item];
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    this.activity.recordActivity('project', 'add_circle', 'sky', `New project "${item.projectName}" created`, 'by Admin');
    return item;
  }

  update(id: number, patch: Partial<Project>): Project | undefined {
    const list = this.projects();
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return undefined;
    const updated = { ...list[idx], ...patch } as Project;
    const next = [...list];
    next[idx] = updated;
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    // Sync to backend
    this.http.put(`${API}/projects/${id}`, patch).subscribe({ error: () => {} });
    if (patch.status) {
      this.activity.recordActivity('project', 'assignment_turned_in', 'violet', `Project "${updated.projectName}" marked ${patch.status}`, 'Status updated by Admin');
    } else if (patch.budget) {
      this.activity.recordActivity('budget', 'currency_rupee', 'amber', `Budget allocation ₹${patch.budget.toLocaleString()} updated`, `for ${updated.department} dept`);
    }
    return updated;
  }

  remove(id: number) {
    const list = this.projects();
    const item = list.find(x => x.id === id);
    if (!item) return;
    const next = list.filter(x => x.id !== id);
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    this.http.delete(`${API}/projects/${id}`).subscribe({ error: () => {} });
    this.activity.recordActivity('project', 'delete_outline', 'rose', `Project "${item.projectName}" deleted`, 'by Admin');
  }
}
