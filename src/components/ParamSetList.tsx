import { Action, ActionPanel, Form, List, Icon, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { ParamSet, Variable } from "../types";
import { deleteParamSet, getParamSets, getVariables, saveParamSet } from "../storage";
import { generateId, formatDate } from "../utils";
import { VariableList } from "./VariableList";

interface ParamSetListProps {
  command: ParamSet["command"];
  onSelect: (paramSet: ParamSet) => void;
}

export function ParamSetList({ command, onSelect }: ParamSetListProps) {
  const [paramSets, setParamSets] = useState<ParamSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParamSets();
  }, []);

  async function loadParamSets() {
    setIsLoading(true);
    const sets = await getParamSets(command);
    setParamSets(sets);
    setIsLoading(false);
  }

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        icon={Icon.Document}
        title="No Parameter Sets"
        description="Add your first parameter set"
        actions={
          <ActionPanel>
            <Action.Push title="Add Parameter Set" target={<ParamSetForm command={command} onSave={loadParamSets} />} />
            <Action.Push title="Manage Variables" target={<VariableList />} />
          </ActionPanel>
        }
      />
      {paramSets.map((paramSet) => (
        <List.Item
          key={paramSet.id}
          title={paramSet.name}
          subtitle={formatDate(paramSet.updatedAt)}
          actions={
            <ActionPanel>
              <Action title="Use Parameter Set" onAction={() => onSelect(paramSet)} />
              <Action.Push
                title="Edit Parameter Set"
                target={<ParamSetForm paramSet={paramSet} command={command} onSave={loadParamSets} />}
              />
              <Action
                title="Delete Parameter Set"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={async () => {
                  await deleteParamSet(paramSet.id);
                  await loadParamSets();
                }}
              />
              <Action.Push title="Manage Variables" target={<VariableList />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

interface ParamSetFormProps {
  command: ParamSet["command"];
  paramSet?: ParamSet;
  onSave: () => void;
}

function ParamSetForm({ command, paramSet, onSave }: ParamSetFormProps) {
  const { pop } = useNavigation();
  const [nameError, setNameError] = useState<string>();
  const [fromError, setFromError] = useState<string>();
  const [toError, setToError] = useState<string>();
  const [jsonPathError, setJsonPathError] = useState<string>();
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    loadVariables();
  }, []);

  async function loadVariables() {
    const vars = await getVariables();
    setVariables(vars);
  }

  async function handleSubmit(values: {
    name: string;
    from: string;
    to: string;
    skipExist: boolean;
    jsonPath?: string;
  }) {
    if (!values.name) {
      setNameError("Name is required");
      return;
    }
    if (!values.from) {
      setFromError("Source path is required");
      return;
    }
    if (!values.to) {
      setToError("Target path is required");
      return;
    }
    if (command === "modify-json" && !values.jsonPath) {
      setJsonPathError("JSON path is required");
      return;
    }

    const now = Date.now();
    await saveParamSet({
      id: paramSet?.id || generateId(),
      name: values.name,
      command,
      params: {
        from: values.from,
        to: values.to,
        skipExist: values.skipExist,
        ...(command === "modify-json" ? { jsonPath: values.jsonPath } : {}),
      },
      createdAt: paramSet?.createdAt || now,
      updatedAt: now,
    });

    onSave();
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Parameter Set" onSubmit={handleSubmit} />
          <Action.Push title="Manage Variables" target={<VariableList />} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="Enter parameter set name"
        defaultValue={paramSet?.name}
        error={nameError}
        onChange={() => setNameError(undefined)}
      />
      <Form.TextField
        id="from"
        title="Source Path"
        placeholder="Enter source path (supports variables like {{Desktop}})"
        defaultValue={paramSet?.params.from}
        error={fromError}
        onChange={() => setFromError(undefined)}
      />
      <Form.TextField
        id="to"
        title="Target Path"
        placeholder="Enter target path (supports variables like {{Desktop}})"
        defaultValue={paramSet?.params.to}
        error={toError}
        onChange={() => setToError(undefined)}
      />
      <Form.Checkbox
        id="skipExist"
        label="Skip Existing Files"
        defaultValue={paramSet?.params.skipExist}
      />
      {command === "modify-json" && (
        <Form.TextField
          id="jsonPath"
          title="JSON Path"
          placeholder="Enter JSON path expression (e.g. $.meta.*)"
          defaultValue={paramSet?.params.jsonPath}
          error={jsonPathError}
          onChange={() => setJsonPathError(undefined)}
        />
      )}
      <Form.Separator />
      <Form.Description title="Available Variables" text={variables.map(v => `{{${v.name}}}: ${v.value}`).join("\n")} />
    </Form>
  );
} 
