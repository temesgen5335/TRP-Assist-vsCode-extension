// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "trp-assist" is now active!');

	const disposable = vscode.commands.registerCommand('trp-assist.trp-assist', () => {
		vscode.window.showInformationMessage('Hello World from trp1-assist!');

		// const panel = vscode.window.createWebviewPanel(
		// 	'trpAssist', // Identifies the type of the webview. Used internally
		// 	'TRP Assist', // Title of the panel displayed to the users
		// 	vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		// 	{
		// 		enableScripts: true // Enable scripts in the webview
		// 	}
		// );

		// Set the HTML content for the webview
		// panel.webview.html = getWebviewContent(panel.webview);
		// panel.webview.onDidReceiveMessage( async (message: any) => {
		// 	if (message.command === 'sendPrompt') {
		// 		const prompt = message.text;
		// 		console.log('Received prompt from webview:', prompt);
		// 		// Here you would handle the prompt, e.g., send it to your backend or an AI API
		// 		// For demonstration, we'll just echo it back with a delay to simulate processing
		// 		panel.webview.postMessage({ command: 'append', who: 'assistant', content: 'Processing your request...' });
		// 		setTimeout(() => {
		// 			panel.webview.postMessage({ command: 'appendChunk', content: `You said: ${prompt}` });
		// 		}, 2000);
		// 	}
		// });
    
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview): string {
  // You can later move CSS/JS to separate files + use webview.asWebviewUri()
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'self';">
      <style>
        body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); margin: 0; padding: 12px; height: 100vh; display: flex; flex-direction: column; }
        #messages { flex: 1; overflow-y: auto; padding-bottom: 80px; }
        .message { margin: 8px 0; padding: 10px; border-radius: 6px; max-width: 85%; }
        .user    { background: var(--vscode-button-background); color: white; align-self: flex-end; margin-left: auto; }
        .assistant { background: var(--vscode-editor-lineHighlightBackground); align-self: flex-start; }
        #input-area { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px; background: var(--vscode-editor-background); border-top: 1px solid var(--vscode-editor-lineHighlightBorder); display: flex; }
        #input { flex: 1; padding: 8px 12px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; }
        button { margin-left: 8px; padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div id="messages"></div>

      <div id="input-area">
        <input id="input" type="text" placeholder="Ask anything..." autofocus />
        <button onclick="sendMessage()">Send</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const input = document.getElementById('input');

        function appendMessage(who, content) {
          const div = document.createElement('div');
          div.className = \`message \${who}\`;
          div.innerHTML = content.replace(/\\n/g, '<br>');
          messagesDiv.appendChild(div);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function appendChunk(content) {
          const last = messagesDiv.lastElementChild;
          if (last && last.classList.contains('assistant')) {
            last.innerHTML += content.replace(/\\n/g, '<br>');
          } else {
            appendMessage('assistant', content);
          }
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
          const text = input.value.trim();
          if (!text) return;
          appendMessage('user', text);
          vscode.postMessage({ command: 'sendPrompt', text });
          input.value = '';
        }

        input.addEventListener('keypress', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
          }
        });

        window.addEventListener('message', event => {
          const msg = event.data;
          switch (msg.command) {
            case 'append':
              appendMessage(msg.who, msg.content);
              break;
            case 'appendChunk':
              appendChunk(msg.content);
              break;
          }
        });
      </script>
	  
    </body>
    </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
