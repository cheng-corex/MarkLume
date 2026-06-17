use crate::file_system;

#[tauri::command]
pub fn read_markdown_file(path: String) -> Result<file_system::FileContent, String> {
    file_system::read_markdown_file(&path)
}

#[tauri::command]
pub fn scan_markdown_files(path: String) -> Result<Vec<file_system::FileEntry>, String> {
    file_system::scan_markdown_files(&path)
}