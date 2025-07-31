import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  
  // Get customer details from Stripe
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    console.log('Customer has been deleted');
    return;
  }

  const customerData = customer as Stripe.Customer;
  const userEmail = customerData.email;

  if (!userEmail) {
    console.log('No email found for customer:', customerId);
    return;
  }

  // Find user by email in Supabase
  const { data: user, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }

  const targetUser = user.users.find((u: any) => u.email === userEmail);
  
  if (!targetUser) {
    console.log('No user found for email:', userEmail);
    return;
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', targetUser.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    await supabase
      .from('profiles')
      .update({ 
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUser.id);
  } else {
    // Create new profile
    await supabase
      .from('profiles')
      .insert({
        id: targetUser.id,
        stripe_customer_id: customerId
      });
  }

  console.log(`Updated profile for user ${targetUser.id} with customer ID ${customerId}`);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  
  // Optionally handle subscription cancellation
  // You might want to update user permissions or send notifications
  console.log(`Subscription cancelled for customer: ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  
  // Handle successful payment
  console.log(`Payment succeeded for customer: ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  
  // Handle failed payment
  console.log(`Payment failed for customer: ${customerId}`);
} 