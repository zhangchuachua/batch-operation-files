import { spawn } from "child_process";
import { CommandOutput } from "./types";
import path from "path";

export async function runCliCommand(args: string[]): Promise<CommandOutput> {
  return new Promise((resolve) => {
    try {
      // 获取 CLI 工具的路径
      const cliPath = path.join(process.env.HOME || "", "Desktop", "json-cli", "target", "debug", "my-helper");

      let stdout = "";
      let stderr = "";

      // 使用 spawn 直接传递参数数组，不经过 shell 解释
      const child = spawn(cliPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0 || stderr) {
          resolve({
            success: false,
            message: "Command failed",
            error: stderr || `Process exited with code ${code}`,
          });
        } else {
          resolve({
            success: true,
            message: "Command executed successfully",
            output: stdout,
          });
        }
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          message: "Command execution failed",
          error: error.message,
        });
      });

    } catch (error) {
      resolve({
        success: false,
        message: "Command execution failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
} 
