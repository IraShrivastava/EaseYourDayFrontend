import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationStyleMetadata } from '@angular/animations';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  public countries = [];
  public countriesCode = [];
  public singleCountryCode: any;
  public countryCode: any;
  public countryName: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public mobileNumber: string;

  constructor(public appService: AppService, public _route: ActivatedRoute, public router: Router, private toastr: ToastrService) { }

  ngOnInit() {

    this.appService.getCountryNames().subscribe(
      (response) => {
        for (let i in response) {
          let singleCountry = {
            name: response[i],
            code: i
          }
          this.countries.push(singleCountry);

        }
        this.countries = this.countries.sort((first, second) => {
          return first.name.toUpperCase() < second.name.toUpperCase() ? -1 : (first.name.toUpperCase() > second.name.toUpperCase() ? 1 : 0);
        });//end sort
      }
    )

    this.appService.getCountryCodes()
      .subscribe((response) => {
        for (let i in response) {
          let singleCountryCode = {
            number: response[i],
            code: i
          }
          this.countriesCode.push(singleCountryCode);
        }
      })


  }

  public getCode = () => {
    for (let x of this.countriesCode) {
      if (this.countryCode === x['code']) {
        this.singleCountryCode = x['number']
      }
    }

    for (let y of this.countries) {
      if (this.countryCode === y['code']) {
        this.countryName = y['name']
      }
    }

    console.log(this.countryName)
  }

  public signupFunction: any = () => {
    if (!this.firstName) {
      this.toastr.info('Enter first name')
    } else if (!this.lastName) {
      this.toastr.info('Enter last name')
    } else if (!this.mobileNumber) {
      this.toastr.info('Enter mobile number')
    } else if (!this.password) {
      this.toastr.info('Enter password')
    } else {
      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNumber: `${this.singleCountryCode}${this.mobileNumber}`,
        email: this.email,
        password: this.password,
        country: this.countryName
      }

      this.appService.signUp(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success('SignUp Successfully');
            setTimeout(() => {
              this.router.navigate(['/'])
            }, 2000);
          } else {
            this.toastr.info(apiResponse.message);
          }
        }, (error) => {
          this.router.navigate(['/servererror'])
        })
    }
  }
}