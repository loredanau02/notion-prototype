import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Workspace, Page, Block, BlockType } from '../models/block.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private storageKey = 'notion-clone-data';
  private isBrowser: boolean;
  
  private workspacesSubject = new BehaviorSubject<Workspace[]>([]);
  workspaces$ = this.workspacesSubject.asObservable();
  
  private activeWorkspaceSubject = new BehaviorSubject<string | null>(null);
  activeWorkspace$ = this.activeWorkspaceSubject.asObservable();
  
  private activePageSubject = new BehaviorSubject<string | null>(null);
  activePage$ = this.activePageSubject.asObservable();
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    this.loadFromStorage();
    
    if (this.workspacesSubject.value.length === 0) {
      this.createDefaultWorkspace();
    }
  }
  
  private loadFromStorage() {
    if (!this.isBrowser) {
      // Skip localStorage operations when running on server
      return;
    }
    
    const storedData = localStorage.getItem(this.storageKey);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        this.workspacesSubject.next(data);
        
        // Set active workspace and page if available
        if (data.length > 0) {
          this.activeWorkspaceSubject.next(data[0].id);
          
          if (data[0].pages.length > 0) {
            this.activePageSubject.next(data[0].pages[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to parse stored data', e);
      }
    }
  }
  private saveToStorage() {
    if (!this.isBrowser) {
      return;
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(this.workspacesSubject.value));
  }
  
  private createDefaultWorkspace() {
    const defaultWorkspace: Workspace = {
      id: uuidv4(),
      name: 'My Workspace',
      pages: [
        {
          id: uuidv4(),
          title: 'Getting Started',
          emoji: '🚀',
          blocks: [
            {
              id: uuidv4(),
              type: 'heading1',
              content: 'Welcome to your Notion Clone!'
            },
            {
              id: uuidv4(),
              type: 'text',
              content: 'This is your own personal knowledge base. Start typing to begin...'
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };
    
    this.workspacesSubject.next([defaultWorkspace]);
    this.activeWorkspaceSubject.next(defaultWorkspace.id);
    this.activePageSubject.next(defaultWorkspace.pages[0].id);
    this.saveToStorage();
  }
  
  createWorkspace(name: string) {
    const workspaces = [...this.workspacesSubject.value];
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name,
      pages: []
    };
    
    workspaces.push(newWorkspace);
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
    return newWorkspace.id;
  }
  
  updateWorkspace(id: string, data: Partial<Workspace>) {
    const workspaces = [...this.workspacesSubject.value];
    const index = workspaces.findIndex(w => w.id === id);
    
    if (index !== -1) {
      workspaces[index] = { ...workspaces[index], ...data };
      this.workspacesSubject.next(workspaces);
      this.saveToStorage();
    }
  }
  
  deleteWorkspace(id: string) {
    const workspaces = this.workspacesSubject.value.filter(w => w.id !== id);
    this.workspacesSubject.next(workspaces);
    
    if (this.activeWorkspaceSubject.value === id) {
      this.activeWorkspaceSubject.next(workspaces.length > 0 ? workspaces[0].id : null);
      
      if (workspaces.length > 0 && workspaces[0].pages.length > 0) {
        this.activePageSubject.next(workspaces[0].pages[0].id);
      } else {
        this.activePageSubject.next(null);
      }
    }
    
    this.saveToStorage();
  }
  
  createPage(workspaceId: string, title: string, emoji?: string) {
    const workspaces = [...this.workspacesSubject.value];
    const workspaceIndex = workspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex === -1) return null;
    
    const newPage: Page = {
      id: uuidv4(),
      title,
      emoji,
      blocks: [
        {
          id: uuidv4(),
          type: 'heading1',
          content: title
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    workspaces[workspaceIndex].pages.push(newPage);
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
    return newPage.id;
  }
  
  updatePage(workspaceId: string, pageId: string, data: Partial<Page>) {
    const workspaces = [...this.workspacesSubject.value];
    const workspaceIndex = workspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex === -1) return;
    
    const pageIndex = workspaces[workspaceIndex].pages.findIndex(p => p.id === pageId);
    
    if (pageIndex === -1) return;
    
    workspaces[workspaceIndex].pages[pageIndex] = {
      ...workspaces[workspaceIndex].pages[pageIndex],
      ...data,
      updatedAt: new Date()
    };
    
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
  }
  
  deletePage(workspaceId: string, pageId: string) {
    const workspaces = [...this.workspacesSubject.value];
    const workspaceIndex = workspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex === -1) return;
    
    workspaces[workspaceIndex].pages = workspaces[workspaceIndex].pages.filter(p => p.id !== pageId);
    
    if (this.activePageSubject.value === pageId) {
      if (workspaces[workspaceIndex].pages.length > 0) {
        this.activePageSubject.next(workspaces[workspaceIndex].pages[0].id);
      } else {
        this.activePageSubject.next(null);
      }
    }
    
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
  }
  
  getActivePage(): Page | null {
    const activeWorkspaceId = this.activeWorkspaceSubject.value;
    const activePageId = this.activePageSubject.value;
    
    if (!activeWorkspaceId || !activePageId) return null;
    
    const workspace = this.workspacesSubject.value.find(w => w.id === activeWorkspaceId);
    if (!workspace) return null;
    
    return workspace.pages.find(p => p.id === activePageId) || null;
  }
  
  addBlock(pageId: string, blockId: string, position: 'before' | 'after') {
    const workspaces = [...this.workspacesSubject.value];
    const activeWorkspaceId = this.activeWorkspaceSubject.value;
    
    if (!activeWorkspaceId) return;
    
    const workspaceIndex = workspaces.findIndex(w => w.id === activeWorkspaceId);
    if (workspaceIndex === -1) return;
    
    const pageIndex = workspaces[workspaceIndex].pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const page = workspaces[workspaceIndex].pages[pageIndex];
    const blocks = [...page.blocks];
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex === -1) return;
    
    const newBlock: Block = {
      id: uuidv4(),
      type: 'text',
      content: ''
    };
    
    const insertIndex = position === 'after' ? blockIndex + 1 : blockIndex;
    blocks.splice(insertIndex, 0, newBlock);
    
    workspaces[workspaceIndex].pages[pageIndex].blocks = blocks;
    workspaces[workspaceIndex].pages[pageIndex].updatedAt = new Date();
    
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
    
    return newBlock.id;
  }
  
  updateBlock(pageId: string, block: Block) {
    const workspaces = [...this.workspacesSubject.value];
    const activeWorkspaceId = this.activeWorkspaceSubject.value;
    
    if (!activeWorkspaceId) return;
    
    const workspaceIndex = workspaces.findIndex(w => w.id === activeWorkspaceId);
    if (workspaceIndex === -1) return;
    
    const pageIndex = workspaces[workspaceIndex].pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const page = workspaces[workspaceIndex].pages[pageIndex];
    const blockIndex = page.blocks.findIndex(b => b.id === block.id);
    
    if (blockIndex === -1) return;
    
    workspaces[workspaceIndex].pages[pageIndex].blocks[blockIndex] = block;
    workspaces[workspaceIndex].pages[pageIndex].updatedAt = new Date();
    
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
  }
  
  deleteBlock(pageId: string, blockId: string) {
    const workspaces = [...this.workspacesSubject.value];
    const activeWorkspaceId = this.activeWorkspaceSubject.value;
    
    if (!activeWorkspaceId) return;
    
    const workspaceIndex = workspaces.findIndex(w => w.id === activeWorkspaceId);
    if (workspaceIndex === -1) return;
    
    const pageIndex = workspaces[workspaceIndex].pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const page = workspaces[workspaceIndex].pages[pageIndex];
    
    if (page.blocks.length <= 1) return;
    
    workspaces[workspaceIndex].pages[pageIndex].blocks = page.blocks.filter(b => b.id !== blockId);
    workspaces[workspaceIndex].pages[pageIndex].updatedAt = new Date();
    
    this.workspacesSubject.next(workspaces);
    this.saveToStorage();
  }
  
  setActiveWorkspace(id: string) {
    this.activeWorkspaceSubject.next(id);
    
    const workspace = this.workspacesSubject.value.find(w => w.id === id);
    if (workspace && workspace.pages.length > 0) {
      this.activePageSubject.next(workspace.pages[0].id);
    } else {
      this.activePageSubject.next(null);
    }
  }
  
  setActivePage(id: string) {
    this.activePageSubject.next(id);
  }
}