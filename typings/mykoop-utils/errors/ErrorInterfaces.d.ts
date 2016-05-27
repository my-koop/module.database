
declare module ErrorInterfaces {
  export interface SerializeResult {
      context: string;
      validation?: any;
      app?: any;
      [id: string]: any;
  }
}
