import { registerAction } from "./registry";
import { webhookAction } from "./webhookAction";
import { mindmapAction } from "./mindmapAction";
import { flowchartAction } from "./flowchartAction";

registerAction(webhookAction);
registerAction(mindmapAction);
registerAction(flowchartAction);

export { getActions, getActionById } from "./registry";
export type { ActionDefinition, ActionResult, Artifact, ActionParam } from "./types";
