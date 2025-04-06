// import { GameScene } from "@/Game/Scenes/Game-Scene";

// export class ChatComponent {
//     private scene: Phaser.Scene;
//     private container: Phaser.GameObjects.Container;
//     private messageLog: Phaser.GameObjects.Text;
//     private inputField: HTMLInputElement;
//     private inputLabel: HTMLLabelElement;
//     private messages: { sender: string; text: string }[] = [];
//     public visible: boolean = false;
  
//     constructor(scene: Phaser.Scene) {
//       this.scene = scene;
      
//       // Create UI container
//       this.container = scene.add.container(10, scene.cameras.main.height - 200);
//       this.container.setScrollFactor(0); // Fixed to camera
      
//       // Background panel
//       const panel = scene.add.rectangle(0, 0, 300, 150, 0x000000, 0.7);
      
//       // Message log area
//       this.messageLog = scene.add.text(10, 10, "", {
//         fontSize: '14px',
//         color: '#ffffff',
//         wordWrap: { width: 280 }
//       });
      
//       // Add components to container
//       this.container.add([panel, this.messageLog]);
//       this.container.setDepth(100);
      
//       // Create HTML input element for chat
//       this.inputField = document.createElement('input');
//       this.inputField.type = 'text';
//       this.inputField.size = 14;
//       this.inputField.style.position = 'absolute';
//       this.inputField.style.bottom = '40px';
//       this.inputField.style.left = '10px';
//       this.inputField.style.width = '300px';
//       this.inputField.style.padding = '8px';
//       this.inputField.style.display = 'none';

//       this.inputLabel = document.createElement('label');
//       this.inputLabel.textContent = 'Enter your message';
//       this.inputLabel.style.position = 'absolute';
//       this.inputLabel.style.bottom = '50px';
//       this.inputLabel.style.left = '10px';
//       this.inputLabel.style.width = '300px';
//       this.inputLabel.style.padding = '8px';
//       this.inputLabel.style.display = 'none';
      
//       document.body.appendChild(this.inputField);
      
//       // Handle sending messages
//       this.inputField.addEventListener('keydown', (e) => {
//         if (e.key === 'Enter' && this.inputField.value.trim() !== '') {
//           this.sendMessage(this.inputField.value);
//           this.inputField.value = '';
//         }
//       });
      
//       // Hide initially
//       this.setVisible(false);
//     }
    
//     setVisible(visible: boolean) {
//       this.visible = visible;
//       this.container.setVisible(visible);
//       this.inputField.style.display = visible ? 'block' : 'none';
      
//       if (visible) {
//         this.inputField.focus();
//       }
//     }
    
//     toggle() {
//       this.setVisible(!this.visible);
//     }
    
//     addMessage(sender: string, text: string) {
//       this.messages.push({ sender, text });
      
//       // Limit to most recent 5 messages
//       if (this.messages.length > 5) {
//         this.messages.shift();
//       }
      
//       // Update message display
//       this.updateMessageDisplay();
//     }
    
//     updateMessageDisplay() {
//       let displayText = "";
//       this.messages.forEach(msg => {
//         displayText += `${msg.sender}: ${msg.text}\n`;
//       });
      
//       this.messageLog.setText(displayText);
//     }
    
//     sendMessage(text: string) {
//       const gameScene = this.scene as GameScene;
      
//       // Add to local chat
//       this.addMessage("You", text);
      
//       // Send to server if connected
//       if (gameScene.gameRoom) {
//         gameScene.gameRoom.send("chatMessage", {
//           text: text,
//           senderName: "Player" // Could be a username set elsewhere
//         });
//       }
//     }
    
//     updatePartnersList(partners: any[]) {
//       // Optionally show who you're chatting with
//       const partnerNames = partners.map(p => p.sessionId).join(", ");
//       // Could display this information somewhere in the UI
//     }
//   }
  

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { GameScene } from "@/Game/Scenes/Game-Scene";

// React component for the chat UI
const ChatUI: React.FC<{
  messages: { sender: string; text: string }[];
  visible: boolean;
  onSendMessage: (text: string) => void;
}> = ({ messages, visible, onSendMessage }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when chat becomes visible
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-15 left-2 z-50 font-pixelify">
      <div className="w-80 rounded p-2 text-white">
        {/* Messages display area */}
        <div className="h-32 overflow-y-auto mb-2">
          {messages.map((msg, index) => (
            <div key={index} className="mb-1">
              <span className="font-bold">{msg.sender}:</span> {msg.text}
            </div>
          ))}
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow bg-yellow-800/50 text-white px-2 py-2 rounded-l focus:outline-none"
            placeholder="Type a message..."
          />
          <button 
            type="submit" 
            className="bg-yellow-500 text-black px-4 py-1 rounded-r hover:bg-yellow-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export class ChatComponent {
  private scene: Phaser.Scene;
  private messages: { sender: string; text: string }[] = [];
  public visible: boolean = true;
  private reactRoot: any;
  private rootElement: HTMLDivElement;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create container for React component
    this.rootElement = document.createElement('div');
    document.body.appendChild(this.rootElement);
    this.reactRoot = createRoot(this.rootElement);
    
    // Initial render
    this.renderReactComponent();
    
    // Hide initially
    // this.setVisible(false);
  }
  
  private renderReactComponent() {
    this.reactRoot.render(
      <ChatUI 
        messages={this.messages}
        visible={this.visible}
        onSendMessage={(text) => this.sendMessage(text)}
      />
    );
  }
  
  setVisible(visible: boolean) {
    this.visible = visible;
    this.renderReactComponent();
  }
  
  toggle() {
    this.setVisible(!this.visible);
  }
  
  addMessage(sender: string, text: string) {
    this.messages.push({ sender, text });
    
    // Limit to most recent 5 messages
    if (this.messages.length > 5) {
      this.messages.shift();
    }
    
    // Update React component
    this.renderReactComponent();
  }
  
  sendMessage(text: string) {
    const gameScene = this.scene as GameScene;
    
    // Add to local chat
    this.addMessage("You", text);
    
    // Send to server if connected
    if (gameScene.gameRoom) {
      gameScene.gameRoom.send("chatMessage", {
        text: text,
        senderName: "Player" // Could be a username set elsewhere
      });
    }
  }
  
  updatePartnersList(partners: any[]) {
    // This could be expanded to show partners in the UI
    this.renderReactComponent();
  }
  
  destroy() {
    // Clean up when component is destroyed
    if (this.rootElement) {
      document.body.removeChild(this.rootElement);
    }
  }
}