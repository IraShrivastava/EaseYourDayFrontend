import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import{AuthGuard} from './auth.guard';
import { AddFriendComponent } from './add-friend/add-friend.component';
import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from './shared/shared.module';
import { SidebarModule, Sidebar } from 'ng-sidebar';

const routes: Routes = [
  {path: 'login', component: LoginComponent, pathMatch:'full'},
  {path:"", redirectTo:'login', pathMatch:'full'},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'servererror', component: ServerErrorComponent},
  {path: 'addFriend', component: AddFriendComponent, canActivate: [AuthGuard]},
  {path:'*', component:PageNotFoundComponent},
  {path:'**', component:PageNotFoundComponent}
];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    FormsModule,
    BrowserModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    SidebarModule.forRoot()
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }