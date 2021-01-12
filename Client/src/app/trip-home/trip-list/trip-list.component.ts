import { Component, OnInit } from '@angular/core';
import { TripService } from 'src/app/shared/trip.service';
import { Trip } from 'src/app/models/trip.model';
import { ToastrService } from 'ngx-toastr';
import { ContextService } from 'src/app/shared/context.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  public filteredTripList: Trip[];
  public destionationFilter = "";
  public commentFilter = "";
  public startDateFilter: Date;
  public endDateFilter: Date;
  public displayedColumns: string[] = ['Destination', 'StartDate', 'EndDate', 'Comment'];


  constructor(public tripService: TripService, private toastr: ToastrService, private contextService: ContextService) { }

  ngOnInit(): void {
    this.tripService.refreshList();
    this.tripService.tripList.subscribe((tList) => {
      this.filteredTripList = tList;
    });

    if(this.contextService.IsAdmin())
      this.displayedColumns.push('UserName');

    this.displayedColumns.push('Actions');
  }

  filter() {
    this.filteredTripList = this.tripService.tripList.getValue().filter(x => {
      var curStartDate: Date = new Date(x.StartDate);
      var endStartDate: Date = new Date(x.EndDate);
      return x.Destination.toLowerCase().includes(this.destionationFilter.toLowerCase()) 
        && x.Comment.toLowerCase().includes(this.commentFilter.toLowerCase())
        && (!this.startDateFilter || this.startDateFilter <= curStartDate)
        && (!this.endDateFilter || this.endDateFilter >= endStartDate)
    });
  }

  populateForm(trip: Trip) {
    this.tripService.formModel.patchValue({ Id: trip.Id });
    this.tripService.formModel.patchValue({ Destination: trip.Destination });
    this.tripService.formModel.patchValue({ StartDate: trip.StartDate });
    this.tripService.formModel.patchValue({ EndDate: trip.EndDate });
    this.tripService.formModel.patchValue({ Comment: trip.Comment });
    this.tripService.formModel.patchValue({ ApplicationUser: trip.ApplicationUser });
  }

  onDelete(trip: Trip) {
    if (confirm("Are you sure to delete this trip")) {
      this.tripService.deleteTrip(trip.Id)
        .subscribe(
          res => {
            this.tripService.refreshList();
            this.toastr.warning("Trip deleted successfully", "Trip Deletion");
          },
          err => {
            this.toastr.error(err.error.message, "Trip Deletion Failed");
          }
        );
    }
  }

}
