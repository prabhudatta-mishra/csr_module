import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'auth.loggedIn';
  readonly loggedIn = signal<boolean>(false);
  readonly userId = signal<number | null>(null);
  readonly role = signal<'admin' | 'employee' | 'volunteer' | null>(null);
  readonly profile = signal<{ name: string; email: string; profession: string } | null>(null);
  readonly verified = signal<boolean>(false);

  constructor() {
    this.loggedIn.set(localStorage.getItem(this.key) === '1');
    const uid = localStorage.getItem('auth.userId');
    const role = localStorage.getItem('auth.role') as 'admin' | 'employee' | 'volunteer' | null;
    this.userId.set(uid ? Number(uid) : null);
    this.role.set(role ?? null);
    this.verified.set(localStorage.getItem('auth.verified') === '1');
    try {
      const raw = localStorage.getItem('auth.profile');
      this.profile.set(raw ? JSON.parse(raw) : null);
    } catch { this.profile.set(null); }
  }

  async login(
    username: string,
    password: string,
    role?: 'admin' | 'employee' | 'volunteer',
    profile?: { name: string; email: string; profession: string }
  ): Promise<boolean> {
    const ok = !!username && !!password;
    if (!ok) return false;
    
    if (role === 'admin') {
      this.loggedIn.set(true);
      localStorage.setItem(this.key, '1');
      this.userId.set(0);
      this.role.set('admin');
      localStorage.setItem('auth.userId', '0');
      localStorage.setItem('auth.role', 'admin');
      return true;
    }
    
    try {
      if (profile) { // Sign up
        const signres = await fetch('http://localhost:8080/api/users/upsert', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             username, password, name: profile.name, email: profile.email, 
             profession: profile.profession, role: role === 'volunteer' ? 'Volunteer' : 'Employee' 
          })
        });
        if (!signres.ok) return false;
      }
      
      // Perform login
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password, role })
      });
      if (!res.ok) return false;
      
      const user = await res.json();
      this.loggedIn.set(true);
      localStorage.setItem(this.key, '1');
      const assignedRole = role ?? 'employee';
      const assignedUserId = user.id || (assignedRole === 'volunteer' ? 999 : 1);
      this.userId.set(assignedUserId);
      this.role.set(assignedRole);
      localStorage.setItem('auth.userId', String(assignedUserId));
      localStorage.setItem('auth.role', assignedRole);
      
      this.profile.set({ name: user.name, email: user.email, profession: user.profession });
      localStorage.setItem('auth.profile', JSON.stringify(this.profile()));
      this.verified.set(true);
      localStorage.setItem('auth.verified', '1');
      
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  loginWithEmail(profile: { name?: string; email: string; profession?: string }) {
    this.loggedIn.set(true);
    localStorage.setItem(this.key, '1');
    this.userId.set(1);
    this.role.set('employee');
    localStorage.setItem('auth.userId', '1');
    localStorage.setItem('auth.role', 'employee');
    this.profile.set({ name: profile.name || '', email: profile.email, profession: profile.profession || '' });
    localStorage.setItem('auth.profile', JSON.stringify(this.profile()));
    this.verified.set(true);
    localStorage.setItem('auth.verified', '1');
  }

  logout() {
    this.loggedIn.set(false);
    this.userId.set(null);
    this.role.set(null);
    this.profile.set(null);
    this.verified.set(false);
    localStorage.removeItem(this.key);
    localStorage.removeItem('auth.userId');
    localStorage.removeItem('auth.role');
    localStorage.removeItem('auth.profile');
    localStorage.removeItem('auth.verified');
  }

  isAdmin() { return this.role() === 'admin'; }
  isEmployee() { return this.role() === 'employee'; }
  isVolunteer() { return this.role() === 'volunteer'; }
  isVerified() { return this.verified(); }
}
