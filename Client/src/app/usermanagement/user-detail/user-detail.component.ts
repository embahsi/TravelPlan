import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm, Validators, ValidatorFn, AbstractControl, FormGroupDirective } from '@angular/forms';
import { ContextService } from 'src/app/shared/context.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  constructor(public userService: UserService, public contextService: ContextService, private toastr: ToastrService, private ref: ChangeDetectorRef) { }
  submitText: string;
  showPassword: boolean;

  ngOnInit(): void {
    const confirmPasswordControl = this.userService.formModel.get('Passwords.ConfirmPassword');
    const passwordControl = this.userService.formModel.get('Passwords.Password');

    this.userService.formModel.get('Id').valueChanges
      .subscribe(id => {
        if (id == null) {
          passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
          confirmPasswordControl.setValidators([Validators.required, this.comparePasswordValidator(passwordControl)]);
          this.submitText = "Create User";
          this.showPassword = true;
        }
        else {
          passwordControl.setValidators(null);
          confirmPasswordControl.setValidators(null);
          this.submitText = "Edit User";
          this.showPassword = false;
        }
        passwordControl.updateValueAndValidity();
        confirmPasswordControl.updateValueAndValidity();
      });

    this.resetForm();
  }

  comparePasswordValidator(pwControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== pwControl.value) {
        return { 'passwordMismatch': true };
      }
      return null;
    }
  };

  resetForm() {
    this.userService.resetForm();
    this.submitText = "Create User";
  }

  onSubmit() {
    if (this.userService.formModel.value.Id == null)
      this.insertRecord();
    else
      this.updateRecord();
  }

  insertRecord() {
    this.userService.postUser().subscribe(
      (res: any) => {
        if (res.Succeeded) {
          this.resetForm();
          this.toastr.success("User created successfully", "New User");
          if (localStorage.getItem('token') != null)
            this.userService.refreshList();
        }
        else {
          res.errors.forEach(element => {
            this.toastr.error(element.description, "Registration Failed");
          });
        }
      },
      err => {
          this.toastr.error(err.error.message, "Registration Failed");
      });
  }

  updateRecord() {
    this.userService.putUser().subscribe(
      res => {
        this.resetForm();
        this.toastr.info("Changes saved successfully", "User Update");
        this.userService.refreshList();
      },
      err => {
        this.toastr.error(err.error.message, "User Update Failed");
    });
  }

}
