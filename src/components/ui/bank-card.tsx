"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CreditCard as CreditCardIcon, Wifi, Shield, Check, X, AlertCircle, MoreVertical } from "lucide-react"
import { useEffect, useRef, useState, useLayoutEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AMEX_MASK = "#### ###### #####";
const OTHER_MASK = "#### #### #### ####";
const CARD_TYPE_IMAGES: Record<string, string> = {
  visa: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png",
  amex: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png",
  mastercard: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png",
  unionpay: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/unionpay.png",
  dinersclub: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/dinersclub.png",
  discover: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/discover.png",
  troy: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/troy.png",
  jcb: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/jcb.png",
  stripe: "/logos/stripe.svg", // Local Stripe logo
};

function getCardType(cardNumber: string) {
  if (/^4/.test(cardNumber)) return "visa";
  if (/^(34|37)/.test(cardNumber)) return "amex";
  if (/^5[1-5]/.test(cardNumber)) return "mastercard";
  if (/^(62|81)/.test(cardNumber)) return "unionpay";
  if (/^6011/.test(cardNumber)) return "discover";
  if (/^(36|30[0-5]|38)/.test(cardNumber)) return "dinersclub";
  if (/^9792/.test(cardNumber)) return "troy";
  if (/^35(2[89]|[3-8][0-9])/.test(cardNumber)) return "jcb";
  if (cardNumber.replace(/\s/g, "") === "4242424242424242") return "stripe";
  return "visa";
}

function generateCardNumberMask(cardType: string) {
  return cardType === "amex" ? AMEX_MASK : OTHER_MASK;
}

interface BankCardProps {
  cardNumber?: string
  cardholderName?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  isFlipped?: boolean
  /** Card visual variant - determines color scheme and styling */
  variant?: "default" | "premium" | "platinum" | "black"
  /** Display chip icon on card front */
  showChip?: boolean
  cardImage?: string
  /** Display contactless payment icon */
  showContactless?: boolean
  /** Display holographic security feature */
  showHologram?: boolean
  isValid?: boolean
  validationErrors?: string[]
  className?: string
  onClick?: () => void
  /** Visual indicator for selected card in galleries */
  isSelected?: boolean
  focusField?: string | null
  /** For Stripe saved cards that come pre-masked */
  isMasked?: boolean
  /** Control whether to display validation error badges */
  showValidationErrors?: boolean
  /** Card brand from payment provider (visa, mastercard, amex, etc.) */
  brand?: string
  /** Compact mode for gallery/list displays */
  compact?: boolean
}

/** 
 * Card Visual Variants
 * Defines appearance for different card tiers while maintaining consistent behavior
 */
const cardVariants = {
  default: {
    background: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
    text: "text-white",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
  premium: {
    background: "bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700",
    text: "text-black",
    chip: "bg-gradient-to-br from-gray-800 to-black border-gray-700",
    chipText: "bg-white/80",
  },
  platinum: {
    background: "bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400",
    text: "text-black",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
  black: {
    background: "bg-gradient-to-br from-black via-gray-900 to-black",
    text: "text-white",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
} as const;

/** 
 * Centralized sizing configuration for regular and compact card displays
 * Maintains visual consistency across different use cases (full display vs gallery)
 */
const cardSizing = {
  regular: {
    padding: "p-6",
    cardNumber: "text-2xl tracking-widest",
    cardNumberMasked: "text-lg font-mono tracking-[.1em] -ml-22",
    cardNumberDigit: "text-lg font-mono",
    cardholderName: "text-sm font-medium tracking-wide uppercase",
    expiry: "text-sm font-mono tracking-wider",
    label: "text-xs pt-2",
    chip: { size: "w-12 h-8", grid: "w-6 h-4", dot: "w-1 h-1" },
    contactless: "w-6 h-6",
    logo: { text: "text-2xl", icon: "w-8 h-8", circle: "w-8 h-8", amex: "text-lg" },
    hologram: "w-12 h-12",
    hologramIcon: "w-6 h-6",
    hologramPosition: "bottom-18 right-6",
    spacing: "my-4",
  },
  compact: {
    padding: "p-4",
    cardNumber: "text-xl tracking-tight",
    cardNumberMasked: "text-xs text-start tracking-[.005em] -ml-8",
    cardNumberDigit: "text-xs tracking-[.2em]",
    cardholderName: "text-xs font-small uppercase",
    expiry: "text-xs font-small",
    label: "text-[0.6rem] pt-4.5",
    chip: { size: "w-8 h-5", grid: "w-5 h-3.5", dot: "w-0.5 h-0.5" },
    contactless: "w-4 h-4",
    logo: { text: "text-sm", icon: "w-6 h-6", circle: "w-6 h-6", amex: "text-base" },
    hologram: "w-5 h-5",
    hologramIcon: "w-4 h-4",
    hologramPosition: "bottom-10 right-4",
    spacing: "my-2",
  },
} as const;

/** Helper to get size configuration based on compact mode */
const getSize = (compact: boolean) => compact ? cardSizing.compact : cardSizing.regular;

/**
 * Detects if a card number is already masked (Stripe format)
 * Stripe sends cards like "**** **** **** 4242"
 */
function isCardMasked(cardNumber: string): boolean {
  return cardNumber.includes("*") || cardNumber.includes("•");
}

/**
 * Renders card number with proper masking for security
 * - For unmasked cards: masks middle digits
 * - For Stripe saved cards: displays simplified "**** nnnn" format
 */
function renderCardNumber(cardNumber: string, cardType: string, compact: boolean = false) {
  const size = getSize(compact);
  const cleanNumber = cardNumber.replace(/\s/g, "");
  const mask = generateCardNumberMask(cardType);
  const maskArr = mask.split("");

  // If already masked (Stripe saved card), display simplified format: "**** nnnn"
  if (isCardMasked(cardNumber)) {
    // Extract last 4 digits
    const last4Match = cardNumber.match(/(\d{4})\s*$/);
    const last4 = last4Match ? last4Match[1] : "••••";

    return (
      <span className={cn("inline-block", size.cardNumberMasked)}>
        •••• •••• •••• {last4}
      </span>
    );
  }

  // For new cards, mask middle digits for security
  return maskArr.map((n, i) => {
    const isSpace = n.trim() === "";
    const shouldMask = cardType === "amex"
      ? (i > 4 && i < 14 && cleanNumber.length > i)
      : (i > 4 && i < 15 && cleanNumber.length > i);

    if (shouldMask && !isSpace) {
      return <span key={i} className={cn("inline-block w-4", size.cardNumberDigit)}>•</span>;
    }

    if (cleanNumber.length > i) {
      return (
        <span key={i} className={cn("inline-block", isSpace ? "w-3" : "w-4", size.cardNumberDigit)}>
          {cleanNumber[i]}
        </span>
      );
    }

    return (
      <span key={i} className={cn("inline-block", isSpace ? "w-3" : "w-4", size.cardNumberDigit, "text-white/20")}>
        {n}
      </span>
    );
  });
}


const validateCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, "")
  if (!/^\d+$/.test(cleaned)) return false

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {

    let digit = Number.parseInt(cleaned[i] || `${i}`)

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

const validateExpiry = (month: string, year: string): boolean => {
  if (!month || !year) return false

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const expMonth = Number.parseInt(month)
  const expYear = Number.parseInt(year)

  if (expMonth < 1 || expMonth > 12) return false
  if (expYear < currentYear) return false
  if (expYear === currentYear && expMonth < currentMonth) return false

  return true
}

const CardChip = ({ variant, compact = false }: { variant: keyof typeof cardVariants; compact?: boolean }) => {
  const size = getSize(compact);
  return (
    <div className="relative">
      <div className={cn(
        size.chip.size,
        "rounded-md border-2 flex items-center justify-center",
        cardVariants[variant].chip
      )}>
        <div className={cn("grid grid-cols-3 gap-0.5", size.chip.grid)}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={cn(size.chip.dot, "rounded-sm", cardVariants[variant].chipText)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ContactlessIcon = ({ variant, compact = false }: { variant: keyof typeof cardVariants; compact?: boolean }) => {
  const size = getSize(compact);
  return (
    <div className="relative">
      <Wifi className={cn(size.contactless, "rotate-90", cardVariants[variant].text, "opacity-60")} />
    </div>
  );
}

const HologramEffect = ({ variant, compact = false }: { variant: keyof typeof cardVariants; compact?: boolean }) => {
  const size = getSize(compact);
  return (
    <div className={cn("absolute", size.hologramPosition)}>
      <div className={cn(size.hologram, "relative rounded-full overflow-hidden")}>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 via-green-400 to-blue-500 opacity-70 animate-spin-slow" />
        <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className={cn(size.hologramIcon, "text-white/80")} />
        </div>
      </div>
    </div>
  );
}

const CardImage = ({ cardImage }: { cardImage?: typeof CARD_TYPE_IMAGES[keyof typeof CARD_TYPE_IMAGES] }) => {
  if (!cardImage) return null

  return (
    <div className="absolute top-4 right-4">
      <img src={cardImage} alt="Card Type" className="max-w-[100px] w-full h-[45px] object-contain opacity-80" />
    </div>
  )
}

const CardLogo = ({
  cardInfo,
  variant,
  compact = false,
}: { cardInfo: string; variant: keyof typeof cardVariants; compact?: boolean }) => {
  const size = getSize(compact);
  const logoColor = cardVariants[variant].text === "text-white" ? "text-white" : "text-black"

  if (cardInfo === "visa") {
    return <div className={cn(size.logo.text, compact ? "font-semibold" : "font-bold tracking-wider", logoColor)}>VISA</div>
  }

  if (cardInfo === "mastercard") {
    return (
      <div className="flex space-x-1">
        <div className={cn(size.logo.circle, "rounded-full bg-red-500 opacity-90")} />
        <div className={cn(size.logo.circle, compact ? "-ml-1.5" : "-ml-2", "rounded-full bg-yellow-500 opacity-90")} />
      </div>
    )
  }

  if (cardInfo === "amex") {
    return <div className={cn(size.logo.amex, "font-bold", logoColor)}>AMEX</div>
  }

  if (cardInfo === "discover") {
    return <div className={cn(size.logo.amex, "font-bold", logoColor)}>DISCOVER</div>
  }

  if (cardInfo === "diners") {
    return <div className={cn(size.logo.amex, "font-bold", logoColor)}>DINERS</div>
  }

  if (cardInfo === "jcb") {
    return <div className={cn(size.logo.amex, "font-bold", logoColor)}>JCB</div>
  }

  return <CreditCardIcon className={cn(size.logo.icon, logoColor, "opacity-60")} />
}

const ValidationIndicator = ({ isValid, errors }: { isValid?: boolean; errors?: string[] }) => {
  if (isValid === undefined) return null

  return (
    <div className="absolute top-4 left-4">
      <div
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full backdrop-blur-sm",
          isValid ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30",
        )}
      >
        {isValid ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-red-400" />}
        <span className={cn("text-xs font-medium", isValid ? "text-green-400" : "text-red-400")}>
          {isValid ? "VALID" : "INVALID"}
        </span>
      </div>
    </div>
  )
}

const BankCard = React.forwardRef<HTMLDivElement, BankCardProps>(
  (
    {
      cardNumber = "",
      cardholderName = "",
      expiryMonth = "",
      expiryYear = "",
      cvv = "",
      isFlipped = false,
      variant = "default",
      showChip = true,
      showContactless = true,
      showHologram = true,
      isValid,
      validationErrors = [],
      className,
      cardImage,
      onClick,
      isSelected = false,
      focusField,
      isMasked = false,
      showValidationErrors = false,
      brand,
      compact = false,
      ...props
    },
    ref,
  ) => {
    // Use brand prop if provided (from Stripe), otherwise detect
    const cardInfo = brand || getCardType(cardNumber)
    const variantStyles = cardVariants[variant]
    const size = getSize(compact)
    const isStripeSavedCard = isMasked || isCardMasked(cardNumber)

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full max-w-sm mx-auto cursor-pointer group",
          className,
        )}
        style={{ perspective: "1000px", aspectRatio: "1.586" }}
        onClick={onClick}
        whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isSelected ? { 
          scale: [1, 1.03, 1],
        } : {}}
        transition={isSelected ? {
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        } : {}}
        {...props}
      >
        {/* Premium Selection Border with Gradient Glow */}
        {isSelected && (
          <>
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 opacity-75 blur-sm"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Solid gradient border */}
            <div className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500" />
            {/* Inner glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-[17px] bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-purple-400/20 blur-md"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Premium selected badge */}
            <div className="absolute -top-3 -right-3 z-20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-md opacity-60" />
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-lg shadow-blue-500/50 border-2 border-white">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              </motion.div>
            </div>
          </>
        )}
        
        <motion.div
          className={cn(
            "relative w-full h-full transition-transform duration-700 preserve-3d",
            isSelected && "shadow-[0_20px_60px_rgba(59,130,246,0.4)]"
          )}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
          role="img"
          aria-label={`${variant} credit card ${isStripeSavedCard ? "(saved)" : ""}`}
        >
          {/* Front of Card */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden backface-hidden",
              variantStyles.background,
            )}
          >
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />

            {/* Holographic Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />

            <div className={cn("relative z-10 h-full flex flex-col justify-between", size.padding)}>
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {showChip && <CardChip variant={variant} compact={compact} />}
                  {showContactless && <ContactlessIcon variant={variant} compact={compact} />}
                </div>
                <CardLogo cardInfo={cardInfo} variant={variant} compact={compact} />
                {/* <CardImage cardImage={cardImage || CARD_TYPE_IMAGES[cardInfo]} /> */}
              </div>

              {/* Card Number */}
              <div className={cn("flex justify-center", size.spacing)}>
                <div
                  className={cn(
                    size.cardNumber,
                    "font-mono",
                    variantStyles.text,
                    focusField === "number" && "ring-2 ring-white/70 rounded px-1"
                  )}
                  aria-label="Card number display"
                >
                  {renderCardNumber(cardNumber, cardInfo, compact)}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between">
                <div>
                  <div className={cn(size.label, "opacity-60", variantStyles.text)}>CARDHOLDER NAME</div>
                  <div
                    className={cn(
                      size.cardholderName,
                      variantStyles.text,
                      focusField === "name" && "ring-2 ring-white/70 rounded px-1"
                    )}
                    aria-label="Cardholder name display"
                  >
                    {cardholderName || "YOUR NAME"}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(size.label, "opacity-60", variantStyles.text)}>VALID THRU</div>
                  <div
                    className={cn(
                      size.expiry,
                      variantStyles.text,
                      focusField === "date" && "ring-2 ring-white/70 rounded px-1"
                    )}
                    aria-label="Card expiry date display"
                  >
                    {expiryMonth || "MM"}/{expiryYear?.slice(-2) || "YY"}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Indicator */}
            {showValidationErrors && <ValidationIndicator isValid={isValid} errors={validationErrors} />}

            {/* Security Features Indicator */}
            {/* <div className="absolute top-4 right-4">
              <div className={cn(
                "flex items-center space-x-1 rounded-full bg-white/10 backdrop-blur-sm",
                compact ? "px-1.5 py-0.5" : "px-2 py-1"
              )}>
                <Shield className={cn(compact ? "w-2.5 h-2.5" : "w-3 h-3", "text-green-400")} />
                <span className={cn(compact ? "text-[0.55rem]" : "text-xs", "text-green-400 font-medium")}>SECURE</span>
              </div>
            </div> */}

            {/* Hologram */}
            {showHologram && <HologramEffect variant={variant} compact={compact} />}
          </div>

          {/* Back of Card */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden backface-hidden rotate-y-180",
              variantStyles.background,
            )}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-12 bg-black mt-6" />

            <div className="p-6 pt-8">
              {/* Signature Strip */}
              <div
                className="bg-white h-10 rounded mb-4 flex items-center justify-end pr-4"
                aria-label="CVV security code area"
              >
                <div className="text-black text-sm font-mono">
                  {cvv.length > 0 ? <span aria-hidden="true">{"•".repeat(cvv.length)}</span> : ""}
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-2">
                <div className={cn("text-xs", variantStyles.text, "opacity-60")}>
                  AUTHORIZED SIGNATURE - NOT VALID UNLESS SIGNED
                </div>
                <div className={cn("text-xs", variantStyles.text, "opacity-60")}>
                  This card is property of the issuing bank
                </div>
                <div className={cn("text-xs", variantStyles.text, "opacity-60")}>Card Type: {cardInfo.toUpperCase()}</div>
              </div>

              {/* Hologram */}
              {showHologram && <HologramEffect variant={variant} />}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  },
)

BankCard.displayName = "BankCard"

interface SavedBankCard {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  variant: "default" | "premium" | "platinum" | "black"
  isDefault?: boolean
  brand?: string
}

interface SavedBankCardsProps {
  cards: SavedBankCard[]
  selectedCardId?: string
  onCardSelect?: (cardId: string) => void
  onAddCard?: () => void
  onSetDefault?: (cardId: string) => void
  onRemoveCard?: (cardId: string) => void
  onReplaceCard?: (cardId: string) => void
  className?: string
}

const SavedBankCardsGallery = React.forwardRef<HTMLDivElement, SavedBankCardsProps>(
  ({ cards, selectedCardId, onCardSelect, onAddCard, onSetDefault, onRemoveCard, onReplaceCard, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-fg-primary">Saved Payment Methods</h3>
          <button
            type="button"
            onClick={onAddCard}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            + Add New Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <BankCard
                  cardNumber={card.cardNumber}
                  cardholderName={card.cardholderName}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  variant={card.variant}
                  brand={card.brand}
                  isMasked={true}
                  isSelected={selectedCardId === card.id}
                  onClick={() => onCardSelect?.(card.id)}
                  compact={true}
                />

                {/* Default Badge */}
                {card.isDefault && (
                  <div className="absolute -top-3 -left-3 z-20">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-500 rounded-full blur-md opacity-60" />
                      <div className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600/90 to-emerald-600/90 shadow-lg shadow-emerald-500/50 border-2 border-white">
                        {/* <Check className="w-3 h-3 text-white" strokeWidth={3} /> */}
                        <span className="text-[10px] font-bold text-white leading-none">Default</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Ellipsis Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-fg-secondary" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetDefault?.(card.id)
                        }}
                        disabled={card.isDefault}
                        className="cursor-pointer"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onReplaceCard?.(card.id)
                        }}
                        className="cursor-pointer"
                      >
                        <CreditCardIcon className="mr-2 h-4 w-4" />
                        Replace Card
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveCard?.(card.id)
                        }}
                        className="cursor-pointer text-red-fg-primary focus:text-red-fg-primary"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    )
  },
)

SavedBankCardsGallery.displayName = "SavedBankCardsGallery"

interface InteractiveBankCardProps extends BankCardProps {
  onCardNumberChange?: (value: string) => void
  onCardholderNameChange?: (value: string) => void
  onExpiryMonthChange?: (value: string) => void
  onExpiryYearChange?: (value: string) => void
  onCvvChange?: (value: string) => void
  onFlip?: (flipped: boolean) => void
  showInputs?: boolean
  autoValidate?: boolean
  readOnly?: boolean // For displaying saved cards
  showInputValidationErrors?: boolean // Show inline validation errors
}

/**
 * InteractiveBankCard Component
 * 
 * ⚠️ CRITICAL PCI COMPLIANCE WARNING ⚠️
 * 
 * This component is designed for DISPLAY and DEMONSTRATION purposes only.
 * 
 * NEVER use the input fields for actual payment collection in production because:
 * 
 * 1. PCI-DSS VIOLATION:
 *    - If your app has raw card input fields, YOU become responsible for PCI compliance
 *    - Requires SAQ-D certification (350+ security requirements)
 *    - Annual security audits, penetration testing, network segmentation
 *    - Potential fines up to $500,000 per violation
 * 
 * 2. LEGAL LIABILITY:
 *    - Your servers/logs touch raw card data = massive legal liability
 *    - Data breaches can result in millions in damages
 * 
 * 3. STRIPE ELEMENTS IS REQUIRED:
 *    - Stripe Elements keeps card data in Stripe's iframes
 *    - Data NEVER touches your app/server (SAQ-A compliance)
 *    - Only a tokenized reference is sent to your backend
 * 
 * CORRECT USAGE:
 * ✅ Display masked cards from Stripe: <BankCard cardNumber="**** **** **** 4242" isMasked />
 * ✅ UI/UX demos and prototypes
 * ✅ Design showcases
 * 
 * ❌ NEVER use InteractiveBankCard input fields for real payment collection
 * ❌ NEVER send raw card data to your backend
 * 
 * For payment collection, ALWAYS use:
 * - <Elements><PaymentElement /></Elements> from @stripe/react-stripe-js
 */
const InteractiveBankCard = React.forwardRef<HTMLDivElement, InteractiveBankCardProps>(
  (
    {
      cardNumber = "",
      cardholderName = "",
      expiryMonth = "",
      expiryYear = "",
      cvv = "",
      isFlipped = false,
      variant = "default",
      showChip = true,
      showContactless = true,
      showHologram = true,
      onCardNumberChange,
      onCardholderNameChange,
      onExpiryMonthChange,
      onExpiryYearChange,
      onCvvChange,
      onFlip,
      showInputs = false,
      autoValidate = true,
      readOnly = false,
      showInputValidationErrors = true,
      isMasked = false,
      brand,
      className,
      onClick,
      isSelected,
      focusField: externalFocusField,
      cardImage,
      isValid: externalIsValid,
      validationErrors: externalValidationErrors,
      ...domProps
    },
    ref,
  ) => {
    const [localFlipped, setLocalFlipped] = React.useState(isFlipped)
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])
    const [isValid, setIsValid] = React.useState<boolean | undefined>(undefined)
    const [focusField, setFocusField] = React.useState<string | null>(null)
    const isStripeSavedCard = isMasked || isCardMasked(cardNumber)

    const handleFlip = (flipped: boolean) => {
      setLocalFlipped(flipped)
      onFlip?.(flipped)
    }


    const validateCard = React.useCallback(() => {
      // Skip validation for saved/masked cards
      if (!autoValidate || isStripeSavedCard) {
        setIsValid(undefined)
        setValidationErrors([])
        return
      }

      const errors: string[] = []
      let valid = true

      // Validate card number
      if (cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, "")
        if (!validateCardNumber(cleanNumber)) {
          errors.push("Invalid card number")
          valid = false
        }
      }

      // Validate expiry
      if (expiryMonth && expiryYear) {
        if (!validateExpiry(expiryMonth, expiryYear)) {
          errors.push("Card expired or invalid expiry date")
          valid = false
        }
      }

      // Validate CVV
      if (cvv) {
        const cardInfo = brand || getCardType(cardNumber)
        const expectedLength = cardInfo === "amex" ? 4 : 3
        if (cvv.length !== expectedLength) {
          errors.push(`CVV should be ${expectedLength} digits`)
          valid = false
        }
      }

      setValidationErrors(errors)
      setIsValid(cardNumber || expiryMonth || expiryYear || cvv ? valid : undefined)
    }, [cardNumber, expiryMonth, expiryYear, cvv, autoValidate, isStripeSavedCard, brand])

    React.useEffect(() => {
      validateCard()
    }, [validateCard])

    return (
      <div ref={ref} className={cn("space-y-6", className)} {...domProps}>
        <BankCard
          cardNumber={cardNumber}
          cardholderName={cardholderName}
          expiryMonth={expiryMonth}
          expiryYear={expiryYear}
          cvv={cvv}
          isFlipped={localFlipped}
          variant={variant}
          showChip={showChip}
          showContactless={showContactless}
          showHologram={showHologram}
          isValid={isValid}
          validationErrors={validationErrors}
          focusField={focusField}
          isMasked={isMasked}
          showValidationErrors={!isStripeSavedCard && showInputValidationErrors}
          brand={brand}
        />

        {showInputValidationErrors && validationErrors.length > 0 && !isStripeSavedCard && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3" role="alert" aria-live="polite">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-red-400/80 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {showInputs && (
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number-input" className="block text-sm font-medium mb-2">
                Card Number
              </label>
              <input
                id="card-number-input"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\s/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim()
                  if (value.length <= 19) {
                    onCardNumberChange?.(value)
                  }
                }}
                onFocus={() => { handleFlip(false); setFocusField("number"); }}
                onBlur={() => setFocusField(null)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                maxLength={19}
                inputMode="numeric"
                autoComplete="cc-number"
                aria-label="Credit card number"
                aria-invalid={validationErrors.some(e => e.includes("card number"))}
                disabled={readOnly || isStripeSavedCard}
                readOnly={readOnly || isStripeSavedCard}
              />
            </div>

            <div>
              <label htmlFor="cardholder-name-input" className="block text-sm font-medium mb-2">
                Cardholder Name
              </label>
              <input
                id="cardholder-name-input"
                type="text"
                value={cardholderName}
                onChange={(e) => onCardholderNameChange?.(e.target.value.toUpperCase())}
                onFocus={() => { handleFlip(false); setFocusField("name"); }}
                onBlur={() => setFocusField(null)}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 uppercase"
                autoComplete="cc-name"
                aria-label="Name on card"
                disabled={readOnly}
                readOnly={readOnly}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="expiry-month-input" className="block text-sm font-medium mb-2">Month</label>
                <select
                  id="expiry-month-input"
                  value={expiryMonth}
                  onChange={(e) => onExpiryMonthChange?.(e.target.value)}
                  onFocus={() => { handleFlip(false); setFocusField("date"); }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  autoComplete="cc-exp-month"
                  aria-label="Expiry month"
                  aria-invalid={validationErrors.some(e => e.includes("expiry"))}
                  disabled={readOnly}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expiry-year-input" className="block text-sm font-medium mb-2">Year</label>
                <select
                  id="expiry-year-input"
                  value={expiryYear}
                  onChange={(e) => onExpiryYearChange?.(e.target.value)}
                  onFocus={() => { handleFlip(false); setFocusField("date"); }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  autoComplete="cc-exp-year"
                  aria-label="Expiry year"
                  aria-invalid={validationErrors.some(e => e.includes("expiry"))}
                  disabled={readOnly}
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2026 + i} value={String(2026 + i)}>{2026 + i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cvv-input" className="block text-sm font-medium mb-2">
                  CVV
                  <span className="ml-1 text-xs opacity-60">
                    ({(brand || getCardType(cardNumber)) === "amex" ? "4" : "3"} digits)
                  </span>
                </label>
                <input
                  id="cvv-input"
                  type="password"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const cardInfo = brand || getCardType(cardNumber);
                    const maxLength = cardInfo === "amex" ? 4 : 3;
                    if (value.length <= maxLength) {
                      onCvvChange?.(value);
                    }
                  }}
                  onFocus={() => { handleFlip(true); setFocusField(null); }}
                  onBlur={() => { handleFlip(false); setFocusField(null); }}
                  placeholder={(brand || getCardType(cardNumber)) === "amex" ? "1234" : "123"}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  maxLength={(brand || getCardType(cardNumber)) === "amex" ? 4 : 3}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  aria-label="Card security code"
                  aria-invalid={validationErrors.some(e => e.includes("CVV"))}
                  disabled={readOnly}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

InteractiveBankCard.displayName = "InteractiveBankCard"

export { BankCard, InteractiveBankCard, SavedBankCardsGallery }