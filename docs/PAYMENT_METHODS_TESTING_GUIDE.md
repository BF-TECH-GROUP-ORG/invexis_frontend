# Payment Methods - Testing Guide

## 🧪 Testing Overview

This guide covers comprehensive testing for the payment methods implementation across both debt repayment and sales payment flows.

## 📋 Manual Testing Checklist

### Debt Repayment Form Testing

#### 1. Payment Method Selector Display
- [ ] All 5 payment method buttons are visible (Cash, MTN, Airtel, M-Pesa, Bank)
- [ ] Payment method buttons are arranged in a 3-column grid
- [ ] Cash shows 💵 emoji
- [ ] Bank Transfer shows 🏦 emoji
- [ ] MTN logo image displays correctly
- [ ] Airtel logo image displays correctly
- [ ] M-Pesa logo image displays correctly
- [ ] Logo images are grayscale on unselected methods
- [ ] Default selection is "CASH"

#### 2. Payment Method Selection
- [ ] Click Cash → button becomes highlighted with orange border and light orange background
- [ ] Click MTN → button becomes highlighted, previous selection is unselected
- [ ] Click Airtel → button becomes highlighted
- [ ] Click M-Pesa → button becomes highlighted
- [ ] Click Bank Transfer → button becomes highlighted
- [ ] Selection persists when switching between other form fields
- [ ] Selected payment method button shows full color logo (not grayscale)

#### 3. Phone Input Conditional Rendering
- [ ] Cash selected → NO phone input field appears
- [ ] Bank Transfer selected → NO phone input field appears
- [ ] MTN selected → Phone input field appears with label "Payment Phone Number (MTN)"
- [ ] Airtel selected → Phone input field appears with label "Payment Phone Number (AIRTEL)"
- [ ] M-Pesa selected → Phone input field appears with label "Payment Phone Number (MPESA)"
- [ ] Switching from mobile to non-mobile method → Phone input disappears
- [ ] Switching from non-mobile to mobile method → Phone input appears

#### 4. Phone Input Validation
- [ ] Phone input accepts numeric characters, +, -, spaces
- [ ] Phone input placeholder shows "+250..."
- [ ] Helper text says "Phone number to be used for payment request"
- [ ] Enter 5 digits → "Invalid" state (red border)
- [ ] Enter 10 digits → "Valid" state (normal border)
- [ ] Enter 15 digits → Still "Valid" (no max length)
- [ ] Clear phone input → Returns to invalid state (red border)

#### 5. Amount Validation
- [ ] Amount input shows FRW prefix
- [ ] Enter 0 → "Invalid" state
- [ ] Enter negative number → "Invalid" state
- [ ] Enter amount > balance → Error message "⚠️ Amount exceeds remaining debt"
- [ ] Enter valid amount → "Valid" state
- [ ] Maximum shown is actual remaining balance

#### 6. Form Submission
- [ ] Cash selected, amount filled, valid → "Record Payment" button ENABLED
- [ ] MTN selected, no phone → "Record Payment" button DISABLED
- [ ] MTN selected, phone < 10 digits → "Record Payment" button DISABLED
- [ ] MTN selected, amount filled, phone valid → "Record Payment" button ENABLED
- [ ] Click "Record Payment" → Dialog closes, payment recorded
- [ ] Payment recorded with correct payment method value (UPPERCASE)
- [ ] Payment recorded with phone number if applicable

#### 7. Payload Verification (Developer Tools)
**Cash Payment Payload**:
```javascript
{
  paymentMethod: "CASH",
  paymentPhoneNumber: undefined,
  amountPaid: 50000
}
```

**MTN Payment Payload**:
```javascript
{
  paymentMethod: "MTN",
  paymentPhoneNumber: "+250788123456",
  amountPaid: 50000
}
```

### Sales Form Testing

#### 1. Payment Method Selector Display
- [ ] All 5 payment method buttons are visible in sales form
- [ ] Payment method buttons are arranged in a 5-column grid
- [ ] Button styling matches debt form styling
- [ ] Logo images display correctly
- [ ] Responsive grid on tablet (4 columns expected)
- [ ] Responsive grid on mobile (2 columns expected)
- [ ] Default selection is "cash"

#### 2. Payment Method Selection
- [ ] Click any payment method → Selection updates correctly
- [ ] Visual feedback is immediate (no lag)
- [ ] Selection persists after scrolling form
- [ ] Form values don't reset when changing payment method

#### 3. Phone Input Conditional Rendering
- [ ] cash selected → NO phone input
- [ ] bank_transfer selected → NO phone input
- [ ] mtn selected → Phone input appears
- [ ] airtel selected → Phone input appears
- [ ] mpesa selected → Phone input appears
- [ ] Phone input label updates based on selected method

#### 4. Form Submission with Payment Methods
- [ ] Fill all required fields + valid payment method → Form submits
- [ ] mtn selected, no phone → Form submission fails with error
- [ ] mtn selected, phone < 10 digits → Form submission fails with error
- [ ] mtn selected, valid phone → Form submits successfully
- [ ] Payment data sent to backend with correct method value (lowercase)
- [ ] Payment data includes phone number when applicable

#### 5. PDF Receipt Generation
- [ ] Print receipt checkbox visible
- [ ] Check print receipt + submit → PDF generates
- [ ] PDF includes payment method name
- [ ] PDF shows "Payment: Cash" for cash payment
- [ ] PDF shows "Payment: MTN" for MTN payment
- [ ] PDF includes "Payment Phone: +250..." for mobile methods
- [ ] PDF layout is readable and professional

#### 6. Responsive Design Testing
**Desktop (1200px+)**:
- [ ] 5-column grid layout
- [ ] Buttons: 100px height approximately
- [ ] Spacing is comfortable

**Tablet (768px-1199px)**:
- [ ] 4-column grid layout
- [ ] Buttons: 90px height approximately
- [ ] Still readable and clickable

**Mobile (< 768px)**:
- [ ] 2-column grid layout
- [ ] Buttons: 70px height approximately
- [ ] Touch-friendly button size (min 44x44px)
- [ ] Phone input readable on mobile
- [ ] Form scrolls smoothly

### Cross-Form Testing

#### 1. Consistency
- [ ] Same payment method buttons appear in both debt and sales
- [ ] Same styling applied to all payment method selectors
- [ ] Same colors and transitions used
- [ ] Same phone input behavior in both forms

#### 2. Data Integrity
- [ ] Debt form sends uppercase method values (CASH, MTN, etc.)
- [ ] Sales form sends lowercase method values (cash, mtn, etc.)
- [ ] Phone numbers formatted consistently
- [ ] No data loss during form submission

#### 3. Error Handling
- [ ] Network error → Shows error message
- [ ] Invalid phone format → Shows validation error
- [ ] Amount exceeds balance → Shows warning
- [ ] Form can be submitted again after error

## 🔍 Visual Testing

### Color Verification
- [ ] Primary color #FF6D00 used for selected state
- [ ] Secondary color #FFF3E0 used for selected background
- [ ] Unselected border: #e0e0e0
- [ ] Hover state shows #FFF3E0 background
- [ ] Text colors contrast properly (WCAG AA standard)

### Typography Testing
- [ ] Payment Method label is bold (weight 600)
- [ ] Button labels are bold (weight 600)
- [ ] Helper text is lighter gray
- [ ] Font sizes are readable at normal zoom

### Image Quality
- [ ] MTN logo is crisp and clear
- [ ] Airtel logo is crisp and clear
- [ ] M-Pesa logo is crisp and clear
- [ ] No pixelation on retina displays
- [ ] Proper aspect ratio maintained
- [ ] No image loading errors in console

### Animation Testing
- [ ] Border color transitions smoothly (200ms)
- [ ] Background color transitions smoothly
- [ ] Logo filter (grayscale) transitions smoothly
- [ ] No jank or stuttering during transitions
- [ ] Transitions work on low-end devices

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab key moves focus through payment methods (left to right)
- [ ] Tab key moves focus to phone input (if visible)
- [ ] Tab key moves focus to form actions (Cancel, Confirm)
- [ ] Shift+Tab moves focus backward
- [ ] Enter key selects focused payment method
- [ ] Enter key submits form from action buttons

### Screen Reader Testing (NVDA/JAWS)
- [ ] "Payment Method" label announced
- [ ] Payment method buttons announced as "button"
- [ ] Button purpose is clear ("Cash button" not just "button")
- [ ] Selected state is announced
- [ ] Phone input label is announced
- [ ] Required fields marked with asterisk
- [ ] Error messages are announced

### Focus Indicators
- [ ] Focus outline is visible (not hidden)
- [ ] Focus outline has sufficient contrast
- [ ] Focus outline doesn't overlap content
- [ ] Focus outline is blue (browser default) or consistent

## 🐛 Bug Testing

### Known Issues to Verify
- [ ] Images load correctly (not blocked by CORS)
- [ ] Phone input validates correctly with special characters
- [ ] Amount input doesn't accept negative numbers
- [ ] Multiple rapid clicks don't cause issues
- [ ] Form doesn't submit while loading

### Edge Cases
- [ ] Very long customer name (100+ chars) doesn't break layout
- [ ] Very long phone number (20+ digits) displays correctly
- [ ] Zero amount → validation error shown
- [ ] Decimal amounts in integer field → handled gracefully
- [ ] Paste phone number → validation works
- [ ] Autocomplete phone from browser → works correctly

## 📊 Performance Testing

### Load Time
- [ ] Page loads within 3 seconds
- [ ] Images load without blocking render
- [ ] No layout shift when images load (CLS)
- [ ] Payment dialog opens immediately

### Memory Usage
- [ ] No memory leaks when opening/closing dialog multiple times
- [ ] Component unmounts cleanly
- [ ] Event listeners cleaned up

### Rendering Performance
- [ ] Transitions are 60fps
- [ ] No dropped frames during transitions
- [ ] Page is responsive while form processing
- [ ] Scrolling is smooth

## 🔗 Integration Testing

### API Integration
- [ ] Payment method value sent to API matches expected format
- [ ] Phone number included in request payload
- [ ] API response parsed correctly
- [ ] Error from API displayed to user
- [ ] Success from API shown to user

### State Management
- [ ] Payment method state updates correctly
- [ ] Phone state updates independently
- [ ] Amount state independent of payment state
- [ ] Clearing one field doesn't clear others
- [ ] Form resets after successful submission

### LocalStorage/SessionStorage
- [ ] Form data not saved in storage (privacy)
- [ ] Phone number not persisted
- [ ] Payment method not cached inappropriately

## 📱 Device Testing

### iOS Testing
- [ ] Touch interactions work smoothly
- [ ] Input field focus behavior works
- [ ] Keyboard doesn't cover input
- [ ] Phone number format accepted
- [ ] Scrolling works smoothly

### Android Testing
- [ ] Touch interactions work smoothly
- [ ] Back button behavior correct
- [ ] Input field accessible
- [ ] Keyboard behavior standard
- [ ] Scrolling performance good

### Desktop Testing
- [ ] Mouse hover effects work
- [ ] Click behavior accurate
- [ ] Keyboard navigation complete
- [ ] Responsive at various zoom levels

## ✅ Test Pass/Fail Criteria

### PASS Criteria
- ✅ All 5 payment methods display correctly
- ✅ Phone input appears/disappears conditionally
- ✅ Form submission validates correctly
- ✅ Data sent to backend is correct format
- ✅ UI is responsive on all screen sizes
- ✅ No console errors or warnings
- ✅ Accessibility features working
- ✅ Performance is acceptable

### FAIL Criteria
- ❌ Any payment method button doesn't work
- ❌ Phone validation allows invalid numbers
- ❌ Wrong payment method value sent to backend
- ❌ Images fail to load
- ❌ Form breaks on mobile
- ❌ Console errors present
- ❌ Keyboard navigation broken
- ❌ Accessibility failures

## 📝 Test Report Template

```
Test Date: YYYY-MM-DD
Tester: [Name]
Environment: [Browser/Device]

Summary:
- Total Tests: __
- Passed: __
- Failed: __
- Blocked: __

Issues Found:
1. [Issue Title]
   - Description: 
   - Steps to Reproduce:
   - Expected Result:
   - Actual Result:
   - Severity: [Critical/High/Medium/Low]

Recommendations:
- 

Sign-off:
- Approved: [ ] Yes [ ] No
- Date: YYYY-MM-DD
```

## 🚀 Continuous Testing

### Automated Tests (Future)
```javascript
// Example Jest test
test('should show phone input for MTN payment', () => {
  const { getByText } = render(<PaymentMethodSelector type="debt" />);
  fireEvent.click(getByText('MTN'));
  expect(getByLabelText(/Payment Phone Number/)).toBeInTheDocument();
});
```

### Regular Testing Schedule
- [ ] Manual test after each code change
- [ ] Full regression test before release
- [ ] Cross-browser test weekly
- [ ] Mobile device test weekly
- [ ] Accessibility audit monthly

---

**Last Updated**: January 9, 2025
**Version**: 1.0
**Status**: Ready for Testing
