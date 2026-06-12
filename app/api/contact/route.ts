import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message } = (body ?? {}) as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // TODO: wire to email service (Resend/Nodemailer).
  // e.g. with Resend:
  //   await resend.emails.send({
  //     from: "site@buildfitness.in",
  //     to: "hello@buildfitness.in",
  //     subject: `New enquiry from ${name}`,
  //     text: JSON.stringify(body, null, 2),
  //   });
  console.log("[contact] new enquiry:", body);

  return NextResponse.json({ ok: true });
}
