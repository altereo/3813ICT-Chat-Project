import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'home', component: HomeComponent, children: [
		{ path: 'channel/:path', component: ChatComponent }
	]},

	{ path: '**', redirectTo: '/home' }		// The road home.
];
