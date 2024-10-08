export class User {
  constructor(
    // public id: string,
    // public email: string,
    private idToken:string,
    private refreshToken:string,
    private accessToken:string,
    private expiresIn:number,
    // private _token: string,
    private tokenExpirationDate: Date
  ) {}

  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    return this.idToken;
  }

  get tokenDuration() {
    if (!this.token) {
      return 0;
    }
    return this.tokenExpirationDate.getTime() - new Date().getTime();
  }
}
