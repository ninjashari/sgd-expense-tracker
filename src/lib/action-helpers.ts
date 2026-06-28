export type ActionResult =
  | { success: true; redirectTo?: string; data?: Record<string, string> }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };
