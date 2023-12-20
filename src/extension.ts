// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios,{ AxiosResponse, AxiosError } from 'axios';

let inputCount: number = 0;
let lastUpdateTime: number = Date.now();
let lastSpeed: number = 0;

interface Music {
    id: number;
    name: string;
    artist: string;
    cover: string;
    url: string;
    kind: number;
    text: string;
    type: string;
}

let musicSet: Music[] = [];
let panel: vscode.WebviewPanel | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	console.log('Extension "helloworld" is now active!');

    await getMusicFromServer();

	// 打开 Webview
    panel = vscode.window.createWebviewPanel(
        'audioPlayer', // 唯一标识符
        'Audio Player', // 标题
        vscode.ViewColumn.Nine, // 显示在编辑器的哪个部分
        {
            enableScripts: true // 允许在 Webview 中执行脚本
        }
    );

    // Webview 的 HTML 内容
    panel.webview.html = getWebviewContent(0);


    // The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Code With Music on!');
	});

	context.subscriptions.push(disposable);

	// 注册事件监听器，当文档发生变化时调用
    vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument);

    // 注册事件监听器，当活动编辑器发生变化时调用
    vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor);
/*
    let newMusicId = -1; 

	setInterval(() => {
        newMusicId = calculateAndShowAverageRate();
        if(newMusicId !== -1){
            panel.webview.html = getWebviewContent(newMusicId);
        }
    }, 10000);
*/
    // 手动执行一次以获取初始状态
    updateLanguageInfo();
    lastSpeed = 0;
}

// 监听文档变化事件
function onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
	// 获取当前活跃的文本编辑器
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        // 计算输入字符数量
    inputCount += event.contentChanges.reduce((count, change) => count + change.text.length, 0);
    }

    if(inputCount >= 20) {//如果更新字数大于20，触发速度计算
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastUpdateTime;

        // 计算平均速率（每秒输入的字符数）
        const nowSpeed = inputCount / (elapsedTime / 1000);
        const averageRate = nowSpeed.toFixed(2);

        // 重置输入计数和更新时间
        inputCount = 0;
        lastUpdateTime = currentTime;

        let musicId = -1;

        //与lastSpeed比较，确定是否触发改变音乐
        let diff = lastSpeed - nowSpeed;
        if(diff < 0){ diff = - diff; }
        if(diff > 1){
            musicId = rollNewMusic(nowSpeed);
        }
        // 显示平均速率信息
        vscode.window.showInformationMessage(`Average Input Rate: ${averageRate} chars/s`);
        //console.log('check:',musicSet);  

        if(musicId !== -1){
            if(panel){
                panel.webview.html = getWebviewContent(musicId);
            }
        }
    }
}

// 监听活跃编辑器变化事件
function onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
    // 更新当前活跃编辑器的语言信息
    updateLanguageInfo();
}

// 更新当前活跃编辑器的语言信息
function updateLanguageInfo() {
    // 获取当前活跃的文本编辑器
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        // 获取当前文本编辑器的语言 ID
        const languageId = editor.document.languageId;

        // 显示语言信息
        vscode.window.showInformationMessage(`Current language: ${languageId}`);
    }
}

async function getMusicFromServer() {
    const musicUrl = 'http://localhost:3001/api/musics';

    await axios.get(musicUrl)
  .then((response: AxiosResponse) => {
    // 请求成功，处理响应数据
    
    musicSet = response.data;
    console.log('Music Set:', musicSet);
  })
  .catch((error: AxiosError) => {
    // 请求失败，处理错误
    console.error('Error:', error.message);
  });
}

function rollNewMusic(nowSpeed: number):number{
    let curKind = 0; 
    let musicId = 0;
    if(nowSpeed === 0) {
        curKind = 0;
    } else if(nowSpeed > 0 && nowSpeed < 1) {
        curKind = 1;
    } else if(nowSpeed >=1 && nowSpeed < 2) {
        curKind = 2;
    } else if(nowSpeed >=2 && nowSpeed < 3){
        curKind = 3;
    } else {
        curKind = 4;
    }
    
    let randomInteger = Math.floor(Math.random() * 10) + 1;
    randomInteger = randomInteger % musicSet.length;
    for(let i = randomInteger ; i < musicSet.length ; i++){
        if(musicSet[i].kind === curKind){
            musicId = i;
            break;
        }
    }
    return musicId;
}

function getWebviewContent(musicId: any) {
    console.log(musicId,musicSet);
    const musicUrl = musicSet[musicId].url;
    console.log(musicUrl);
    return `
        <!DOCTYPE html>
        <html>
        <body>

        <h1>Audio Player</h1>
        <h2>playing music ${musicId}<h2>
        <audio controls autoplay>
            <source src="${musicUrl}" type="audio/mp3">
            Your browser does not support the audio tag.
        </audio>

        </body>
        </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
