import { Component, OnInit } from '@angular/core';
import { ContextService } from '../shared/context.service';
import { Roles } from '../constants/common-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.css']
})
export class UsermanagementComponent implements OnInit {

  constructor(private contextService: ContextService, private router: Router) { }

  ngOnInit(): void {
    if(this.contextService.getRole() == Roles.User)
    {
      this.router.navigateByUrl('/home');
    }
  }

}
