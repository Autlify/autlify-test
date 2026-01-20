"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CreditCard, Wifi, Shield, Check, X, AlertCircle } from "lucide-react"
import { useEffect, useRef, useState, useLayoutEffect } from "react"

const AMEX_MASK = "#### ###### #####";
const OTHER_MASK = "#### #### #### ####";
const CARD_TYPE_IMAGES: Record<string, string> = {
  visa: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png",
  amex: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png",
  mastercard: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png",
  discover: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/discover.png",
  troy: "https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/troy.png",
};

function getCardType(cardNumber: string) {
  if (/^4/.test(cardNumber)) return "visa";
  if (/^(34|37)/.test(cardNumber)) return "amex";
  if (/^5[1-5]/.test(cardNumber)) return "mastercard";
  if (/^6011/.test(cardNumber)) return "discover";
  if (/^9792/.test(cardNumber)) return "troy";
  if (/^(36|30[0-5]|38)/.test(cardNumber)) return "diners";
  if (/^(2131|1800)/.test(cardNumber)) return "jcb";
  return "visa";
}

function generateCardNumberMask(cardType: string) {
  return cardType === "amex" ? AMEX_MASK : OTHER_MASK;
}

interface GlassCreditCardProps {
  cardNumber?: string
  cardholderName?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  isFlipped?: boolean
  variant?: "default" | "premium" | "platinum" | "black"
  showChip?: boolean
  brand?: string
  cardImage?: string
  showContactless?: boolean
  showHologram?: boolean
  isValid?: boolean
  validationErrors?: string[]
  className?: string
  onClick?: () => void
  isSelected?: boolean
  focusField?: string | null;
}

const cardVariants = {
  default: {
    background: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
    accent: "from-blue-500 to-purple-600",
    text: "text-white",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
  premium: {
    background: "bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700",
    accent: "from-amber-400 to-yellow-300",
    text: "text-black",
    chip: "bg-gradient-to-br from-gray-800 to-black border-gray-700",
    chipText: "bg-white/80",
  },
  platinum: {
    background: "bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400",
    accent: "from-gray-100 to-white",
    text: "text-black",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
  black: {
    background: "bg-gradient-to-br from-black via-gray-900 to-black",
    accent: "from-gray-600 to-gray-400",
    text: "text-white",
    chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    chipText: "bg-black/60",
  },
}

function formatCardNumber(cardNumber: string, mask: string) {
  let formatted = "";
  let digitIndex = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "#") {
      if (cardNumber[digitIndex]) {
        formatted += cardNumber[digitIndex];
        digitIndex++;
      } else {
        formatted += "";
      }
    } else {
      formatted += mask[i];
    }
  }
  return formatted.trim();
}

const maskCardNumber = (cardNumber: string) => {
  return getCardType(cardNumber) === "amex"
    ? cardNumber.replace(/(\d{4})(\d{6})(\d{5})/, "**** **** **$3")
    : cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "**** **** **** $4");
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

const CardChip = ({ variant }: { variant: keyof typeof cardVariants }) => (
  <div className="relative">
    <div className={cn("w-12 h-8 rounded-md border-2 flex items-center justify-center", cardVariants[variant].chip)}>
      <div className="grid grid-cols-3 gap-0.5 w-6 h-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={cn("w-1 h-1 rounded-sm", cardVariants[variant].chipText)} />
        ))}
      </div>
    </div>
  </div>
)

const ContactlessIcon = ({ variant }: { variant: keyof typeof cardVariants }) => (
  <div className="relative">
    <Wifi className={cn("w-6 h-6 rotate-90", cardVariants[variant].text, "opacity-60")} />
  </div>
)

const HologramEffect = ({ variant }: { variant: keyof typeof cardVariants }) => (
  <div className="absolute bottom-6 right-6">
    <div className="relative w-12 h-12 rounded-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 via-green-400 to-blue-500 opacity-70 animate-spin-slow" />
      <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="w-6 h-6 text-white/80" />
      </div>
    </div>
  </div>
)

const CardImage = ({ cardImage }: { cardImage?: typeof CARD_TYPE_IMAGES[keyof typeof CARD_TYPE_IMAGES] } ) => {
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
}: {  cardInfo: string; variant: keyof typeof cardVariants }) => {
  const logoColor = cardVariants[variant].text === "text-white" ? "text-white" : "text-black"

  if (cardInfo === "visa") {
    return <div className={cn("text-2xl font-bold tracking-wider", logoColor)}>VISA</div>
  }

  if (cardInfo === "mastercard") {
    return (
      <div className="flex space-x-1">
        <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
        <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-90 -ml-2" />
      </div>
    )
  }

  if (cardInfo === "amex") {
    return <div className={cn("text-lg font-bold", logoColor)}>AMEX</div>
  }

  if (cardInfo === "discover") {
    return <div className={cn("text-lg font-bold", logoColor)}>DISCOVER</div>
  }

  if (cardInfo === "diners") {
    return <div className={cn("text-lg font-bold", logoColor)}>DINERS</div>
  }

  if (cardInfo === "jcb") {
    return <div className={cn("text-lg font-bold", logoColor)}>JCB</div>
  }

  return <CreditCard className={cn("w-8 h-8", logoColor, "opacity-60")} />
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

export const GlassCreditCard = React.forwardRef<HTMLDivElement, GlassCreditCardProps>(
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
      brand,
      cardImage,
      onClick,
      isSelected = false,
      focusField,
      ...props
    },
    ref,
  ) => {
    const cardInfo = getCardType(cardNumber)
    const variantStyles = cardVariants[variant]
    const cardNumberRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
    const cardNameRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
    const cardDateRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
    // Focus highlight state
    const [focusStyle, setFocusStyle] = useState<React.CSSProperties | undefined>(undefined)

    useLayoutEffect(() => {
      let ref: React.RefObject<HTMLDivElement> | null = null;
      if (focusField === "number") ref = cardNumberRef;
      if (focusField === "name") ref = cardNameRef;
      if (focusField === "date") ref = cardDateRef;
      if (ref && ref.current) {
        const ew = cardInfo === "amex" ? 24 : 30;
        const el = ref.current;
        setFocusStyle({
          width: `${el.offsetWidth + ew}px`,
          height: `${el.offsetHeight + 4}px`,
          transform: `translateX(${el.offsetLeft - (ew / 2)}px) translateY(${el.offsetTop - 2}px)`,
          opacity: 1,
          position: "absolute",
          border: "2px solid rgba(255,255,255,0.7)",
          borderRadius: "8px",
          pointerEvents: "none",
          transition: "all 0.35s cubic-bezier(0.71, 0.03, 0.56, 0.85)",
          zIndex: 30,
        });
      } else {
        setFocusStyle(undefined);
      }
    }, [focusField, cardInfo])

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full max-w-sm mx-auto cursor-pointer",
          isSelected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent",
          className,
        )}
        style={{ perspective: "1000px" }}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <motion.div
          className="relative w-full h-56 transition-transform duration-700 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Focus highlight rectangle */}
          {focusStyle && <div style={focusStyle} />}
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

            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {showChip && <CardChip variant={variant} />}
                  {showContactless && <ContactlessIcon variant={variant} />}
                </div>
                {/* <CardLogo cardInfo={cardInfo} variant={variant} /> */}
                <CardImage cardImage={cardImage || CARD_TYPE_IMAGES[cardInfo]} />
              </div>

              {/* Card Number */}
              <div className="flex-1 flex items-center">
                <div
                  className={cn("text-2xl font-mono tracking-widest", variantStyles.text)}
                  ref={cardNumberRef}
                >
                  {/* Vue-style animated masking for card number */}
                  {(() => {
                    const mask = generateCardNumberMask(cardInfo);
                    const maskArr = mask.split("");
                    return maskArr.map((n, i) => {
                      if (
                        (cardInfo === "amex" && i > 4 && i < 14 && cardNumber.length > i && n.trim() !== "") ||
                        (cardInfo !== "amex" && i > 4 && i < 15 && cardNumber.length > i && n.trim() !== "")
                      ) {
                        return (
                          <span key={i} className="inline-block w-4 text-lg font-mono">*</span>
                        );
                      }
                      if (cardNumber.length > i) {
                        return (
                          <span key={i} className={`inline-block w-4 text-lg font-mono${n.trim() === "" ? " font-bold" : ""}`}>{cardNumber[i]}</span>
                        );
                      }
                      return (
                        <span key={i} className={`inline-block w-4 text-lg font-mono${n.trim() === "" ? " font-bold" : ""}`}>{n}</span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between">
                <div>
                  <div className={cn("text-xs opacity-60 mb-1", variantStyles.text)}>CARDHOLDER NAME</div>
                  <div className={cn("text-sm font-medium tracking-wide uppercase", variantStyles.text)}>
                    {cardholderName || "YOUR NAME"}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-xs opacity-60 mb-1", variantStyles.text)}>VALID THRU</div>
                  <div className={cn("text-lg font-mono tracking-wider", variantStyles.text)}>
                    {expiryMonth || "MM"}/{expiryYear?.slice(-2) || "YY"}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Indicator */}
            <ValidationIndicator isValid={isValid} errors={validationErrors} />

            {/* Security Features Indicator */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">SECURE</span>
              </div>
            </div>

            {/* Hologram */}
            {showHologram && <HologramEffect variant={variant} />}
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
              <div className="bg-white h-10 rounded mb-4 flex items-center justify-end pr-4">
                <div className="text-black text-sm font-mono">
                  {cvv.length > 0 ? <span>{cvv?.replace(/\d/g, "•")}</span> : ""}
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

GlassCreditCard.displayName = "GlassCreditCard"

interface SavedCard {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  variant: "default" | "premium" | "platinum" | "black"
  isDefault?: boolean
}

interface SavedCardsGalleryProps {
  cards: SavedCard[]
  selectedCardId?: string
  onCardSelect?: (cardId: string) => void
  onAddCard?: () => void
  className?: string
}

export const SavedCardsGallery = React.forwardRef<HTMLDivElement, SavedCardsGalleryProps>(
  ({ cards, selectedCardId, onCardSelect, onAddCard, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white text-black">Saved Payment Methods</h3>
          <button onClick={onAddCard} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
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
                className="relative"
              >
                <GlassCreditCard
                  cardNumber={card.cardNumber}
                  cardholderName={card.cardholderName}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  variant={card.variant}
                  isSelected={selectedCardId === card.id}
                  onClick={() => onCardSelect?.(card.id)}
                  className="scale-75 origin-top-left"
                />
                {card.isDefault && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Default
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    )
  },
)

SavedCardsGallery.displayName = "SavedCardsGallery"

interface InteractiveCreditCardProps extends GlassCreditCardProps {
  onCardNumberChange?: (value: string) => void
  onCardholderNameChange?: (value: string) => void
  onExpiryMonthChange?: (value: string) => void
  onExpiryYearChange?: (value: string) => void
  onCvvChange?: (value: string) => void
  onFlip?: (flipped: boolean) => void
  showInputs?: boolean
  autoValidate?: boolean
}

export const InteractiveGlassCreditCard = React.forwardRef<HTMLDivElement, InteractiveCreditCardProps>(
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
      className,
      ...props
    },
    ref,
  ) => {
    const [localFlipped, setLocalFlipped] = React.useState(isFlipped)
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])
    const [isValid, setIsValid] = React.useState<boolean | undefined>(undefined)
    const [focusField, setFocusField] = React.useState<string | null>(null)

    const handleFlip = (flipped: boolean) => {
      setLocalFlipped(flipped)
      onFlip?.(flipped)
    }


    const validateCard = React.useCallback(() => {
      if (!autoValidate) return

      const errors: string[] = []
      let valid = true

      // Validate card number
      if (cardNumber) {
        if (!validateCardNumber(cardNumber)) {
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
        const cardInfo = getCardType(cardNumber)
        const expectedLength = cardInfo === "amex" ? 4 : 3
        if (cvv.length !== expectedLength) {
          errors.push(`CVV should be ${expectedLength} digits`)
          valid = false
        }
      }

      setValidationErrors(errors)
      setIsValid(cardNumber || expiryMonth || expiryYear || cvv ? valid : undefined)
    }, [cardNumber, expiryMonth, expiryYear, cvv, autoValidate])

    React.useEffect(() => {
      validateCard()
    }, [validateCard])

    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        <GlassCreditCard
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
        />

        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
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
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <input
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => onCardholderNameChange?.(e.target.value)}
                onFocus={() => { handleFlip(false); setFocusField("name"); }}
                onBlur={() => setFocusField(null)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium mb-2">Month</label>
                <select
                  id="expiryMonth"
                  value={expiryMonth}
                  onChange={(e) => onExpiryMonthChange?.(e.target.value)}
                  onFocus={() => { handleFlip(false); setFocusField("date"); }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium mb-2">Year</label>
                <select
                  id="expiryYear"
                  value={expiryYear}
                  onChange={(e) => onExpiryYearChange?.(e.target.value)}
                  onFocus={() => { handleFlip(false); setFocusField("date"); }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2024 + i} value={String(2024 + i)}>{2024 + i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const cardInfo = getCardType(cardNumber);
                    const maxLength = cardInfo === "amex" ? 4 : 3;
                    if (value.length <= maxLength) {
                      onCvvChange?.(value);
                    }
                  }}
                  onFocus={() => { handleFlip(true); setFocusField(null); }}
                  onBlur={() => setFocusField(null)}
                  placeholder="123"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  maxLength={getCardType(cardNumber) === "amex" ? 4 : 3}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

InteractiveGlassCreditCard.displayName = "InteractiveGlassCreditCard"

export { GlassCreditCard as default }
