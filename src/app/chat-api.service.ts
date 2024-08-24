import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const BACKEND_URL = "http://127.0.0.1:3000";

export type User = {
  username: string | null;
  email: string | null;
  id: number;
  roles: string[];
  groups: number[];
  valid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private isBrowser!: boolean;
  private readonly user$: BehaviorSubject<User> = new BehaviorSubject<User>({
    username: null,
    email: null,
    id: -1,
    roles: [],
    groups: [],
    valid: false
  });

  // Store data in sessionStorage.
  private store(key: string, data: any) {
    this.user$.next(data);

    if (!this.isBrowser) return(null);
    sessionStorage.setItem('user', JSON.stringify(data));
    return(true);
  }

  // Get user data from sessionStorage.
  getUser() {
    if (!this.isBrowser) return(null);

    let data = sessionStorage.getItem('user') || "{ \"valid\": false }";
    return(JSON.parse(data));
  }

  // Return boolean if user is 'logged in'.
  isLoggedIn(): boolean {
    let data = this.getUser();
    return(data && data["valid"]);
  }

  // Authorise the user with the given credentials.
  authorise(email: string, password: string) {
    let body = {
      "email": email,
      "password": password
    }

    this.httpClient.post(`${BACKEND_URL}/api/auth`, body, httpOptions)
    .subscribe((data: any) => {
      if (data.status === "OK" && data.user.valid) {
        this.store("user", data.user);
      } else {
        this.store("user", { "valid": false });
      }
    });
  }

  // Clear user data from session (logout).
  clearUser() {
    this.store("user", { "valid": false });
    return;
  }

  // Get groups belonging to a given user.
  getGroups(userID: number) {
    return(this.httpClient.get(`${BACKEND_URL}/groups/${userID}`, httpOptions));
  }

  // Get details of a group, including available channels and name.
  getGroupDetails(groupID: number) {
    return(this.httpClient.get(`${BACKEND_URL}/group/${groupID}`, httpOptions));
  }

  // Get messages in channel.
  getMessages(channelID: number) {
    return(this.httpClient.get(`${BACKEND_URL}/messages/${channelID}`, httpOptions));
  }


  get user(): Observable<User> {
    return(this.user$.asObservable());
  }

  constructor(@Inject(PLATFORM_ID) private platformId:Object, private httpClient: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
}
