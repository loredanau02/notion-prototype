import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block, BlockType } from '../models/block.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSelectionListChange } from '@angular/material/list';

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
    MatListModule
  ]
})
export class BlockComponent {
  @Input() block!: Block;
  @Output() blockChange = new EventEmitter<Block>();
  @Output() blockDelete = new EventEmitter<string>();
  @Output() blockAdd = new EventEmitter<{id: string, position: 'before' | 'after'}>();
  
  isMenuOpen = false;
  isFocused = false;
  
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
  
  onContentChange(event: Event) {
    const htmlElement = event.target as HTMLElement;
    const content = htmlElement.innerText;
    this.block.content = content;
    this.blockChange.emit(this.block);
  }
  
  onTypeChange(type: string) {
    this.block.type = type as BlockType;
    this.blockChange.emit(this.block);
    this.isMenuOpen = false;
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  onFocus() {
    this.isFocused = true;
  }
  
  onBlur() {
    this.isFocused = false;
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
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addBlockAfter();
    }
    
    if (event.key === 'Backspace' && this.block.content === '') {
      this.deleteBlock();
    }
  }
}