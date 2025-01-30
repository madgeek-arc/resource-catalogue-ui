export class UserInfo {
  stakeholders: Stakeholder[];
  coordinators: Coordinator[];
  administrators: Administrator[];
  user: User;
  admin: boolean;

  constructor() {
    this.user = new User();
  }
}

export class UserGroup {
  id: string;
  name: string;
  type: string;
  members: string[];
  admins: string[];

  constructor() {
    this.name = null;
    this.type = null;
  }
}

export class Stakeholder extends UserGroup {
  associationMember: string;
  country: string;
  subType: string;
  mandated: boolean;

  constructor() {
    super();
    this.id = null;
    this.associationMember = null;
    this.mandated = false;
    this.country = null;
    this.subType = null;
  }

}

export class Coordinator extends UserGroup{}

export class Administrator extends UserGroup{}


export class User {
  sub: string;
  email: string;
  name: string;
  surname: string;
  fullname: string;
  policiesAccepted: PolicyAccepted[];
  profile: Profile;
  id: string

  constructor() {
    this.profile = new Profile();
  }
}

export class PolicyAccepted {
  id: string;
  time: number;
  acceptedDate: number;
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

export class GroupMembers {
  members: User[];
  admins: User[];
}

export class UserActivity {
  sessionId: string;
  fullname: string;
  action: string;
  position: string;
  color: string;
  date: Date;
}
