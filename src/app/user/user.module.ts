import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
//import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

import { RouterModule, Route } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const routes = [
  {path: 'signup', component: SignUpComponent},
  {path:'forget-password', component:ForgetPasswordComponent},
  {path :'verify-email/:userId', component:VerifyEmailComponent},
  {path :'reset-password/:userId', component:ResetPasswordComponent}
  ]


@NgModule({
  declarations: [ForgetPasswordComponent, ResetPasswordComponent, SignUpComponent, VerifyEmailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
