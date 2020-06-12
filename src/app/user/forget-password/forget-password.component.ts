import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  constructor( public appService: AppService, public _route: ActivatedRoute, public router: Router, private toastr: ToastrService) { }

  public email : string;
  ngOnInit() {}

  public resetPassword = () =>{
    console.log(this.email+'here')
    if(!this.email){
      
      this.toastr.warning("Please provide registered email address", "Warning!");
    } else {
      
      this.appService.forgetPassword(this.email).subscribe(
        (response)=>{
          
          if(response['status'] === 200){
            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.messsage)
          }
        },
        (error)=>{
          this.router.navigate(['/servererror'])
        }
      )
    }
  }

}
