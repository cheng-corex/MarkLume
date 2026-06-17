mod commands;
mod file_system;

use std::sync::Mutex;
use tauri::{Manager, State};

struct AppState {
    initial_file: Mutex<Option<String>>,
}

#[tauri::command]
fn get_initial_file(state: State<AppState>) -> Option<String> {
    state.initial_file.lock().unwrap().take()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let initial_path = args.get(1).cloned();
            app.manage(AppState {
                initial_file: Mutex::new(initial_path),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_markdown_file,
            commands::scan_markdown_files,
            get_initial_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}