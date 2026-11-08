// Resolves the CSS variables used by a stylesheet back to their Figma tokens.
import tokens from "@/tokens/tokens.json";

type Token = { type: string; value?: string | number; alias?: string };
type Collections = Record<string, { variables: Record<string, Token> }>;

const collections = tokens.collections as Collections;
const cssVar = (name: string) => "--" + name.replace(/\//g, "-");

export type TokenInfo = {
  cssVar: string;
  figmaName: string;
  collection: string;
  alias?: string;
  light: string;
  dark?: string;
};

function resolve(name: string, layer: Record<string, Token>): string {
  const token = layer[name] ?? collections.Primitives.variables[name] ?? collections.Typography.variables[name];
  if (!token) return "?";
  if (token.alias) return resolve(token.alias, collections.Primitives.variables);
  return typeof token.value === "number" ? `${token.value}px` : String(token.value);
}

const INDEX = new Map<string, TokenInfo>();
for (const [collection, { variables }] of Object.entries(collections)) {
  if (collection === "Semantic Dark") continue;
  for (const [name, token] of Object.entries(variables)) {
    const dark = collections["Semantic Dark"].variables[name];
    INDEX.set(cssVar(name), {
      cssVar: cssVar(name),
      figmaName: name,
      collection,
      alias: token.alias,
      light: resolve(name, variables),
      dark: dark ? resolve(name, collections["Semantic Dark"].variables) : undefined,
    });
  }
}

export type TextStyleInfo = { name: string; className: string; tokens: TokenInfo[] };

const TEXT_STYLES = tokens.textStyles as Record<string, Record<string, string>>;

/** Text styles referenced as `text-…` class names (e.g. "text-body-large") in component code. */
export function textStylesUsedIn(code: string): TextStyleInfo[] {
  return Object.entries(TEXT_STYLES)
    .map(([name, parts]) => ({ name, className: "text-" + name.replace(/\//g, "-"), parts }))
    .filter(({ className }) => new RegExp(`["\` ]${className}["\` ]`).test(code))
    .map(({ name, className, parts }) => ({
      name,
      className,
      tokens: Object.values(parts).map((t) => INDEX.get(cssVar(t))).filter((t): t is TokenInfo => Boolean(t)),
    }));
}

/** Every token referenced with var(--…) in the given CSS, in order of first use. */
export function tokensUsedIn(css: string): TokenInfo[] {
  const names = new Set(Array.from(css.matchAll(/var\((--[a-z0-9-]+)\)/g), (m) => m[1]));
  return [...names].map((n) => INDEX.get(n)).filter((t): t is TokenInfo => Boolean(t));
}
