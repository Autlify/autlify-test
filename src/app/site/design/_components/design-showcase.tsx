'use client'

import React from 'react'
import { ColorTokens } from './sections/color-tokens'
import { TypographySection } from './sections/typography'
import { ButtonsSection } from './sections/buttons'
import { FormsSection } from './sections/forms'
import { CardsSection } from './sections/cards'
import { AlertsSection } from './sections/alerts'
import { TablesSection } from './sections/tables' 
import { BillingSDKSection } from './sections/billing-sdk'

export function DesignShowcase() {
  return (
    <div className="space-y-16 pb-16">
      <ColorTokens />
      <TypographySection />
      <ButtonsSection />
      <FormsSection />
      <CardsSection />
      <AlertsSection />
      <TablesSection /> 
      <BillingSDKSection />
    </div>
  )
}
