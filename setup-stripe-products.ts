import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');

  try {
    // Create products
    const starterProduct = await stripe.products.create({
      name: 'Starter Plan',
      description: 'Perfect for individuals and small projects',
    });

    const proProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'For growing teams and businesses',
    });

    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'For large organizations with custom needs',
    });

    console.log('✅ Products created');

    // Create prices
    const prices = await Promise.all([
      // Starter prices
      stripe.prices.create({
        product: starterProduct.id,
        unit_amount: 900, // $9.00
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Starter Monthly',
      }),
      stripe.prices.create({
        product: starterProduct.id,
        unit_amount: 9000, // $90.00
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: 'Starter Yearly',
      }),

      // Professional prices
      stripe.prices.create({
        product: proProduct.id,
        unit_amount: 2900, // $29.00
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Professional Monthly',
      }),
      stripe.prices.create({
        product: proProduct.id,
        unit_amount: 29000, // $290.00
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: 'Professional Yearly',
      }),

      // Enterprise prices
      stripe.prices.create({
        product: enterpriseProduct.id,
        unit_amount: 9900, // $99.00
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Enterprise Monthly',
      }),
      stripe.prices.create({
        product: enterpriseProduct.id,
        unit_amount: 99000, // $990.00
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: 'Enterprise Yearly',
      }),
    ]);

    console.log('\n✅ Prices created!');
    console.log('\n📋 Add these to your .env.local:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=${prices[0].id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=${prices[1].id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=${prices[2].id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=${prices[3].id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=${prices[4].id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=${prices[5].id}`);

    // Save to file for convenience
    const envContent = `
# Stripe Price IDs - Generated on ${new Date().toISOString()}
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=${prices[0].id}
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=${prices[1].id}
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=${prices[2].id}
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=${prices[3].id}
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=${prices[4].id}
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=${prices[5].id}
`;

    await require('fs').promises.writeFile('STRIPE_PRICE_IDS.txt', envContent);
    console.log('\n✅ Price IDs saved to STRIPE_PRICE_IDS.txt');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
  }
}

createStripeProducts();