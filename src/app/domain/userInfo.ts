export class UserInfo {
  constructor() {
  }
}

export class Profile {
  picture: string | ArrayBuffer;
  position: string;
  affiliation: string;
  webpage: string;

  constructor() {
    this.picture = null
    this.position = null
    this.affiliation = null
    this.webpage = null
  }
}

export class UserActivity {
  sessionId: string;
  fullname: string;
  action: string;
  position: string;
  color: string;
  date: Date;
}
