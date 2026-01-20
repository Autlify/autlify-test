import React from "react";
import Link from "next/link";
import Stripe from "stripe";
import clsx from "clsx";
import { Check, ChevronRight, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { stripe } from "@/lib/stripe";
import { getAuthUserDetails } from "@/lib/queries";

const Pricing: React.FC = async () => {
  let prices: Stripe.ApiList<Stripe.Price> = {
    data: [],
    has_more: false,
    object: "list",
    url: "",
  };

  if (process.env.NEXT_AUTLIFY_PRODUCT_ID) {
    prices = await stripe.prices.list({
      product: process.env.NEXT_AUTLIFY_PRODUCT_ID,
      active: true,
    });
  }

const user = await getAuthUserDetails();

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-background">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_50%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" aria-hidden="true" />
      
      {/* Header Section */}
      <section className="relative px-4 pt-16 sm:pt-28">
        <div className="container mx-auto max-w-4xl text-center">
 
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl mx-auto text-center relative bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/70 leading-tight pb-2">
            Pricing Plans
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
            Choose the plan that best fits your needs and start enhancing your
            productivity today.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section
        className="relative mx-auto max-w-6xl px-4 pt-18 sm:px-6 lg:px-8 pb-24 sm:pb-40"
        aria-labelledby="pricing-heading"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {prices.data.map((price) => {
            const cardInfo = pricingCards.find((c) => c.title === price.nickname);
            const isPopular = price.nickname === "Advanced";

            const amount =
              price.unit_amount != null ? Math.round(price.unit_amount / 100) : 0;
            const interval = price.recurring?.interval || "month";

            // Premium card border wrapper:
            // - Idle: subtle border with light/dark mode awareness
            // - Hover: primary gradient border with enhanced shadow
            const wrapperClass = clsx(
              "group relative rounded-2xl p-[1px] transition-all duration-500 max-w-[340px]",
              // Idle state - refined borders using theme colors
              "bg-gradient-to-br from-border via-border/60 to-border",
              // Hover effects with smooth transitions
              "hover:-translate-y-1",
              "hover:bg-[linear-gradient(135deg,hsl(var(--primary)/0.6),hsl(var(--primary)/0.3),hsl(var(--primary)/0.1))]",
              "hover:shadow-[0_8px_30px_hsl(var(--foreground)/0.08),0_0_0_1px_hsl(var(--primary)/0.2)]"
            );

            // Card surface with premium gradients and glass effect
            const surfaceClass = clsx(
              "relative overflow-hidden rounded-2xl border-0 flex flex-col h-full backdrop-blur-sm bg-card",
              "shadow-[inset_0_1px_0_hsl(var(--border)),inset_0_-1px_0_hsl(var(--border)/0.5)]",
              "transition-all duration-500"
            );
            //pointer-events-none absolute left-0 top-[-100px] z-[-1] h-full w-full bg-[radial-gradient(100%_100%_at_50%_50%,hsl(0deg_0%_100%/8%)_0,hsl(0deg_0%_100%/2%)_50%)] blur-2xl md:left-[-100px] md:h-[calc(100%+200px)] md:w-[calc(100%+200px)]

            return (
              <div key={price.id} className={wrapperClass}>
                <Card
                  className={surfaceClass}
                  role="article"
                  aria-label={`${price.nickname} pricing plan`}
                >
                  {/* Hover glow overlay with refined gradients */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(600px_circle_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)]"
                  />

                  <CardHeader className="relative px-7 pt-7 pb-5 min-h-[150px]">
                    <div className="flex items-center justify-between mb-5 h-7">
                      <div className="flex-shrink-0">
                        {isPopular && (
                          <div className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                            ✨ Popular
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border">
                        {price.nickname}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold min-h-[28px]">
                      {cardInfo?.title || price.nickname}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {cardInfo?.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative px-7 py-5 flex-1">
                    {/* Price */}
                    <div className="flex items-baseline gap-2.5 h-14">
                      <span className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                        RM {amount}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        / {interval}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-5 min-h-[44px] leading-relaxed">
                      {cardInfo?.highlight ||
                        `The best option for ${price.nickname?.toLowerCase()} notetakers`}
                    </p>

                    {/* Divider */}
                    <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

                    {/* Features */}
                    <ul className="space-y-3.5 pt-7" role="list" aria-label="Plan features">
                      {cardInfo?.features.map((feature, idx) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 mt-0.5" aria-hidden="true">
                            <Check className="h-3.5 w-3.5 text-muted-foreground/80 group-hover:text-primary/90 transition-all duration-300 group-hover:scale-110" strokeWidth={2.5} />
                          </div>
                          <span className="text-sm text-foreground leading-relaxed font-medium">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative px-7 pb-7 pt-5">
                    <Link
                      href={`/site/pricing/checkout/${price.id}`}
                      className={clsx(
                        "group/cta w-full text-center rounded-xl font-bold text-base transition-all duration-300",
                        "h-12 inline-flex items-center justify-center gap-1.5",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                        isPopular
                          ? // Popular - Premium primary gradient
                            "bg-primary hover:bg-primary/90 "
                            + "text-primary-foreground "
                            + "shadow-[0_8px_30px_hsl(var(--primary)/0.3)] "
                            + "hover:shadow-[0_12px_40px_hsl(var(--primary)/0.4)] "
                            + "hover:scale-[1.02] active:scale-[0.99] focus:ring-primary"
                          : // Regular - Secondary button
                            "bg-secondary hover:bg-secondary/80 "
                            + "text-secondary-foreground "
                            + "shadow-sm hover:shadow-md "
                            + "hover:scale-[1.02] active:scale-[0.99] focus:ring-ring"
                      )}
                      aria-label={`Get started with ${price.nickname} plan`}
                    >
                      {/* Show "(Trial)" if user is eligible and trial is enabled for the plan else Shows "(Subscribe)" */}
                      {user?.trialEligibled && cardInfo?.trialEnabled ? (
                        <span className="font-bold tracking-wide">
                         Start <span className="text-emerald-400">Trial</span>
                        </span>
                      ) : (
                        <span className="font-bold tracking-wide">
                          Subscribe
                        </span>
                      )}
                      <ChevronRight
                        className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </section>

      <section className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center pb-16">
        <p className="text-base text-muted-foreground">
          Have questions?{" "}
          <Link
            href="#faq"
            className="text-primary hover:text-primary/80 font-bold transition-colors focus:outline-none focus:underline underline-offset-4"
          >
            View our FAQ
          </Link>
          {" "}or{" "}
          <Link
            href="/contact"
            className="text-primary hover:text-primary/80 font-bold transition-colors focus:outline-none focus:underline underline-offset-4"
          >
            contact support
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Pricing;
