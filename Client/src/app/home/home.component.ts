import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { ContextService } from '../shared/context.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userDetails;
  constructor(private router: Router, private service: UserService, public contextService: ContextService) { }

  ngOnInit(): void {
    if(this.contextService.IsUser())
      this.router.navigateByUrl('/home/trip');
    else
      this.router.navigateByUrl('/home/usermanagement');
  }

  onLogout(){
    this.contextService.clearContext()
    this.router.navigate(['/user/login']);
  }

}
