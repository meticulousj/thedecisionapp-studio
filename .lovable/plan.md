

# Subscription Management Plan

Add full subscription lifecycle handling so the app correctly grants, downgrades, and revokes Pro access when users cancel, change plans, or have failed payments.

## Prerequisite

Lovable Cloud and Stripe payments must be enabled first (in progress from earlier turn). Once enabled, this plan implements the subscription logic on top.

## What you get

1. **A single source of truth** for each user's plan (`free` / `pro`) and status (`active`, `canceled`, `past_due`, `grace_period`).
2. **Automatic access updates** when:
   - User cancels → keeps Pro until period end, then downgrades to Free.
   - User downgrades → switches plan at next renewal.
   - Payment fails → enters 7-day grace period, then downgrades to Free.
   - Payment recovers → restored to Pro automatically.
3. **A Billing page** where users can view plan, cancel, resume, change plan, and update payment method.
4. **Feature gating** wired into the existing tools (entry caps on Free, Pro features locked behind plan check).

## User-facing flow

```text
Settings → Billing
┌─────────────────────────────────────────┐
│  Current plan: Pro Monthly              │
│  Status: Active · Renews May 22         │
│                                         │
│  [Manage payment method]                │
│  [Change plan]   [Cancel subscription]  │
└─────────────────────────────────────────┘

After cancel:
│  Status: Canceled · Access until May 22 │
│  [Resume subscription]                  │

After failed payment:
│  Status: Payment failed · Retrying      │
│  Grace period ends in 5 days            │
│  [Update payment method]                │
```

## Technical implementation

**Database (`subscribers` table)**
- `user_id`, `stripe_customer_id`, `stripe_subscription_id`
- `plan` (`free` | `pro`), `tier` (`monthly` | `yearly`)
- `status` (`active` | `canceled` | `past_due` | `grace_period` | `incomplete`)
- `current_period_end`, `cancel_at_period_end`, `grace_period_end`
- RLS: users read own row only; writes via service role from edge functions.

**Edge functions**
1. `stripe-webhook` — handles events:
   - `checkout.session.completed` → set plan=pro, status=active
   - `customer.subscription.updated` → update tier, period_end, cancel_at_period_end
   - `customer.subscription.deleted` → plan=free, status=canceled
   - `invoice.payment_failed` → status=past_due, set grace_period_end (+7 days)
   - `invoice.payment_succeeded` → status=active, clear grace_period_end
2. `create-portal-session` — returns a Stripe Billing Portal URL for managing payment method, canceling, and switching plans (Stripe handles the UI).
3. `check-subscription` — called on app load; reconciles local state with Stripe in case a webhook was missed.

**Frontend**
- `useSubscription()` hook: returns `{ plan, status, isPro, daysLeft, isInGracePeriod }`.
- `<BillingPage />`: shows current plan, calls `create-portal-session` for management actions.
- `<PlanGate feature="...">`: wraps Pro-only features; shows upgrade prompt when `!isPro`.
- Toast notifications for grace period warnings and successful plan changes.

**Access enforcement**
- Free: 5 entries per tool, no export, no AI features.
- Grace period: keeps Pro access with a banner warning.
- Canceled (still in period): full Pro access until `current_period_end`.
- After downgrade: existing data stays readable; new entries blocked past Free limit.

## Files to add / change

- `supabase/functions/stripe-webhook/index.ts` (new)
- `supabase/functions/create-portal-session/index.ts` (new)
- `supabase/functions/check-subscription/index.ts` (new)
- Migration: `subscribers` table + RLS policies
- `src/hooks/useSubscription.ts` (new)
- `src/components/BillingPage.tsx` (new)
- `src/components/PlanGate.tsx` (new)
- `src/components/DecisionSuite.tsx` — add billing nav item, wire `PlanGate` around Pro features

## Out of scope (ask separately if needed)

- Proration math UI (Stripe Portal handles it)
- Team/seat-based plans
- Usage-based metering
- Refund automation

