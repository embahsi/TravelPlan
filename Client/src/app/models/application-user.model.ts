export class ApplicationUser {
    Id: string;
    UserName: string;
    Email: string;
    FirstName: string;
    LastName: string;
    Role: string;
    Password: string;
}

export class ApplicationUserCalc extends ApplicationUser {
    HasTrips: boolean;
}

