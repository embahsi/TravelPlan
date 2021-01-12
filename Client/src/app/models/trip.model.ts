import { ApplicationUser } from './application-user.model';

export class Trip {
    Id: number;
    Destination: string;
    StartDate: Date;
    EndDate: Date;
    Comment: string;
    ApplicationUser: ApplicationUser;
}
