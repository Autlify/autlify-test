"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircle,
  Check,
  CreditCard as CreditCardIcon,
  MoreVertical,
  Plus,
  Shield,
  Wifi,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AspectRatio } from "./aspect-ratio"

type BankCardTone = "default" | "premium" | "platinum" | "black"

type BankCardSize = "regular" | "compact"

type CardIssuer = 
  // Malaysian Banks
  | 'mayBank' | 'cimb' | 'publicBank' | 'rhbBank' | 'amBank' | 'hongLeongBank' 
  | 'bankIslam' | 'affinBank' | 'allianceBank' | 'bsn' | 'ocbc' | 'uob'
  | 'hsbc' | 'standardChartered' | 'citiBank' | 'mbsbBank'
  // Foreign Banks
  | 'dbs' | 'bankOfAmerica' | 'bankOfChina' | 'kasikornBank' | 'bangkokBank'
  | 'jpMorganChase' | 'wellsFargo' | 'barclays' | 'bdo' | 'bca' | 'stripeBank'
  // Generic fallbacks
  | 'genericVisa' | 'genericMastercard' | 'genericAmex' | 'genericDiscover'

const AMEX_GROUPS = [4, 6, 5] as const
const OTHER_GROUPS = [4, 4, 4, 4] as const

// Bank-specific style definitions (overrides tone when issuer is detected)
interface IssuerStyles {
  background: string
  textColor: string
  textMuted: string
  bankLogoText?: string
  bankLogoColor?: string
}

const issuerStyles: Record<CardIssuer, IssuerStyles> = {
  // Malaysian Banks
  mayBank: {
    background: "bg-gradient-to-br from-yellow-400 to-yellow-300",
    textColor: "text-black",
    textMuted: "text-black/90",
    bankLogoText: "Maybank",
    bankLogoColor: "text-yellow-400",
  },
  cimb: {
    background: "bg-gradient-to-r from-red-600 via-red-500 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "CIMB",
    bankLogoColor: "text-red-600",
  },
  publicBank: {
    background: "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "PBB",
    bankLogoColor: "text-blue-700",
  },
  rhbBank: {
    background: "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "RHB",
    bankLogoColor: "text-blue-800",
  },
  amBank: {
    background: "bg-gradient-to-r from-blue-900 to-blue-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "AmBank",
    bankLogoColor: "text-blue-800",
  },
  hongLeongBank: {
    background: "bg-gradient-to-r from-orange-600 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "HL Bank",
    bankLogoColor: "text-red-600",
  },
  bankIslam: {
    background: "bg-gradient-to-br from-green-700 via-green-600 to-green-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "B.Islam",
    bankLogoColor: "text-green-700",
  },
  affinBank: {
    background: "bg-gradient-to-r from-purple-800 to-purple-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Affin",
    bankLogoColor: "text-purple-700",
  },
  allianceBank: {
    background: "bg-gradient-to-br from-blue-700 to-cyan-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Alliance",
    bankLogoColor: "text-blue-700",
  },
  bsn: {
    background: "bg-gradient-to-r from-orange-600 to-amber-500",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BSN",
    bankLogoColor: "text-orange-600",
  },
  ocbc: {
    background: "bg-gradient-to-r from-red-700 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "OCBC",
    bankLogoColor: "text-red-600",
  },
  uob: {
    background: "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "UOB",
    bankLogoColor: "text-blue-700",
  },
  hsbc: {
    background: "bg-gradient-to-br from-neutral-900 to-neutral-800",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "HSBC",
    bankLogoColor: "text-red-600",
  },
  standardChartered: {
    background: "bg-gradient-to-br from-blue-800 to-blue-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "SC",
    bankLogoColor: "text-blue-800",
  },
  citiBank: {
    background: "bg-gradient-to-r from-blue-500 to-blue-400",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Citi",
    bankLogoColor: "text-blue-500",
  },
  mbsbBank: {
    background: "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "MBSB",
    bankLogoColor: "text-blue-700",
  },
  
  // Foreign Banks
  dbs: {
    background: "bg-gradient-to-br from-red-700 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "DBS",
    bankLogoColor: "text-red-600",
  },
  bankOfAmerica: {
    background: "bg-gradient-to-r from-red-700 via-red-600 to-red-500",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BoA",
    bankLogoColor: "text-blue-700",
  },
  bankOfChina: {
    background: "bg-gradient-to-r from-red-700 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BoC",
    bankLogoColor: "text-red-600",
  },
  kasikornBank: {
    background: "bg-gradient-to-br from-green-600 to-green-500",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "KBank",
    bankLogoColor: "text-green-600",
  },
  bangkokBank: {
    background: "bg-gradient-to-br from-blue-800 to-blue-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BBL",
    bankLogoColor: "text-blue-900",
  },
  jpMorganChase: {
    background: "bg-gradient-to-r from-blue-800 to-sky-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Chase",
    bankLogoColor: "text-blue-900",
  },
  wellsFargo: {
    background: "bg-gradient-to-r from-red-700 to-red-600",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "WF",
    bankLogoColor: "text-red-700",
  },
  barclays: {
    background: "bg-gradient-to-r from-blue-900 to-blue-800",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Barclays",
    bankLogoColor: "text-blue-600",
  },
  bdo: {
    background: "bg-gradient-to-br from-blue-600 to-blue-500",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BDO",
    bankLogoColor: "text-blue-700",
  },
  bca: {
    background: "bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "BCA",
    bankLogoColor: "text-blue-800",
  },
  stripeBank: {
    background: "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700",
    textColor: "text-white",
    textMuted: "text-white/90",
    bankLogoText: "Stripe",
    bankLogoColor: "text-indigo-600",
  },
  
  // Generic card brand fallbacks
  genericVisa: {
    background: "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700",
    textColor: "text-white",
    textMuted: "text-white/90",
  },
  genericMastercard: {
    background: "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800",
    textColor: "text-white",
    textMuted: "text-white/90",
  },
  genericAmex: {
    background: "bg-gradient-to-br from-slate-700 via-blue-800 to-slate-800",
    textColor: "text-white",
    textMuted: "text-white/90",
  },
  genericDiscover: {
    background: "bg-gradient-to-r from-orange-600 to-amber-600",
    textColor: "text-white",
    textMuted: "text-white/90",
  },
}

// BIN ranges for Malaysian and foreign banks
const binRanges: Record<string, CardIssuer> = {
  // Malaysian Banks
  "557382": "mayBank", "557383": "mayBank",
  "552033": "cimb", "552034": "cimb",
  "464896": "publicBank", "464897": "publicBank",
  "552042": "rhbBank", "552043": "rhbBank",
  "552065": "amBank", "552066": "amBank",
  "554674": "hongLeongBank", "554675": "hongLeongBank",
  "458412": "bankIslam", "458413": "bankIslam",
  "452507": "affinBank",
  "521893": "allianceBank",
  "454867": "bsn",
  "531289": "ocbc",
  "472439": "uob",
  "405525": "hsbc",
  "522183": "standardChartered",
  "541324": "citiBank",
  "457116": "mbsbBank",
  // Stripe test cards
  "424242": "stripeBank", "400000": "stripeBank",
}

// Detect card issuer from BIN or fallback to generic brand
function detectCardIssuer(cardNumber: string, cardBrand: string): CardIssuer | null {
  if (!cardNumber || cardNumber.length < 6) return null
  
  // Try BIN detection first
  const clean = cardNumber.replace(/\s/g, "")
  const bin = clean.substring(0, 6)
  
  for (const [prefix, issuer] of Object.entries(binRanges)) {
    if (bin.startsWith(prefix)) {
      return issuer
    }
  }
  
  // Fallback to generic brand styling
  switch (cardBrand) {
    case 'visa':
      return 'genericVisa'
    case 'mastercard':
      return 'genericMastercard'
    case 'amex':
      return 'genericAmex'
    case 'discover':
      return 'genericDiscover'
    default:
      return null
  }
}

function getCardType(input: string) {
  const cardNumber = input.replace(/\s/g, "")
  if (/^4/.test(cardNumber)) return "visa"
  if (/^(34|37)/.test(cardNumber)) return "amex"
  if (/^5[1-5]/.test(cardNumber)) return "mastercard"
  if (/^(62|81)/.test(cardNumber)) return "unionpay"
  if (/^6011/.test(cardNumber)) return "discover"
  if (/^(36|30[0-5]|38)/.test(cardNumber)) return "dinersclub" // Sample Numbers: 36148900000013, 30569309025904, 38520000023237
  if (/^9792/.test(cardNumber)) return "troy" // Sample Number: 9792000000000000
  if (/^35(2[89]|[3-8][0-9])/.test(cardNumber)) return "jcb" // Sample Numbers: 3528000000000007, 3566002020360505
  if (/^400000/.test(cardNumber)) return "visa" // SampleNumbers: 4000000000000010 (3D Secure), 4000002500003155 (insufficient funds)
  if (/^4242/.test(cardNumber)) return "visa" // Sample Numbers: 4242424242424242 (basic), 4242424242424241 (declined)
  
  return "visa"
}

function isCardMasked(value: string): boolean {
  return value.includes("*") || value.includes("•")
}

function extractLast4(value: string): string {
  const match = value.match(/(\d{4})\s*$/)
  return match ? match[1] : "••••"
}

function groupDigits(digits: string[], groups: readonly number[]) {
  const out: string[] = []
  let i = 0
  for (const g of groups) {
    out.push(digits.slice(i, i + g).join(""))
    i += g
  }
  return out.join(" ")
}

function buildMaskedCardNumber(
  cardNumber: string,
  cardType: string,
  opts?: { showFullMask?: boolean }
) {
  // Saved cards: "**** **** **** 4242" or bullets
  if (isCardMasked(cardNumber)) {
    const last4 = extractLast4(cardNumber)
    return `•••• •••• •••• ${last4}`
  }

  const clean = cardNumber.replace(/\D/g, "")
  const groups = cardType === "amex" ? AMEX_GROUPS : OTHER_GROUPS
  const totalLen = groups.reduce((a, b) => a + b, 0)

  // Create a padded digit array (typed digits + placeholders)
  const padded = Array.from({ length: totalLen }, (_, idx) => clean[idx] ?? "•")

  // Mask middle digits once the user passes the first group.
  // Keep first 4 visible; keep up to last 4 visible if present.
  if (!opts?.showFullMask) {
    const typed = clean.length
    if (typed > 4) {
      const lastVisibleStart = Math.max(typed - 4, 4)
      for (let i = 4; i < Math.min(totalLen - 4, typed); i++) {
        // if we're within the last 4 digits typed, keep it visible
        if (i >= lastVisibleStart) continue
        padded[i] = "•"
      }
    }
  }

  return groupDigits(padded, groups)
}

interface BankCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardNumber?: string
  cardholderName?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  isFlipped?: boolean
  /** Card tone (tier) - determines color scheme */
  variant?: BankCardTone
  /** Specific card issuer (bank) - overrides variant when detected */
  issuer?: CardIssuer
  /** Compact / Regular sizing */
  size?: BankCardSize
  /** @deprecated Use `size` instead */
  compact?: boolean

  showChip?: boolean
  showContactless?: boolean
  showHologram?: boolean
  showBankLogo?: boolean

  isValid?: boolean
  validationErrors?: string[]
  showValidationErrors?: boolean

  onClick?: () => void
  /** Visual indicator for selected card in galleries */
  isSelected?: boolean

  focusField?: "number" | "name" | "date" | null

  /** For Stripe saved cards that come pre-masked */
  isMasked?: boolean
  /** Card brand from payment provider (visa, mastercard, amex, etc.) */
  brand?: string
}

const frameVariants = cva(
  "relative w-full mx-auto select-none group",
  {
    variants: {
      size: {
        regular: "max-w-sm",
        compact: "max-w-[320px]",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      size: "regular",
      interactive: false,
    },
  }
)

const faceVariants = cva(
  "absolute inset-0 w-full h-full rounded-2xl overflow-hidden",
  {
    variants: {
      size: {
        regular: "shadow-linear-xl",
        compact: "shadow-linear-lg",
      },
    },
    defaultVariants: {
      size: "regular",
    },
  }
)

const contentPaddingVariants = cva(
  "relative z-10 h-full flex flex-col justify-between",
  {
    variants: {
      size: {
        regular: "p-6",
        compact: "p-5",
      },
    },
    defaultVariants: {
      size: "regular",
    },
  }
)

const numberVariants = cva("font-mono tabular-nums", {
  variants: {
    size: {
      regular: "sm:text-[14px] md:text-auto font-bold tracking-[0.22em]",
      compact: "text-[11px] font-semibold tracking-[0.20em]",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const labelVariants = cva("opacity-60", {
  variants: {
    size: {
      regular: "text-xs",
      compact: "text-[10px]",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const valueVariants = cva("", {
  variants: {
    size: {
      regular: "text-[14px] font-medium tracking-wide uppercase",
      compact: "text-[11px] font-medium tracking-wide uppercase",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const expiryVariants = cva("font-mono tabular-nums", {
  variants: {
    size: {
      regular: "text-sm tracking-wider",
      compact: "text-[11px] tracking-wider",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const chipVariants = cva("rounded-md border flex items-center justify-center", {
  variants: {
    size: {
      regular: "w-10 h-6",
      compact: "w-9 h-5",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const chipGridVariants = cva("grid grid-cols-3 gap-0.5", {
  variants: {
    size: {
      regular: "w-6 h-4",
      compact: "w-5 h-3",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const chipDotVariants = cva("rounded-sm", {
  variants: {
    size: {
      regular: "w-0.75 h-0.75",
      compact: "w-0.5 h-0.5",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const contactlessVariants = cva("rotate-90 opacity-60", {
  variants: {
    size: {
      regular: "w-5 h-5",
      compact: "w-4 h-4",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const hologramPosVariants = cva("absolute", {
  variants: {
    size: {
      regular: "bottom-5 right-6",
      compact: "bottom-4 right-5",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const hologramSizeVariants = cva("relative rounded-full overflow-hidden", {
  variants: {
    size: {
      regular: "w-11 h-11",
      compact: "w-8 h-8",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const hologramIconVariants = cva("text-white/80", {
  variants: {
    size: {
      regular: "w-6 h-6",
      compact: "w-5 h-5",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const logoVisaVariants = cva("font-bold tracking-wider", {
  variants: {
    size: {
      regular: "md:text-lg lg:text-xl xl:text-2xl",
      compact: "text-md",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const logoSmallTextVariants = cva("font-bold", {
  variants: {
    size: {
      regular: "text-lg",
      compact: "text-base",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const logoIconVariants = cva("opacity-60", {
  variants: {
    size: {
      regular: "w-8 h-8",
      compact: "w-7 h-7",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

const logoCircleVariants = cva("rounded-full", {
  variants: {
    size: {
      regular: "w-8 h-8",
      compact: "w-7 h-7",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})


const logoOverlapVariants = cva("rounded-full", {
  variants: {
    size: {
      regular: "-ml-2",
      compact: "-ml-1.5",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

type ToneStyles = {
  surface: string
  text: string
  textMuted: string
  placeholder: string
  chip: string
  chipDot: string
  hologram: string
}

const toneStyles: Record<BankCardTone, ToneStyles> = {
  // Theme-aware default (uses globals.css brand gradient)
  default: {
    surface: "bg-brand-gradient",
    text: "text-white",
    textMuted: "text-white/70",
    placeholder: "text-white/25",
    chip: "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200/70",
    chipDot: "bg-black/60",
    hologram: "from-fuchsia-400 via-violet-500 to-cyan-400",
  },
  // Gold (fixed metallic look; stays readable across themes)
  premium: {
    surface:
      "bg-[image:linear-gradient(135deg,#B8892B_0%,#F1D38F_45%,#8E6A1C_100%)]",
    text: "text-black",
    textMuted: "text-black/70",
    placeholder: "text-black/25",
    chip: "bg-gradient-to-br from-zinc-900 to-black border-zinc-700",
    chipDot: "bg-white/80",
    hologram: "from-amber-200 via-emerald-200 to-sky-200",
  },
  // Silver (theme-aware, uses globals.css gradient tokens)
  platinum: {
    surface: "bg-secondary-gradient",
    text: "text-content-primary",
    textMuted: "text-content-secondary",
    placeholder: "text-content-tertiary",
    chip: "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200/70",
    chipDot: "bg-black/60",
    hologram: "from-amber-200 via-emerald-200 to-sky-200",
  },
  // Near-black (fixed, high-contrast)
  black: {
    surface:
      "bg-[image:linear-gradient(135deg,#050607_0%,#0A0B0D_50%,#121417_100%)]",
    text: "text-white",
    textMuted: "text-white/70",
    placeholder: "text-white/25",
    chip: "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200/70",
    chipDot: "bg-black/60",
    hologram: "from-fuchsia-400 via-violet-500 to-cyan-400",
  },
}

function SelectedGlow() {
  return (
    <>
      {/* Soft gradient glow */}
      <motion.div
        className="pointer-events-none absolute -inset-[2px] rounded-[18px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 opacity-70 blur-sm"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Crisp border */}
      <div className="pointer-events-none absolute -inset-[2px] rounded-[18px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700" />

      {/* Selected badge */}
      <div className="absolute -top-3 -right-3 z-20">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full blur-md opacity-60" />
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg border-2 border-white/80">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        </motion.div>
      </div>
    </>
  )
}


function CardChip({ tone, size }: { tone: ToneStyles; size: BankCardSize }) {
  return (
    <div className="relative">
      <div className={cn(chipVariants({ size }), tone.chip)}>
        <div className={cn(chipGridVariants({ size }))}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={cn(chipDotVariants({ size }), tone.chipDot)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactlessIcon({ tone, size }: { tone: ToneStyles; size: BankCardSize }) {
  return <Wifi className={cn(contactlessVariants({ size }), tone.text)} />
}

function Hologram({ tone, size }: { tone: ToneStyles; size: BankCardSize }) {
  return (
    <div className={cn(hologramPosVariants({ size }))}>
      <div className={cn(hologramSizeVariants({ size }))}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", tone.hologram, "animate-pulse")} />
        <div className="absolute inset-0 opacity-70 [animation:spin_7s_linear_infinite] bg-gradient-to-tr from-white/20 via-transparent to-white/20" />
        <div className="absolute inset-2 bg-gradient-to-br from-white/25 to-transparent rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className={cn(hologramIconVariants({ size }))} />
        </div>
      </div>
    </div>
  )
}

function CardLogo({ brand, tone, size }: { brand: string; tone: ToneStyles; size: BankCardSize }) {
  if (brand === "visa") {
    return <div className={cn(logoVisaVariants({ size }), tone.text)}>VISA</div>
  }

  if (brand === "mastercard") {
    return (
      <div className="flex space-x-1">
        <div className={cn(logoCircleVariants({ size }), "bg-red-500/90")} />
        <div className={cn(logoCircleVariants({ size }), logoOverlapVariants({ size }), "bg-amber-400/90")} />
      </div>
    )
  }

  if (brand === "amex") return <div className={cn(logoSmallTextVariants({ size }), tone.text)}>AMEX</div>
  if (brand === "discover") return <div className={cn(logoSmallTextVariants({ size }), tone.text)}>DISCOVER</div>
  if (brand === "dinersclub") return <div className={cn(logoSmallTextVariants({ size }), tone.text)}>DINERS</div>
  if (brand === "jcb") return <div className={cn(logoSmallTextVariants({ size }), tone.text)}>JCB</div>

  return <CreditCardIcon className={cn(logoIconVariants({ size }), tone.text)} />
}

function BankLogo({ issuer, size }: { issuer: CardIssuer; size: BankCardSize }) {
  const styles = issuerStyles[issuer]
  if (!styles.bankLogoText) return null
  
  return (
    <div className={cn(
      "absolute top-6 right-6 bg-white/90 rounded flex items-center justify-center backdrop-blur-sm shadow-md",
      size === "compact" ? "w-14 h-7 px-2" : "w-16 h-8 px-2.5"
    )}>
      <span className={cn(
        "font-bold leading-none",
        styles.bankLogoColor,
        size === "compact" ? "text-xs" : "text-sm"
      )}>
        {styles.bankLogoText}
      </span>
    </div>
  )
}

function ValidationIndicator({ isValid }: { isValid?: boolean }) {
  if (isValid === undefined) return null

  return (
    <div className="absolute top-4 left-4">
      <div
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full backdrop-blur-sm",
          isValid ? "bg-success/15 border border-success/25" : "bg-destructive/15 border border-destructive/25"
        )}
      >
        {isValid ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <X className="w-3 h-3 text-destructive" />
        )}
        <span className={cn("text-xs font-medium", isValid ? "text-success" : "text-destructive")}>
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
      issuer: providedIssuer,
      size,
      compact,
      showChip = true,
      showContactless = true,
      showHologram = true,
      showBankLogo = true,
      isValid,
      validationErrors = [],
      showValidationErrors = false,
      className,
      onClick,
      isSelected = false,
      focusField,
      isMasked = false,
      brand,
      onDrag,
      onDragEnd,
      onDragStart,
      onDragEnter,
      onDragExit,
      onDragLeave,
      onDragOver,
      onDrop,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionEnd,
      ...props
    },
    ref
  ) => {
    const resolvedSize: BankCardSize = size ?? (compact ? "compact" : "regular")
    const cardBrand = brand || getCardType(cardNumber)
    const isStripeSavedCard = isMasked || isCardMasked(cardNumber)
    const displayNumber = buildMaskedCardNumber(cardNumber, cardBrand)
    
    // Detect issuer from BIN or use provided issuer
    const detectedIssuer = providedIssuer || detectCardIssuer(cardNumber, cardBrand)
    
    // Use issuer styles if available, otherwise fall back to tone
    const baseTone = toneStyles[variant]
    const issuerStyle = detectedIssuer ? issuerStyles[detectedIssuer] : null
    
    const tone: ToneStyles = issuerStyle ? {
      surface: issuerStyle.background,
      text: issuerStyle.textColor,
      textMuted: issuerStyle.textMuted,
      placeholder: `${issuerStyle.textColor}/25`,
      chip: baseTone.chip,
      chipDot: baseTone.chipDot,
      hologram: baseTone.hologram,
    } : baseTone
 

    return (
      <motion.div
        ref={ref}
        className={cn(
          frameVariants({ size: resolvedSize, interactive: Boolean(onClick) }) as string,
           className
        )}
        style={{ perspective: "1000px", aspectRatio: "1.586" }}
        onClick={onClick}
        whileHover={onClick ? { scale: isSelected ? 1.03 : 1.015 } : {}}
        whileTap={onClick ? { scale: 0.985 } : {}}
        animate={isSelected ? { 
          scale: [1, 1.02, 1],
        } : {}}
        transition={isSelected ? {
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        } : {}}
        {...props}
      >
        {isSelected && (<SelectedGlow />)}

        <motion.div
          className={cn(
            "relative w-full h-full transition-transform duration-700",
            "[transform-style:preserve-3d]",
            isSelected && "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          )}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
          role="img"
          aria-label={`${variant} card ${isStripeSavedCard ? "(saved)" : ""}`}
        >
          {/* Front */}
          <div
            className={cn(faceVariants({ size: resolvedSize }), tone.surface)}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Ambient highlights */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-white/6" />
            <div className="absolute inset-0 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
            <div className="absolute inset-0 [background:radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.06),transparent_55%)]" />

            {/* Sweeping sheen */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
              animate={{ x: ["-120%", "120%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />

            <div className={contentPaddingVariants({ size: resolvedSize })}>
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {showChip && <CardChip tone={tone} size={resolvedSize} />}
                  {showContactless && <ContactlessIcon tone={tone} size={resolvedSize} />}
                </div>
                {/* Show bank logo if issuer detected and has logo, otherwise show card brand logo */}
                {detectedIssuer && showBankLogo ? (
                  <BankLogo issuer={detectedIssuer} size={resolvedSize} />
                ) : (
                  <CardLogo brand={cardBrand} tone={tone} size={resolvedSize} />
                )}
              </div>

              {/* Number */}
              <div className={cn("flex justify-center", resolvedSize === "compact" ? "my-3" : "my-4")}>
                <div
                  className={cn(
                    numberVariants({ size: resolvedSize }),
                    tone.text,
                    focusField === "number" && "ring-2 ring-white/60 rounded px-1"
                  )}
                  aria-label="Card number display"
                >
                  <span className={cn(isStripeSavedCard ? "tracking-[0.18em]" : "", tone.text)}>
                    {displayNumber}
                  </span>
                  {/* Subtle placeholder fallback when empty */}
                  {!cardNumber && (
                    <span className={cn("sr-only")}>Card number</span>
                  )}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-end justify-between">
                <div>
                  <div className={cn(labelVariants({ size: resolvedSize }), tone.textMuted)}>CARDHOLDER NAME</div>
                  <div
                    className={cn(valueVariants({ size: resolvedSize }), tone.text, focusField === "name" && "ring-2 ring-white/60 rounded px-1")}
                    aria-label="Cardholder name display"
                  >
                    {cardholderName || "YOUR NAME"}
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(labelVariants({ size: resolvedSize }), tone.textMuted)}>VALID THRU</div>
                  <div
                    className={cn(expiryVariants({ size: resolvedSize }), tone.text, focusField === "date" && "ring-2 ring-white/60 rounded px-1")}
                    aria-label="Card expiry date display"
                  >
                    {(expiryMonth || "MM") + "/" + (expiryYear?.slice(-2) || "YY")}
                  </div>
                </div>
              </div>
            </div>

            {showValidationErrors && validationErrors.length > 0 && (
              <ValidationIndicator isValid={isValid} />
            )}

            {showHologram && <Hologram tone={tone} size={resolvedSize} />}
          </div>

          {/* Back */}
          <div
            className={cn(faceVariants({ size: resolvedSize }), tone.surface)}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {/* Magnetic stripe */}
            <div className="w-full h-12 bg-black/90 mt-6" />

            <div className={cn(resolvedSize === "compact" ? "p-5 pt-7" : "p-6 pt-8")}>
              {/* Signature strip / CVV */}
              <div className="bg-white/90 h-10 rounded mb-4 flex items-center justify-end pr-4" aria-label="CVV security code area">
                <div className="text-black text-sm font-mono tabular-nums">
                  {cvv.length > 0 ? <span aria-hidden="true">{"•".repeat(cvv.length)}</span> : ""}
                </div>
              </div>

              <div className="space-y-2">
                <div className={cn("text-xs", tone.textMuted)}>AUTHORIZED SIGNATURE - NOT VALID UNLESS SIGNED</div>
                <div className={cn("text-xs", tone.textMuted)}>This card is property of the issuing bank</div>
                <div className={cn("text-xs", tone.textMuted)}>Card Type: {cardBrand.toUpperCase()}</div>
              </div>

              {showHologram && <Hologram tone={tone} size={resolvedSize} />}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }
)

BankCard.displayName = "BankCard"


export interface SavedBankCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  cards: (Partial<BankCardProps> & { id: string; isDefault?: boolean })[]
  selectedCardId?: string
  onCardSelect?: (cardId: string) => void
  onAddCard?: () => void
  onSetDefault?: (cardId: string) => void
  onRemoveCard?: (cardId: string) => void
  onReplaceCard?: (cardId: string) => void
  size?: BankCardSize
  /** @deprecated Use `size` instead */
  compact?: boolean
}

const SavedBankCardsGallery = React.forwardRef<HTMLDivElement, SavedBankCardsProps>(
  (
    {
      cards,
      selectedCardId,
      onCardSelect,
      onAddCard,
      onSetDefault,
      onRemoveCard,
      onReplaceCard,
      className,
      size,
      compact,
      ...props
    },
    ref
  ) => {
    const resolvedSize: BankCardSize = size ?? (compact ? "compact" : "regular")

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {onAddCard && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-content-primary">Saved Payment Methods</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCard}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add New Card
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                <AspectRatio ratio={1.586} >
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group"
              >
                <BankCard
                  cardNumber={card.cardNumber}
                  cardholderName={card.cardholderName}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  variant={card.variant}
                  issuer={card.issuer}
                  brand={card.brand}
                  isMasked
                  isSelected={selectedCardId === card.id}
                  onClick={() => onCardSelect?.(card.id)}
                  size={resolvedSize}
                />
              

                {/* Default badge - inside card */}
                {card.isDefault && (
                  <div className="absolute -top-2 -left-4 z-20">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                      <div className="relative flex items-center gap-1 px-2 py-1.5 rounded-md bg-green-500/90 shadow-sm backdrop-blur-sm">
                        <Check className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-semibold text-white leading-none">Default</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Ellipsis menu - inside card */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all duration-200 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                      >
                        <MoreVertical className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {!card.isDefault && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSetDefault?.(card.id)
                          }}
                          className="cursor-pointer"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
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
                        className="cursor-pointer text-destructive focus:text-destructive"
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
            </AspectRatio>
        </div>
      </div>
    )
  }
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
  readOnly?: boolean
  showInputValidationErrors?: boolean
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
      issuer,
      size,
      compact,
      showChip = true,
      showContactless = true,
      showHologram = true,
      showBankLogo = true,
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
      ...domProps
    },
    ref
  ) => {
    const resolvedSize: BankCardSize = size ?? (compact ? "compact" : "regular")

    const [localFlipped, setLocalFlipped] = React.useState(isFlipped)
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])
    const [isValid, setIsValid] = React.useState<boolean | undefined>(undefined)
    const [focusField, setFocusField] = React.useState<"number" | "name" | "date" | null>(null)

    const isStripeSavedCard = isMasked || isCardMasked(cardNumber)

    const handleFlip = (flipped: boolean) => {
      setLocalFlipped(flipped)
      onFlip?.(flipped)
    }

    const validateCard = React.useCallback(() => {
      if (!autoValidate || isStripeSavedCard) {
        setIsValid(undefined)
        setValidationErrors([])
        return
      }

      const errors: string[] = []
      let valid = true

      if (cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, "")
        if (!validateCardNumber(cleanNumber)) {
          errors.push("Invalid card number")
          valid = false
        }
      }

      if (expiryMonth && expiryYear) {
        if (!validateExpiry(expiryMonth, expiryYear)) {
          errors.push("Card expired or invalid expiry date")
          valid = false
        }
      }

      if (cvv) {
        const t = brand || getCardType(cardNumber)
        const expectedLength = t === "amex" ? 4 : 3
        if (cvv.length !== expectedLength) {
          errors.push(`CVV should be ${expectedLength} digits`)
          valid = false
        }
      }

      setValidationErrors(errors)
      setIsValid(cardNumber || expiryMonth || expiryYear || cvv ? valid : undefined)
    }, [autoValidate, isStripeSavedCard, cardNumber, expiryMonth, expiryYear, cvv, brand])

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
          issuer={issuer}
          size={resolvedSize}
          showChip={showChip}
          showContactless={showContactless}
          showHologram={showHologram}
          showBankLogo={showBankLogo}
          isValid={isValid}
          validationErrors={validationErrors}
          focusField={focusField}
          isMasked={isMasked}
          showValidationErrors={!isStripeSavedCard && showInputValidationErrors}
          brand={brand}
        />

        {showInputValidationErrors && validationErrors.length > 0 && !isStripeSavedCard && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3" role="alert" aria-live="polite">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-destructive/80 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {showInputs && (
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number-input" className="block text-sm font-medium mb-2 text-content-primary">
                Card Number
              </label>
              <input
                id="card-number-input"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()
                  if (value.length <= 19) onCardNumberChange?.(value)
                }}
                onFocus={() => {
                  handleFlip(false)
                  setFocusField("number")
                }}
                onBlur={() => setFocusField(null)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-lg bg-input border border-line-primary focus:bg-surface-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 text-content-primary placeholder:text-content-tertiary"
                maxLength={19}
                inputMode="numeric"
                autoComplete="cc-number"
                aria-label="Credit card number"
                aria-invalid={validationErrors.some((e) => e.includes("card number"))}
                disabled={readOnly || isStripeSavedCard}
                readOnly={readOnly || isStripeSavedCard}
              />
            </div>

            <div>
              <label htmlFor="cardholder-name-input" className="block text-sm font-medium mb-2 text-content-primary">
                Cardholder Name
              </label>
              <input
                id="cardholder-name-input"
                type="text"
                value={cardholderName}
                onChange={(e) => onCardholderNameChange?.(e.target.value.toUpperCase())}
                onFocus={() => {
                  handleFlip(false)
                  setFocusField("name")
                }}
                onBlur={() => setFocusField(null)}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 rounded-lg bg-input border border-line-primary focus:bg-surface-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 uppercase text-content-primary placeholder:text-content-tertiary"
                autoComplete="cc-name"
                aria-label="Name on card"
                disabled={readOnly}
                readOnly={readOnly}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="expiry-month-input" className="block text-sm font-medium mb-2 text-content-primary">
                  Month
                </label>
                <select
                  id="expiry-month-input"
                  value={expiryMonth}
                  onChange={(e) => onExpiryMonthChange?.(e.target.value)}
                  onFocus={() => {
                    handleFlip(false)
                    setFocusField("date")
                  }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-line-primary focus:bg-surface-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 text-content-primary"
                  autoComplete="cc-exp-month"
                  aria-label="Expiry month"
                  aria-invalid={validationErrors.some((e) => e.includes("expiry"))}
                  disabled={readOnly}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expiry-year-input" className="block text-sm font-medium mb-2 text-content-primary">
                  Year
                </label>
                <select
                  id="expiry-year-input"
                  value={expiryYear}
                  onChange={(e) => onExpiryYearChange?.(e.target.value)}
                  onFocus={() => {
                    handleFlip(false)
                    setFocusField("date")
                  }}
                  onBlur={() => setFocusField(null)}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-line-primary focus:bg-surface-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 text-content-primary"
                  autoComplete="cc-exp-year"
                  aria-label="Expiry year"
                  aria-invalid={validationErrors.some((e) => e.includes("expiry"))}
                  disabled={readOnly}
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2026 + i} value={String(2026 + i)}>
                      {2026 + i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cvv-input" className="block text-sm font-medium mb-2 text-content-primary">
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
                    const value = e.target.value.replace(/\D/g, "")
                    const t = brand || getCardType(cardNumber)
                    const maxLength = t === "amex" ? 4 : 3
                    if (value.length <= maxLength) onCvvChange?.(value)
                  }}
                  onFocus={() => {
                    handleFlip(true)
                    setFocusField(null)
                  }}
                  onBlur={() => {
                    handleFlip(false)
                    setFocusField(null)
                  }}
                  placeholder={(brand || getCardType(cardNumber)) === "amex" ? "1234" : "123"}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-line-primary focus:bg-surface-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 text-content-primary placeholder:text-content-tertiary"
                  maxLength={(brand || getCardType(cardNumber)) === "amex" ? 4 : 3}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  aria-label="Card security code"
                  aria-invalid={validationErrors.some((e) => e.includes("CVV"))}
                  disabled={readOnly}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

InteractiveBankCard.displayName = "InteractiveBankCard"

export { BankCard, InteractiveBankCard, SavedBankCardsGallery }
export type { BankCardProps, InteractiveBankCardProps, BankCardTone, BankCardSize, CardIssuer }
