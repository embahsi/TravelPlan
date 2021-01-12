import { Component, OnInit } from '@angular/core';
import { TripService } from 'src/app/shared/trip.service';
import { ToastrService } from 'ngx-toastr';
import { ContextService } from 'src/app/shared/context.service';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {

  constructor(public tripService: TripService, private toastr: ToastrService, public contextService: ContextService, public userService:UserService) { }
  submitText: string;

  ngOnInit(): void {
    this.tripService.formModel.get('Id').valueChanges.subscribe(id => {
        if (id == null)
          this.submitText = "Create Trip";
        else 
          this.submitText = "Edit Trip";
      });

    this.resetForm();
  }

  resetForm() {
      this.tripService.formModel.reset();
      Object.keys(this.tripService.formModel.controls).forEach(key => {
        this.tripService.formModel.controls[key].setErrors(null)
      });
      this.submitText = "Create Trip";
  }

  onSubmit() {
    if (this.tripService.formModel.value.Id == null)
      this.insertRecord();
    else
      this.updateRecord();
  }

  insertRecord()
  {
    this.tripService.postTrip().subscribe(
      res => {
        this.resetForm();
        this.toastr.success("Trip created successfully", "New Trip");
        this.tripService.refreshList();
      },
      err => {
        this.toastr.error(err.error.message, "Trip Creation Failed");
    });
  }

  updateRecord()
  {
    this.tripService.putTrip().subscribe(
      res => {
        this.resetForm();
        this.toastr.info("Changes saved successfully", "Trip Update");
        this.tripService.refreshList();
      },
      err => {
        this.toastr.error(err.error.message, "Trip Update Failed");
    });
  }

  compareUser(user1,user2): boolean {
    return user1 && user2 && (user1.Id === user2.Id);
  }

}
