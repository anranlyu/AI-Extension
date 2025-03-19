declare module '@tailwindcss/vite';

declare module "wxt" {
  export function defineContentScript<T>(config: T): T;
}

declare module 'wxt/client' {
  export function defineContentScript(options: {
    matches: string[];
    cssInjectionMode?: string;
    main: (ctx: any) => Promise<void>;
  }): any;
}

declare function defineContentScript(options: {
  matches: string[];
  cssInjectionMode?: string;
  main: (ctx: any) => Promise<void>;
}): any;

