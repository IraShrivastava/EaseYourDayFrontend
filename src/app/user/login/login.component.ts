import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { CookieService} from 'ngx-cookie-service';
import { AppService} from './../../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: any;
  public password: any;

  constructor(private cookieService : CookieService, private toastr: ToastrService, public appService : AppService, public router: Router) { }

  ngOnInit(){

    let token=this.cookieService.get('authtoken')
      console.log("authtoken "+token)
    if(token === null)
      this.router.navigate(['/login']);
    else
      this.router.navigate(['/dashboard']);
   }

  public signinFunction: any =()=>{
    if (!this.email){
      this.toastr.warning('Please Enter Email')
    } else if (!this.password){
      this.toastr.warning('Please Enter Password')
    } else {
      let data = {
        email: this.email,
        password: this.password
      }
      this.appService.signinFunction(data)
      .subscribe(
        (apiResponse)=>{
        if(apiResponse.status===200){
          console.log(apiResponse.data)
          this.cookieService.set('authtoken', apiResponse.data.authToken);
          this.cookieService.set('userId', apiResponse.data.userDetails.userId);
          this.cookieService.set('UserName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);
          this.appService.setUserInformationStorage(apiResponse.data)
          this.router.navigate(['/dashboard'])
        } else{
          this.toastr.info(apiResponse.message)
        }
      },
      (error)=>{
        this.router.navigate(['/servererror']);
      }
      
      )
    }
  }

}
