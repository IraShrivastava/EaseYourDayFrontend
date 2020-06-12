import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {AppService} from './app.service';
import {Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private appService: AppService,
    private router: Router,
    private toastr: ToastrService,
    ){
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(this.appService.isLoggedIn() !== null){
        return true;
      }else{
        this.toastr.info('Please Login to access this page')
        setTimeout(()=>{
          this.router.navigate(["/login"]);
          return false;
        },2000);
        
      }
  }
}