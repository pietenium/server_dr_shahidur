declare module "whatsapp-web.js" {
  import { EventEmitter } from "events";
  export class Client extends EventEmitter {
    constructor(options: {
      authStrategy?: any;
      puppeteer?: { args?: string[] };
    }): void;
    initialize(): Promise<void>;
    on(event: "qr", listener: (qr: string) => void): this;
    on(event: "ready", listener: () => void): this;
    sendMessage(chatId: string, content: string): Promise<Message>;
    destroy(): Promise<void>;
  }
  export class LocalAuth {
    constructor(options: { sessionPath?: string }): any;
  }
  export class Message {
    id: { id: string };
    body: string;
  }
}
