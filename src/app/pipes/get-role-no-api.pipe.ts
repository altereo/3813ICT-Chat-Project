import { Pipe, PipeTransform } from '@angular/core';

import { ChatApiService, User, Group } from '../chat-api.service';

@Pipe({
  name: 'getRoleNoAPI',
  standalone: true
})
export class GetRoleNoAPIPipe implements PipeTransform {

  transform(user: User | null, groupID: number): string {
    if (!user) return("User");
    
    if (user.roles.length === 0) {
      return("User");
    } else if (user.roles.includes("SUPERADMIN")) {
      return("Operator");
    } else if (user.roles.find((role: string) => role.startsWith(`${groupID}::`))) {
      return("Admin");
    } else {
      return("User");
    }
  }

  constructor (private chatApiService: ChatApiService) { }
}
