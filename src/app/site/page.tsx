"use client";
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Users } from 'lucide-react'
import { SparklesCore } from '@/components/ui/sparkles'
import { BorderTrail } from '@/components/ui/border-trail'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import GlassContainer from '@/components/ui/glass-container'
import { BentoGrid } from '@/components/ui/bento-grid'
import { Dashboard } from '@/components/site/dashboard'

import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const ParallaxScroll = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  const gridRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    container: gridRef, // remove this if your container is not fixed height
    offset: ["start start", "end start"], // remove this if your container is not fixed height
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const third = Math.ceil(images.length / 3);

  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  return (
    <div
      className={cn("h-[40rem] items-start overflow-y-auto w-full", className)}
      ref={gridRef}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start  max-w-5xl mx-auto gap-10 py-40 px-10"
        ref={gridRef}
      >
        <div className="grid gap-10">
          {firstPart.map((el, idx) => (
            <motion.div
              style={{ y: translateFirst }} // Apply the translateY motion value here
              key={"grid-1" + idx}
            >
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 !m-0 !p-0"
                height="400"
                width="400"
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {secondPart.map((el, idx) => (
            <motion.div style={{ y: translateSecond }} key={"grid-2" + idx}>
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 !m-0 !p-0"
                height="400"
                width="400"
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {thirdPart.map((el, idx) => (
            <motion.div style={{ y: translateThird }} key={"grid-3" + idx}>
              <img
                src={el}
                className="h-80 w-full object-cover object-left-top rounded-lg gap-10 !m-0 !p-0"
                height="400"
                width="400"
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  return (
    <div className="min-w-full min-h-full relative overflow-hidden bg-bg-primary text-fg-primary">

      {/* Premium: Subtle grid overlay for depth */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--line-quaternary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--line-quaternary))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" aria-hidden="true" /> */}

      {/* Premium: Blue gradient spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--accent-base))_0%,transparent_60%)] opacity-[0.08] blur-3xl" aria-hidden="true" />

      {/* Hero Section - Linear Mirror */}
      <section className="relative px-4 pt-16 sm:pt-28">
        <div className="container mx-auto relative">

          {/* Top Spacing - Linear's generous padding */}
          <div className="h-20 md:h-28" aria-hidden="true" />

          <div className="flex flex-col items-start">

            {/* Hero Headline - Linear Typography */}
            <h1 className="max-w-6xl font-semibold leading-[1.1] tracking-[-0.022em]">
              <span className="block text-4xl md:text-5xl lg:text-6xl text-fg-primary">
                Autlify is a{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-accent-base via-accent-base to-accent-hover bg-clip-text text-transparent">
                    purpose-built tool
                  </span>
                  {/* Premium: Subtle glow effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-accent-base to-accent-hover blur-xl opacity-20" aria-hidden="true"></span>
                </span>
                {' '}for planning and building agencies
              </span>
            </h1>

            {/* Spacing - Linear's rhythm */}
            <div className="h-6" aria-hidden="true" />

            {/* Hero Description - Linear's text hierarchy */}
            <p className="max-w-2xl text-lg leading-[1.6] text-fg-secondary md:text-xl">
              Meet the system for modern agency development.{' '}
              <span className="text-fg-primary">
                Streamline clients, projects, and product roadmaps.
              </span>
            </p>

            {/* CTA Section - Linear buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agency/sign-up"
                className="btn-primary group relative inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[image:var(--color-button-primary-bg-gradient)] px-6 font-medium text-button-primary-text shadow-[0_1px_0_0_hsl(var(--line-primary)),0_0_20px_-8px_hsl(var(--accent-base))] transition-all hover:bg-[image:var(--color-button-primary-bg-gradient-hover)] hover:shadow-[0_1px_0_0_hsl(var(--line-primary)),0_0_24px_-6px_hsl(var(--accent-base))] active:scale-[0.98]"
              >
                Start building
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-button-secondary-bg border border-quaternary px-6 font-medium text-button-secondary-text shadow-sm transition-all hover:bg-button-secondary-bg-hover hover:border-accent-tint active:scale-[0.98]"
              >
                View pricing
              </Link>
            </div>
          </div>

          {/* Spacing before image */}
          {/* <div className="h-20 md:h-28" aria-hidden="true" /> */}
        </div>

        {/* Hero Image Section - Linear's refined presentation */}

        {/* Hero Preview - Linear-style glass container with edge fading */}
        {/* <div className="relative mx-auto max-w-[1400px] px-6 lg:px-8">
          <GlassContainer
            maskFade="bottom-right"
            outerRadius={18}
            innerRadius={10}
          >
            <Image
              src={'/assets/preview.png'}
              alt="banner image"
              height={1200}
              width={1200}
              className="w-full h-full object-cover object-top"
            />
          </GlassContainer> 
        </div>  */}


        <div
          className='relative max-w-[1400px] mx-auto -top-4 -mt-6 items-center justify-center'
          style={{ perspective: '1200px' }}
        >
          <motion.div
            initial={{
              opacity: 0,
              x: 200,
              y: -150,
              rotateX: 45,
              rotateY: 15,
              rotateZ: -30,
              scale: 0.6,
            }}
            animate={{
              opacity: 1,
              x: -100,
              y: -5,
              rotateX: 32.5,
              rotateY: 5,
              rotateZ: -20.5,
              scale: 0.85,
            }}
            transition={{
              duration: 4.6,
              delay: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }} 
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'top right',
            }}
          >
            <GlassContainer
              maskFade="bottom-right"
              outerRadius={18}
              innerRadius={10}
            >
              <Dashboard />
            </GlassContainer>
          </motion.div>
        </div>


        <div className='relative mx-auto max-w-[1400px] h-full px-6 lg:px-8'>

        </div>
      </section>
      {/* Spacer */}
      <div className="h-32 md:h-40" aria-hidden="true" />

      {/* Spacer */}
      <div className="h-32 md:h-40" aria-hidden="true" />

      {/* Customers/Social Proof Section - Linear style */}
      <section className="relative">
        <div className="mx-auto max-w-[1024px] px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-[0.08em] text-fg-tertiary">
            <span className="hidden md:inline">Powering the world's best product teams. </span>
            From next-gen startups to established enterprises.
          </p>

          <div className="h-10" aria-hidden="true" />

          {/* Customer Logos Grid - Linear's refined cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {['OpenAI', 'Cash App', 'Scale', 'Ramp', 'Vercel', 'Coinbase'].map((company, i) => (
              <div
                key={i}
                className="group flex h-16 items-center justify-center rounded-lg border border-line-secondary bg-bg-secondary shadow-[var(--color-shadow-sm)] transition-all hover:border-accent-tint hover:bg-bg-tertiary hover:shadow-[var(--color-shadow-md)]"
              >
                <span className="text-xs font-medium text-fg-tertiary group-hover:text-fg-secondary transition-colors">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32 md:h-48" aria-hidden="true" />

      {/* Features Section - Linear's card design */}
      <section className="relative">
        <div className="mx-auto max-w-[1024px] px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">

            {/* Left: Feature Headline */}
            <div>
              <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.022em] text-fg-primary md:text-5xl">
                Made for modern<br />product teams
              </h2>
              <div className="h-6" aria-hidden="true" />
              <p className="text-lg leading-[1.6] text-fg-secondary">
                Autlify is shaped by the practices and principles that distinguish world-class agency teams from the rest: relentless focus, fast execution, and a commitment to the quality of craft.
              </p>
            </div>

            {/* Right: Feature Cards - Linear style */}
            <div className="space-y-3">
              {[
                {
                  icon: Zap,
                  title: 'Purpose-built for agency development',
                  desc: 'Consolidate specs, milestones, tasks, and other documentation in one centralized location.',
                },
                {
                  icon: Shield,
                  title: 'Designed to move fast',
                  desc: 'Create tasks in seconds, discuss issues in context, and breeze through your work.',
                },
                {
                  icon: Users,
                  title: 'Crafted to perfection',
                  desc: 'Beautiful, minimal, and thoughtfully designed with care and precision.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative flex gap-4 rounded-lg border border-line-secondary bg-bg-secondary p-5 shadow-[var(--color-shadow-sm)] transition-all hover:border-accent-tint hover:bg-bg-tertiary hover:shadow-[var(--color-shadow-md)] hover:-translate-y-px"
                >
                  {/* Premium: Subtle blue gradient on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent-base/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>

                  {/* Icon */}
                  <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent-base ring-1 ring-inset ring-accent-base/20 group-hover:ring-accent-base/40 transition-all">
                    <feature.icon className="h-4 w-4" strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div className="relative flex-1">
                    <h3 className="text-sm font-medium text-fg-primary group-hover:text-accent-hover transition-colors">
                      {feature.title}
                    </h3>
                    <div className="h-1.5" aria-hidden="true" />
                    <p className="text-sm leading-[1.5] text-fg-tertiary">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32 md:h-48" aria-hidden="true" />


      {/* Secondary Feature Section - Linear showcase */}
      <section className="relative items-center justify-center px-4 pt-16 sm:pt-28">


        <div className="mx-auto max-w-[1024px] px-6 lg:px-8">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-accent-base">
              <span className="inline-block h-px w-8 bg-gradient-to-r from-transparent to-accent-base"></span>
              Issue tracking
              <span className="inline-block h-px w-8 bg-gradient-to-l from-transparent to-accent-base"></span>
            </p>
            <div className="h-4" aria-hidden="true" />
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.022em] md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-b from-fg-primary via-fg-primary to-fg-secondary bg-clip-text text-transparent">
                Issue tracking<br />you'll enjoy using
              </span>
            </h2>
            <div className="h-6" aria-hidden="true" />
            <p className="mx-auto max-w-2xl text-lg leading-[1.6] text-fg-secondary">
              Optimized for speed and efficiency. Create tasks in seconds, discuss issues in context, and breeze through your work in views tailored to you and your team.
            </p>
          </div>

          <div className="h-20 md:h-28" aria-hidden="true" />


          <BentoGrid className="md:grid-cols-2 md:auto-rows-[16rem] lg:auto-rows-[18rem] gap-4">
            {[
              'Manage projects end-to-end',
              'Project updates',
              'Ideate and specify',
              'AI-assisted development'
            ].map((label, i) => (
              <GlassContainer
                key={i}
                maskFade="bottom-right"
                outerRadius={18}
                innerRadius={10}
                className={i === 0 ? 'md:col-span-2' : ''}
              >
                <div className="group relative h-full overflow-hidden">
                  {/* Premium: Blue accent gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-base/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />

                  <div className="relative flex h-full items-end p-6">
                    <span className="text-sm font-medium text-fg-secondary group-hover:text-accent-hover transition-colors">
                      {label}
                    </span>
                  </div>
                </div>
              </GlassContainer>
            ))}
          </BentoGrid>
        </div>

      </section>

      {/* Spacer */}
      <div className="h-32 md:h-48" aria-hidden="true" />

      {/* CTA Section - Linear's final push */}
      <section className="relative">
        {/* Premium: Bottom blue gradient spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--accent-base))_0%,transparent_70%)] opacity-[0.06] blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.022em] md:text-5xl">
            <span className="bg-gradient-to-b from-fg-primary to-fg-secondary bg-clip-text text-transparent">
              Get started today
            </span>
          </h2>
          <div className="h-6" aria-hidden="true" />
          <p className="text-lg leading-[1.6] text-fg-secondary">
            Join thousands of teams building better products with our platform.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/agency/sign-up"
              className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[image:var(--color-button-primary-bg-gradient)] px-8 font-medium text-button-primary-text shadow-[0_1px_0_0_hsl(var(--line-primary)),0_0_20px_-8px_hsl(var(--accent-base))] transition-all hover:bg-[image:var(--color-button-primary-bg-gradient-hover)] hover:shadow-[0_1px_0_0_hsl(var(--line-primary)),0_0_28px_-4px_hsl(var(--accent-base))] active:scale-[0.98]"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-40 md:h-56" aria-hidden="true" />
    </div>
  )
}

