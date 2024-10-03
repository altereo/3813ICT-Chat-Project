# 3813ICTChat - S5293070
## Organization
The project was tracked via this git repository, with commits being regularly made upon the implementation of a new feature, or at the end of a work period. Branches were not utilised for this project, as it was decided that a project of this size would only be overcomplicated by the use of branches. The server and frontend code were both commited to this project, with the server code specifically residing in the `/server` directory.

## Data Structures
There are a variety of data structures utilised in the project, mainly on the frontend portion, as the backend was configured to provide JSON response and thus only utilised `status: string` consistently. All other data structures were defined in the frontend's `chat-api.service` and `rtc-call.service`.

### User
Describes the data commonly associated with a user.
```
username: string | null;
email: string | null;
id: number; (9 digits)
roles: string[]; (Roles could be in the format 'SUPERADMIN' or '$ID::ADMIN', with $ID being the target group's ID.)
groups: number[];
valid: boolean
```

### Group
Describes the data commonly associated with a group.
```
id: number;
name: string;
channels: Channel[]; (A list of channels in typed using the custom Channel type.)
users: number[]; (A list of user IDs)
joinRequests: number[]; (A list of user IDs)
creator: number; (A user ID)
```

### Channel
Describes the data commonly associated with a channel.
```
id: number;
name: string;
```

### Message
Describes a singular message.
```
author: number; (user ID)
content: string;
date: number; (date in Epoch format.)
```

### RTCUser
Associates a user of the peerJS service with their chat-api user ID.
```
user: number; (user ID)
peer: string; (peer.js ID)
```

### RTCStream
Stores the peer.js stream associated with the user's ID and Peer ID.
```
id: number; (user ID)
peer: string; (peer.js ID)
stream: MediaStream; (Remote video stream)
```

### CameraState
Represents the state of the local camera/microphone stream.
```
video: boolean;
audio: boolean;
```

## Division of Responsibility
The client and server applications are structured such that minimal data processing is performed on the client side. This is to prevent inconsistencies from arising as a result of hardware or software differences, ensuring a consistent experience between browsers. For example, the storage, processing, and disemination of information is managed on the server application. Signals from the server application via socket connection then indicate to the client a change in data, which the client then fetches from the server. All server responses are in the form of a JSON object, with most routes responding with status 200 and an additional `status` property in the body containing either `OK` or `ERROR`. This is to ensure consistency with API responses and prevent any error behaviour inherent to Angular from interfering with the application.

## Angular Architecture
- All API-related functions of the application, including custom types, URLs, and basic data processing/storage are placed in `chat-api.service`.
- All video conferencing functions of the application are placed in `rtc-call.service`.
- The application possess three main routes: `/login`, `/home` and `/call`.
- `/login` contains all logic for logging in or creating a new user, with both forms merged into a tabbed container constructed using `ng-bootstrap`.
- `/home` contains all logic for display groups and their channels, listing in a collapsible list constructed using `ng-bootstrap`.
- `/call` contains the video conferencing functionality, and is accessible via a 'call' button on the channel interface.
- Clicking on a channel navigates to the `channel` route, which uses the `chat` component and is a subroute belonging to `/home`. The channel route takes a parameter in the format `$SERVER_ID::$CHANNEL_ID` and the last 50 messages sent to the channel. Scrolling up will cause the application to load more messages if they exist. This component also contains a button which navigates to `/call` and starts a video conference.
- Messages can be sent from the `channel` route, which sends new messages to the server via the socket connection.
- Modals and an Offcanvas from `ng-bootstrap` are used in the `/home` route in order to display group settings and create or join groups.

## Node/Express Server Architecture
- The main `app.js` file does not contain any routes, simply importing routes from external files.
- Uploaded images are accessible via the routes `/avatar` and `/uploads`, which host uploaded profile pictures and chat images respectively.
- Each category of tasks is given its own file and path. For example, authentication related functions are placed in `auth.js` and are accessible via the `/api/auth` route. Any chat-related API methods are placed as sub-routes under `/api/chat`.
- The `/api/upload` supports the upload of images for both chat and profile picture purposes. Multer and Sharp are used for the implementation of cropping and saving uploaded images in the `WebP` format.
- Persistent data, such as users, groups, channels, and messages, are stored in a MongoDB Database with the name `3813ICT-Chat`.
- The database contains 3 collections: `groups`, `messages`, and `users`.
- Any methods related to the access and processing of stored information are delegated to the `interface.js` file, this is in order to centralise Database access.
- Socket functionality is implemented in the `sockets.js` file, via `Socket.io`. It is used by the server application for notifying connected clients of realtime events, such as new messages, changes to groups, or changes to users.
- A PeerJS signaling server is implemented in `rtcserver.js`, to facilitate the association of Peer IDs with chat User IDs. This component also tracks the users in a given 'room', allowing for clients to submit and retrieve other peers in a video conference via routes under `/peerserv`.
- Messages are received from the client via the socket server, these are repeated to other connected clients.

### Routes
#### Auth
- `POST: /api/auth`: Takes a body containing an `email` and `password`, then verifies it against the data storage and returns a corresponding `User` object.
- `POST: /api/auth/create`: Takes a body containing a `username`, `email`, and `password`, then checks for duplicate emails and if OK, creates a new user.

#### Chat
- `GET: /api/chat/groups/:userID`: GETs a list of groups the user ID belongs to, in the form of group IDs.
- `GET: /api/chat/group/:groupID`: GETs the group ID's corresponding object.
- `POST: /api/chat/group/remove`: Takes a `user`, `group`, and `executor`, and removes the `user` from the `group`, provided the `executor` has the requisite permissions.
- `POST: /api/chat/group/rename`: Takes a `group`, `newName`, and `executor`, and renames the `group` provided the `executor` has the requisite permissions.
- `POST: /api/chat/group/modifyRequest`: Takes a `user`, `group`, `state`, and `executor`, then approves or rejects a `user`'s request to join a `group`, provided the `executor` has the requisite permissions.
- `POST: /api/chat/group/channels/create`: Takes a `group`, the new channel's `name`, and an `executor`, then creates a new channel for the given `group` provided the `executor` has the requisite permission.
- `POST: /api/chat/group/channels/delete`: Takes a `group`, `channel`, and `executor`, then deletes the `channel` from the `group`, provided the `executor` has the requisite permission.
- `POST: /api/chat/group/delete`: Takes a `group` and `executor`, then deletes the `group`, removing all joined users, provided the `executor` has the requisite permission.
- `POST: /api/chat/group/create`: Takes a `name` and `executor`, then creates a group with the `executor` as admin, provided the `executor` has the requisite permissions.
- `POST: /api/chat/group/request`: Takes a `code` (an 8 character long join code), and an `executor`, then adds the `executor` to the `joinRequests` of the `code`'s corresponding group.
- `GET: /api/chat/group/messages`: Takes a `group`, `channel` and `before`, then returns either the last 50 messages to be sent to that group's channel or the last 50 messages before a given timestamp.
- `GET: /api/chat/users/username/:userID`: Takes a `userID` and returns that user's username.
- `GET: /api/chat/users/roles/:userID`: Takes a `userID` and returns that user's roles.
- `GET: /api/chat/users/:userID`: Takes a `userID` and returns the corresponding user.
- `POST: /api/chat/group/user/promote`: Takes a `group`, `user`, `role` (USER, ADMIN, or SUPERADMIN), and `executor`, then sets that `user`'s permissions to that level, provided the `executor` has the requisite permissions.
- `POST: /api/chat/group/user/notify`: Takes a `group`, `channel`, and `user`, then caches these details to track the channel a given user is viewing.

#### Image (Upload)
- `POST: /api/upload/avatar`: Takes a `user` and `file` (in the form of a blob), then uploads it to the server for hosting, then stores the image's saved name in the `user`'s data as their profile picture.
- `POST: /api/upload/image`: Takes a `file` (in the form of a blob), then uploads it to the server for hosting, responding with its filename so that it can be attached to an outgoing message.

#### RTCServer
- `POST: /peerserv/associate`: Takes a `user`, `group`, `channel`, and `peer`, then caches the `user` and `peer` under the `channel` belonging to a given `group`, then responds with all other `user`:`peer` pairs in the given `channel`.
- `GET: /peerserv/peers/:group/:channel`: Takes a `group` and `channel`, the responds with all `user:peer` pairs within that channel.
  
## Interaction
All data will be fetched from the server via the previously described routes. The only exceptions will be new messages and events, such as group modifications, new users, etc. These functions require that the frontend respond without requiring a refresh, and as such have been delegated to a socket connection to the server. The server also hosts a PeerJS Signaling server, which enables peer to peer video communication and tracks the peers in a given call. The client does not re-fetch data except in the event of a refresh or an event via the socket connection. It is also the client's responsibility to indicate a data change via its socket connection. This allows for greater flexibility in the design of client-server interactions. Any data that may be updated without warning, such as user, group, or message data, is stored in their respective service as a `BehaviorSubject`. This acts as a multicast `Observable`, allowing for multiple components to subscribe to pertinent data in a simple manner.
