import { Injectable } from '@angular/core';
import { Roles } from '../constants/common-constants';

@Injectable()
export class ContextService {
  
  constructor() { }

  public init()
  {
    this.setContext();
  }

  public setContext()
  {
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    localStorage.setItem('Role', payLoad.role);
    localStorage.setItem('FirstName', payLoad.FirstName);
    localStorage.setItem('LastName', payLoad.LastName);
    localStorage.setItem('Email', payLoad.Email);
    localStorage.setItem('Id', payLoad.Id);
  }

  public clearContext()
  {
    localStorage.clear();
  }

  public getRole() : string
  {
    return localStorage.getItem('Role');
  }

  public getFirstName(): string
  {
    return localStorage.getItem('FirstName');
  }

  public getLastName(): string
  {
    return localStorage.getItem('LastName');
  }

  public getEmail(): string
  {
    return localStorage.getItem('Email');
  }

  public getId(): string
  {
    return localStorage.getItem('Id');
  }

  public isUserManagerOrAdmin() : boolean
  {
    var role = this.getRole();
    return role && (role==Roles.Admin || role==Roles.UserManager);
  }

  public IsAdmin() : boolean {
    var role = this.getRole();
    return role && role==Roles.Admin;
  }

  public IsUser() : boolean {
    var role = this.getRole();
    return role && role==Roles.User;
  }
  
}
