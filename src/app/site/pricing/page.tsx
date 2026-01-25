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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { v4 as uuidv4 } from "uuid";
import { pricingCards } from "@/lib/constants";
import { stripe } from "@/lib/stripe";
import { getAuthUserDetails } from "@/lib/queries";
import ReflectiveCard from "@/components/ui/reflective-card";

const toggleVariants = cva(
  "flex h-11 w-fit shrink-0 items-center rounded-md p-1 text-lg",
  {
    variants: {
      theme: {
        minimal: "bg-muted",
        classic:
          "bg-muted/50 backdrop-blur-sm border border-border/50 shadow-lg",
      },
    },
    defaultVariants: {
      theme: "minimal",
    },
  },
);

type Interval = {
  duration: "monthly" | "annually";
  label: string;
}

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
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Linear-inspired ambient background */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--line-quaternary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--line-quaternary))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--accent-base))_0%,transparent_60%)] opacity-[0.08] blur-3xl" aria-hidden="true" /> */}

      {/* Header Section */}
      <section className="relative px-4 pt-16 sm:pt-28">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Top Spacing */}
          <div className="h-12 md:h-16" aria-hidden="true" />

          <h1 className="bg-gradient-to-b from-neutral-header to-neutral-fg-tertiary bg-clip-text text-transparent text-5xl md:text-6xl lg:text-7xl font-semibold max-w-4xl mx-auto text-center relative leading-[1.1] tracking-[-0.022em] pb-2">
            Pricing Plans
          </h1>
          <div className="h-6" aria-hidden="true" />
          <p className="text-lg md:text-xl text-content-secondary max-w-2xl mx-auto leading-[1.6]">
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
              "group relative rounded-2xl transition-all duration-500 max-w-[340px]",
              // Hover effects with smooth transitions
              "hover:-translate-y-1"
            );

            // Card surface with Linear-inspired design + premium glass effect for ALL cards
            const surfaceClass = clsx(
              "relative overflow-hidden rounded-2xl flex flex-col h-full",
              "shadow-sm",
              "transition-all duration-500",
              "backdrop-blur-xl backdrop-saturate-150",
              "bg-surface-secondary/95 hover:bg-surface-tertiary/95",
              "hover:shadow-md",
              isPopular
                ? "border-2 border-brand-bg"
                : "border border-line-primary hover:border-line-primary/60"
            );
            //pointer-events-none absolute left-0 top-[-100px] z-[-1] h-full w-full bg-[radial-gradient(100%_100%_at_50%_50%,hsl(0deg_0%_100%/8%)_0,hsl(0deg_0%_100%/2%)_50%)] blur-2xl md:left-[-100px] md:h-[calc(100%+200px)] md:w-[calc(100%+200px)]

            return (
              <div key={price.id} className={wrapperClass}>
                <Card
                  className={surfaceClass}
                  role="article"
                  aria-label={`${price.nickname} pricing plan`}
                >
                  {/* Linear-inspired subtle hover gradient */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-accent-base/[0.03] via-transparent to-transparent"
                  />

                  {/* Premium mask gradient for popular card */}
                  {isPopular && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(46,140,255,0.15),transparent)] opacity-60"
                    />
                  )}

                  <CardHeader className="relative px-7 pt-7 pb-5 min-h-[150px]">
                    <div className="flex items-center justify-between mb-5 h-7">
                      <div className="flex-shrink-0">
                        {isPopular && (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-brand-bg/10 px-3 py-1.5 text-xs font-medium text-brand-bg border border-brand-bg/30">
                            <Sparkles className="h-3 w-3" />
                            Popular
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg bg-surface-tertiary px-3 py-1.5 text-xs font-medium text-content-secondary border border-line-secondary">
                        {price.nickname}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold min-h-[28px] text-content-primary">
                      {cardInfo?.title || price.nickname}
                    </CardTitle>
                    <div className="h-2" aria-hidden="true" />
                    <CardDescription className="text-sm text-content-secondary leading-[1.5]">
                      {cardInfo?.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative px-7 py-5 flex-1">
                    {/* Price */}
                    <div className="flex items-baseline gap-2.5 h-14">
                      <span className="text-5xl font-semibold tracking-tight text-content-primary">
                        RM {amount}
                      </span>
                      <span className="text-sm font-medium text-content-tertiary">
                        / {interval}
                      </span>
                    </div>

                    <div className="h-5" aria-hidden="true" />
                    <p className="text-sm text-content-tertiary min-h-[44px] leading-[1.5]">
                      {cardInfo?.highlight ||
                        `The best option for ${price.nickname?.toLowerCase()} notetakers`}
                    </p>

                    {/* Divider */}
                    <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-line-secondary to-transparent" />

                    {/* Features */}
                    <ul className="space-y-3.5 pt-7" role="list" aria-label="Plan features">
                      {cardInfo?.features.map((feature, idx) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-bg/10 border border-brand-bg/30 transition-all duration-300 group-hover:bg-brand-bg/15 group-hover:border-brand-bg/50 mt-0.5" aria-hidden="true">
                            <Check className="h-3.5 w-3.5 text-brand-bg transition-all duration-300 group-hover:scale-110" strokeWidth={2.5} />
                          </div>
                          <span className="text-sm text-content-primary leading-[1.5] font-medium">
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
                        "group/cta w-full text-center rounded-lg font-medium text-base transition-all duration-300",
                        "h-11 inline-flex items-center justify-center gap-1.5",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary",
                        isPopular
                          ? "bg-brand-gradient hover:bg-brand-gradient-hover text-white border border-brand-border focus:ring-brand-bg shadow-md"
                          : "bg-surface-tertiary border border-line-primary text-content-primary shadow-sm hover:bg-surface-quaternary hover:border-brand-bg/50 active:scale-[0.98] focus:ring-brand-bg/30"
                      )}
                      aria-label={`Get started with ${price.nickname} plan`}
                    >
                      {/* Show "(Trial)" if user is eligible and trial is enabled for the plan else Shows "(Subscribe)" */}
                      {user?.trialEligible && cardInfo?.trialEnabled ? (
                        <span className="font-medium">
                          Start <span className={isPopular ? "text-white/90" : "text-brand-bg"}>Trial</span>
                        </span>
                      ) : (
                        <span className="font-medium">
                          Subscribe
                        </span>
                      )}
                      <ChevronRight
                        className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
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
        <p className="text-base text-content-secondary">
          Have questions?{" "}
          <Link
            href="#faq"
            className="text-brand-bg hover:text-brand-bg-hover font-medium transition-colors focus:outline-none focus:underline underline-offset-4"
          >
            View our FAQ
          </Link>
          {" "}or{" "}
          <Link
            href="/contact"
            className="text-brand-bg hover:text-brand-bg-hover font-medium transition-colors focus:outline-none focus:underline underline-offset-4"
          >
            contact support
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Pricing;
