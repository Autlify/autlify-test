# Card Preview with Masked Data & Flip Animation

## Overview

This document describes the visual card preview feature that displays masked payment card data in real-time as users interact with the Stripe PaymentElement form.

## Features Implemented

### 1. **Visual Card Preview**
- Live card preview displayed above the Stripe payment form
- Updates dynamically as card data is validated
- Shows card brand (Visa, Mastercard, etc.)
- Displays last 4 digits of card number
- Uses bullet characters (•) for masked digits

### 2. **Masked Data Display**
- Card numbers shown as: `•••• •••• •••• 1234`
- Maintains PCI compliance by never displaying full card numbers
- Real-time updates after Stripe validates the payment method

### 3. **Flip Animation**
- Card can flip to show the back side
- Smooth 3D rotation animation
- Prepared for CVV field focus integration (future enhancement)

### 4. **Validation Indicator**
- Shows green checkmark when card is validated
- "Validated" badge appears next to preview title
- Provides visual feedback for successful card entry

## Technical Implementation

### Components Modified

#### 1. **checkout-form.tsx**
```typescript
// Added state for card preview
const [cardPreview, setCardPreview] = useState({
  brand: 'visa' as string,
  last4: '',
  complete: false,
  isFlipped: false,
})
```

**Visual Preview Component:**
```tsx
<InteractiveBankCard
  cardNumber={cardPreview.last4 ? `•••• •••• •••• ${cardPreview.last4}` : '•••• •••• •••• ••••'}
  brand={cardPreview.brand}
  isMasked={true}
  isFlipped={cardPreview.isFlipped}
  variant="default"
  showInputs={false}
  showValidationErrors={false}
/>
```

#### 2. **stripe-payment-element.tsx**
**Added onChange callback:**
- Listens to Stripe PaymentElement events
- Extracts card metadata (brand, last4)
- Triggers parent component update

**Key Changes:**
```typescript
onCardChange?: (data: { brand: string; last4: string; complete: boolean }) => void

// After payment method creation:
if (paymentMethod.card) {
  onCardChange?.({
    brand: paymentMethod.card.brand || 'visa',
    last4: paymentMethod.card.last4 || '',
    complete: true,
  })
}
```

#### 3. **bank-card.tsx**
**Improved Masked Display:**
- Changed masking character from `*` to `•` for better visual appearance
- Better spacing for masked characters
- Dimmed placeholder digits for empty card number

## User Experience Flow

1. **User opens "Add New Card" modal**
   - Default card preview shows: `•••• •••• •••• ••••`
   - Card appears in default Visa style

2. **User enters card details in Stripe form**
   - User types card number, expiry, CVV
   - Stripe validates input in real-time

3. **User clicks "Validate Card"**
   - Stripe creates payment method
   - Card preview updates with real data
   - Shows: `•••• •••• •••• 4242` (last 4 digits visible)
   - Card brand updates (Visa → Mastercard if applicable)
   - Green "✓ Validated" badge appears

4. **Visual Feedback**
   - Card number displayed with bullet masking
   - Brand logo updates dynamically
   - Smooth transitions between states

## PCI Compliance

✅ **Fully Compliant:**
- Card data never touches your application code
- Only tokenized data (brand, last4) is received from Stripe
- Full card numbers are NEVER stored or displayed
- Maintains SAQ-A compliance level

## Security Features

1. **Masked Display**: Always shows bullets (•) for hidden digits
2. **Limited Data**: Only brand and last 4 digits are ever shown
3. **Stripe Tokens**: Full card data stays in Stripe's secure iframe
4. **No Storage**: No raw card data is stored in your database

## Visual Design

- **Card Aspect Ratio**: 1.586:1 (credit card standard)
- **Masking Character**: Bullet (•) instead of asterisk (*)
- **Spacing**: Optimized for readability
- **Brand Detection**: Automatic Visa/Mastercard/Amex recognition
- **3D Flip**: Smooth perspective animation
- **Validation Badge**: Green checkmark with "Validated" text

## Future Enhancements

### Potential Improvements:
1. **CVV Focus Flip**: Auto-flip card when CVV field is focused
2. **Cardholder Name**: Display user's name on card preview
3. **Expiry Date**: Show expiry month/year from Stripe metadata
4. **Real-time Typing**: Update preview as user types (if Stripe exposes event)
5. **Card Type Animation**: Smooth transition when brand changes

## Code Examples

### Using the Card Preview

```tsx
// In checkout form modal
<InteractiveBankCard
  cardNumber={cardPreview.last4 ? `•••• •••• •••• ${cardPreview.last4}` : '•••• •••• •••• ••••'}
  brand={cardPreview.brand}
  isMasked={true}
  isFlipped={false}
  variant="default"
  showInputs={false}
  showValidationErrors={false}
/>
```

### Handling Stripe Events

```tsx
<StripePaymentElement
  billingData={billingData}
  onPaymentMethodCollected={(pmId) => {
    // Handle payment method
  }}
  onCardChange={(data) => {
    setCardPreview({
      brand: data.brand,
      last4: data.last4,
      complete: data.complete,
      isFlipped: false,
    })
  }}
/>
```

## Testing Checklist

- [ ] Card preview shows bullets before validation
- [ ] Last 4 digits appear after "Validate Card"
- [ ] Brand logo updates correctly (Visa/Mastercard)
- [ ] Validation badge appears on success
- [ ] Modal closes after card is added
- [ ] No compilation errors
- [ ] Responsive on mobile devices
- [ ] Dark mode compatibility

## Related Documentation

- [BANK_CARD_USAGE_GUIDE.md](../src/components/ui/BANK_CARD_USAGE_GUIDE.md) - PCI compliance guide
- [CHECKOUT_FLOW.md](./CHECKOUT_FLOW.md) - Full checkout process
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/react)

## Conclusion

The card preview feature provides excellent visual feedback to users while maintaining strict PCI compliance. By showing masked data with the last 4 digits and card brand, users can verify their card selection without compromising security.
