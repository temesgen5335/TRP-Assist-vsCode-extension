import * as vscode from 'vscode';
import Ollama from 'ollama';
// import { SYSTEM_PROMPT } from './systemPrompt';

const SYSTEM_PROMPT = `
You are TRP Assistant.

Your role is to support TRP trainees and colleagues throughout the TRP training program.

You specialize in:
- Technical AI engineering guidance
- Document parsing and extraction
- Summarizing complex training and challenge documents
- Explaining tasks and requirements clearly
- Contextualizing and referencing provided documents
- Giving concise, practical, implementation-focused answers

Assume the user is a TRP trainee or colleague.
Be precise, structured, and helpful.
`;


export function activate(context: vscode.ExtensionContext) {
  console.log('TRP Assist activated');

  const command = vscode.commands.registerCommand('trp-assist.trp-assist', () => {
    const panel = vscode.window.createWebviewPanel(
      'trpAssist',
      'TRP Assist',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = getWebviewContent(panel.webview);

    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command !== 'sendPrompt') return;

      const prompt: string = message.text;

      // create empty assistant message
      panel.webview.postMessage({
        command: 'assistantStart'
      });

      try {
        const stream = await Ollama.chat({
          model: 'qwen2.5:7b',
          messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt }
            ],
          stream: true
        });

        for await (const chunk of stream) {
          const token = chunk.message?.content ?? '';
          if (token) {
            panel.webview.postMessage({
              command: 'assistantChunk',
              text: token
            });
          }
        }
      } catch (err) {
        console.error(err);
        panel.webview.postMessage({
          command: 'assistantChunk',
          text: '\n\n⚠️ Error communicating with Ollama.'
        });
      }
    });
  });

  context.subscriptions.push(command);
}

function getWebviewContent(webview: vscode.Webview): string {
  const nonce = getNonce();

  return /* html */ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--vscode-font-family);
          background: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }

        #chat {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .msg {
          max-width: 80%;
          margin: 6px 0;
          padding: 8px 12px;
          border-radius: 6px;
          white-space: pre-wrap;
        }

        .user {
          align-self: flex-end;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }

        .assistant {
          align-self: flex-start;
          background: var(--vscode-editor-lineHighlightBackground);
        }

        #input-bar {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid var(--vscode-editorGroup-border);
          background: var(--vscode-editor-background);
        }

        input {
          flex: 1;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--vscode-input-border);
          background: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
        }

        button {
          padding: 8px 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
      </style>
      </head>

      <body>
        <div id="chat"></div>

        <div id="input-bar">
          <input id="input" placeholder="Ask Ogitllama…" />
          <button id="send">Ask</button>
        </div>


        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          const messages = document.getElementById('chat');
          const input = document.getElementById('input');
          const sendBtn = document.getElementById('send');

          let currentAssistant = null;

          function addMessage(role, text = '') {
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.textContent = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            return div;
          }

          sendBtn.onclick = send;
          input.addEventListener('keydown', e => {
            if (e.key === 'Enter') send();
          });

          function send() {
            const text = input.value.trim();
            if (!text) return;

            addMessage('user', text);
            vscode.postMessage({ command: 'sendPrompt', text });
            input.value = '';
          }

          window.addEventListener('message', event => {
            const { command, text } = event.data;

            if (command === 'assistantStart') {
              currentAssistant = addMessage('assistant', '');
            }

            if (command === 'assistantChunk' && currentAssistant) {
              currentAssistant.textContent += text;
              messages.scrollTop = messages.scrollHeight;
            }
          });
        </script>
      </body>
    </html>`;
}

function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}
