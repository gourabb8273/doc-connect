/** Server-only MSG91 env — bracket access avoids Turbopack inlining empty values. */

export function getMsg91AuthKey(): string {
  return (process.env["MSG91_AUTH_KEY"] ?? "").trim();
}

export function getMsg91WidgetId(): string {
  return (process.env["MSG91_WIDGET_ID"] ?? "").trim();
}

export function getMsg91AuthToken(): string {
  return (process.env["MSG91_AUTH_TOKEN"] ?? "").trim();
}

export function getMsg91TemplateId(): string {
  return (process.env["MSG91_TEMPLATE_ID"] ?? "").trim();
}

export function isSmsDevModeEnv(): boolean {
  return process.env["SMS_DEV_MODE"] === "true";
}

export function isMsg91Configured(): boolean {
  return (
    isSmsDevModeEnv() ||
    !!getMsg91AuthKey() ||
    !!getMsg91TemplateId()
  );
}
