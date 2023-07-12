// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::io::prelude::*;
use std::net::TcpStream;
use std::sync::{Arc, Mutex};
use tauri::{command, State};

// 定义一个AppState结构体，用来存储socket连接
struct AppState {
    socket: Arc<Mutex<Option<TcpStream>>>,
}

// 建立连接的command，接收一个地址参数，返回一个Result
#[command]
fn socket_connect(state: State<AppState>, addr: &str) -> Result<String, String> {
    // 获取state中的socket引用，并加锁
    let mut socket = state.socket.lock().unwrap();
    // 如果已经有连接，不再进行连接并返回连接信息
    if socket.is_some() {
        Ok("Already connected".to_string())
    } else {
        // 如果没有连接，尝试连接到指定的地址
        let stream = TcpStream::connect(addr).map_err(|e| e.to_string())?;
        stream.set_nonblocking(true).map_err(|e| e.to_string())?;
        // 把新的连接放入state中
        *socket = Some(stream);
        // 返回连接结果
        Ok("Connected successfully".to_string())
    }
}

// 读取消息的command，返回一个Result<String>
#[command]
fn socket_read(state: State<AppState>) -> Result<Vec<u8>, String> {
    // 获取state中的socket引用，并加锁
    let mut socket = state.socket.lock().unwrap();
    // 如果有连接，尝试从中读取数据
    if let Some(stream) = socket.as_mut() {
        let mut buffer = [0; 36];
        stream.read(&mut buffer).map_err(|e| e.to_string())?;
        // 把数据转换成字符串并返回
        let data = buffer.to_vec();
        Ok(data)
    } else {
        // 如果没有连接，返回一个错误
        Err("No socket connection".to_string())
    }
}

#[command]
fn socket_write(state: State<AppState>, message: &str) -> Result<(), String> {
    // 获取state中的socket引用，并加锁
    let mut socket = state.socket.lock().unwrap();
    // 如果有连接，尝试向其中写入数据
    if let Some(stream) = socket.as_mut() {
        let data = hex::decode(message).unwrap();
        stream.write(&data).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        // 如果没有连接，返回一个错误
        Err("No socket connection".to_string())
    }
}

#[command]
fn socket_close(state: State<AppState>) -> Result<(), String> {
    // 获取state中的socket引用，并加锁
    let mut socket = state.socket.lock().unwrap();
    // 如果有连接，尝试关闭它
    if let Some(stream) = socket.take() {
        stream
            .shutdown(std::net::Shutdown::Both)
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        // 如果没有连接，返回一个错误
        Err("No socket connection".to_string())
    }
}


fn main() {
    // 创建一个AppState实例，并初始化socket为None
    let app_state = AppState {
        socket: Arc::new(Mutex::new(None)),
    };
    
    // 使用tauri的build函数来启动应用，并注册上面定义的command
    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            socket_connect,
            socket_read,
            socket_write,
            socket_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

