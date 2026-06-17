import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export type FileContent = {
  path: string;
  name: string;
  content: string;
  size: number;
  modifiedAt: number;
};

export type FolderFile = {
  path: string;
  name: string;
  relativePath: string;
};

export type FolderState = {
  folderPath: string;
  files: FolderFile[];
  currentIndex: number;
};

/**
 * 打开系统文件选择对话框，只允许选择 .md/.markdown/.txt 文件
 */
export async function pickMarkdownFile(): Promise<string | null> {
  const selected = await open({
    title: "选择 Markdown 文件",
    multiple: false,
    filters: [
      {
        name: "Markdown",
        extensions: ["md", "markdown", "txt"],
      },
    ],
  });

  if (selected && typeof selected === "string") {
    return selected;
  }
  return null;
}

/**
 * 打开系统文件夹选择对话框
 */
export async function pickFolder(): Promise<string | null> {
  const selected = await open({
    title: "选择文件夹",
    directory: true,
    multiple: false,
  });

  if (selected && typeof selected === "string") {
    return selected;
  }
  return null;
}

/**
 * 通过 Tauri 后端读取文件内容
 */
export async function readFile(path: string): Promise<FileContent> {
  const result = await invoke<{
    path: string;
    name: string;
    content: string;
    size: number;
    modified_at: number;
  }>("read_markdown_file", { path });

  return {
    path: result.path,
    name: result.name,
    content: result.content,
    size: result.size,
    modifiedAt: result.modified_at,
  };
}

/**
 * 扫描文件夹内的 Markdown 文件
 */
export async function scanFolder(dir: string): Promise<FolderFile[]> {
  const result = await invoke<
    {
      path: string;
      name: string;
      relative_path: string;
    }[]
  >("scan_markdown_files", { path: dir });

  return result.map((f) => ({
    path: f.path,
    name: f.name,
    relativePath: f.relative_path,
  }));
}