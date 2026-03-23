import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProjectsService } from './projects.service';
import { EmployeesService } from './employees.service';
import { NotificationService } from './notification.service';
import { ActivityService } from './activity.service';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8080/api';

export interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  seats: number;
}

export interface EventBooking {
  id: string;
  eventId: number;
  userId: number | null;
  name?: string;
  email?: string;
  profession?: string;
  date: string;
  status?: 'Pending' | 'In Progress' | 'Completed';
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly EVENTS_KEY = 'events.data';
  private readonly BOOKINGS_KEY = 'events.bookings';

  readonly events = signal<EventItem[]>([]);
  readonly bookings = signal<EventBooking[]>([]);

  constructor(
    private readonly auth: AuthService,
    private readonly projects: ProjectsService,
    private readonly employees: EmployeesService,
    private readonly notifications: NotificationService,
    private readonly activity: ActivityService,
    private readonly http: HttpClient
  ) {
    // Load events from localStorage (local seed)
    const existing = localStorage.getItem(this.EVENTS_KEY);
    if (existing) {
      this.events.set(JSON.parse(existing));
    } else {
      const seed: EventItem[] = [
        { id: 1, title: 'Tree Plantation Drive', date: '2025-11-05', location: 'Campus Grounds', seats: 25 },
        { id: 2, title: 'Blood Donation Camp', date: '2025-11-12', location: 'Main Hall', seats: 10 },
        { id: 3, title: 'Beach Cleanup', date: '2025-12-02', location: 'City Beach', seats: 5 },
      ];
      this.events.set(seed);
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(seed));
    }
    // Load bookings from backend
    this.loadBookingsFromBackend();
  }

  private loadBookingsFromBackend() {
    this.http.get<any[]>(`${API}/bookings`).subscribe({
      next: (list) => {
        if (!list) { this.loadBookingsFromLocalStorage(); return; }
        const bookings: EventBooking[] = list.map(b => ({
          id: b.id,
          eventId: b.eventId,
          userId: b.userId,
          name: b.name,
          email: b.email,
          profession: b.profession,
          date: b.bookedAt || b.createdAt,
          status: (b.status as any) || 'Pending'
        }));
        this.bookings.set(bookings);
        localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
      },
      error: () => this.loadBookingsFromLocalStorage()
    });
  }

  private loadBookingsFromLocalStorage() {
    const b = localStorage.getItem(this.BOOKINGS_KEY);
    this.bookings.set(b ? JSON.parse(b) : []);
  }

  list(): EventItem[] { return this.events(); }
  listBookings(): EventBooking[] { return this.bookings(); }

  book(eventId: number): { ok: boolean; message?: string } {
    const ev = this.events().find(e => e.id === eventId);
    if (!ev) return { ok: false, message: 'Event not found' };
    if (ev.seats <= 0) return { ok: false, message: 'No seats available' };
    const userId = this.auth.userId();
    const profile = this.auth.profile();

    let finalUserId = userId;
    if (profile) {
      const emp = this.employees.addOrGet({
        name: profile.name,
        email: profile.email,
        profession: profile.profession,
        role: this.auth.isVolunteer() ? 'Volunteer' : 'Employee'
      });
      finalUserId = emp.id;
    }

    const booking: EventBooking = {
      id: cryptoRandomId(),
      eventId: ev.id,
      userId: finalUserId,
      name: profile?.name,
      email: profile?.email,
      profession: profile?.profession,
      date: new Date().toISOString(),
      status: 'Pending'
    };

    // Decrement seats
    const nextEvents = this.events().map(e => e.id === ev.id ? { ...e, seats: e.seats - 1 } : e);
    this.events.set(nextEvents);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(nextEvents));

    const nextBookings = [booking, ...this.bookings()];
    this.bookings.set(nextBookings);
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(nextBookings));

    // Sync booking to backend
    this.http.post(`${API}/bookings`, {
      id: booking.id, eventId: booking.eventId, userId: booking.userId,
      name: booking.name, email: booking.email, profession: booking.profession,
      status: 'Pending', bookingType: 'Event',
      bookedAt: booking.date
    }).subscribe({ error: () => {} });

    this.activity.recordActivity('booking', 'event', 'sky', `Event "${ev.title}" booked`, `by ${profile?.name || 'User'}`);
    return { ok: true };
  }

  bookProject(projectId: number): { ok: boolean; message?: string } {
    const list = this.projects.list();
    const p = list.find(x => x.id === projectId);
    if (!p) return { ok: false, message: 'Project not found' };
    const seats = (p.seats ?? 0);
    if (seats <= 0) return { ok: false, message: 'No seats available' };
    this.projects.update(projectId, { seats: seats - 1 });

    const userId = this.auth.userId();
    const profile = this.auth.profile();
    let finalUserId = userId;
    if (profile) {
      const emp = this.employees.addOrGet({
        name: profile.name,
        email: profile.email,
        profession: profile.profession,
        role: this.auth.isVolunteer() ? 'Volunteer' : 'Employee'
      });
      this.employees.assign(emp.id, projectId);
      finalUserId = emp.id;
    }

    const booking: EventBooking = {
      id: cryptoRandomId(),
      eventId: projectId,
      userId: finalUserId,
      name: profile?.name,
      email: profile?.email,
      profession: profile?.profession,
      date: new Date().toISOString(),
      status: 'Pending'
    };

    const nextBookings = [booking, ...this.bookings()];
    this.bookings.set(nextBookings);
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(nextBookings));

    // Sync booking to backend
    this.http.post(`${API}/bookings`, {
      id: booking.id, eventId: booking.eventId, userId: booking.userId,
      name: booking.name, email: booking.email, profession: booking.profession,
      status: 'Pending', bookingType: 'Project',
      bookedAt: booking.date
    }).subscribe({ error: () => {} });

    const projectName = p.projectName ?? `#${projectId}`;
    this.notifications.push(`${profile?.name || 'User'} booked project "${projectName}"`);
    const roleLabel = this.auth.isVolunteer() ? 'Volunteer' : 'Employee';
    this.activity.recordActivity('booking', 'assignment', 'violet', `${roleLabel} ${profile?.name || 'User'} booked a project`, 'Awaiting alignment');
    return { ok: true };
  }
}

function cryptoRandomId() {
  try {
    const a = new Uint8Array(8);
    crypto.getRandomValues(a);
    return Array.from(a).map(x => x.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
