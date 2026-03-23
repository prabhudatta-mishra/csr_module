import { Injectable, signal } from '@angular/core';
import { Project, ProjectsService } from './projects.service';
import { ActivityService } from './activity.service';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8080/api';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  assignedProjectIds: number[];
  role?: 'Employee' | 'Volunteer';
  appliedProjects?: number[];
}

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly KEY = 'employees.data';
  private seq = 5;
  readonly employees = signal<Employee[]>([]);

  constructor(
    private readonly projects: ProjectsService,
    private readonly activity: ActivityService,
    private readonly http: HttpClient
  ) {
    // Load from backend first, fallback to localStorage cache
    this.loadFromBackend();
  }

  private loadFromBackend() {
    this.http.get<any[]>(`${API}/users`).subscribe({
      next: (users) => {
        if (!users || users.length === 0) {
          this.loadFromLocalStorage(); return;
        }
        // Map backend users to Employee shape
        const backendEmployees: Employee[] = users
          .filter(u => u.role !== 'Admin' && u.role !== 'admin')
          .map(u => {
            // Find existing cached employee to restore assignedProjectIds
            const cached = this.getCachedById(u.id) || this.getCachedByEmail(u.email);
            return {
              id: u.id,
              name: u.name || '',
              email: u.email || '',
              department: u.department || u.profession || 'General',
              role: (u.role === 'Volunteer' ? 'Volunteer' : 'Employee') as 'Employee' | 'Volunteer',
              assignedProjectIds: cached?.assignedProjectIds || [],
              appliedProjects: cached?.appliedProjects || []
            };
          });
        // Fetch assignments and merge
        this.http.get<{ userId: number; projectId: number }[]>(`${API}/assignments`).subscribe({
          next: (assignments) => {
            // Build map userId -> projectIds
            const map: Record<number, number[]> = {};
            for (const a of assignments) {
              if (!map[a.userId]) map[a.userId] = [];
              map[a.userId].push(a.projectId);
            }
            const merged = backendEmployees.map(e => ({
              ...e,
              assignedProjectIds: map[e.id] || e.assignedProjectIds || []
            }));
            this.seq = merged.reduce((m, e) => Math.max(m, e.id), this.seq);
            this.employees.set(merged);
            localStorage.setItem(this.KEY, JSON.stringify(merged));
          },
          error: () => {
            this.seq = backendEmployees.reduce((m, e) => Math.max(m, e.id), this.seq);
            this.employees.set(backendEmployees);
            localStorage.setItem(this.KEY, JSON.stringify(backendEmployees));
          }
        });
      },
      error: () => this.loadFromLocalStorage()
    });
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      const list = JSON.parse(saved) as Employee[];
      this.employees.set(list);
      this.seq = list.reduce((m, e) => Math.max(m, e.id), 0);
    } else {
      const seed: Employee[] = [
        { id: 1, name: 'Alice Johnson', email: 'alice@corp.com', department: 'Environment', assignedProjectIds: [1], role: 'Employee', appliedProjects: [] },
        { id: 2, name: 'Bob Singh', email: 'bob@corp.com', department: 'Education', assignedProjectIds: [2], role: 'Employee', appliedProjects: [] },
        { id: 3, name: 'Chitra Rao', email: 'chitra@corp.com', department: 'Healthcare', assignedProjectIds: [3], role: 'Employee', appliedProjects: [] },
        { id: 4, name: 'Daniel Kim', email: 'daniel@corp.com', department: 'Environment', assignedProjectIds: [], role: 'Employee', appliedProjects: [] },
        { id: 5, name: 'Eva Lopez', email: 'eva@corp.com', department: 'Education', assignedProjectIds: [], role: 'Employee', appliedProjects: [] },
        { id: 6, name: 'John Volunteer', email: 'volunteer@csr.com', department: 'Education', assignedProjectIds: [], role: 'Volunteer', appliedProjects: [] }
      ];
      this.employees.set(seed);
      localStorage.setItem(this.KEY, JSON.stringify(seed));
    }
  }

  private getCachedById(id: number): Employee | undefined {
    try {
      const saved = localStorage.getItem(this.KEY);
      if (!saved) return undefined;
      return (JSON.parse(saved) as Employee[]).find(e => e.id === id);
    } catch { return undefined; }
  }

  private getCachedByEmail(email: string): Employee | undefined {
    try {
      const saved = localStorage.getItem(this.KEY);
      if (!saved) return undefined;
      return (JSON.parse(saved) as Employee[]).find(e => e.email?.toLowerCase() === email?.toLowerCase());
    } catch { return undefined; }
  }

  private syncToBackend(emp: Employee) {
    this.http.post(`${API}/users/upsert`, {
      name: emp.name,
      email: emp.email,
      profession: emp.department,
      department: emp.department,
      role: emp.role || 'Employee'
    }).subscribe({ error: () => {} });
  }

  list(): Employee[] { return this.employees(); }

  addMany(newOnes: Omit<Employee, 'id' | 'assignedProjectIds'>[]) {
    const current = this.employees();
    const emails = new Set(current.map(e => e.email.toLowerCase()));
    const toAdd: Employee[] = [];
    for (const n of newOnes) {
      if (!n.email || emails.has(n.email.toLowerCase())) continue;
      const item: Employee = { id: ++this.seq, name: n.name, email: n.email, department: n.department || 'General', assignedProjectIds: [], role: n.role || 'Employee', appliedProjects: [] };
      emails.add(item.email.toLowerCase());
      toAdd.push(item);
    }
    if (toAdd.length) {
      const next = [...current, ...toAdd];
      this.employees.set(next);
      localStorage.setItem(this.KEY, JSON.stringify(next));
      toAdd.forEach(e => this.syncToBackend(e));
    }
    return toAdd.length;
  }

  addOrGet(profile: { name: string; email: string; profession?: string; department?: string; role?: 'Employee' | 'Volunteer' }): Employee {
    const list = this.employees();
    const found = list.find(e => e.email.toLowerCase() === (profile.email || '').toLowerCase());
    if (found) {
      const newRole = (profile.role || found.role || 'Employee');
      const standardizedRole = newRole.toLowerCase().includes('volunt') ? 'Volunteer' : 'Employee';
      const updated: Employee = {
        ...found,
        name: profile.name || found.name,
        department: (profile.department || profile.profession || found.department || 'General'),
        role: standardizedRole
      };
      if (updated.name !== found.name || updated.department !== found.department || updated.role !== found.role) {
        const next = list.map(e => e.id === updated.id ? updated : e);
        this.employees.set(next);
        localStorage.setItem(this.KEY, JSON.stringify(next));
        this.syncToBackend(updated);
      }
      return updated;
    }
    const item: Employee = { id: ++this.seq, name: profile.name || 'User', email: profile.email || `user${this.seq}@local`, department: profile.department || profile.profession || 'General', assignedProjectIds: [], role: profile.role || 'Employee', appliedProjects: [] };
    const next = [...list, item];
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    this.syncToBackend(item);
    const roleLabel = item.role === 'Volunteer' ? 'Volunteer' : 'Employee';
    this.activity.recordActivity(item.role === 'Volunteer' ? 'volunteer' : 'employee',
      item.role === 'Volunteer' ? 'person_add' : 'person',
      item.role === 'Volunteer' ? 'emerald' : 'sky',
      `${roleLabel} ${item.name} joined`,
      'Self-registration');
    return item;
  }

  assign(employeeId: number, projectId: number) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx < 0) return;
    const e = { ...list[idx] } as Employee;
    if (!e.assignedProjectIds) e.assignedProjectIds = [];
    const numId = Number(projectId);
    if (!e.assignedProjectIds.includes(numId)) e.assignedProjectIds = [...e.assignedProjectIds, numId];
    const next = [...list];
    next[idx] = e;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    // Sync assignment to backend
    this.http.post(`${API}/assignments`, { userId: employeeId, projectId: numId }).subscribe({ error: () => {} });
  }

  unassign(employeeId: number, projectId: number) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx < 0) return;
    const e = { ...list[idx] } as Employee;
    if (!e.assignedProjectIds) e.assignedProjectIds = [];
    const numProj = Number(projectId);
    e.assignedProjectIds = e.assignedProjectIds.filter(id => id !== numProj);
    const next = [...list];
    next[idx] = e;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    // Sync unassignment to backend
    this.http.delete(`${API}/assignments?userId=${employeeId}&projectId=${numProj}`).subscribe({ error: () => {} });
  }

  applyForProject(volunteerId: number, projectId: number) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === volunteerId);
    if (idx < 0) return;
    const e = { ...list[idx] } as Employee;
    if (!e.appliedProjects) e.appliedProjects = [];
    if (!e.appliedProjects.includes(projectId)) {
      e.appliedProjects = [...e.appliedProjects, projectId];
      const next = [...list];
      next[idx] = e;
      this.employees.set(next);
      localStorage.setItem(this.KEY, JSON.stringify(next));
      this.activity.recordActivity('booking', 'assignment', 'violet', `Volunteer applied for project #${projectId}`, 'Awaiting assignment');
    }
  }

  projectsFor(e: Employee): Project[] {
    const all = this.projects.list();
    const assigned = e.assignedProjectIds || [];
    return all.filter(p => assigned.includes(p.id));
  }

  update(id: number, patch: Partial<Employee>) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === id);
    if (idx < 0) return;
    const updated = { ...list[idx], ...patch } as Employee;
    const next = [...list];
    next[idx] = updated;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    this.syncToBackend(updated);
  }

  remove(employeeId: number) {
    const list = this.employees();
    const emp = list.find(e => e.id === employeeId);
    const next = list.filter(e => e.id !== employeeId);
    if (next.length === list.length) return;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    if (emp?.email) {
      this.http.delete(`${API}/users/by-email?email=${encodeURIComponent(emp.email)}`).subscribe({ error: () => {} });
    }
  }
}
