import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginationResult } from '../_models/pagination';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(private userService: UserService,
              private authservice: AuthService,
              private route: ActivatedRoute,
              private alertify: AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages(){
    this.userService.getMessages(this.authservice.decodedToken.nameid,
                                  this.pagination.currentPage,
                                  this.pagination.itemsPerPage,
                                  this.messageContainer).subscribe((res: PaginationResult<Message[]>) => {
                                    this.messages = res.result;
                                    this.pagination = res.pagination;
                                  }, error => {
                                    this.alertify.error(error);
                                  });
  }

  deleteMessage(id: number){
    this.alertify.confirm('are u sure to delete the msg',() => {
      this.userService.deleteMessage(id, this.authservice.decodedToken.nameid).subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
        this.alertify.success('msg has been deleted');
      }, error => {
        this.alertify.error('failed to delete msg');
      });
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

}
