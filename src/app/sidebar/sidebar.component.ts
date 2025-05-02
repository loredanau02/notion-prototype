import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  workspaces: string[] = ['Workspace 1', 'Workspace 2'];

  addWorkspace() {
    const newWorkspace = `Workspace ${this.workspaces.length + 1}`;
    this.workspaces.push(newWorkspace);
  }
}
