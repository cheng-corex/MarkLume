use crate::file_system;
use base64::{Engine as _, engine::general_purpose};

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