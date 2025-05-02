import { Component } from '@angular/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent {
  blocks = [1];

  addBlock() {
    this.blocks.push(this.blocks.length + 1);
  }
}