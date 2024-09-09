import { Injectable, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { io, Socket } from 'socket.io-client';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const BACKEND_URL = "http://127.0.0.1:3000";

// Type template for user object.
export type User = {
  username: string | null;
  email: string | null;
  id: number;
  roles: string[];
  groups: number[];
  image: string;
  valid: boolean;
}

// Type templates for channels and groups.
export type Channel = {
  id: number;
  name: string;
}

export type Group = {
  id: number;
  name: string;
  channels: Channel[];
  users: number[];
  joinRequests: number[];
  creator: number;
}

export type Message = {
  group: number;
  channel: number;
  id: number;
  text: string;
  author: User | null;
  image: string | null;
  date: number
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private isBrowser!: boolean;
  private socket: Socket | null = null;
  private readonly message$: BehaviorSubject<Message> = new BehaviorSubject<Message>({
    group: -1,
    channel: -1,
    id: -1,
    text: "",
    author: null,
    image: null,
    date: 0
  });

  private readonly user$: BehaviorSubject<User> = new BehaviorSubject<User>({
    username: null,
    email: null,
    id: -1,
    roles: [],
    groups: [],
    image: "",
    valid: false
  });

  private readonly groups$: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);
  private readonly groupUpdate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  // Initialise the socket connection.
  initSocket() {
    if (!this.isBrowser) return; // Prevent angular from hanging with SSR on.
    if (this.socket !== null) return;

    this.socket = io(BACKEND_URL);
    
    // Listeners.
    this.socket?.on('connect', () => {
      console.debug("Connected to socket server.");
      return;
    });

    this.socket?.on('disconnect', () => {
      console.debug("Disconnected from socket server.");
      return;
    });

    this.socket?.on('connect_error', (err) => {
      console.log("Failed to connect to socket server:", err);
      return;
    });

    this.socket?.on('message', (message: Message) => {
      this.message$.next(message);
      return;
    });

    this.socket?.on('group_change', (id: number) => {
      this.groupUpdate$.next(id || 0);
      return;
    });
    return;
  }

  generateID(length: number) {
    if (length < 1) return(-1);
    return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
  }

  // On message event.
  onMessage(): Observable<Message> {
    return(this.message$.asObservable());
  }

  // On group update event.
  onGroupChanged(): Observable<number> {
    return(this.groupUpdate$.asObservable());
  }

  announceGroupChange(): void {
    this.socket?.emit('group_change');
    return;
  }

  emitMessage(group: number, channel: number, author: number, text: string): void {
    if (text === "") return;

    this.socket?.emit('message', {
      group,
      channel,
      author,
      text,
      id: this.generateID(8),
      image: null
    });
    return;
  }

  // Store data in sessionStorage.
  private store(key: string, data: any) {
    if (key === "user") this.user$.next(data);
    if (key === "groups") this.groups$.next(data);

    if (!this.isBrowser) return(null);
    sessionStorage.setItem(key, JSON.stringify(data));
    return(true);
  }

  // Get user data from sessionStorage.
  getUser() {
    if (!this.isBrowser) return(null);

    let data = sessionStorage.getItem('user') || "{ \"valid\": false }";
    return(JSON.parse(data));
  }

  // Get chat title by server and channel ID from session storage.
  getChatTitle(groupID: number, channelID: number): string {
    if (!this.isBrowser) return("");

    let data: Group[] = JSON.parse(sessionStorage.getItem('groups') || "[]");
    let group = (data.find((group: Group) => group.id === groupID));
    let channel = group?.channels?.find((channel: Channel) => channel.id === channelID);
    
    if (!group?.name || !channel?.name) return("");
    return(`${group?.name} :: ${channel?.name}` || "");
  }

  getGroupsValue() {
    return(this.groups$.value);
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

  createAccount(username: string, email: string, password: string) {
    let body = {
      username,
      email,
      password
    };

    // Users of this method should subscribe to this,
    // then upon success, run the authorise method with the supplied
    // details.
    return(this.httpClient.post(`${BACKEND_URL}/api/auth/create`, body, httpOptions));
  }

  // Clear user data from session (logout).
  clearUser() {
    this.store("user", { "valid": false });
    this.store("groups", []);
    return;
  }

  // Get groups belonging to a given user.
  getGroups(userID: number) {
    this.httpClient.get(`${BACKEND_URL}/api/chat/groups/${userID}`, httpOptions).subscribe((data: any) => {
      if (data.status === "OK") {
        let groups = data.groups;
        this.store("groups", groups);

        return;
      }
    })
  }

  // Get details of a group, including available channels and name.
  getGroupDetails(groupID: number) {
    return(this.httpClient.get(`${BACKEND_URL}/api/chat/group/${groupID}`, httpOptions));
  }

  // Get messages in channel.
  getMessages(channelID: number) {
    return(this.httpClient.get(`${BACKEND_URL}/api/chat/messages/${channelID}`, httpOptions));
  }


  // Get username of user by id.
  getUsername(id: number) {
    return(this.httpClient.get(`${BACKEND_URL}/api/chat/users/username/${id}`, httpOptions));
  }

  // Get roles of user by id.
  getRoles(id: number) {
    return(this.httpClient.get(`${BACKEND_URL}/api/chat/users/roles/${id}`, httpOptions));
  }

  // Remove a user from a given server.
  removeUserFromServer(targetID: number, serverID: number, userID: number) {
    let body = {
      "user": targetID,
      "group": serverID,
      "executor": userID
    };
    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/remove`, body, httpOptions));
  }

  // Rename a given group.
  renameGroup(groupID: number, newName: string, userID: number) {
    let body = {
      "group": groupID,
      "newName": newName,
      "executor": userID
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/rename`, body, httpOptions));
  }

  // Approves or rejects join requests.
  approveRejectRequest(userID: number, groupID: number, state: boolean, executor: number) {
    let body = {
      "user": userID,
      "group": groupID,
      "state": state,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/modifyRequest`, body, httpOptions));
  }

  // Create a channel with name.
  requestCreateChannel(groupID: number, channelName: string, executor: number) {
    let body = {
      "group": groupID,
      "name": channelName,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/channels/create`, body, httpOptions));
  }

  // Delete a channel with ID.
  requestDeleteChannel(groupID: number, channelID: number, executor: number) {
    let body = {
      "group": groupID,
      "channel": channelID,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/channels/remove`, body, httpOptions));
  }

  requestDeleteGroup(groupID: number, executor: number) {
    let body = {
      "group": groupID,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/delete`, body, httpOptions));
  }

  requestJoinGroup(groupCode: string, executor: number) {
    let body = {
      "code": groupCode,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/request`, body, httpOptions));
  }

  requestCreateGroup(groupName: string, executor: number) {
    let body = {
      "name": groupName,
      "executor": executor
    };

    return(this.httpClient.post(`${BACKEND_URL}/api/chat/group/create`, body, httpOptions));
  }

  updateRoles(newRoles: string[]) {
    let newUser = this.getUser();
    newUser.roles = newRoles;
    this.store("user", newUser);
    return;
  }

  // Getters for any multicast observables we have.
  get user(): Observable<User> {
    return(this.user$.asObservable());
  }

  get groups(): Observable<Group[]> {
    return(this.groups$.asObservable());
  }

  synchroniseService() {
    this.store("user", this.getUser());
    return;
  }

  constructor(@Inject(PLATFORM_ID) private platformId:Object, private httpClient: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initSocket();
  }
}
