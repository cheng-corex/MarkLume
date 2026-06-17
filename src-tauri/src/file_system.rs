use serde::Serialize;
use std::fs;
use std::path::Path;

const ALLOWED_EXTENSIONS: &[&str] = &["md", "markdown", "txt"];
const MAX_FILE_SIZE: u64 = 20 * 1024 * 1024; // 20MB
const MAX_SCAN_DEPTH: u32 = 10;

#[derive(Serialize)]
pub struct FileContent {
    pub path: String,
    pub name: String,
    pub content: String,
    pub size: u64,
    pub modified_at: u64,
}

#[derive(Serialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub relative_path: String,
}

pub fn read_markdown_file(path: &str) -> Result<FileContent, String> {
    let file_path = Path::new(path);

    // 1. 验证文件存在
    if !file_path.exists() {
        return Err(format!("文件不存在: {}", path));
    }

    // 2. 验证扩展名
    let ext = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !ALLOWED_EXTENSIONS.contains(&ext.as_str()) {
        return Err(format!(
            "不支持的文件格式: .{}，仅支持 .md、.markdown、.txt",
            ext
        ));
    }

    // 3. 验证文件大小
    let metadata = fs::metadata(file_path).map_err(|e| format!("无法读取文件信息: {}", e))?;
    let file_size = metadata.len();

    if file_size > MAX_FILE_SIZE {
        return Err(format!(
            "文件过大: {:.2}MB，最大支持 20MB",
            file_size as f64 / 1024.0 / 1024.0
        ));
    }

    // 4. 读取文件内容
    let content = fs::read_to_string(file_path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            format!("权限不足，无法读取文件: {}", path)
        } else {
            format!("读取文件失败，请确认文件编码为 UTF-8: {}", e)
        }
    })?;

    let modified_at = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(FileContent {
        path: file_path.to_string_lossy().to_string(),
        name: file_name,
        content,
        size: file_size,
        modified_at,
    })
}

pub fn scan_markdown_files(dir: &str) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(dir);
    if !dir_path.is_dir() {
        return Err(format!("目录不存在: {}", dir));
    }

    let mut files = Vec::new();
    scan_dir_recursive(dir_path, dir_path, &mut files, 0)?;

    // 按文件名排序
    files.sort_by(|a, b| a.relative_path.to_lowercase().cmp(&b.relative_path.to_lowercase()));

    Ok(files)
}

fn scan_dir_recursive(
    base: &Path,
    dir: &Path,
    files: &mut Vec<FileEntry>,
    depth: u32,
) -> Result<(), String> {
    if depth > MAX_SCAN_DEPTH {
        return Ok(());
    }

    let entries = fs::read_dir(dir).map_err(|e| format!("无法读取目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("无法读取目录项: {}", e))?;
        let path = entry.path();

        if path.is_dir() {
            scan_dir_recursive(base, &path, files, depth + 1)?;
        } else if path.is_file() {
            let ext = path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();

            if ALLOWED_EXTENSIONS.contains(&ext.as_str()) {
                let relative_path = path
                    .strip_prefix(base)
                    .unwrap_or(&path)
                    .to_string_lossy()
                    .to_string();

                let name = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("unknown")
                    .to_string();

                files.push(FileEntry {
                    path: path.to_string_lossy().to_string(),
                    name,
                    relative_path,
                });
            }
        }
    }

    Ok(())
}