import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { StudentsService } from './students.service';
import { Student } from './student';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  template: `
    <table mat-table [dataSource]="(students$ | async) ?? []" class="mat-elevation-z8">
      <!-- Position Column -->
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef> No. </th>
        <td mat-cell *matCellDef="let element"> {{element.id}} </td>
      </ng-container>

      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef> Name </th>
        <td mat-cell *matCellDef="let element"> {{element.name}} </td>
      </ng-container>

      <!-- Weight Column -->
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef> Email </th>
        <td mat-cell *matCellDef="let element"> {{element.email}} </td>
      </ng-container>

      <!-- Symbol Column -->
      <ng-container matColumnDef="major">
        <th mat-header-cell *matHeaderCellDef> Major </th>
        <td mat-cell *matCellDef="let element"> {{element.major}} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    table {
      width: 100%;
    }
  `]
})
export class StudentsComponent implements OnInit {
  students$!: Observable<Student[]>;
  displayedColumns: string[] = ['id', 'name', 'email', 'major'];

  constructor(private studentsService: StudentsService) { }

  ngOnInit() {
    this.students$ = this.studentsService.getStudents();
  }
}