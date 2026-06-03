export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });
}

const PRICE_AMOUNT = 999; // $9.99 in cents
const PRODUCT_NAME = "StarlitX — Abyssal Patron";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments not configured yet." }, { status: 503 });
  }

  try {
    const stripe = getStripe();
    const { userId } = await req.json();
    const origin = req.headers.get("origin") ?? "https://starlitx.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: PRICE_AMOUNT,
            product_data: {
              name: PRODUCT_NAME,
              description: "One-time Patron pledge — golden leaderboard name, +100 starting gold, eternal status.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: userId ?? "" },
      success_url: `${origin}/game?patron=success`,
      cancel_url: `${origin}/premium?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
