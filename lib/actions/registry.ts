import type { ActionDefinition } from "./types";

const actions: ActionDefinition[] = [];

export function registerAction(action: ActionDefinition) {
  if (!actions.find((a) => a.id === action.id)) {
    actions.push(action);
  }
}

export function getActions(): ActionDefinition[] {
  return actions;
}

export function getActionById(id: string): ActionDefinition | undefined {
  return actions.find((a) => a.id === id);
}
