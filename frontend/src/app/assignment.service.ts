import { Injectable, signal } from '@angular/core';

export interface Assignment {
  id: string;
  volunteerId: number;
  volunteerName: string;
  employeeIds: number[];
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly KEY = 'csr.assignments';
  readonly assignments = signal<Assignment[]>([]);

  constructor() {
    const saved = localStorage.getItem(this.KEY);
    this.assignments.set(saved ? JSON.parse(saved) : []);
  }

  private save(list: Assignment[]) {
    this.assignments.set(list);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }

  /** Admin: assign a volunteer to a list of employees */
  assign(volunteerId: number, volunteerName: string, employeeIds: number[]): Assignment {
    const list = this.assignments();
    // Remove volunteer from any existing assignment first
    const withoutOld = list.filter(a => a.volunteerId !== volunteerId);
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      volunteerId,
      volunteerName,
      employeeIds
    };
    this.save([...withoutOld, newAssignment]);
    return newAssignment;
  }

  /** Admin: update employee list for a volunteer */
  update(volunteerId: number, employeeIds: number[]) {
    const list = this.assignments().map(a =>
      a.volunteerId === volunteerId ? { ...a, employeeIds } : a
    );
    this.save(list);
  }

  /** Admin: remove volunteer's assignment entirely */
  remove(volunteerId: number) {
    this.save(this.assignments().filter(a => a.volunteerId !== volunteerId));
  }

  /** Volunteer: get their assignment */
  getByVolunteer(volunteerId: number): Assignment | undefined {
    return this.assignments().find(a => a.volunteerId === volunteerId);
  }

  /** Employee: get who is assigned to them */
  getVolunteerForEmployee(employeeId: number): Assignment | undefined {
    return this.assignments().find(a => a.employeeIds.includes(employeeId));
  }

  listAll(): Assignment[] { return this.assignments(); }
}
