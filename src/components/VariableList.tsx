import { Action, ActionPanel, Form, List, Icon, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { Variable } from "../types";
import { deleteVariable, getVariables, saveVariable } from "../storage";

export function VariableList() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVariables();
  }, []);

  async function loadVariables() {
    setIsLoading(true);
    const vars = await getVariables();
    setVariables(vars);
    setIsLoading(false);
  }

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        icon={Icon.Text}
        title="No Variables"
        description="Add your first variable to use in paths"
        actions={
          <ActionPanel>
            <Action.Push title="Add Variable" target={<VariableForm onSave={loadVariables} />} />
          </ActionPanel>
        }
      />
      {variables.map((variable) => (
        <List.Item
          key={variable.name}
          title={variable.name}
          subtitle={variable.value}
          actions={
            <ActionPanel>
              <Action.Push
                title="Edit Variable"
                target={<VariableForm variable={variable} onSave={loadVariables} />}
              />
              <Action
                title="Delete Variable"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={async () => {
                  await deleteVariable(variable.name);
                  await loadVariables();
                }}
              />
            </ActionPanel>
          }
        />
      ))}

      <List.Item
        title="Add Variable"
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push title="Add Variable" target={<VariableForm onSave={loadVariables} />} />
          </ActionPanel>
        }
      />
    </List>
  );
}

function VariableForm({ variable, onSave }: { variable?: Variable; onSave: () => void }) {
  const { pop } = useNavigation();
  const [nameError, setNameError] = useState<string>();
  const [valueError, setValueError] = useState<string>();

  async function handleSubmit(values: { name: string; value: string }) {
    if (!values.name) {
      setNameError("Name is required");
      return;
    }
    if (!values.value) {
      setValueError("Value is required");
      return;
    }

    await saveVariable({
      name: values.name,
      value: values.value,
    });

    onSave();
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Variable" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="Enter variable name"
        defaultValue={variable?.name}
        error={nameError}
        onChange={() => setNameError(undefined)}
      />
      <Form.TextField
        id="value"
        title="Value"
        placeholder="Enter variable value"
        defaultValue={variable?.value}
        error={valueError}
        onChange={() => setValueError(undefined)}
      />
    </Form>
  );
} 
