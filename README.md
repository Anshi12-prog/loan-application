# LendSwift — Multi-Step Loan Application

A production-grade multi-step loan application form built for the ZeTheta Algorithms Frontend Developer internship assessment.

![LendSwift](https://img.shields.io/badge/LendSwift-Loan%20Application-1F4E79?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## Live Demo

[https://lendswift-app.vercel.app](https://loan-application-qvc4.vercel.app/)

---

## Overview

LendSwift is a fictional Indian fintech loan application platform. The project implements a complete 8-step form wizard with real-world validation, accessibility compliance, encrypted auto-save, and dynamic step logic.

---

## Features

### Form Engineering
- 8-step wizard with dynamic navigation
- Step 6 (Co-Applicant) conditionally shown based on loan type and amount:
  - Personal Loan > ₹5,00,000 (strictly greater than)
  - Business Loan > ₹20,00,000 (strictly greater than)
  - Home Loan: always shown regardless of amount
- Cross-step validation (age + tenure must not exceed 65 years)
- Live EMI preview using reducing balance formula
- Indian number formatting (1,00,000 not 1,000,000)

### Validation
- Verhoeff checksum algorithm for Aadhaar validation
- PAN entity type validation with specific error messages
- GST number validation with checksum
- Age boundary checks (exactly 21 years = valid, 20y 364d = invalid)
- Employment type cross-check for business loans

### Accessibility (WCAG 2.1 AA)
- Focus moves to step heading on every step change
- All inputs have htmlFor/id linkage
- Error messages use role="alert" aria-live="polite"
- Progress bar uses role="progressbar" with aria-valuemin/max/now
- Step list uses ol with aria-current="step"
- All touch targets minimum 44×44px
- Animations use prefers-reduced-motion

### Auto-Save
- Saves to localStorage every 30 seconds
- Key format: lendswift_draft_{loanType}
- 72-hour expiry with resume modal on page reload
- Never prompts user for passphrase

### Documents & Signature
- Drag-and-drop file upload zones
- Image compression via Canvas API (max 1200px, quality 0.7)
- Pure canvas e-signature pad (no library dependency)
- Dynamic required documents based on loan type and employment

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Form State | React Hook Form v7 |
| Validation | Zod v4 |
| Global State | Zustand v5 |
| Styling | Tailwind CSS v3 |
| File Upload | react-dropzone |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Cypress 13 |
| Deployment | Vercel |

---

## Project Structure
src/

├── components/

│   ├── common/          # Reusable UI components

│   │   ├── Input.jsx

│   │   ├── Select.jsx

│   │   ├── RadioGroup.jsx

│   │   ├── Checkbox.jsx

│   │   ├── CurrencyInput.jsx

│   │   ├── MaskedInput.jsx

│   │   ├── DatePicker.jsx

│   │   ├── ErrorMessage.jsx

│   │   └── Toast.jsx

│   ├── wizard/          # Wizard shell components

│   │   ├── Wizard.jsx

│   │   ├── ProgressBar.jsx

│   │   └── StepNavigation.jsx

│   └── steps/           # 8 step components

│       ├── Step1LoanType.jsx

│       ├── Step2PersonalInfo.jsx

│       ├── Step3KYC.jsx

│       ├── Step4Address.jsx

│       ├── Step5Employment.jsx

│       ├── Step6CoApplicant.jsx

│       ├── Step7Documents.jsx

│       └── Step8Review.jsx

├── hooks/

│   ├── useAutoSave.js

│   ├── usePinCodeLookup.js

│   └── useVerification.js

├── schemas/             # Zod validation schemas

│   ├── step1Schema.js

│   ├── step2Schema.js

│   ├── step3Schema.js

│   ├── step4Schema.js

│   ├── step5Schema.js

│   ├── step6Schema.js

│   ├── step7Schema.js

│   ├── step8Schema.js

│   └── schemaFactory.js

├── store/

│   └── loanStore.js     # Zustand global store

├── utils/

│   ├── validators.js    # Verhoeff, PAN, Aadhaar, GST

│   ├── emiCalculator.js # Reducing balance EMI formula

│   ├── formatters.js    # Indian number formatting

│   ├── encryption.js    # AES-256-GCM via Web Crypto

│   └── pinCodeData.js   # 60+ Indian PIN codes

└── tests/

├── setup.js

├── validators.test.js

├── emiCalculator.test.js

└── loanStore.test.js
cypress/

├── e2e/                 # End-to-end test suites

├── fixtures/            # Test data (JSON)

└── support/             # Custom commands

---

## Setup

```bash
# Clone the repository
git clone https://github.com/Anshi12-prog/loan-application.git
cd loan-application

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run Vitest unit tests
npm run test:e2e     # Open Cypress E2E tests
npm run lint         # ESLint
```

---

## Key Technical Decisions

### Verhoeff Algorithm
The Aadhaar checksum uses the full Verhoeff algorithm with correct inverse table `[0,4,3,2,1,9,8,7,6,5]`. This validates real Aadhaar numbers mathematically.

### Step 6 Threshold Logic
The co-applicant step uses strictly greater than comparisons:
```js
// Personal: 500000 = NO step 6, 500001 = YES step 6
if (loanType === 'personal' && loanAmount > 500000) include step 6
if (loanType === 'business' && loanAmount > 2000000) include step 6
if (loanType === 'home') always include step 6
```

### EMI Formula
Reducing balance method:


EMI = P × r × (1+r)^n / ((1+r)^n - 1)

where r = annual rate / 12 / 100


Rates: Personal 10.5%, Home 8.5%, Business 14%

### Auto-Save
Saves encrypted form state to localStorage every 30 seconds. Key: `lendswift_draft_{loanType}`. Drafts expire after 72 hours. Resume modal shown on page reload if valid draft exists.

---

## Loan Types

| Loan Type | Max Amount | Tenure | Interest Rate |
|---|---|---|---|
| Personal | ₹10,00,000 | 12–60 months | 10.5% p.a. |
| Home | ₹1,00,00,000 | 60–360 months | 8.5% p.a. |
| Business | ₹50,00,000 | 12–120 months | 14% p.a. |

---

## Test Coverage

### Unit Tests (Vitest)
- Verhoeff checksum validation
- Aadhaar number validation (boundary cases)
- PAN entity type validation
- EMI calculation accuracy
- Step 6 threshold boundary tests (500000 vs 500001)
- Store actions and computed values

### E2E Tests (Cypress)
- Personal loan happy path
- Home loan happy path (with co-applicant)
- Business loan happy path (with GST)
- Validation error scenarios
- Auto-save and resume flow
- Cross-step dependency tests

---

## Accessibility

- WCAG 2.1 AA compliant
- Screen reader tested
- Keyboard navigable
- Focus management on step transitions
- ARIA live regions for dynamic content
- Reduced motion support

---

## Deployment

Deployed on Vercel with SPA routing configured via `vercel.json`.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Assessment Requirements

This project was built for the ZeTheta Algorithms Frontend Developer internship assessment with the following evaluation criteria:

- Form Engineering — multi-step wizard with complex validation
- Accessibility — WCAG 2.1 AA compliance
- Testing — unit tests and E2E coverage
- Code Quality — component architecture, separation of concerns
- Indian Fintech Context — RBI guidelines, Indian number formats, KYC flow

---

## Author

Built by Anshika for the ZeTheta Algorithms Frontend Developer Assessment.

---

## License

MIT
