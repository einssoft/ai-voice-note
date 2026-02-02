import type { ActionDefinition } from "./types";

export const webhookAction: ActionDefinition = {
  id: "webhook",
  title: "Webhook",
  icon: "Send",
  category: "integrate",
  description: "actions.webhookDesc",
  requiresNetwork: true,
  params: [
    {
      key: "endpointUrl",
      label: "URL",
      type: "string",
      placeholder: "https://example.com/webhook",
      required: true,
    },
    {
      key: "includeTranscript",
      label: "actions.includeTranscript",
      type: "boolean",
      defaultValue: false,
    },
  ],
  run: async (session, params) => {
    const url = params.endpointUrl as string;
    if (!url) {
      return { ok: false, message: "actions.webhookNoUrl" };
    }
    try {
      new URL(url);
    } catch {
      return { ok: false, message: "actions.webhookInvalidUrl" };
    }

    const payload: Record<string, unknown> = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      mode: session.mode,
      enriched: session.enriched,
      keywords: session.metadata.keywords,
    };
    if (params.includeTranscript) {
      payload.transcript = session.transcript;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return {
          ok: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      return {
        ok: true,
        message: "actions.webhookSuccess",
        artifacts: [{ type: "url", content: url, label: `POST ${url}` }],
      };
    } catch (error) {
      clearTimeout(timeout);
      const msg = error instanceof Error ? error.message : String(error);
      return { ok: false, message: msg };
    }
  },
};
