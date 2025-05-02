import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block, BlockType } from '../models/block.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule
  ]
})
export class BlockComponent {
  @Input() block!: Block;
  @Output() blockChange = new EventEmitter<Block>();
  @Output() blockDelete = new EventEmitter<string>();
  @Output() blockAdd = new EventEmitter<{id: string, position: 'before' | 'after'}>();
  
  isMenuOpen = false;
  isFocused = false;
  showControls = false;
  
  blockTypes = [
    { type: 'text' as BlockType, icon: 'text_fields', label: 'Text' },
    { type: 'heading1' as BlockType, icon: 'title', label: 'Heading 1' },
    { type: 'heading2' as BlockType, icon: 'format_size', label: 'Heading 2' },
    { type: 'heading3' as BlockType, icon: 'format_size', label: 'Heading 3' },
    { type: 'todo' as BlockType, icon: 'check_box', label: 'To-do List' },
    { type: 'bulleted-list' as BlockType, icon: 'format_list_bulleted', label: 'Bulleted List' },
    { type: 'numbered-list' as BlockType, icon: 'format_list_numbered', label: 'Numbered List' },
    { type: 'code' as BlockType, icon: 'code', label: 'Code' },
    { type: 'quote' as BlockType, icon: 'format_quote', label: 'Quote' },
    { type: 'divider' as BlockType, icon: 'horizontal_rule', label: 'Divider' }
  ];
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isMenuOpen && !(event.target as HTMLElement).closest('.block-type-menu') && 
        !(event.target as HTMLElement).closest('.block-handle')) {
      this.isMenuOpen = false;
    }
  }
  
  onContentChange(event: Event) {
    const htmlElement = event.target as HTMLElement;
    const content = htmlElement.textContent || '';
    this.block.content = content;
    this.blockChange.emit(this.block);
  }
  
  onTypeChange(type: string) {
    this.block.type = type as BlockType;
    this.blockChange.emit(this.block);
    this.isMenuOpen = false;
    
    setTimeout(() => {
      const element = document.querySelector('.block-container.focused [contenteditable=true]') as HTMLElement;
      if (element) {
        element.focus();
        
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  onFocus() {
    this.isFocused = true;
    this.showControls = true;
  }
  
  onBlur() {
    this.isFocused = false;

    setTimeout(() => {
      if (!this.showControls) {
        this.showControls = false;
      }
    }, 200);
  }
  
  deleteBlock() {
    this.blockDelete.emit(this.block.id);
  }
  
  addBlockAfter() {
    this.blockAdd.emit({id: this.block.id, position: 'after'});
  }
  
  toggleTodo() {
    if (this.block.type === 'todo') {
      this.block.checked = !this.block.checked;
      this.blockChange.emit(this.block);
    }
  }
  
  handleKeydown(event: KeyboardEvent) {
    if (event.key === '/' && (event.target as HTMLElement).textContent === '') {
      event.preventDefault();
      this.toggleMenu();
      return;
    }
    
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addBlockAfter();
      return;
    }
    if (event.key === 'Backspace' && this.block.content === '') {
      event.preventDefault();
      this.deleteBlock();
      return;
    }
  }
  handleCodeKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      document.execCommand('insertText', false, '  ');
      return;
    }
    
    this.handleKeydown(event);
  }
}