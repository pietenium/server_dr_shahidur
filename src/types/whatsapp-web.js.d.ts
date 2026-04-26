declare module "whatsapp-web.js" {
  export interface ClientOptions {
    authStrategy: LocalAuth;
    puppeteer?: {
      headless: boolean;
      args?: string[];
    };
  }

  export interface LocalAuthOptions {
    dataPath?: string;
    clientId?: string;
  }

  export class LocalAuth {
    constructor(options?: LocalAuthOptions);
  }

  export interface MessageSendOptions {
    linkPreview?: boolean;
  }

  export class Client {
    constructor(options: ClientOptions);
    on(event: "qr", callback: (qr: string) => void): this;
    on(event: "ready", callback: () => void): this;
    on(event: "disconnected", callback: (reason: string) => void): this;
    on(event: "auth_failure", callback: (message: string) => void): this;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    sendMessage(
      chatId: string,
      content: string,
      options?: MessageSendOptions,
    ): Promise<Message>;
    getState(): Promise<string>;
  }

  export interface MessageContact {
    pushname?: string;
    isMe?: boolean;
  }

  export class Message {
    id: {
      _serialized: string;
    };
    body: string;
    from: string;
    to: string;
    timestamp: number;
    hasMedia: boolean;
    type: string;
    _data: {
      notifyName?: string;
      isNewMsg?: boolean;
    };
  }

  export enum MessageTypes {
    TEXT = "chat",
    AUDIO = "audio",
    VOICE = "ptt",
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
    STICKER = "sticker",
    LOCATION = "location",
    CONTACT_CARD = "vcard",
  }
}
