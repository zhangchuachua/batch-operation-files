import { LocalStorage } from "@raycast/api";
import { ParamSet, StorageData, Variable } from "./types";

const STORAGE_KEY = "batch-file-operation";

export async function getStorageData(): Promise<StorageData> {
  const data = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!data) {
    return { variables: [], paramSets: [] };
  }
  return JSON.parse(data);
}

export async function saveStorageData(data: StorageData): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getVariables(): Promise<Variable[]> {
  const data = await getStorageData();
  return data.variables;
}

export async function saveVariable(variable: Variable): Promise<void> {
  const data = await getStorageData();
  const index = data.variables.findIndex((v) => v.name === variable.name);
  if (index >= 0) {
    data.variables[index] = variable;
  } else {
    data.variables.push(variable);
  }
  await saveStorageData(data);
}

export async function deleteVariable(name: string): Promise<void> {
  const data = await getStorageData();
  data.variables = data.variables.filter((v) => v.name !== name);
  await saveStorageData(data);
}

export async function getParamSets(command: ParamSet["command"]): Promise<ParamSet[]> {
  const data = await getStorageData();
  return data.paramSets.filter((p) => p.command === command);
}

export async function saveParamSet(paramSet: ParamSet): Promise<void> {
  const data = await getStorageData();
  const index = data.paramSets.findIndex((p) => p.id === paramSet.id);
  if (index >= 0) {
    data.paramSets[index] = paramSet;
  } else {
    data.paramSets.push(paramSet);
  }
  await saveStorageData(data);
}

export async function deleteParamSet(id: string): Promise<void> {
  const data = await getStorageData();
  data.paramSets = data.paramSets.filter((p) => p.id !== id);
  await saveStorageData(data);
}

export function replaceVariables(text: string, variables: Variable[]): string {
  return variables.reduce((result, variable) => {
    const pattern = new RegExp(`{{${variable.name}}}`, "g");
    return result.replace(pattern, variable.value);
  }, text);
} 
