import type { Tx } from '../db.js';

type Channel = 'PUSH' | 'WHATSAPP' | 'IN_APP';

/**
 * Queues a notification. Delivery happens in the dispatcher so a slow provider
 * never blocks a reconciliation transaction.
 */
export async function notify(
  tx: Tx,
  n: { userId: string; channels: Channel[]; kind: string; title: string; body: string; exceptionId?: string },
) {
  for (const channel of n.channels) {
    await tx.notification.create({
      data: { userId: n.userId, channel, kind: n.kind, title: n.title, body: n.body, exceptionId: n.exceptionId },
    });
  }
}

/** WhatsApp Business Cloud API. Without credentials messages are logged, not sent. */
export async function sendWhatsApp(to: string, body: string): Promise<{ ok: boolean; ref?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    if (!process.env.QUIET_NOTIFY) console.log(`[whatsapp:dry-run] to=${to}\n${body}`);
    return { ok: true, ref: 'dry-run' };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
    });
    const json = (await res.json()) as { messages?: { id: string }[]; error?: { message: string } };
    if (!res.ok) return { ok: false, error: json.error?.message ?? res.statusText };
    return { ok: true, ref: json.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Push delivery hook (FCM/APNs). Stored for the in-app inbox; wire a provider here. */
export async function sendPush(userId: string, title: string, body: string) {
  if (!process.env.QUIET_NOTIFY) console.log(`[push:dry-run] user=${userId} ${title}: ${body}`);
  return { ok: true as const, ref: 'dry-run' };
}
