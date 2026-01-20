import Image from 'next/image'
import Link from 'next/link'
import Stripe from 'stripe'
import clsx from 'clsx'
import { Check, ArrowRight, Sparkles, Zap, Shield, Users } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { pricingCards } from '@/lib/constants'
import { stripe } from '@/lib/stripe'

export default async function Home() {
  let prices: Stripe.ApiList<Stripe.Price> = { data: [], has_more: false, object: 'list', url: '' }

  // Only fetch prices if product ID is configured
  if (process.env.NEXT_AUTLIFY_PRODUCT_ID) {
    prices = await stripe.prices.list({
      product: process.env.NEXT_AUTLIFY_PRODUCT_ID,
      active: true,
    })
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.1),transparent_50%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" aria-hidden="true" />

      {/* Hero Section */}


      <section className="relative px-4 pt-16 sm:pt-28">
        {/* Preview Image Container */}
        <div className="container mx-auto relative mb-20 md:mb-32">
          {/* Top border gradient line */}
          <div className="absolute top-0 left-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent from-10% via-30% to-90%"></div>

          <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
            <h1 className="text-9xl font-bold text-center md:text-[300px]">
              Autlify
            </h1>
          </div>
          <div className="flex justify-center items-center relative md:mt-[-70px] w-full mx-auto mt-4 md:mt-0">
            <Image
              src={'/assets/preview.png'}
              alt="banner image"
              height={1200}
              width={1200}
              className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted border-muted"
            />
            <div className="bottom-0 top-[50%] bg-gradient-to-t from-background via background to-transparent left-0 right-0 absolute z-10"></div>
          </div>

          {/* Bottom gradient fade - enhanced */}
        </div>
      </section>

      {/**Hero Section - Version 1.0.0 */}
      {/* <section className="relative flex items-center justify-center flex-col pt-32 md:pt-40 pb-16 md:pb-24 px-4">
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative mb-8 md:mb-12">
          <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[200px] xl:text-[280px] font-bold text-center leading-none">
            Autlify
          </h1>
        </div>

        <div className="relative w-full max-w-7xl mx-auto mt-4 md:mt-0">
          <div className="absolute top-0 left-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent from-10% via-30% to-90%"></div>

          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-neutral-800 p-2">
            <div className="h-full w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
              <Image
                src={'/assets/preview.png'}
                alt="banner image"
                height={1200}
                width={1200}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          <div className="absolute inset-x-0 -bottom-0 h-2/4 bg-gradient-to-t from-black to-transparent" aria-hidden="true"></div>
        </div>
      </section> */}


      {/* Features Section */}
      {/* <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 mt-16 md:mt-24 mb-20 md:mb-32"> */}
        <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 mt-16 md:mt-24 mb-20 md:mb-32">
        <div className="container mx-auto grid gap-8 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Lightning Fast', description: 'Built for performance with optimized code and caching' },
            { icon: Shield, title: 'Enterprise Security', description: 'Bank-level encryption and compliance with SOC 2' },
            { icon: Users, title: 'Multi-Tenant', description: 'Manage unlimited agencies and subaccounts with ease' }
          ].map((feature, index) => (
            <Card key={index} className="border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-0">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-lg font-semibold mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-neutral-700 dark:text-neutral-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
