/**
 * What a digit field is allowed to hold.
 *
 * `integer` is digits only. `decimal` is digits plus a single dot, so an
 * amount can be `0.5` and still cannot contain letters, signs, or a second dot.
 */
export function typedNumber(value: string, kind: "integer" | "decimal"): string {
  if (kind === "integer") return value.replace(/\D/g, "");
  let seenDot = false;
  let out = "";
  for (const char of value) {
    if (char >= "0" && char <= "9") {
      out += char;
      continue;
    }
    if (char === "." && !seenDot) {
      seenDot = true;
      out += ".";
    }
  }
  return out;
}
