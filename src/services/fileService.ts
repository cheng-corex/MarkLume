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

export type TreeNode = {
  name: string;
  path: string;
  is_dir: boolean;
  children: TreeNode[];
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

/**
 * 扫描文件夹并返回树形结构
 */
export async function scanFolderTree(dir: string): Promise<TreeNode> {
  return await invoke<TreeNode>("scan_folder_tree", { path: dir });
}

/**
 * 将树形结构展平为文件列表（用于搜索和导航）
 */
export function flattenTree(node: TreeNode): FolderFile[] {
  const files: FolderFile[] = [];
  function walk(n: TreeNode, prefix: string) {
    if (!n.is_dir) {
      files.push({
        path: n.path,
        name: n.name,
        relativePath: prefix || n.name,
      });
    }
    for (const child of n.children) {
      const newPrefix = n.is_dir
        ? (prefix ? `${prefix}/${n.name}` : n.name)
        : prefix;
      walk(child, newPrefix);
    }
  }
  walk(node, "");
  return files;
}