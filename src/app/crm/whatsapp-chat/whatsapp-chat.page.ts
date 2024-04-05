import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-whatsapp-chat',
  templateUrl: './whatsapp-chat.page.html',
  styleUrls: ['./whatsapp-chat.page.scss'],
})
export class WhatsappChatPage implements OnInit {

 chatdata = [
   {'username': 'AK', 'chatmsg': 'Hi Cassie! Would you be available for a coffee next week? 😁', 'reply':'Hi  😁', 'time': '8:07'},
   {'username': 'AK', 'chatmsg': 'Hi Cassie! Would you be available for a coffee next week? 😁', 'reply':'Hi Cassie! Would you be available', 'time': '8:07'},
   {'username': 'AK', 'chatmsg': 'Hi Cassie! Would you be available for a coffee next week? 😁', 'reply':'Abailable', 'time': '8:07'},
   {'username': 'AK', 'chatmsg': 'Hi Cassie! Would you be available for a coffee next week? 😁', 'reply':'Yes', 'time': '8:07'},
 ]


  constructor() { }

  ngOnInit() {
  }

}
