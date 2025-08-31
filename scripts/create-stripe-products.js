require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🚀 Creating Stripe products and prices...\n');

    // Create the main product
    const product = await stripe.products.create({
      name: 'BusinessFlow SaaS',
      description: 'All-in-one platform for service businesses',
    });

    console.log('✅ Created product:', product.id);

    // Create prices for each plan
    const plans = [
      {
        name: 'Starter',
        price: 2999, // $29.99 in cents
        id: 'starter',
        features: {
          bookings_per_month: 50,
          team_members: 3,
          support: 'email',
        },
      },
      {
        name: 'Growth',
        price: 5999, // $59.99 in cents
        id: 'growth',
        features: {
          bookings_per_month: 200,
          team_members: 10,
          support: 'priority',
          advanced_features: ['payroll', 'marketing', 'analytics'],
        },
      },
      {
        name: 'Premium',
        price: 9999, // $99.99 in cents
        id: 'premium',
        features: {
          bookings_per_month: 'unlimited',
          team_members: 'unlimited',
          support: 'dedicated',
          advanced_features: ['ai', 'api', 'white_label'],
        },
      },
    ];

    const prices = [];

    for (const plan of plans) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        nickname: plan.name,
        lookup_key: `price_${plan.id}_monthly`,
        metadata: {
          plan_id: plan.id,
          features: JSON.stringify(plan.features),
        },
      });

      prices.push(price);
      console.log(`✅ Created ${plan.name} price:`, price.id, `($${plan.price / 100}/mo)`);
    }

    console.log('\n📋 Summary:');
    console.log('Product ID:', product.id);
    console.log('\nPrice IDs:');
    prices.forEach((price) => {
      console.log(`- ${price.nickname}:`, price.id, `(lookup: ${price.lookup_key})`);
    });

    console.log('\n🔐 Add these to your .env.local:');
    console.log('STRIPE_PRODUCT_ID=' + product.id);
    prices.forEach((price) => {
      console.log(`STRIPE_PRICE_${price.metadata.plan_id.toUpperCase()}_ID=${price.id}`);
    });

    console.log('\n✅ Stripe products created successfully!');
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
}

// Run the script
createProducts();