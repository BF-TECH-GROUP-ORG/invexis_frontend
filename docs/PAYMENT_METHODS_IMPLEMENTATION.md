# Payment Methods Implementation Guide

## Overview

This document describes the implementation of a comprehensive payment methods system for both Debt Repayment and Sales transactions in the Invexis system. The system includes beautiful UI components with payment provider logos and conditional phone number input for mobile money methods.

## Payment Methods Supported

### Debt Repayment Methods
- **CASH** - Direct cash payment (💵 emoji icon)
- **MTN** - MTN Mobile Money (with MTN logo)
- **AIRTEL** - Airtel Money (with Airtel logo)
- **MPESA** - M-Pesa payment (with M-Pesa logo)
- **BANK_TRANSFER** - Bank transfer (🏦 emoji icon)

**Backend Values:** `CASH`, `MTN`, `AIRTEL`, `MPESA`, `BANK_TRANSFER`

### Sales Payment Methods
- **cash** - Direct cash payment (💵 emoji icon)
- **mtn** - MTN Mobile Money (with MTN logo)
- **airtel** - Airtel Money (with Airtel logo)
- **mpesa** - M-Pesa payment (with M-Pesa logo)
- **bank_transfer** - Bank transfer (🏦 emoji icon)

**Backend Values:** `cash`, `mtn`, `airtel`, `mpesa`, `bank_transfer`

## Files Created/Modified

### 1. `/src/constants/paymentMethods.js` (NEW)
Central constants file containing all payment method configurations for both debt and sales.

**Key Features:**
- Two separate objects: `DEBT_PAYMENT_METHODS` and `SALES_PAYMENT_METHODS`
- Each method includes:
  - `id`: Method identifier
  - `label`: Display name
  - `icon`: Emoji icon (for cash/bank transfer)
  - `image`: URL to logo image (for MTN/Airtel/M-Pesa)
  - `description`: User-friendly description
  - `requiresPhone`: Boolean flag for phone requirement
  - `backendValue`: Value sent to backend

**Helper Functions:**
```javascript
getPaymentMethodsList(type = "debt")     // Get all methods for a type
requiresPhone(methodId, type = "debt")   // Check if phone required
getPaymentMethodLabel(methodId, type)    // Get display label
```

### 2. `/src/components/forms/PaymentMethodSelector.jsx` (NEW)
Reusable React component for payment method selection with beautiful UI.

**Props:**
```javascript
{
  paymentMethod: string,           // Currently selected method
  onPaymentMethodChange: function, // Callback when method changes
  phone: string,                   // Phone number for mobile methods
  onPhoneChange: function,         // Callback when phone changes
  type: "debt" | "sales",          // Which payment methods list to use
  compact: boolean                 // Optional: smaller button layout
}
```

**Features:**
- Grid layout with 5 payment method buttons
- Logo images with grayscale filter for unselected methods
- Conditional phone input field for mobile payment methods (MTN, Airtel, M-Pesa)
- Beautiful hover effects and transitions
- Responsive design

### 3. `/src/app/[locale]/inventory/debts/table.jsx` (MODIFIED)
Updated the repayment dialog to use the new `PaymentMethodSelector` component.

**Changes:**
- Imported `PaymentMethodSelector` and payment constants
- Replaced hardcoded payment method grid with reusable component
- Maintains existing mutation logic and API integration
- Phone number validation for mobile payment methods

**Imports Added:**
```javascript
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";
import { DEBT_PAYMENT_METHODS } from "@/constants/paymentMethods";
```

### 4. `/src/components/forms/sellProductsInputs.jsx` (MODIFIED)
Updated the sales form to use payment method constants and add phone number support.

**Changes:**
- Updated payment methods array to use constants
- Replaced select dropdown with beautiful grid button layout
- Added `paymentPhone` state for mobile payment methods
- Conditional phone input validation
- Updated payload to include payment phone number
- Enhanced PDF receipt to include payment method and phone

**New Features:**
```javascript
const [paymentPhone, setPaymentPhone] = useState("");
```

**Payment Method Display:**
- 5-column grid layout with payment method buttons
- Logo images with grayscale effect
- Conditional phone input for MTN, Airtel, M-Pesa
- Validation feedback in real-time

## User Experience Flow

### For Debt Repayment

1. User clicks "Repay" button on a debt
2. Repayment dialog opens showing:
   - Remaining balance
   - Amount input field
   - Payment method selector (5 beautiful buttons with logos)
3. When user selects MTN, Airtel, or M-Pesa:
   - Phone number input appears below
   - User enters phone number to be used for payment
4. User clicks "Record Payment"
5. System validates:
   - Amount is valid (greater than 0, not exceeding balance)
   - If mobile method: phone number has at least 10 digits
6. Payment recorded with method and phone number

### For Sales

1. User fills out sale form and reaches payment method section
2. Payment method selector displays with 5 beautiful options
3. When user selects MTN, Airtel, or M-Pesa:
   - Phone input appears dynamically
   - User enters payment phone number
4. Validation occurs before submission
5. Payload includes payment method and phone if applicable
6. PDF receipt generation includes payment details

## Payment Method Icons/Images

### Logo URLs

| Method | Source |
|--------|--------|
| MTN | https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg |
| Airtel | https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png |
| M-Pesa | https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png |
| Cash | 💵 (emoji) |
| Bank Transfer | 🏦 (emoji) |

### Image Styling
- Height: 32px (full size), 24px (compact)
- Grayscale filter applied when not selected
- Full color when selected
- Automatic width to maintain aspect ratio

## Payload Format

### Debt Repayment Payload
```javascript
{
  companyId: string,
  shopId: string,
  debtId: string,
  customer: {
    name: string,
    phone: string
  },
  amountPaid: number,
  paymentMethod: "CASH" | "MTN" | "AIRTEL" | "MPESA" | "BANK_TRANSFER",
  paymentReference: string,
  paidAt: ISO8601 datetime,
  createdBy: string (user ID),
  paymentPhoneNumber: string | undefined // Only for mobile methods
}
```

### Sales Payload
```javascript
{
  companyId: string,
  shopId: string,
  soldBy: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string | null,
  items: [{
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number,
    discount: number,
    totalPrice: number
  }],
  paymentMethod: "cash" | "mtn" | "airtel" | "mpesa" | "bank_transfer",
  paymentPhoneNumber: string | undefined, // Only for mobile methods
  paymentId: string,
  totalAmount: number,
  discountAmount: number
}
```

## Styling & Visual Design

### Color Scheme
- **Primary Color**: #FF6D00 (Orange - Invexis brand)
- **Selected State**: #FFF3E0 (Light orange background), #FF6D00 (orange border)
- **Unselected State**: #e0e0e0 (light gray border), white background
- **Hover State**: Border changes to #FF6D00, background to #fff8f0

### Button Grid Layout
- **Debt Form**: 3-column grid in dialog
- **Sales Form**: 5-column grid for full width
- **Height**: 100px (normal), 70px (compact)
- **Border Radius**: 8px
- **Padding**: 1.5rem (normal), 1rem (compact)
- **Transitions**: 200ms ease for smooth interactions

## Mobile Payment Method Phone Requirements

Methods requiring phone numbers:
- **MTN**: East African mobile money
- **Airtel**: East African mobile money
- **M-Pesa**: East African mobile money

**Phone Validation Rules:**
- Minimum 10 digits
- Can include +, -, spaces
- Example formats:
  - `+250788123456`
  - `250788123456`
  - `+256701234567`

## Localization Notes

The payment methods are currently hardcoded in English. To support multiple languages, the constants can be enhanced with translation keys:

```javascript
// Future enhancement
DEBT_PAYMENT_METHODS = {
  CASH: {
    labelKey: "paymentMethods.cash",
    descriptionKey: "paymentMethods.cash_desc",
    // ...
  }
}
```

## Integration Checklist

- [x] Payment methods constants created
- [x] PaymentMethodSelector component created
- [x] Debt repayment form updated
- [x] Sales form updated with payment methods
- [x] Phone validation implemented
- [x] PDF receipt generation updated
- [x] Backend payload format documented
- [ ] Backend API integration (if needed)
- [ ] Testing with actual payment providers
- [ ] Localization setup (future)

## Future Enhancements

1. **Backend Integration**: Verify payment phone number with mobile money providers
2. **Payment Confirmation**: Add confirmation status tracking for mobile payments
3. **Localization**: Translate payment method names and descriptions
4. **Additional Methods**: Add more payment options (crypto, digital wallets, etc.)
5. **Payment History**: Display payment method in transaction history
6. **Analytics**: Track payment method usage statistics

## Troubleshooting

### Phone Input Not Appearing
- Verify payment method is one of: MTN, AIRTEL, MPESA (case-sensitive)
- Check that PaymentMethodSelector is imported correctly
- Verify payment method state is updating correctly

### Icons Not Loading
- Check image URLs are accessible
- Verify network connectivity
- Check browser console for CORS errors
- Ensure image URLs are correct (typos in constants)

### Validation Issues
- Phone number minimum is 10 digits (configurable in validation logic)
- Amount validation: must be > 0 and <= remaining balance (debt)
- Check error state messages display correctly

## Support & Contact

For questions about this implementation, refer to:
- `/src/constants/paymentMethods.js` for configuration
- `/src/components/forms/PaymentMethodSelector.jsx` for component logic
- Individual page files for integration details
