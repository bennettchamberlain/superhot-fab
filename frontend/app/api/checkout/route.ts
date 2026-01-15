import {NextRequest, NextResponse} from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const {items, currency = 'usd'} = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({error: 'Cart is empty'}, {status: 400})
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => {
      const price = item.variant?.price || item.price
      const amount = Math.round(price * 100) // Convert to cents

      return {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.title,
            description: item.variant ? `Variant: ${item.variant.name}` : undefined,
            images: item.image?.asset?._ref || item.image?._ref ? [] : undefined,
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      }
    })

    // Create Stripe Checkout Session for Embedded Checkout
    // Note: Apple Pay and Google Pay are automatically enabled when 'card' is used
    // and the customer's device/browser supports them
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      // Enable customer collection for better tracking
      customer_creation: 'always',
      // Collect shipping address if needed
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      // Enable automatic tax calculation (if you have Stripe Tax enabled)
      // automatic_tax: { enabled: true },
      metadata: {
        cartItems: JSON.stringify(items.map((item: any) => ({
          _id: item._id,
          title: item.title,
          slug: item.slug,
          quantity: item.quantity,
          variant: item.variant,
        }))),
      },
    })

    return NextResponse.json({sessionId: session.id})
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      {error: error.message || 'Failed to create checkout session'},
      {status: 500}
    )
  }
}
