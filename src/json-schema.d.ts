declare module 'json-schema' {
  export function validate(instance: any, schema: any): {
    valid: boolean;
    errors: string[];
  };
}
