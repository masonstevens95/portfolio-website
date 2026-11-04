import { describe, it, expect, vi, beforeEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const { renderDownloadEmail, sendDownloadEmail } = await import("./email.js");

const config = { apiKey: "re_test", from: "Plans <plans@masonstevens.dev>" };
const email = {
  to: "buyer@example.com",
  planTitle: "2x4 Tool Cage",
  thanksUrl: "https://masonstevens.dev/plans/thanks?session_id=cs_live_abc",
  idempotencyKey: "plan-download/cs_live_abc",
};

describe("renderDownloadEmail", () => {
  it("links to the thanks page and states the access window", () => {
    const { subject, text, html } = renderDownloadEmail(email);
    expect(subject).toBe("Your plans: 2x4 Tool Cage");
    expect(text).toContain(email.thanksUrl);
    expect(html).toContain(email.thanksUrl.replace(/&/g, "&amp;"));
    expect(text).toMatch(/30 days/);
  });

  it("escapes HTML in plan titles", () => {
    const { html } = renderDownloadEmail({ ...email, planTitle: `<script>"x"&'y'</script>` });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
  });
});

describe("sendDownloadEmail", () => {
  beforeEach(() => send.mockReset());

  it("sends once with the idempotency key and a reply-to", async () => {
    send.mockResolvedValue({ data: { id: "em_1" }, error: null });
    await sendDownloadEmail(config, email);
    expect(send).toHaveBeenCalledTimes(1);
    const [payload, options] = send.mock.calls[0];
    expect(payload).toMatchObject({ from: config.from, to: email.to, replyTo: "mason.c.stevens@gmail.com" });
    expect(options).toEqual({ idempotencyKey: email.idempotencyKey });
  });

  it("throws on any Resend error so the session is not marked fulfilled", async () => {
    send.mockResolvedValue({ data: null, error: { name: "rate_limit_exceeded", message: "slow down" } });
    await expect(sendDownloadEmail(config, email)).rejects.toThrow(/rate_limit_exceeded/);
  });

  it("throws on a concurrent idempotent request (the other delivery owns the send)", async () => {
    send.mockResolvedValue({ data: null, error: { name: "concurrent_idempotent_requests", message: "in progress" } });
    await expect(sendDownloadEmail(config, email)).rejects.toThrow(/concurrent_idempotent_requests/);
  });
});
