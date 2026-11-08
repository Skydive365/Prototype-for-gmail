import { readFileSync } from "node:fs";
import path from "node:path";
import { Playground } from "./Playground";

// Source files shown in the playground's code inspector (all live in /components)
const COMPONENTS = ["EmailRow", "Avatar", "StarButton", "TimeStamp", "AttachmentChip", "LabelChip", "StateLayer", "FocusRing", "SwipeAction"];
const SOURCE_FILES = [...COMPONENTS.flatMap((name) => [`${name}.tsx`, `${name}.module.css`]), "Icon.tsx", "useRowGestures.ts"];

export default function PlaygroundPage() {
  const sources = Object.fromEntries(
    SOURCE_FILES.map((file) => [`components/${file}`, readFileSync(path.join(process.cwd(), "components", file), "utf8")]),
  );
  return <Playground sources={sources} />;
}
