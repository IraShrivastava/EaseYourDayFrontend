import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CookieService} from 'ngx-cookie-service'

import * as io from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class SocketService {

  //public baseUrl = "http://localhost:3000";
  public baseUrl = "http://apitodo.codervisions.in";
  public socket;

  constructor(private http: HttpClient) { 
    this.socket = io(this.baseUrl);
  }
  public verifyUser = ()=>{
    return Observable.create((observer)=>{
      this.socket.on('verifyUser', (data)=>{
        observer.next(data);
      })
    })
  }

  public onlineUserList =()=>{
    return Observable.create((observer)=>{
      this.socket.on('user-list', (userList)=>{
        observer.next(userList);
      })
    })
  }

  public disconnectSocket =()=>{
    return Observable.create((observer)=>{
      this.socket.on('disconnect', ()=>{
        observer.next();
      })
    })
  }

  public getUpdatesFromUser = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {  
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end getUpdatesFromUser

  public setUser =(authToken)=>{
    this.socket.emit('set-user', authToken)
  }


  public notifyUpdates = (data) => {
    this.socket.emit('notification', data);
  }

  public exitSocket = () =>{
    this.socket.disconnect();
  }// end exit socket
}
