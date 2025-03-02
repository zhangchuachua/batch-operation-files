export interface Variable {
  name: string;
  value: string;
}

export interface ParamSet {
  id: string;
  name: string;
  command: "copy" | "modify-json";
  params: {
    from: string;
    to: string;
    skipExist?: boolean;
    jsonPath?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface StorageData {
  variables: Variable[];
  paramSets: ParamSet[];
}

export interface CommandOutput {
  success: boolean;
  message: string;
  output?: string;
  error?: string;
} 
