export interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  isBuiltIn: boolean;
  isPremium: boolean;
  status: ToolStatus;
  frontendBundleUrl?: string; // Computed URL to frontend bundle served from backend
}

export enum ToolStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Disabled = 'Disabled'
}