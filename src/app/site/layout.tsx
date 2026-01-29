'use client'

import Navigation from '@/components/site/navigation'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import React from 'react'
import { usePathname } from 'next/navigation'
import { AspectRatio } from '@radix-ui/react-aspect-ratio'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const hideNavigation =
    pathname.includes('/checkout') ||
    pathname.includes('/docs')


  return ( 
      <main className={hideNavigation ? 'w-full min-h-screen' : 'min-h-screen'}>
        {/* {!hideNavigation && <Navigation />} */}
        {!hideNavigation && <Navbar />}
        {children}
        {!hideNavigation && <Footer />}
      </main> 
  )
}

export default Layout
