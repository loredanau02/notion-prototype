import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';
import { Page, Block } from '../models/block.model';
import { BlockComponent } from '../block/block.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    BlockComponent,
    MatButtonModule,
    MatIconModule
  ]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  activePage: Page | null = null;
  activeWorkspaceId: string | null = null;
  private subscription: Subscription = new Subscription();
  
  constructor(private workspaceService: WorkspaceService) {}
  
  ngOnInit() {
    this.subscription.add(
      this.workspaceService.activeWorkspace$.subscribe(id => {
        this.activeWorkspaceId = id;
      })
    );
    
    this.subscription.add(
      this.workspaceService.activePage$.subscribe(() => {
        this.activePage = this.workspaceService.getActivePage();
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  onTitleChange(event: Event) {
    if (!this.activePage || !this.activeWorkspaceId) return;
    
    const title = (event.target as HTMLElement).innerText;
    
    this.workspaceService.updatePage(this.activeWorkspaceId, this.activePage.id, {
      title
    });
  }
  
  onBlockChange(block: Block) {
    if (!this.activePage) return;
    
    this.workspaceService.updateBlock(this.activePage.id, block);
  }
  
  onBlockDelete(blockId: string) {
    if (!this.activePage) return;
    
    this.workspaceService.deleteBlock(this.activePage.id, blockId);
  }
  
  onBlockAdd(data: {id: string, position: 'before' | 'after'}) {
    if (!this.activePage) return;
    
    this.workspaceService.addBlock(this.activePage.id, data.id, data.position);
  }
  
  addNewBlock() {
    if (!this.activePage || this.activePage.blocks.length === 0) return;
    
    const lastBlock = this.activePage.blocks[this.activePage.blocks.length - 1];
    this.workspaceService.addBlock(this.activePage.id, lastBlock.id, 'after');
  }
}