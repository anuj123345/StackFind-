import { Resend } from 'resend';
import { StackExportEmail } from '@/components/email/stack-export-template';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, idea, techStack, plan } = await req.json();

    if (!email || !techStack || !Array.isArray(techStack) || techStack.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one tool to export' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'StackFind <onboarding@resend.dev>', // Change this to your verified domain in production
      to: email,
      subject: `Project Blueprint: ${idea || "Custom Tool Stack"}`,
      react: StackExportEmail({ 
        idea: idea || "Custom Tool Stack", 
        techStack, 
        plan: plan || "No detailed build plan generated yet. Select tools and click 'Generate Plan' in the playground for a custom roadmap." 
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Export email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
