//import { Component, OnInit, OnDestroy } from '@angular/core';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../app.service';
import { SocketService } from '../socket.service'
//import { SharedModule } from '../shared/shared.module'
import { FirstCharComponent } from './../shared/first-char/first-char.component'
@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.css']
})
export class AddFriendComponent implements OnInit, OnChanges, OnDestroy {


  /** */
  @Input() name: string;
  @Input() userBg: string;
  @Input() userColor: string;

  
  public firstChar: string;
  private _name:string = '';

  @Output()
  notify: EventEmitter<String> = new EventEmitter<String>();
  /** */


  public userId = this.cookieService.get('userId')
  public allUsers = []
  public allFilteredUser = []
  public allRequestReceived = []
  public allRequestSent = []
  public allFriends = []
  public subs

  constructor(private toastr: ToastrService, public appService: AppService, public router: Router, private cookieService: CookieService, public socketService: SocketService) { }

  ngOnInit() {
    this.verifyUserConfirmation()
    this.getAllUpadateDetails()
    this.subs = this.socketService.getUpdatesFromUser(this.userId).subscribe((data) => {
      this.toastr.info(data.message);
      this.getAllUpadateDetails();
    });

    /** */
   // this._name = this.name;
    //this.firstChar = this._name[0];
    /** */
  }

  /** */
  ngOnChanges(changes: SimpleChanges){
    let name  = changes.name;
    this._name = name.currentValue;
    this.firstChar = this._name[0];
  }


  nameClicked(){
    this.notify.emit(this._name);
  }

  /** */

  
  public verifyUserConfirmation = () => {
    this.socketService.verifyUser()
      .subscribe((data) => {
        this.socketService.setUser(this.cookieService.get('authtoken'));//in reply to verify user emitting set-user event with authToken as parameter.
      },
        (err) => {
          this.toastr.error(err, "Some error occured");
        });
  }
  public getAllUpadateDetails() {

    this.appService.getAllFriend().subscribe(
      (response) => {

        let requestReceived = []
        let requestSent = []
        let friends = []
        if (response.data !== null) {
          for (let user of response.data) {
            user.requestReceived.map(reqReceived => requestReceived.push(reqReceived))
            user.requestSent.map(reqSent => requestSent.push(reqSent))
            user.friends.map(friend => friends.push(friend))
          }
          this.allRequestReceived = requestReceived
          this.allRequestSent = requestSent
          this.allFriends = friends
        }
        let userIds = []
        for (let user of this.allRequestReceived) {
          userIds.push(user.senderId)
        }
        for (let user of friends) {
          userIds.push(user.friendId)
        }
        let data = {
          array: userIds
        }
        this.appService.getAllFilterUser(data).subscribe(
          (response) => {
            let id = this.userId
            this.allFilteredUser = response.data
            this.allFilteredUser.forEach(function (user, index, object) {
              if (user.userId === id) {
                object.splice(index, 1)
              }
            })
            this.allFilteredUser.forEach(user => this.allRequestSent.forEach(
              req => {
                if (user.userId === req.receiverId) {
                  user.id = true
                }
              }
            ))
          }
        )
      }
    )

  }
  public notifyUpdatesToUser: any = (data) => {
    this.socketService.notifyUpdates(data);
  }
  public sendRequest(receiverId, receiverName) {

    let data = {
      receiverId: receiverId,
      receiverName: receiverName
    }
    this.appService.sendRequestFunction(data).subscribe(
      (response) => {
        if (response.status === 200) {
          this.toastr.success(response.message)
          this.getAllUpadateDetails()

          let notifcationData = {
            message: `${this.cookieService.get('UserName')} has sent you a friend request.`,
            userId: data.receiverId
          }
          this.notifyUpdatesToUser(notifcationData);
        } else {
          this.toastr.info(response.message)
        }
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )

  }
  public cancelRequest(receiverId, receiverName) {
    let data = {
      receiverId: receiverId,
      receiverName: receiverName
    }

    this.appService.cancelRequestFunction(data).subscribe(
      (response) => {
        if (response.status === 200) {
          this.toastr.info(response.message)
          this.getAllUpadateDetails()

          let notifcationData = {
            message: `${this.cookieService.get('UserName')} has Cancelled the friend request.`,
            userId: data.receiverId
          }
          this.notifyUpdatesToUser(notifcationData);
        } else {
          this.toastr.warning(response.message)
        }
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )
  }
  public rejectRequest(senderId, senderName) {
    let data = {
      senderId: senderId,
      senderName: senderName
    }

    this.appService.rejectRequestFunction(data).subscribe(

      (response) => {
        if (response.status === 200) {
          this.toastr.info(response.message)
          this.getAllUpadateDetails()
          let notifcationData = {
            message: `${this.cookieService.get('UserName')} has rejected your friend request.`,
            userId: data.senderId
          }

          this.notifyUpdatesToUser(notifcationData);
        } else {

          this.toastr.warning(response.message)
        }
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )
  }
  public acceptRequest(senderId, senderName) {
    let data = {
      senderId: senderId,
      senderName: senderName
    }

    this.appService.acceptRequestFunction(data).subscribe(
      (response) => {
        if (response.status === 200) {
          this.toastr.info(response.message)
          this.getAllUpadateDetails()
          let notifcationData = {
            message: `${this.cookieService.get('UserName')} has Accepted your friend request.`,
            userId: data.senderId
          }

          this.notifyUpdatesToUser(notifcationData);
        } else {

          this.toastr.warning(response.message)
        }
        console.log(this.allFriends)
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )
  }
  public unfriend(friendId, friendName) {
    let data = {
      friendId: friendId,
      friendName: friendName
    }

    this.appService.unFriendFunction(data).subscribe(
      (response) => {
        if (response.status === 200) {
          this.toastr.info(response.message)
          this.getAllUpadateDetails()

          let notifcationData = {
            message: `You are no more friend with ${this.cookieService.get('UserName')}.`,
            userId: data.friendId
          }
          this.notifyUpdatesToUser(notifcationData);
        } else {

          this.toastr.warning(response.message)
        }
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }


}
