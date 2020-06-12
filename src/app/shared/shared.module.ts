import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstCharComponent } from './first-char/first-char.component';
import { FormsModule } from '@angular/forms';
//import { UserDetailsComponent } from './user-details/user-details.component';


@NgModule({
  declarations: [FirstCharComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    FirstCharComponent,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
