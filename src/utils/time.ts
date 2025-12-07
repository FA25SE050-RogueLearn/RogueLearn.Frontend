export type FormatOptions = {
  includeSeconds?: boolean
  separator?: "T" | " "
  locale?: string
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function safeDate(input: unknown): Date | null {
  if (!input) return null
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input as Date
  return isValidDate(d) ? d : null
}

function getParts(input: Date | string | number, timeZone: string, locale?: string) {
  const dt = typeof input === "string" || typeof input === "number" ? new Date(input) : input
  const fmt = new Intl.DateTimeFormat(locale ?? "en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
  const parts = fmt.formatToParts(dt)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  }
}

export function formatInTimezone(input: Date | string | number, timeZone: string, options?: FormatOptions) {
  const { includeSeconds = true, separator = "T", locale } = options ?? {}
  const p = getParts(input, timeZone, locale)
  const base = `${p.year}-${p.month}-${p.day}${separator}${p.hour}:${p.minute}`
  return includeSeconds ? `${base}:${p.second}` : base
}

export function nowInTimezone(timeZone: string, options?: FormatOptions) {
  return formatInTimezone(new Date(), timeZone, options)
}

export function formatBangkok(input?: Date | string | number, options?: FormatOptions) {
  return formatInTimezone(input ?? new Date(), "Asia/Bangkok", options)
}

export function nowBangkok(options?: FormatOptions) {
  return nowInTimezone("Asia/Bangkok", options)
}

export function datetimeLocalInTimezone(input: Date | string | number, timeZone: string) {
  const p = getParts(input, timeZone)
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}

export function datetimeLocalBangkok(input?: Date | string | number) {
  return datetimeLocalInTimezone(input ?? new Date(), "Asia/Bangkok")
}