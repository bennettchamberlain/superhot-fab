import {NextRequest, NextResponse} from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({error: 'Session ID is required'}, {status: 400})
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.client_secret) {
      return NextResponse.json({error: 'Client secret not found'}, {status: 404})
    }

    return NextResponse.json({clientSecret: session.client_secret})
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error)
    return NextResponse.json(
      {error: error.message || 'Failed to retrieve checkout session'},
      {status: 500}
    )
  }
}
