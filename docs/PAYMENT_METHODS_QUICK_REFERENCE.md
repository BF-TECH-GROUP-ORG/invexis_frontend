# Payment Methods - Quick Reference Guide

## 🎯 Quick Start

### For Debt Repayment Forms
```jsx
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";
import { DEBT_PAYMENT_METHODS } from "@/constants/paymentMethods";

// In your component
const [paymentMethod, setPaymentMethod] = useState("CASH");
const [phone, setPhone] = useState("");

<PaymentMethodSelector
  paymentMethod={paymentMethod}
  onPaymentMethodChange={setPaymentMethod}
  phone={phone}
  onPhoneChange={setPhone}
  type="debt"
/>
```

### For Sales Payment Forms
```jsx
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";
import { SALES_PAYMENT_METHODS } from "@/constants/paymentMethods";

// In your component
const [paymentMethod, setPaymentMethod] = useState("cash");
const [paymentPhone, setPaymentPhone] = useState("");

<PaymentMethodSelector
  paymentMethod={paymentMethod}
  onPaymentMethodChange={setPaymentMethod}
  phone={paymentPhone}
  onPhoneChange={setPaymentPhone}
  type="sales"
/>
```

## 💳 Payment Methods List

### Debt (Uppercase)
| ID | Label | Logo | Requires Phone |
|----|-------|------|---|
| CASH | Cash | 💵 | No |
| MTN | MTN | ![MTN](https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg) | Yes |
| AIRTEL | Airtel | ![Airtel](https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png) | Yes |
| MPESA | M-Pesa | ![M-Pesa](https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png) | Yes |
| BANK_TRANSFER | Bank Transfer | 🏦 | No |

### Sales (Lowercase)
| ID | Label | Logo | Requires Phone |
|----|-------|------|---|
| cash | Cash | 💵 | No |
| mtn | MTN | ![MTN](https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg) | Yes |
| airtel | Airtel | ![Airtel](https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png) | Yes |
| mpesa | M-Pesa | ![M-Pesa](https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png) | Yes |
| bank_transfer | Bank Transfer | 🏦 | No |

## 🔄 Payload Examples

### Debt Repayment with MTN
```javascript
{
  paymentMethod: "MTN",
  paymentPhoneNumber: "+250788123456",
  amountPaid: 50000,
  // ... other fields
}
```

### Sales with M-Pesa
```javascript
{
  paymentMethod: "mpesa",
  paymentPhoneNumber: "+254701234567",
  totalAmount: 25000,
  // ... other fields
}
```

## 🎨 Styling Notes

- **Primary Color**: #FF6D00 (Orange)
- **Selected Background**: #FFF3E0
- **Selected Border**: #FF6D00 (2px solid)
- **Unselected Border**: #e0e0e0
- **Hover Effect**: Border color changes to #FF6D00

## ✅ Validation Rules

```javascript
// Phone validation
phone.length >= 10 && /^[0-9+\-\s]*$/.test(phone)

// Amount validation (debt)
amount > 0 && amount <= remainingBalance

// Required fields
- Payment method: always required
- Phone: required only for MTN, AIRTEL, MPESA
```

## 🚀 Usage in Different Contexts

### Dialog Component (Debt)
```jsx
<Dialog open={open} onClose={onClose} maxWidth="sm">
  <DialogTitle>Repay Debt</DialogTitle>
  <DialogContent>
    <PaymentMethodSelector
      type="debt"
      paymentMethod={paymentMethod}
      onPaymentMethodChange={setPaymentMethod}
      phone={phone}
      onPhoneChange={setPhone}
    />
  </DialogContent>
</Dialog>
```

### Form Section (Sales)
```jsx
<div className="payment-section">
  <PaymentMethodSelector
    type="sales"
    compact={false}
    paymentMethod={paymentMethod}
    onPaymentMethodChange={setPaymentMethod}
    phone={paymentPhone}
    onPhoneChange={setPaymentPhone}
  />
</div>
```

## 🔗 File Locations

| File | Purpose |
|------|---------|
| `/src/constants/paymentMethods.js` | Payment method definitions |
| `/src/components/forms/PaymentMethodSelector.jsx` | Reusable selector component |
| `/src/app/[locale]/inventory/debts/table.jsx` | Debt repayment integration |
| `/src/components/forms/sellProductsInputs.jsx` | Sales form integration |
| `/docs/PAYMENT_METHODS_IMPLEMENTATION.md` | Full documentation |

## 📱 Mobile Payment Methods

**Require Phone Numbers:**
- MTN (East Africa)
- Airtel (East Africa)
- M-Pesa (East Africa)

**Phone Format Examples:**
- `+250788123456` (Rwanda)
- `+256701234567` (Uganda)
- `+254701234567` (Kenya)

## 🐛 Common Issues & Solutions

### Issue: Phone input not showing
**Solution**: Verify payment method is exactly: `MTN`, `AIRTEL`, or `MPESA` (case-sensitive for debt)

### Issue: Images not loading
**Solution**: Check browser console for CORS errors, verify image URLs in constants

### Issue: Validation failing
**Solution**: Ensure phone has minimum 10 digits, amount is valid

## 🔐 Security Notes

- Phone numbers are sent in plain text in payload
- Validate phone numbers on backend before processing
- Consider encrypting sensitive payment information
- Log payment transactions securely

## 📈 Future Enhancements

- [ ] Payment confirmation webhook integration
- [ ] Real-time payment status updates
- [ ] Multiple phone number support
- [ ] Payment receipt emailing
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support

## 💬 Support

For issues or questions:
1. Check `/docs/PAYMENT_METHODS_IMPLEMENTATION.md`
2. Review component props in `/src/components/forms/PaymentMethodSelector.jsx`
3. Check integration examples in:
   - `/src/app/[locale]/inventory/debts/table.jsx`
   - `/src/components/forms/sellProductsInputs.jsx`
