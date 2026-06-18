use crate::file_system;
use base64::{Engine as _, engine::general_purpose};
use std::time::SystemTime;

#[tauri::command]
pub fn read_markdown_file(path: String) -> Result<file_system::FileContent, String> {
    file_system::read_markdown_file(&path)
}

#[tauri::command]
pub fn scan_markdown_files(path: String) -> Result<Vec<file_system::FileEntry>, String> {
    file_system::scan_markdown_files(&path)
}

#[tauri::command]
pub fn scan_folder_tree(path: String) -> Result<file_system::TreeNode, String> {
    file_system::scan_folder_tree(&path)
}

#[tauri::command]
pub fn read_image_data(path: String) -> Result<String, String> {
    let bytes = std::fs::read(&path)
        .map_err(|e| format!("无法读取文件: {}", e))?;
    Ok(general_purpose::STANDARD.encode(&bytes))
}

#[tauri::command]
pub fn get_file_modified_time(path: String) -> Result<u64, String> {
    let metadata = std::fs::metadata(&path)
        .map_err(|e| format!("无法读取文件信息: {}", e))?;
    let modified = metadata
        .modified()
        .map_err(|e| format!("无法获取修改时间: {}", e))?;
    let duration = modified
        .duration_since(SystemTime::UNIX_EPOCH)
        .map_err(|e| format!("时间转换错误: {}", e))?;
    Ok(duration.as_secs())
}
