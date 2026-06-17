mod commands;
mod file_system;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_markdown_file,
            commands::scan_markdown_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}