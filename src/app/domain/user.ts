/**
 * Created by stefania on 8/30/16.
 */
export class User {
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    joinDate: Date;
    affiliation: string;
    roles: [string];
    // constructor(
    //     public id?: number,
    //     public name: string,
    //     public surname: string,
    //     public username: string,
    //     public email: string,
    //     public password: string,
    //     public joinDate: Date,
    //     public affiliation?: string
    // ) {  }
}