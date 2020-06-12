import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'
import { HttpXsrfCookieExtractor } from '@angular/common/esm2015/http/src/xsrf';
@Injectable({
  providedIn: 'root'
})
export class AppService {

  //public baseUrl = 'http://localhost:3000/api/v1/users'
  public baseUrl = 'http://apitodo.codervisions.in/api/v1/users'
  constructor(private cookieService: CookieService, private _http: HttpClient) { }

  public getUserInformationstorage=()=>{
    return (JSON.parse(localStorage.getItem('userInfo')));
   }
 
   public setUserInformationStorage=(data)=>{
     localStorage.setItem('userInfo', JSON.stringify(data))
   }

   public isLoggedIn() {
    return(this.getUserInformationstorage())
  }

   public signinFunction(data): Observable<any>{
    const params = new HttpParams()
    .set('email', data.email)
    .set('password', data.password)

    return this._http.post(`${this.baseUrl}/login`, params)
  }
  
  public getCountryNames(): Observable<any> {

    return this._http.get("./../assets/countryName.json");

  }//end getCountryNames

  public getCountryCodes(): Observable<any> {

    return this._http.get("./../assets/countryCode.json");
    
  }//end getCountryNumbers

  public signUp(data): Observable<any>{

    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('country',data.country)

    return this._http.post(`${this.baseUrl}/signup`, params);
  }//end signUp 

  public verifyEmail(userId): Observable<any>{
    const params = new HttpParams()
      .set('userId', userId)

      return this._http.post(`${this.baseUrl}/verifyEmail`, params)
  }

  public forgetPassword(email): Observable<any>{
    const params = new HttpParams()
      .set('email', email)
      return this._http.post(`${this.baseUrl}/forgetPassword`, params)
  }

  public resetPassword(data): Observable<any> {
    const params = new HttpParams()
      .set('userId', data.userId)
      .set('password', data.password)
      return this._http.post(`${this.baseUrl}/resetPassword`, params)
  }

  public logout(): Observable<any> {
    
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('userId', this.cookieService.get('userId'))

    return this._http.post(`${this.baseUrl}/logout`, params);

  }

  public getAllUsers(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))

     return this._http.get(`${this.baseUrl}/getAllUsers`, {params : params}) 
  }

  public sendRequestFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('senderId', this.cookieService.get('userId'))
      .set('senderName', this.cookieService.get('UserName'))
      .set('receiverId', data.receiverId)
      .set('receiverName', data.receiverName)
     
     return this._http.post(`${this.baseUrl}/sent-friend-request`, params) 
  }

  public getAllFriend(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('userId', this.cookieService.get('userId'))
     
      return this._http.get(`${this.baseUrl}/get-all-friends`, {params : params})
  }
  
  public getAllFilterUser(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('userIdArray', data.array)
      return this._http.get(`${this.baseUrl}/get-all-filter-users`, {params : params})
  }

  public cancelRequestFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('senderId', this.cookieService.get('userId'))
      .set('senderName', this.cookieService.get('UserName'))
      .set('receiverId', data.receiverId)
      .set('receiverName', data.receiverName)

     return this._http.post(`${this.baseUrl}/cancel-request`, params) 
  }

  public rejectRequestFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('receiverId', this.cookieService.get('userId'))
      .set('receiverName', this.cookieService.get('UserName'))
      .set('senderId', data.senderId)
      .set('senderName', data.senderName)

     return this._http.post(`${this.baseUrl}/reject-request`, params) 
  }

  public acceptRequestFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('receiverId', this.cookieService.get('userId'))
      .set('receiverName', this.cookieService.get('UserName'))
      .set('senderId', data.senderId)
      .set('senderName', data.senderName)

     return this._http.post(`${this.baseUrl}/accept-request`, params) 
  }

  public unFriendFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      .set('receiverId', this.cookieService.get('userId'))
      .set('receiverName', this.cookieService.get('UserName'))
      .set('senderId', data.friendId)
      .set('senderName', data.friendName)

     // console.log(this.cookieService.get('userId')+" "+this.cookieService.get('userId')+" "+this.cookieService.get('UserName')+" "+data.friendId+" "+data.friendName)

     return this._http.post(`${this.baseUrl}/un-friend`, params) 
  }

  public createListFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('userId', data.creatorId)
    .set('listName', data.listName)
    .set('creatorName', data.creatorName)
    .set('modifierName', data.modifierName)
    .set('modifierId', data.modifierId)
    .set('privacy', data.privacy)
    .set('listId', data.listId)

   return this._http.post(`${this.baseUrl}/create-list`, params) 
  }

  public getAllListFunction(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authtoken'))
      return this._http.get(`${this.baseUrl}/get-all-list`, {params : params})
  }

  public deleteListFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', data)
    return this._http.post(`${this.baseUrl}/delete-list`, params)
  }

  public editListFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('modifierName', data.modifierName)
    .set('modifierId', data.modifierId)
    .set('listName', data.listName)
    .set('listId', data.listId)
    return this._http.post(`${this.baseUrl}/edit-list`, params)
  }

  public getAllItem(listId): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', listId)
    return this._http.get(`${this.baseUrl}/get-all-items`, {params : params})
  }

  public addItems(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('itemName', data.itemName)
    .set('listId', data.listId)
    .set('itemId', data.itemId)
    return this._http.post(`${this.baseUrl}/add-item`, params)  

  }

  public addSubItems(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('subItemName', data.subItemName)
    .set('itemId', data.itemId)
    .set('subItemId', data.subItemId)
    return this._http.post(`${this.baseUrl}/add-sub-item`, params)

  }

  public editItem(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('itemName', data.itemName)
    .set('itemId', data.itemId)
    .set('done', data.done)
    return this._http.post(`${this.baseUrl}/edit-item`, params)

  }

  public deleteItemFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('itemId', data)
    return this._http.post(`${this.baseUrl}/delete-item`, params)
  }

  
  public editSubItem(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('subItemName', data.subItemName)
    .set('subItemId', data.subItemId)
    .set('subItemDone', data.subItemDone)
    .set('itemId', data.itemId)
    return this._http.post(`${this.baseUrl}/edit-sub-item`, params)

  }

  public deleteSubItemFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('itemId', data.itemId)
    .set('subItemId', data.subItemId)
    return this._http.post(`${this.baseUrl}/delete-sub-item`, params)
  }

  public getAllHistory(listId): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', listId)
    return this._http.get(`${this.baseUrl}/get-all-history`, {params : params})
  }

  public createHistoryFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', data.listId)
    .set('key', data.key)

    return this._http.post(`${this.baseUrl}/create-history`, params)
  }

  public updateHistoryFunction(listId): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', listId)

    return this._http.post(`${this.baseUrl}/update-history`, params)
  }

  public deleteHistoryFunction(listId): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('listId', listId)

    return this._http.post(`${this.baseUrl}/delete-history`, params)
  }

  public replaceItem(data): Observable<any> {
    const params = new HttpParams()
    .set('authToken', this.cookieService.get('authtoken'))
    .set('data', JSON.stringify(data))
    
    return this._http.post(`${this.baseUrl}/replace-item`, params)

  }
}
