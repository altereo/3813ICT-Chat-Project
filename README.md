# 3813ICTChat - S5293070
## Organization
The project was tracked via this git repository, with commits being regularly made upon the implementation of a new feature, or at the end of a work period. Branches were not utilised for this project, as it was decided that a project of this size would only be overcomplicated by the use of branches. The server and frontend code were both commited to this project, with the server code specifically residing in the `/server` directory.

## Data Structures
There are a variety of data structures utilised in the project, mainly on the frontend portion, as the backend was configured to provide JSON response and thus only utilised `status: string` consistently. All other data structures were defined in the frontend's `chat-api.service`.

### User
```
username: string | null;
email: string | null;
id: number; (9 digits)
roles: string[]; (Roles could be in the format 'SUPERADMIN' or '$ID::ADMIN', with $ID being the target group's ID.)
groups: number[];
valid: boolean
```

### Group
```
id: number;
name: string;
channels: Channel[]; (A list of channels in typed using the custom Channel type.)
users: number[]; (A list of user IDs)
joinRequests: number[]; (A list of user IDs)
creator: number; (A user ID)
```

### Channel
```
id: number;
name: string;
```

### Message
```
author: number; (user ID)
content: string;
date: number; (date in Epoch format.)
```

## Angular Architecture
- All API-related functions of the application, including custom types, URLs, and basic data processing/storage are placed in `chat-api.service`.
- The application possess two main routes: `/login` and `/home`.
- `/login` contains all logic for logging in or creating a new user, with both forms merged into a tabbed container constructed using `ng-bootstrap`.
- `/home` contains all logic for display groups and their channels, listing in a collapsible list constructed using `ng-bootstrap`.
- Clicking on a channel navigates to the `channel` route, which uses the `chat` component and is a subroute belonging to `/home`. The channel route takes a parameter in the format `$SERVER_ID::$CHANNEL_ID` and the last 50 messages sent to the channel.
- Modals and an Offcanvas from `ng-bootstrap` are used in the `/home` route in order to display group settings and create or join groups.

## Node/Express Server Architecture
- The main `app.js` file does not contain any routes, simply importing routes from external files.
- Each category of tasks is given its own file and path. For example, authentication related functions are placed in `auth.js` and are accessible via the `/api/auth` route. Any chat-related API methods are placed as sub-routes under `/api/chat`.
- Any methods related to the access and processing of stored information are delegated to the `interface.js` file, to simplify final implementation of a mongoDB database.

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
- `GET: /api/chat/group/messages`: Takes a `group` and `channel`, then returns the last 50 messages to be sent to that group's channel.
- `GET: /api/chat/users/username/:userID`: Takes a `userID` and returns that user's username.
- `GET: /api/chat/users/roles/:userID`: Takes a `userID` and returns that user's roles.
- `POST: /api/chat/messages/send`: Takes a `group`, `channel`, `executor`, and `message`, then sends that `message` to the `channel` as the corresponding `user`.
- `POST: /api/chat/group/user/promote`: Takes a `group`, `user`, `role` (USER, ADMIN, or SUPERADMIN), and `executor`, then sets that `user`'s permissions to that level, provided the `executor` has the requisite permissions.
  
## Interaction
All data will be fetched from the server via the previously described routes. The only exceptions will be new messages and events, such as group modifications, new users, etc. These functions require that the frontend respond without requiring a refresh, and as such will be delegated to a socket connection.
