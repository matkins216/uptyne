import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, email } = await request.json();

    // Verify the user is creating a customer for themselves
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user already has a Stripe customer ID
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (existingProfile?.stripe_customer_id) {
      return NextResponse.json({ 
        message: 'Customer already exists',
        customerId: existingProfile.stripe_customer_id 
      });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        supabase_user_id: userId,
      },
    });

    // Save customer ID to profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error saving customer ID to profile:', profileError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'Customer created successfully',
      customerId: customer.id
    });

  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' }, 
      { status: 500 }
    );
  }
} 