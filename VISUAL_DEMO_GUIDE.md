# 🎬 Visual Demo & Integration Guide

## 🎨 How It Looks

### Debt Repayment Dialog

When a user clicks "Repay" on a debt, they see a beautiful dialog:

```
╔════════════════════════════════════════════════════╗
║ 💳 Repay Debt — Jane Doe                      [×] │  ← Orange header
╠════════════════════════════════════════════════════╣
║                                                    │
║  Remaining Amount: 50,000 FRW  (in red)          │
║                                                    │
║  ┌──────────────────────────────────────────────┐ │
║  │ FRW │ [________________________]               │ │  ← Amount input
║  │     Maximum: 50,000 FRW                      │ │
║  └──────────────────────────────────────────────┘ │
║                                                    │
║  Payment Method *                                 │
║  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
║  │    💵    │ │  [IMG]   │ │  [IMG]   │  ...   │
║  │   Cash   │ │   MTN    │ │  Airtel  │         │  ← 3-col grid
║  │ (selected)│ │          │ │          │         │
║  └──────────┘ └──────────┘ └──────────┘         │
║                                                    │
║  Payment Phone Number (MTN)  [only if MTN]       │
║  ┌──────────────────────────────────────────────┐ │
║  │ [+ 250] [_____________________]              │ │
║  │ Phone number to be used for payment request  │ │
║  └──────────────────────────────────────────────┘ │
║                                                    │
╠════════════════════════════════════════════════════╣
║  [Cancel]                    [✓ Record Payment]  │
╚════════════════════════════════════════════════════╝
```

---

## 🛒 Sales Payment Selection

When user reaches payment section in sales form:

```
┌────────────────────────────────────────────────────┐
│ Payment Method *                                   │
│                                                    │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐│
│  │   💵  │ │ [IMG] │ │ [IMG] │ │ [IMG] │ │ 🏦  ││
│  │ Cash  │ │  MTN  │ │Airtel │ │ M-Pesa│ │Bank ││
│  └───────┘ └───────┘ └───────┘ └───────┘ └─────┘│
│                                                    │  ← 5-col grid
│  (When MTN/Airtel/M-Pesa selected ↓)             │
│                                                    │
│  Payment Phone Number *                          │
│  ┌────────────────────────────────────────────┐  │
│  │ [+ 250] [____________________]             │  │
│  │ Enter phone for MTN payment                │  │
│  └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 🎯 User Interactions

### Step 1: Select Payment Method
```
User sees 5 payment option buttons:
💵 Cash | 📱 MTN | 📱 Airtel | 📱 M-Pesa | 🏦 Bank

User clicks "MTN"
↓
Button changes:
- Border becomes orange (#FF6D00)
- Background becomes light orange (#FFF3E0)
- Logo becomes full color (not grayscale)
↓
Phone input field appears below
```

### Step 2: Enter Phone (if mobile method)
```
Phone input appears with:
- Label: "Payment Phone Number (MTN)"
- Placeholder: "e.g. +250..."
- Helper text: "Phone number to be used for payment request"

User types: "+250788123456"
↓
Validation:
✓ Length >= 10 digits
✓ Contains numbers, +, -, spaces only
↓
Input turns green (valid)
```

### Step 3: Complete Transaction
```
User enters amount and clicks "Record Payment"
↓
Validation:
✓ Amount > 0
✓ Amount <= remaining balance  
✓ Phone >= 10 digits (if mobile)
↓
Form submission
↓
Backend receives:
{
  paymentMethod: "MTN",
  paymentPhoneNumber: "+250788123456",
  amountPaid: 50000
}
```

---

## 🌈 Visual States

### Payment Method Button States

#### Unselected State
```
┌───────────┐
│           │
│  💵       │
│  (gray)   │
│  Cash     │
│           │
└───────────┘
Border: 2px solid #e0e0e0 (light gray)
Background: #ffffff (white)
Logo: grayscale(100%), opacity 0.7
```

#### Hover State (Unselected)
```
┌───────────┐
│           │
│  💵       │
│  (gray)   │
│  Cash     │
│           │
└───────────┘
Border: 2px solid #FF6D00 (orange)
Background: #fff8f0 (very light orange)
Logo: grayscale(100%), opacity 0.7
```

#### Selected State
```
🔶
┌───────────┐
│           │
│  💵       │
│  (color)  │
│  Cash     │
│           │
└───────────┘
Border: 2px solid #FF6D00 (orange)
Background: #FFF3E0 (light orange)
Logo: no grayscale, opacity 1.0
Text: bold, #E65100 (dark orange)
```

---

## 📱 Mobile View

### Sales Form on Mobile (< 768px)
```
Payment Method *

┌──────┐ ┌──────┐
│  💵  │ │ MTN  │
│ Cash │ │ MTN  │
└──────┘ └──────┘

┌──────┐ ┌──────┐
│Airtel│ │M-Pesa│
│ AIR  │ │ PSA  │
└──────┘ └──────┘

┌──────┐
│ 🏦   │
│ Bank │
└──────┘

(2-column grid, stacks nicely)
```

### Tablet View (768px - 1199px)
```
Payment Method *

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Cash  │ │ MTN  │ │Airtel│ │M-Pesa│
└──────┘ └──────┘ └──────┘ └──────┘

┌──────┐
│ Bank │
└──────┘

(4-column grid)
```

### Desktop View (1200px+)
```
Payment Method *

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Cash  │ │ MTN  │ │Airtel│ │M-Pesa│ │ Bank │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

(5-column grid, all on one line)
```

---

## 💬 Error Messages

### Validation Errors

```
❌ Amount exceeds remaining debt
   "⚠️ Amount exceeds remaining debt"
   (shown below amount input in red)

❌ Missing phone for mobile method
   Input border turns red
   Helper text: "Enter a valid phone number"

❌ Invalid phone format
   Input border turns red
   Hint: "Minimum 10 digits required"

❌ Form submission blocked
   Button becomes disabled (grayed out)
   Tooltip: "Please fix errors above"
```

### Success Messages

```
✅ Payment recorded successfully!
   Toast notification at top-right
   Auto-dismisses after 4 seconds

✅ Form submitted
   Dialog closes, payment data sent to backend
   Page redirects or updates
```

---

## 🔄 Data Flow Diagram

### Debt Repayment Flow

```
┌─────────────────┐
│  Debts Page     │
│  List all debts │
└────────┬────────┘
         │
         │ Click "Repay" button
         ↓
┌─────────────────┐
│ Repayment Dialog│
│ Opens with form │
└────────┬────────┘
         │
         │ User selects payment method
         ↓
┌─────────────────────┐
│ Check: Mobile Pay?  │
│ MTN/Airtel/M-Pesa?  │
└────────┬─────┬──────┘
         │     │
    Yes  │     │  No
         ↓     ↓
   ┌──────┐  ┌─────────┐
   │Phone │  │ No phone│
   │input │  │ needed  │
   └──┬───┘  └────┬────┘
      │           │
      └───┬───────┘
          │
          │ User enters amount
          ↓
   ┌──────────────┐
   │ Validation:  │
   │ ✓ Amount OK  │
   │ ✓ Phone OK   │
   └──────┬───────┘
          │
          │ Click "Record Payment"
          ↓
   ┌──────────────────┐
   │ Send to Backend:  │
   │ paymentMethod    │
   │ amount           │
   │ phone (optional) │
   └──────┬───────────┘
          │
          ↓
   ┌─────────────┐
   │ API Success │
   └──────┬──────┘
          │
          ↓
   ┌─────────────────────┐
   │ ✓ Success Toast     │
   │ Dialog Closes       │
   │ List refreshes      │
   └─────────────────────┘
```

---

## 🛠️ Integration Checklist

### Step 1: Import Component
```jsx
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";
import { DEBT_PAYMENT_METHODS } from "@/constants/paymentMethods";
```

### Step 2: Add State
```jsx
const [paymentMethod, setPaymentMethod] = useState("CASH");
const [phone, setPhone] = useState("");
```

### Step 3: Render Component
```jsx
<PaymentMethodSelector
  paymentMethod={paymentMethod}
  onPaymentMethodChange={setPaymentMethod}
  phone={phone}
  onPhoneChange={setPhone}
  type="debt"  // or "sales"
/>
```

### Step 4: Use in Mutation
```jsx
const payload = {
  paymentMethod: paymentMethod,
  paymentPhoneNumber: phone || undefined,
  // ... other fields
};
mutation.mutate(payload);
```

---

## 🎓 Code Examples

### Example 1: Debt Repayment Component

```jsx
"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";

const MyRepaymentDialog = ({ open, onClose, onSubmit }) => {
  const [method, setMethod] = useState("CASH");
  const [phone, setPhone] = useState("");

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Make Payment</DialogTitle>
      <DialogContent>
        <PaymentMethodSelector
          paymentMethod={method}
          onPaymentMethodChange={setMethod}
          phone={phone}
          onPhoneChange={setPhone}
          type="debt"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit({ method, phone })}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MyRepaymentDialog;
```

### Example 2: Sales Form

```jsx
"use client";
import { useState } from "react";
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";

const SalesForm = () => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentPhone, setPaymentPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      paymentMethod,
      paymentPhoneNumber: paymentPhone || undefined,
      // ... other form data
    };
    // Send to backend
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        phone={paymentPhone}
        onPhoneChange={setPaymentPhone}
        type="sales"
      />
      <button type="submit">Submit Sale</button>
    </form>
  );
};

export default SalesForm;
```

---

## 🚀 Features in Action

### Feature 1: Smart Phone Input
```
User selects: Cash      → No phone input needed ✓
User selects: MTN       → Phone input appears ✓
User changes to: Airtel → Phone label updates ✓
User changes to: Cash   → Phone input disappears ✓
```

### Feature 2: Visual Feedback
```
Hovering over button      → Border turns orange, background lightens
Clicking button           → Instant selection with full color
Selected button visible   → Orange border + light orange background
Unselected grayscale      → Logo appears faded
```

### Feature 3: Validation
```
Amount: 0        → Invalid, button disabled
Amount: -100     → Invalid, button disabled
Amount: 50000    → Valid (if balance >= 50000)
Phone: "250"     → Invalid (< 10 digits)
Phone: "+250788" → Valid (>= 10 digits)
```

---

## 🎯 Quick Troubleshooting

**Q: Phone input not appearing?**
A: Verify payment method is exactly "MTN", "AIRTEL", or "MPESA" (case-sensitive for debt, lowercase for sales)

**Q: Images not loading?**
A: Check browser console for CORS errors, verify image URLs are accessible

**Q: Form won't submit?**
A: Check validation - phone must have 10+ digits for mobile methods, amount must be valid

**Q: Wrong payment values in backend?**
A: Verify you're sending uppercase for debt, lowercase for sales

---

## 📊 Component Props Reference

```javascript
<PaymentMethodSelector
  // Required
  paymentMethod={string}        // Currently selected method ID
  onPaymentMethodChange={func}  // Called when method changes
  phone={string}                // Phone number value
  onPhoneChange={func}          // Called when phone changes
  type={"debt"|"sales"}         // Which method set to use
  
  // Optional
  compact={boolean}             // Smaller button size (default: false)
/>
```

---

**Now you're ready to integrate and deploy!** 🚀

For more details, check the documentation in `/docs/` folder.
