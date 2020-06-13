import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from './../app.service';
import { SocketService } from './../socket.service'
import ShortUniqueId from 'short-unique-id';
//import { AddFriendComponent } from './../add-friend/add-friend.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public userName: String
  public firstChar: String
  public _opened: boolean = false;
  public _friends: boolean = false;
  public listName: String
  public listArray = []
  public friendsListArray = []
  public friendsId = []
  public subs
  public list
  public selectedListName: String
  public allList
  public currentList = []
  public toggle = false
  public friendtoggle = false
  public inputToggle = false
  public itemName: String
  public itemArray = []
  public subItemName: String
  public getAllItems
  public uid = new ShortUniqueId();
  public allHistory
  public selectedListId: String



  //
  public checkVal;
  //

  constructor(private toastr: ToastrService, public appService: AppService, public router: Router, private cookieService: CookieService, public socketService: SocketService) { }

  ngOnInit() {
    this.userName = this.cookieService.get('UserName')
    this.firstChar = this.userName[0];


    this.appService.getAllFriend().subscribe(
      (response) => {

        let friends = []
        if (response.data !== null) {
          for (let user of response.data) {
            user.friends.map(friend => friends.push(friend))
          }
        }
        for (let friend of friends) {
          this.friendsId.push(friend.friendId)
        }
      }
    )

    this.subs = this.socketService.getUpdatesFromUser(this.cookieService.get('userId')).subscribe((data) => {
      this.toastr.info(data.message);
      this.getUpdatedList()
      this.getAllItem(this.selectedListId)
      this.getAllHistory(this.selectedListId)


    });
    this.verifyUserConfirmation()
    this.getUpdatedList()


  }

  public notifyUpdatesToUser: any = (data) => {
    this.socketService.notifyUpdates(data);
  }

  public verifyUserConfirmation = () => {
    this.socketService.verifyUser()
      .subscribe((data) => {
        this.socketService.setUser(this.cookieService.get('authtoken'));
      },
        (err) => {
          this.toastr.error(err, "Some error occured");
        });//end subscribe
  }

  public getOnlineUserList = () => {
    this.socketService.onlineUserList()
      .subscribe((response) => {
        if (response.status !== 200) {
          this.toastr.warning(response.message)
        }
      },
        (error) => {
          this.router.navigate(['/servererror'])
        })
  }

  public onClick = () => {
    this.toastr.success(`${this.userName} to Ease Your Day`, "Welcome!")
  }

  public logOut = () => {
    this.appService.logout()
      .subscribe(() => {
        this.cookieService.delete('authtoken')
        this.cookieService.delete('userId')
        this.cookieService.delete('UserName')
        localStorage.clear()
        this.router.navigate(['/'])
      })
  }

  public _toggleSidebar() {
    this._opened = !this._opened;
  }

  public _friendsToggleSidebar() {
    this._friends = !this._friends;
  }

  public getUpdatedList() {

    this.appService.getAllListFunction().subscribe(
      (response) => {

        this.allList = response.data
        let lists = []
        let freindsList = []

        if (response.data !== null) {
          response.data.forEach(list => {
            if (list.creatorId === this.cookieService.get('userId') && list.privacy === true) {
              lists.push(list)
            }
            if (list.creatorId === this.cookieService.get('userId') && list.privacy === false) {
              freindsList.push(list)
            }
            this.friendsId.forEach(id => {
              if (id === list.creatorId && list.privacy === false) {
                freindsList.push(list)
              }
            })
          });
          this.listArray = lists
          this.friendsListArray = freindsList
        }
        if (this.currentList.length !== 0) {
          this.friendsListArray.forEach((list) => {
            if (this.currentList[0].listId === list.listId) {
              if (this.currentList[0].listName !== list.listName)
                this.currentList[0].listName = list.listName
            }
          })
        }
      }
    )


  }

  public createList(privacy) {
    if (!this.listName) {
      this.toastr.info('Please Enter List Name')
    } else {
      let data = {
        listId: this.uid.randomUUID(8),
        listName: this.listName,
        creatorId: this.cookieService.get('userId'),
        creatorName: this.cookieService.get('UserName'),
        modifierName: this.cookieService.get('UserName'),
        modifierId: this.cookieService.get('userId'),
        privacy: privacy,
        key: "List Added"
      }
      this.appService.createListFunction(data).subscribe(
        (response) => {
          if (response.status === 200) {
            this.toastr.success(response.message)
            this.getUpdatedList()
            this.listName = ""
            if (privacy === false) {

              let notifcationData = {
                message: `A ${data.listName} List has been added by ${this.cookieService.get('UserName')} in Friends List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);
            }

          } else {
            this.toastr.error(response.message)

          }
        },
        (error) => {
          this.router.navigate(['/servererror'])
        }
      )
      this.appService.createHistoryFunction(data).subscribe(
        (response) => {
          if (response.status !== 200) {
            this.toastr.warning(response.message)
          }
        },
        (error) => {
          this.router.navigate(['/servererror'])
        }
      )
    }
  }

  public deleteList(gotList) {

    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test1 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          this.appService.deleteListFunction(gotList.listId).subscribe(
            (response) => {
              if (response.status === 200) {
                this.toastr.success(response.message)
                this.listArray.forEach((list, index, object) => {
                  if (list.listId === gotList.listId) {
                    object.splice(index, 1)
                  }
                })
                this.friendsListArray.forEach((list, index, object) => {
                  if (list.listId === gotList.listId) {
                    object.splice(index, 1)
                  }
                })
              } else {
                this.toastr.info(response.message)
              }
            }
          )

          this.appService.deleteHistoryFunction(gotList.listId).subscribe(
            (response) => {
              if (response.status !== 200) {
                this.toastr.warning(response.message)
              }
            },
            (error) => {
              this.router.navigate(['/servererror'])
            }
          )
          if (gotList.privacy === false) {
            let notifcationData = {
              message: `A ${gotList.listName} List has been deleted by ${this.cookieService.get('UserName')} from Friends List.`,
              userId: this.friendsId
            }
            this.notifyUpdatesToUser(notifcationData);
          }
          this.toggle = false
        }
      })
    }
    else {
      this.appService.deleteListFunction(gotList.listId).subscribe(
        (response) => {
          if (response.status === 200) {
            this.toastr.success(response.message)
            this.listArray.forEach((list, index, object) => {
              if (list.listId === gotList.listId) {
                object.splice(index, 1)
              }
            })
            this.friendsListArray.forEach((list, index, object) => {
              if (list.listId === gotList.listId) {
                object.splice(index, 1)
              }
            })
            
          } else {
            this.toastr.info(response.message)
          }
        }
      )

      this.appService.deleteHistoryFunction(gotList.listId).subscribe(
        (response) => {
          if (response.status !== 200) {
            this.toastr.warning(response.message)
          }
        },
        (error) => {
          this.router.navigate(['/servererror'])
        }
      )
      if (gotList.privacy === false) {
        let notifcationData = {
          message: `A ${gotList.listName} List has been deleted by ${this.cookieService.get('UserName')} from Friends List.`,
          userId: this.friendsId
        }
        this.notifyUpdatesToUser(notifcationData);
      }
      this.toggle = false
    }
  }

  public editListName(event, editedListName, gotList) {
    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test2 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          if (event.keyCode === 13) {
            if (!editedListName) {
              this.toastr.info('Please Enter List Name')
            } else {
              let data = {
                listId: gotList.listId,
                listName: editedListName,
                modifierName: this.cookieService.get('UserName'),
                modifierId: this.cookieService.get('userId')
              }
              this.appService.editListFunction(data).subscribe(
                (response) => {
                  this.toastr.success(response.message)
                  this.getUpdatedList()

                }
              )
              if (this.currentList.length !== 0) {
                if (this.currentList[0].listId === gotList.listId) {
                  this.currentList[0].listName = editedListName;
                }
              }
              if (gotList.privacy === false) {
                let notifcationData = {
                  message: `A ${gotList.listName} List has been Changed by ${this.cookieService.get('UserName')} to ${editedListName} in Friends List.`,
                  userId: this.friendsId
                }
                this.notifyUpdatesToUser(notifcationData);
              }
            }
          }
        }
      })
    }
    else {
      if (event.keyCode === 13) {
        if (!editedListName) {
          this.toastr.info('Please Enter List Name')
        } else {
          let data = {
            listId: gotList.listId,
            listName: editedListName,
            modifierName: this.cookieService.get('UserName'),
            modifierId: this.cookieService.get('userId')
          }
          this.appService.editListFunction(data).subscribe(
            (response) => {
              this.toastr.success(response.message)
              this.getUpdatedList()
            }
          )
          if (this.currentList.length !== 0) {
            if (this.currentList[0].listId === gotList.listId) {
              this.currentList[0].listName = editedListName;
            }
          }
          if (gotList.privacy === false) {
            let notifcationData = {
              message: `A ${gotList.listName} List has been Changed by ${this.cookieService.get('UserName')} to ${editedListName} in Friends List.`,
              userId: this.friendsId
            }
            this.notifyUpdatesToUser(notifcationData);
          }
        }
      }
    }
  }

  public getAllHistory(listId) {
    this.appService.getAllHistory(listId).subscribe(
      (response) => {
        if (response.data !== null) {
          for (let x of response.data) {
            this.allHistory = x.itemDetails
          }
          this.allHistory.reverse()
        }
      },
      (error) => {
        this.router.navigate(['/servererror'])
      }
    )
  }

  public getAllItem(listId) {
    this.itemArray = []
    this.appService.getAllItem(listId).subscribe(
      (response) => {
        if (response.data !== null) {
          response.data.forEach(item => {
            if (listId === item.listId) {
              this.itemArray.push(item)
            }
          });
        }
      }
    )

  }

  public chooseList(listId) {
    for (let selectList of this.allList) {
      if (listId === selectList.listId) {
        this.currentList = [selectList]
      }
    }
    this.getAllItem(listId)
    if(this.currentList[0].privacy === true)
    {
      this._toggleSidebar()
      this.toggle = true
    }
    if(this.currentList[0].privacy === false)
    {
      this._friendsToggleSidebar()
      this.friendtoggle = true
    }
    
    this.getAllHistory(listId)
    this.selectedListId = listId

  }

  public addItem(list) {
    if (!this.itemName) {
      this.toastr.info('Please Enter item Name')
    } else {
      if (list.privacy === false && (this.cookieService.get('userId') !== list.creatorId)) {

        this.appService.getAllFriend().subscribe((response) => {
          let friendsidlist;
          let check;
          for (let i = 0; i < response.data.length; i++) {
            friendsidlist = response.data[i].friends
          }
          var test = friendsidlist.filter(function (frnd) {
            check = friendsidlist.find(id => id.friendId === list.creatorId)
          })
          if (check === undefined)
            this.router.navigate(['/*'])
          else {
            let option = {
              key: "Item Added",
              listId: list.listId
            }
            this.appService.createHistoryFunction(option).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
            let data = {
              listId: list.listId,
              itemName: this.itemName,
              itemId: this.uid.randomUUID(8)
            }
            //
            this.inputToggle = false
            //
            this.appService.addItems(data).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.router.navigate(['/*'])
                }
                else if (response.status === 200) {
                  this.toastr.success(response.message)
                  for (let item of response.data) {
                    this.itemArray.push(item)
                  }
                  this.itemName = ''
                  this.getAllHistory(list.listId)
                } else {
                  this.router.navigate(['/*'])
                }
              }
            )
            if (list.privacy === false) {
              let notifcationData = {
                message: `A ${data.itemName} Item has been added by ${this.cookieService.get('UserName')} in ${list.listName} List.`,
                userId: this.friendsId,
                listId: list.listId
              }
              this.notifyUpdatesToUser(notifcationData);
            }
          }
        })
      }
      else {
        //
        let option = {
          key: "Item Added",
          listId: list.listId
        }
        this.appService.createHistoryFunction(option).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
        let data = {
          listId: list.listId,
          itemName: this.itemName,
          itemId: this.uid.randomUUID(8)
        }
        //
        this.inputToggle = false
        //
        this.appService.addItems(data).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.router.navigate(['/*'])
            }
            else if (response.status === 200) {
              this.toastr.success(response.message)
              for (let item of response.data) {
                this.itemArray.push(item)
              }
              this.itemName = ''
              this.getAllHistory(list.listId)
            } else {
              this.router.navigate(['/*'])
            }
          }
        )
        if (list.privacy === false) {
          let notifcationData = {
            message: `A ${data.itemName} Item has been added by ${this.cookieService.get('UserName')} in ${list.listName} List.`,
            userId: this.friendsId,
            listId: list.listId
          }
          this.notifyUpdatesToUser(notifcationData);
        }
      }
    }
  }

  public addSubItem(item, itemId, gotList?) {
    if (!this.subItemName) {
      this.toastr.info('Please Enter Sub Item Name')
    }
    else {
      if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
        this.appService.getAllFriend().subscribe((response) => {
          let friendsidlist;
          let check;
          for (let i = 0; i < response.data.length; i++) {
            friendsidlist = response.data[i].friends
          }
          var test3 = friendsidlist.filter(function (frnd) {
            check = friendsidlist.find(id => id.friendId === gotList.creatorId)
          })
          if (check === undefined)
            this.router.navigate(['/*'])
          else {
            let option = {
              key: "Sub Item Added",
              listId: gotList.listId
            }
            this.appService.createHistoryFunction(option).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
            let data = {
              itemId: itemId,
              subItemName: this.subItemName,
              subItemId: this.uid.randomUUID(8),
              subItemDone: false,
            }
            this.appService.addSubItems(data).subscribe(
              (response) => {
                this.toastr.success(response.message)
                for (let item of this.itemArray) {
                  if (itemId === item.itemId) {
                    item.subItems.push(data)
                  }
                }
                this.subItemName = ''
                this.getAllHistory(gotList.listId)
              }
            )
            if (gotList.privacy === false) {
              let notifcationData = {
                message: `A ${data.subItemName} Sub Item has been added by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);
            }
            item.id = false;
          }
        })
      }
      else {
        let option = {
          key: "Sub Item Added",
          listId: gotList.listId
        }
        this.appService.createHistoryFunction(option).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
        let data = {
          itemId: itemId,
          subItemName: this.subItemName,
          subItemId: this.uid.randomUUID(8),
          subItemDone: false,
        }
        this.appService.addSubItems(data).subscribe(
          (response) => {
            this.toastr.success(response.message)
            for (let item of this.itemArray) {
              if (itemId === item.itemId) {
                item.subItems.push(data)
              }
            }
            this.subItemName = ''
            this.getAllHistory(gotList.listId)
          }
        )
        if (gotList.privacy === false) {
          let notifcationData = {
            message: `A ${data.subItemName} Sub Item has been added by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
            userId: this.friendsId
          }
          this.notifyUpdatesToUser(notifcationData);
        }
        item.id = false;
      }
    }
  }

  public editItem(event, item, done, gotList) {
    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test3 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          if (event) {
            let option = {
              key: "Item Edited",
              listId: item.listId
            }
            this.appService.createHistoryFunction(option).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
            if (!item.itemName) {
              this.toastr.info('Please Enter Item Name')
            } else {
              let data = {
                itemId: item.itemId,
                itemName: item.itemName,
                done: done
              }
              this.appService.editItem(data).subscribe(
                (response) => {
                  this.toastr.success(response.message)
                }
              )

              item.a = false
              this.getAllHistory(item.listId)
            }
            if (gotList.privacy === false) {
              let notifcationData = {
                message: `A ${item.itemName}  Item has been Changed by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);
            }
          }
        }
      })
    }
    else {
      if (event) {
        let option = {
          key: "Item Edited",
          listId: item.listId
        }
        this.appService.createHistoryFunction(option).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
        if (!item.itemName) {
          this.toastr.info('Please Enter Item Name')
        } else {
          let data = {
            itemId: item.itemId,
            itemName: item.itemName,
            done: done
          }
          this.appService.editItem(data).subscribe(
            (response) => {
              this.toastr.success(response.message)
            }
          )

          item.a = false
          this.getAllHistory(item.listId)
        }
        if (gotList.privacy === false) {
          let notifcationData = {
            message: `A ${item.itemName}  Item has been Changed by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
            userId: this.friendsId
          }
          this.notifyUpdatesToUser(notifcationData);
        }
      }
    }
  }

  public deleteItem(item, gotList?) {
    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test3 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          if (gotList) {
            let option = {
              key: "Item Deleted",
              listId: gotList.listId
            }
            this.appService.createHistoryFunction(option).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
          }
          this.appService.deleteItemFunction(item.itemId).subscribe(
            (response) => {
              if (response.status === 200) {
                this.toastr.info(response.message)
                this.itemArray.forEach((Item, index, object) => {
                  if (item.itemId === Item.itemId) {
                    object.splice(index, 1)

                  }
                })
              } else {
                this.toastr.warning(response.message)
              }
              this.getAllHistory(this.selectedListId)
            }
          )
          if (gotList) {
            if (gotList.privacy === false) {
              let notifcationData = {
                message: `A ${item.itemName}  Item has been Deleted by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);
            }
          }
        }
      })
    }
    else {
      if (gotList) {
        let option = {
          key: "Item Deleted",
          listId: gotList.listId
        }
        this.appService.createHistoryFunction(option).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
      }
      this.appService.deleteItemFunction(item.itemId).subscribe(
        (response) => {
          if (response.status === 200) {
            this.toastr.info(response.message)
            this.itemArray.forEach((Item, index, object) => {
              if (item.itemId === Item.itemId) {
                object.splice(index, 1)

              }
            })
          } else {
            this.toastr.warning(response.message)
          }
          this.getAllHistory(this.selectedListId)
        }
      )
      if (gotList) {
        if (gotList.privacy === false) {
          let notifcationData = {
            message: `A ${item.itemName}  Item has been Deleted by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
            userId: this.friendsId
          }
          this.notifyUpdatesToUser(notifcationData);
        }
      }
    }
  }

  public editSubItem(event, subItem, itemId, done, gotList?) {
    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test3 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          if (event) {
            let option = {
              key: "Sub Item Edited",
              listId: this.selectedListId
            }
            this.appService.createHistoryFunction(option).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
            if (!subItem.subItemName) {
              this.toastr.info('Please Enter Item Name')
            } else {
              let data = {
                subItemId: subItem.subItemId,
                subItemName: subItem.subItemName,
                subItemDone: done,
                itemId: itemId
              }
              this.appService.editSubItem(data).subscribe(
                (response) => {
                  this.toastr.success(response.message)
                }
              )
              subItem.a = false
              this.getAllHistory(this.selectedListId)
            }

            if (gotList.privacy === false) {
              let notifcationData = {
                message: `A ${subItem.subItemName} Sub Item has been Changed by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);
            }
          }
        }
      })

    }
    else {
      if (event) {
        let option = {
          key: "Sub Item Edited",
          listId: this.selectedListId
        }
        this.appService.createHistoryFunction(option).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
        if (!subItem.subItemName) {
          this.toastr.info('Please Enter Item Name')
        } else {
          let data = {
            subItemId: subItem.subItemId,
            subItemName: subItem.subItemName,
            subItemDone: done,
            itemId: itemId
          }
          this.appService.editSubItem(data).subscribe(
            (response) => {
              this.toastr.success(response.message)
            }
          )
          subItem.a = false
          this.getAllHistory(this.selectedListId)
        }

        if (gotList.privacy === false) {
          let notifcationData = {
            message: `A ${subItem.subItemName} Sub Item has been Changed by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
            userId: this.friendsId
          }
          this.notifyUpdatesToUser(notifcationData);
        }
      }
    }
  }

  public deleteSubItem(subItem, itemId, gotList?) {
    if (gotList.privacy === false && (this.cookieService.get('userId') !== gotList.creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        var test3 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === gotList.creatorId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          let option = {
            key: "Sub Item Added",
            listId: this.selectedListId
          }
          this.appService.createHistoryFunction(option).subscribe(
            (response) => {
              if (response.status !== 200) {
                this.toastr.warning(response.message)
              }
            },
            (error) => {
              this.router.navigate(['/servererror'])
            }
          )
          let data = {
            itemId: itemId,
            subItemId: subItem.subItemId
          }
          this.appService.deleteSubItemFunction(data).subscribe(
            (response) => {
              if (response.status === 200) {
                this.toastr.info(response.message)
                this.itemArray.forEach((item) => {
                  item.subItems.forEach((Item, index, object) => {
                    if (Item.subItemId === subItem.subItemId) {
                      object.splice(index, 1)
                    }
                  })
                })
              } else {
                this.toastr.warning(response.message)
              }
              this.getAllHistory(this.selectedListId)
            }
          )
          if (gotList.privacy === false) {
            let notifcationData = {
              message: `A ${subItem.subItemName} Sub Item has been Deleted by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
              userId: this.friendsId
            }
            this.notifyUpdatesToUser(notifcationData);
          }
        }
      })
    }
    else {
      let option = {
        key: "Sub Item Added",
        listId: this.selectedListId
      }
      this.appService.createHistoryFunction(option).subscribe(
        (response) => {
          if (response.status !== 200) {
            this.toastr.warning(response.message)
          }
        },
        (error) => {
          this.router.navigate(['/servererror'])
        }
      )
      let data = {
        itemId: itemId,
        subItemId: subItem.subItemId
      }
      this.appService.deleteSubItemFunction(data).subscribe(
        (response) => {
          if (response.status === 200) {
            this.toastr.info(response.message)
            this.itemArray.forEach((item) => {
              item.subItems.forEach((Item, index, object) => {
                if (Item.subItemId === subItem.subItemId) {
                  object.splice(index, 1)
                }
              })
            })
          } else {
            this.toastr.warning(response.message)
          }
          this.getAllHistory(this.selectedListId)
        }
      )
      if (gotList.privacy === false) {
        let notifcationData = {
          message: `A ${subItem.subItemName} Sub Item has been Deleted by ${this.cookieService.get('UserName')} in ${gotList.listName} List.`,
          userId: this.friendsId
        }
        this.notifyUpdatesToUser(notifcationData);
      }
    }
  }

  public undoFunction(listId) {
    if (this.currentList[0].privacy === false && (this.cookieService.get('userId') !== this.currentList[0].creatorId)) {
      this.appService.getAllFriend().subscribe((response) => {
        let friendsidlist;
        let check;
        for (let i = 0; i < response.data.length; i++) {
          friendsidlist = response.data[i].friends
        }
        let cId = this.currentList[0].creatorId
        var test3 = friendsidlist.filter(function (frnd) {
          check = friendsidlist.find(id => id.friendId === cId)
        })
        if (check === undefined)
          this.router.navigate(['/*'])
        else {
          let tempHistory = this.allHistory[0]
          let props = ['itemId', 'listId', 'itemName', 'createdOn', 'subItems']
          //
          if (tempHistory.key === "Item Added") {
            let result = this.itemArray.filter((oldItem) => {
              return !tempHistory.itemsArray.some((newItem) => {
                return oldItem.itemId === newItem.itemId;
              });
            }).map((item) => {
              return props.reduce((newOne, itemId) => {
                newOne[itemId] = item[itemId];
                return newOne;
              }, {});
            });
            for (let item of result) {
              this.deleteItem(item, this.currentList)
            }
          }

          if (tempHistory.key === "Item Deleted") {
            let newResult = tempHistory.itemsArray.filter((oldItem) => {
              return !this.itemArray.some((newItem) => {
                return oldItem.itemId === newItem.itemId;
              });
            }).map((item) => {
              return props.reduce((newOne, itemId) => {
                newOne[itemId] = item[itemId];
                return newOne;
              }, {});
            });
            for (let item of newResult) {
              let data = {
                listId: item['listId'],
                itemName: item['itemName'],
                itemId: item['itemId']
              }
              this.appService.addItems(data).subscribe(
                (response) => {
                  this.toastr.success(response.message)
                }

              )
              this.getAllHistory(item['listId'])
            }
          }
          this.itemArray = this.allHistory[0].itemsArray
          for (let items of this.itemArray) {
            let data = {
              listId: listId,
              itemId: items.itemId,
              itemName: items.itemName,
              done: items.done,
              subItems: items.subItems,
              createdOn: items.createdOn
            }
            this.appService.replaceItem(data).subscribe(
              (response) => {
                if (response.status !== 200) {
                  this.toastr.warning(response.message)
                }
              },
              (error) => {
                this.router.navigate(['/servererror'])
              }
            )
          }

          this.appService.updateHistoryFunction(listId).subscribe(
            (response) => {
              if (response.status !== 200) {
                this.toastr.warning(response.message)
              }
            },
            (error) => {
              this.router.navigate(['/servererror'])
            }
          )
          this.getAllHistory(listId)
          this.getAllItem(listId)
          for (let list of this.currentList) {
            if (list.privacy === false) {

              let notifcationData = {
                message: `A Undo has been done by ${this.cookieService.get('UserName')} in ${list.listName} List.`,
                userId: this.friendsId
              }
              this.notifyUpdatesToUser(notifcationData);

            }
          }
        }
      })
    }
    else {
      let tempHistory = this.allHistory[0]
      let props = ['itemId', 'listId', 'itemName', 'createdOn', 'subItems']
      //
      if (tempHistory.key === "Item Added") {
        let result = this.itemArray.filter((oldItem) => {
          return !tempHistory.itemsArray.some((newItem) => {
            return oldItem.itemId === newItem.itemId;
          });
        }).map((item) => {
          return props.reduce((newOne, itemId) => {
            newOne[itemId] = item[itemId];
            return newOne;
          }, {});
        });
        for (let item of result) {
          this.deleteItem(item, this.currentList)
        }
      }

      if (tempHistory.key === "Item Deleted") {
        let newResult = tempHistory.itemsArray.filter((oldItem) => {
          return !this.itemArray.some((newItem) => {
            return oldItem.itemId === newItem.itemId;
          });
        }).map((item) => {
          return props.reduce((newOne, itemId) => {
            newOne[itemId] = item[itemId];
            return newOne;
          }, {});
        });
        for (let item of newResult) {
          let data = {
            listId: item['listId'],
            itemName: item['itemName'],
            itemId: item['itemId']
          }
          this.appService.addItems(data).subscribe(
            (response) => {
              this.toastr.success(response.message)
            }

          )
          this.getAllHistory(item['listId'])
        }
      }
      this.itemArray = this.allHistory[0].itemsArray
      for (let items of this.itemArray) {
        let data = {
          listId: listId,
          itemId: items.itemId,
          itemName: items.itemName,
          done: items.done,
          subItems: items.subItems,
          createdOn: items.createdOn
        }
        this.appService.replaceItem(data).subscribe(
          (response) => {
            if (response.status !== 200) {
              this.toastr.warning(response.message)
            }
          },
          (error) => {
            this.router.navigate(['/servererror'])
          }
        )
      }

      this.appService.updateHistoryFunction(listId).subscribe(
        (response) => {
          if (response.status !== 200) {
            this.toastr.warning(response.message)
          }
        },
        (error) => {
          this.router.navigate(['/servererror'])
        }
      )
      this.getAllHistory(listId)
      this.getAllItem(listId)
      for (let list of this.currentList) {
        if (list.privacy === false) {

          let notifcationData = {
            message: `A Undo has been done by ${this.cookieService.get('UserName')} in ${list.listName} List.`,
            userId: this.friendsId
          }
          this.notifyUpdatesToUser(notifcationData);

        }
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'z' || event.metaKey && event.key == 'z') {
      this.undoFunction(this.selectedListId);
    }

  }//end

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

}
