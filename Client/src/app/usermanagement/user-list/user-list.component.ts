import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ApplicationUser, ApplicationUserCalc } from 'src/app/models/application-user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(public userService: UserService, private toastr: ToastrService) { }

  displayedColumns: string[] = ['UserName', 'Email', 'FirstName', 'LastName', 'Role', 'Actions'];
  
  ngOnInit(): void {
    this.userService.refreshList();
  }

  populateForm(user: ApplicationUserCalc) {
    this.userService.formModel.patchValue({Id : user.Id});
    this.userService.formModel.patchValue({Email : user.Email});
    this.userService.formModel.patchValue({FirstName : user.FirstName});
    this.userService.formModel.patchValue({LastName : user.LastName});
    this.userService.formModel.patchValue({Role : user.Role});
    this.userService.formModel.patchValue({UserName : user.UserName});
  }

  onDelete(user: ApplicationUserCalc) {
    if(user.HasTrips)
      this.toastr.warning("Users who have trips can not be deleted.", "User Deletion Unsuccessful");
    if (confirm("Are you sure to delete this user")) {
      this.userService.deleteUser(user.Id)
        .subscribe(
          res => {
            this.userService.refreshList();
            this.toastr.warning("User deleted successfully", "User Deletion");
          },
          err => {
            this.toastr.error(err.error.message, "User Deletion Failed");
        });
    }
  }

}
