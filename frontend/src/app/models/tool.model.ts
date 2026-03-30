export interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  isBuiltIn: boolean;
  isPremium: boolean;
  status: ToolStatus;
  frontendBundle?: string; // URL to Angular bundle (Phase 5+)
}

export enum ToolStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Disabled = 'Disabled'
}