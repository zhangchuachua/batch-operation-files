import { Action, ActionPanel, Detail } from "@raycast/api";
import { useState } from "react";
import { ParamSet } from "./types";
import { ParamSetList } from "./components/ParamSetList";
import { getVariables, replaceVariables } from "./storage";
import { runCliCommand } from "./utils";

export default function Command() {
  const [output, setOutput] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleParamSetSelect(paramSet: ParamSet) {
    setIsLoading(true);
    try {
      const variables = await getVariables();
      const { from, to, skipExist } = paramSet.params;

      const args = [
        "copy",
        "--from",
        replaceVariables(from, variables),
        "--to",
        replaceVariables(to, variables),
      ];

      if (skipExist) {
        args.push("--skip-exist");
      }

      const result = await runCliCommand(args);
      setOutput(
        `# ${result.success ? "Success" : "Error"}\n\n` +
        `${result.message}\n\n` +
        (result.output ? `## Output\n\`\`\`\n${result.output}\n\`\`\`\n\n` : "") +
        (result.error ? `## Error\n\`\`\`\n${result.error}\n\`\`\`\n\n` : "")
      );
    } catch (error) {
      setOutput(`# Error\n\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (output) {
    return (
      <Detail
        markdown={output}
        isLoading={isLoading}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Output"
              content={output}
            />
            <Action
              title="Back to Parameter Sets"
              onAction={() => setOutput(undefined)}
            />
          </ActionPanel>
        }
      />
    );
  }

  return <ParamSetList command="copy" onSelect={handleParamSetSelect} />;
} 
