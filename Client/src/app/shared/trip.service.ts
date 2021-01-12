import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { HttpClient } from '@angular/common/http';
import { ContextService } from './context.service';
import { ApplicationUser } from '../models/application-user.model';
import { formatDate } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  readonly BaseURI = 'http://localhost:11968/api';

  //public formData: Trip;
  public tripList = new BehaviorSubject<Trip[]>(undefined);
  public formModel = this.fb.group({
    Id: [],
    Destination: [, Validators.required],
    StartDate: [, Validators.required],
    EndDate: [, Validators.required],
    Comment: [],
    ApplicationUser: [new ApplicationUser()]
  });

  constructor(private fb:FormBuilder, private http : HttpClient, private contextService : ContextService, private toastr:ToastrService) { }

  postTrip() {
    var user;
    if(this.contextService.IsAdmin())
    {
      user = this.formModel.value.ApplicationUser;
    }
    else{
      user = new ApplicationUser();
      user.Id = this.contextService.getId();
    }
    this.formModel.patchValue({ApplicationUser: user});
    var trip = this.formToTrip();
    trip.Id = undefined;
    return this.http.post(this.BaseURI + '/Trip', trip);
  }

  putTrip() {
    return this.http.put(this.BaseURI + '/Trip/' + this.formModel.value.Id, this.formToTrip());
  }

  deleteTrip(id:number) {
    return this.http.delete(this.BaseURI + '/Trip/' + id);
  }

  refreshList(){
    return this.http.get(this.BaseURI + '/Trip')
    .toPromise()
    .then(
      res=>{this.tripList.next(res as Trip[])},
      err => {
        this.toastr.error(err.error.message, "Trip List can not be retrieved");
    });
  }

  formToTrip(): Trip
  {
    let trip = new Trip();
    trip.Id = this.formModel.value.Id;
    trip.Destination = this.formModel.value.Destination;
    trip.StartDate = this.formModel.value.StartDate;
    trip.EndDate = this.formModel.value.EndDate;
    trip.Comment = this.formModel.value.Comment;
    trip.ApplicationUser = this.formModel.value.ApplicationUser;
    
    return trip;
  }


}
