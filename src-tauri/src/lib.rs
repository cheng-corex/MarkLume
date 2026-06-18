mod commands;
mod file_system;

use tauri::{Emitter, Manager};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // 第二个实例启动时，将文件路径发送给已运行的窗口并将窗口置顶
            if let Some(file_path) = argv.get(1) {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                    let _ = window.emit("file-opened", file_path.clone());
                }
            }
        }))
        .setup(|app| {
            // 处理首次启动时的命令行参数
            let args: Vec<String> = std::env::args().collect();
            if let Some(file_path) = args.get(1) {
                if let Some(window) = app.get_webview_window("main") {
                    let path = file_path.clone();
                    let w = window.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(500));
                        let _ = w.set_focus();
                        let _ = w.emit("file-opened", path);
                    });
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_markdown_file,
            commands::scan_markdown_files,
            commands::scan_folder_tree,
            commands::read_image_data,
            commands::get_file_modified_time,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}