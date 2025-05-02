// src/app/models/block.model.ts
export type BlockType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'todo' | 'bulleted-list' | 'numbered-list' | 'code' | 'quote' | 'divider';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  children?: Block[];
  checked?: boolean; // For todo blocks
}

export interface Page {
  id: string;
  title: string;
  emoji?: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  pages: Page[];
}