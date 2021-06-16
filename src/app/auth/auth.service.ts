import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userIsAuthenticated = true;
  private _userId = 'abc2';

  get userIsAuthenticated() {
    // eslint-disable-next-line no-underscore-dangle
    return this._userIsAuthenticated;
  }

  get userId() {
    // eslint-disable-next-line no-underscore-dangle
    return this._userId;
  }

  // Hello there

  constructor() {}

  login() {
    // eslint-disable-next-line no-underscore-dangle
    this._userIsAuthenticated = true;
  }

  logout() {
    // eslint-disable-next-line no-underscore-dangle
    this._userIsAuthenticated = false;
  }
}
