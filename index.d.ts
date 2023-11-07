import { CookieJar } from 'cookiejar';
import { Response as FetchResponse } from 'node-fetch-commonjs';

declare global {
  interface Window {
    prototype: Window;
  }
  interface Document {
    prototype: Document;
  }
  interface MutationObserver {
    prototype: MutationObserver;
    new(callback: MutationCallback): MutationObserver;
  }
}

declare module "@expressen/tallahassee" {
  export class BrowserTab {
    /** Cheerio context */
    get $(): cheerio.Cheerio;
    get jar(): CookieJar;
    get response(): FetchResponse;
    get _pending(): Promise<BrowserTab>;
    window: Window;
    document: Document;
    navigateTo(uri: string, headers?: Record<string, any>, statusCode?: number): Promise<BrowserTab>;
    load(markup: string): BrowserTab;
    focusIframe(element: HTMLElement, src: string): Promise<BrowserTab>;
    runScript(script: HTMLElement): void;
    runScripts(context?: Node): void;
    mutated(targetNode: Node, config?: { childList?: boolean, attributes?: boolean }): Promise<any[]>;
  }

  export class WebPage {
    navigateTo(uri: string, headers?: Record<string, any>, statusCode?: number): Promise<BrowserTab>;
    load(markup: string): Promise<BrowserTab>;
    submit(uri: string, options?: Record<string, any>): Promise<BrowserTab>;
    fetch(uri: string, requestOptions?: Record<string, any>): Promise<FetchResponse>;
  }

  class Browser {
    constructor(origin: any, options?: Record<string, any>);
    constructor(options?: Record<string, any>);
    navigateTo(uri: string, headers?: Record<string, any>, statusCode?: number): Promise<BrowserTab>;
    load(markup: string): Promise<BrowserTab>;
  }

  interface DOMInterface {
    Document: Document;
    HTMLCollection: HTMLCollection;
    IntersectionObserver: IntersectionObserver;
    MutationObserver: MutationObserver;
    Window: Window;
    Storage: Storage;
  }

  export const DOM: DOMInterface;

  export = Browser;
}
