import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';
import { CallComponent } from './call/call.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'home', component: HomeComponent, children: [
		{ path: 'channel/:path', component: ChatComponent }
	]},
	{ path: 'call/:path', component: CallComponent },

	{ path: '**', redirectTo: '/home' }		// The road home.
];
