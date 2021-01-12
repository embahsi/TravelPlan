import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { ContextService } from './context.service';
import { Roles } from '../constants/common-constants';
import { ApplicationUser, ApplicationUserCalc } from '../models/application-user.model';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class UserService {

  constructor(private fb:FormBuilder, private http: HttpClient, public contextService: ContextService, private toastr: ToastrService) { }
  
  readonly BaseURI = 'http://localhost:11968/api';
  public userList : ApplicationUserCalc[];
  public userRoleUsers : ApplicationUser[];

  roles = [
    {id:'User', value: 'User'},
    {id:'UserManager', value: 'UserManager'},
    {id:'Admin', value: 'Admin'},
  ]

  public formModel = this.fb.group({
    Id: [],
    UserName: [, Validators.required],
    Email: [, Validators.email],
    FirstName: [],
    LastName: [],
    Passwords : this.fb.group({
      Password: [],
      ConfirmPassword: []
    }),
    Role: []
  });

  login(formData)
  {
    return this.http.post(this.BaseURI+'/ApplicationUser/Login', formData);
  }

  roleMatch(allowedRoles): boolean {
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    allowedRoles.forEach(element => {
      if (userRole == element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }

  refreshList(){
    return this.http.get(this.BaseURI + '/ApplicationUser/getAllUsers')
    .toPromise()
    .then(res=>{
      this.userList = res as ApplicationUserCalc[]
      this.userRoleUsers = this.userList
        .filter(x=>x.Role==Roles.User)
        .map(function(appUser){
          var user: ApplicationUser = {
          Id:appUser.Id,
          UserName:appUser.UserName,
          Email:appUser.Email,
          Role:appUser.Role,
          FirstName:appUser.FirstName,
          LastName:appUser.LastName,
          Password:appUser.Password
        }
        return user;
      });
    },
      err => {
        this.toastr.error(err.error.message, "Trip List can not be retrieved");
    });
  }

  postUser() {
    var url = this.BaseURI + '/ApplicationUser';

    if(this.contextService.isUserManagerOrAdmin())
    {
      url = url + "/createUserByAdmin";
    }
    else{
      this.formModel.patchValue({Role: Roles.User});
    }

    return this.http.post(url, this.formToUser());
  }

  putUser() {
    return this.http.put(this.BaseURI + '/ApplicationUser/' + this.formModel.value.Id, this.formToUser());
  }

  deleteUser(id:string) {
    return this.http.delete(this.BaseURI + '/ApplicationUser/' + id);
  }

  resetForm()
  {
    this.formModel.reset();
    this.formModel.controls.UserName.setErrors(null);
    setTimeout(() => { 
      this.formModel.get('Passwords')['controls'].Password.setErrors(null);
      this.formModel.get('Passwords')['controls'].ConfirmPassword.setErrors(null);
    }, 0);
    
  }

  formToUser(): ApplicationUser
  {
    let user = new ApplicationUser();
    user.Id = this.formModel.value.Id;
    user.UserName = this.formModel.value.UserName;
    user.Email = this.formModel.value.Email;
    user.FirstName = this.formModel.value.FirstName;
    user.LastName = this.formModel.value.LastName;
    user.Password = this.formModel.value.Passwords.Password;
    user.Role = this.formModel.value.Role;

    return user;
  }

}
