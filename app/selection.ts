import type { Breed } from "./breeds";
import type { Fact } from "./facts";

export type SelectionKey = { kind: "breed"; id: Breed["id"] } | { kind: "fact"; id: Fact["id"] };

type ResolvedSelection =
  | { kind: "breed"; item: Breed; index: number }
  | { kind: "fact"; item: Fact };

export function resolveSelection(
  selection: SelectionKey | null,
  breeds: readonly Breed[],
  facts: readonly Fact[],
): ResolvedSelection | null {
  if (!selection) return null;

  if (selection.kind === "breed") {
    const index = breeds.findIndex((breed) => breed.id === selection.id);
    return index < 0 ? null : { kind: "breed", item: breeds[index], index };
  }

  const fact = facts.find((fact) => fact.id === selection.id);
  return fact ? { kind: "fact", item: fact } : null;
}
