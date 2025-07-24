import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    
    if (user.length === 0 || !user[0].stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user[0].stripeCustomerId,
      limit: 20,
      expand: ['data.subscription'],
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description || `${invoice.lines.data[0]?.description || 'Subscription'}`,
      number: invoice.number,
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}