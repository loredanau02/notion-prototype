import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';
import { Workspace, Page } from '../models/block.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  workspaces: Workspace[] = [];
  activeWorkspaceId: string | null = null;
  activePageId: string | null = null;
  isAddingWorkspace = false;
  isAddingPage = false;
  newWorkspaceName = '';
  newPageName = '';
  private subscription: Subscription = new Subscription();
  
  constructor(private workspaceService: WorkspaceService) {}
  
  ngOnInit() {
    this.subscription.add(
      this.workspaceService.workspaces$.subscribe(workspaces => {
        this.workspaces = workspaces;
      })
    );
    
    this.subscription.add(
      this.workspaceService.activeWorkspace$.subscribe(id => {
        this.activeWorkspaceId = id;
      })
    );
    
    this.subscription.add(
      this.workspaceService.activePage$.subscribe(id => {
        this.activePageId = id;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  getActiveWorkspace(): Workspace | undefined {
    return this.workspaces.find(w => w.id === this.activeWorkspaceId);
  }
  
  selectWorkspace(id: string) {
    this.workspaceService.setActiveWorkspace(id);
  }
  
  selectPage(id: string) {
    this.workspaceService.setActivePage(id);
  }
  
  startAddingWorkspace() {
    this.isAddingWorkspace = true;
    this.newWorkspaceName = '';
  }
  
  cancelAddingWorkspace() {
    this.isAddingWorkspace = false;
  }
  
  submitNewWorkspace() {
    if (this.newWorkspaceName.trim()) {
      const id = this.workspaceService.createWorkspace(this.newWorkspaceName.trim());
      this.workspaceService.setActiveWorkspace(id);
      this.isAddingWorkspace = false;
    }
  }
  
  startAddingPage() {
    this.isAddingPage = true;
    this.newPageName = '';
  }
  
  cancelAddingPage() {
    this.isAddingPage = false;
  }
  
  submitNewPage() {
    if (this.newPageName.trim() && this.activeWorkspaceId) {
      const id = this.workspaceService.createPage(
        this.activeWorkspaceId, 
        this.newPageName.trim(),
        '📄'
      );
      
      if (id) {
        this.workspaceService.setActivePage(id);
      }
      
      this.isAddingPage = false;
    }
  }
  
  deleteWorkspace(event: Event, id: string) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this workspace and all its pages?')) {
      this.workspaceService.deleteWorkspace(id);
    }
  }
  
  deletePage(event: Event, workspaceId: string, pageId: string) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this page?')) {
      this.workspaceService.deletePage(workspaceId, pageId);
    }
  }
}