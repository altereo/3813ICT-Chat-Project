import { of, Observable } from 'rxjs';

export class MockChatApiService {
	authorise() {
		return;
	}

	createAccount(): Observable<any> {
		let response = {
			status: "ERROR",
			message: "Service mocked."
		};

		return of(response);
	}

	isLoggedIn(): boolean {
		return(false);
	}

	onMessage(): Observable<any> {
		return of({});
	}

	onChannelChanged(): Observable<any> {
		return of(0);
	}

	onCallChanged(): Observable<any> {
		return of(0);
	}

	getUser(): any {
		return({
			username: null,
			email: null,
			id: -1,
			roles: [],
			groups: [],
			image: "",
			valid: false
		});
	}

	get user(): Observable<any> {
		let response = {
			username: null,
			email: null,
			id: -1,
			roles: [],
			groups: [],
			image: "",
			valid: true
		}

		return of(response);
	}

	get groups(): Observable<any> {
		return of([]);
	}
}