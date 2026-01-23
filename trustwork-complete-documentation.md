# 🚀 TrustWork Marketplace - Complete Project Documentation

## 📌 Project Overview

**TrustWork** is a decentralized freelance marketplace built on Stacks blockchain where:
- Clients post jobs with escrow protection
- Freelancers bid on jobs
- Smart contracts handle payments automatically
- Disputes resolved by platform
- USDCx stablecoin for payments

---

## 🎯 Core Features

### For Clients:
✅ Post jobs with budget locked in escrow
✅ Review bids from freelancers
✅ Select best freelancer
✅ Approve completed work
✅ Raise disputes if needed
✅ Auto-refund if no suitable bids

### For Freelancers:
✅ Browse available jobs
✅ Submit bids with proposals
✅ Work on accepted jobs
✅ Submit completed work
✅ Auto-payment after 7 days if client doesn't respond
✅ Raise disputes if payment withheld

### Platform Features:
✅ 2% platform fee on completed jobs
✅ Dispute resolution system
✅ Reputation tracking
✅ Category-based job discovery
✅ Time-based auto-release mechanism

---

## 📊 Complete User Flow

### Flow 1: Successful Job Completion

```
CLIENT                          PLATFORM                      FREELANCER
  |                                |                              |
  | 1. Post Job                    |                              |
  |---> Lock 100 USDCx in escrow   |                              |
  |                                |                              |
  |                                |    2. Browse Jobs            |
  |                                | <----------------------------|
  |                                |                              |
  |                                |    3. Submit Bid             |
  | <------------------------------------------------------------ |
  |                                |       (80 USDCx + proposal)  |
  |                                |                              |
  | 4. Review Bids                 |                              |
  |---> Accept Freelancer's Bid    |                              |
  |                                |                              |
  |                                | Status: IN_PROGRESS -------> |
  |                                |                              |
  |                                |    5. Complete Work          |
  | <------------------------------------------------------------ |
  |                                |    Submit Work Description   |
  |                                |                              |
  | 6. Review Work                 |                              |
  |---> Approve Work               |                              |
  |                                |                              |
  |     Release Payment            | 7. Process Payment           |
  |                                |---> 78.4 USDCx to Freelancer |
  |                                |---> 1.6 USDCx Platform Fee   |
  |                                |                              |
  |                                |    ✅ Job Complete           |
  |                                |                              |
```

### Flow 2: Auto-Release (Client Doesn't Respond)

```
CLIENT                          PLATFORM                      FREELANCER
  |                                |                              |
  | Job Posted, Bid Accepted       |                              |
  |                                |    Work Submitted            |
  | <------------------------------------------------------------ |
  |                                |                              |
  | ⏱️ 7 Days Pass...              |                              |
  | (No Response)                  |                              |
  |                                |                              |
  |                                |    Auto-Release Triggered    |
  |                                | <----------------------------|
  |                                |    (Anyone can call)         |
  |                                |                              |
  |     Payment Auto-Released      | Process Payment              |
  |                                |---> 78.4 USDCx to Freelancer |
  |                                |---> 1.6 USDCx Platform Fee   |
  |                                |                              |
  |                                |    ✅ Job Auto-Completed     |
```

### Flow 3: Job Cancellation (No Suitable Bids)

```
CLIENT                          PLATFORM                      FREELANCER
  |                                |                              |
  | 1. Post Job                    |                              |
  |---> Lock 100 USDCx             |                              |
  |                                |                              |
  |                                |    2. Submit Bid             |
  | <------------------------------------------------------------ |
  |                                |    (150 USDCx - too high)    |
  |                                |                              |
  | 3. No Suitable Bids            |                              |
  |---> Cancel Job                 |                              |
  |                                |                              |
  |     Full Refund                | Process Refund               |
  | <------------------------------ |                              |
  |     (100 USDCx back)           |                              |
  |                                |                              |
  |                                |    ❌ Job Cancelled          |
```

### Flow 4: Dispute Resolution

```
CLIENT                          PLATFORM                      FREELANCER
  |                                |                              |
  | Job in Progress                |    Work Submitted            |
  | <------------------------------------------------------------ |
  |                                |                              |
  | 🚨 Raise Dispute               |                              |
  |---> "Work incomplete"          |                              |
  |                                |                              |
  |                                | Status: DISPUTED             |
  |                                |                              |
  |                                | 🔍 Platform Reviews          |
  |                                |    - Check work description  |
  |                                |    - Review both arguments   |
  |                                |    - Make decision           |
  |                                |                              |
  |     Dispute Decision           | Resolve Dispute              |
  |                                |---> 50% to Freelancer        |
  |                                |---> 48% Refund to Client     |
  |                                |---> 2% Platform Fee          |
  |                                |                              |
  |                                |    ⚖️ Dispute Resolved       |
```

---

## 🔐 Smart Contract Functions Flow

### Job Lifecycle States

```
JOB_OPEN (1)
    ↓
    | Client accepts bid
    ↓
JOB_IN_PROGRESS (2)
    ↓
    | Freelancer submits work
    ↓
JOB_WORK_SUBMITTED (3)
    ↓               ↓
    |               | Either party raises dispute
    |               ↓
    |           JOB_DISPUTED (5)
    |               ↓
    |               | Platform resolves
    |               ↓
    | Client approves OR Auto-release after 7 days
    ↓
JOB_COMPLETED (4)
```

### Function Call Sequence

**1. Client Posts Job:**
```javascript
await contractCall({
  function: 'post-job',
  args: [
    stringUtf8('Logo Design'),
    stringUtf8('Need modern logo for startup'),
    uintCV(100000000), // 100 USDCx (6 decimals)
    uintCV(burnHeight + 1000), // Deadline
    stringUtf8('Design')
  ]
})
// Returns: job-id
```

**2. Freelancer Submits Bid:**
```javascript
await contractCall({
  function: 'submit-bid',
  args: [
    uintCV(jobId),
    uintCV(80000000), // 80 USDCx
    stringUtf8('I have 5 years experience in logo design...')
  ]
})
```

**3. Client Accepts Bid:**
```javascript
await contractCall({
  function: 'accept-bid',
  args: [
    uintCV(jobId),
    principalCV(freelancerAddress)
  ]
})
```

**4. Freelancer Submits Work:**
```javascript
await contractCall({
  function: 'submit-work',
  args: [
    uintCV(jobId),
    stringUtf8('Logo files uploaded to IPFS: ipfs://...')
  ]
})
```

**5. Client Approves Work:**
```javascript
await contractCall({
  function: 'approve-work',
  args: [
    uintCV(jobId),
    stringUtf8('Great work! Exactly what I needed.')
  ]
})
```

**6. Auto-Release (if client doesn't respond):**
```javascript
// After 1000 blocks (~7 days)
await contractCall({
  function: 'auto-release-payment',
  args: [uintCV(jobId)]
})
```

**7. Raise Dispute:**
```javascript
await contractCall({
  function: 'raise-dispute',
  args: [
    uintCV(jobId),
    stringUtf8('Work does not meet requirements...')
  ]
})
```

**8. Resolve Dispute (Platform Admin):**
```javascript
await contractCall({
  function: 'resolve-dispute',
  args: [
    uintCV(jobId),
    boolCV(false), // false = pay freelancer, true = refund client
    stringUtf8('After review, work meets minimum requirements.')
  ]
})
```

---

## 🗄️ Data Structures

### Job Object
```typescript
interface Job {
  creator: string;              // Client's principal
  title: string;                // Max 200 chars
  description: string;          // Max 1000 chars
  budget: number;               // In micro-USDCx (6 decimals)
  deadline: number;             // Burn block height
  status: number;               // 1-6 (see status codes)
  selectedFreelancer: string | null;
  workSubmittedBy: string | null;
  workSubmittedAt: number | null;
  workDescription: string | null;
  creatorFeedback: string | null;
  createdAt: number;            // Burn block height
  category: string;             // e.g., "Design", "Development"
}
```

### Bid Object
```typescript
interface Bid {
  bidAmount: number;            // In micro-USDCx
  proposal: string;             // Max 500 chars
  bidStatus: number;            // 1-4 (pending/accepted/rejected/withdrawn)
  submittedAt: number;          // Burn block height
}
```

### Dispute Object
```typescript
interface Dispute {
  raisedBy: string;             // Who raised the dispute
  reason: string;               // Max 500 chars
  raisedAt: number;
  resolved: boolean;
  resolution: string | null;    // Admin's decision
}
```

---

## 💻 Frontend Pages Required

### 1. Landing Page
- Hero section
- How it works (3 steps)
- Featured jobs
- Statistics (total jobs, total paid out)
- Call to action

### 2. Browse Jobs (Freelancers)
- Filter by category
- Search by keywords
- Sort by budget/date
- Job cards showing:
  - Title, description (truncated)
  - Budget
  - Deadline
  - Number of bids
  - "View Details" button

### 3. Job Details Page
- Full job description
- Client info (username, ratings)
- Current bids (if client viewing)
- Submit bid form (if freelancer)
- Status indicator
- Timeline/activity log

### 4. Post Job Page (Clients)
- Form fields:
  - Title
  - Description (rich text editor)
  - Budget (USDCx input)
  - Deadline (date picker)
  - Category (dropdown)
- Wallet approval preview
- Estimated platform fee

### 5. My Jobs Dashboard (Clients)
Tabs:
- **Active Jobs**: Show jobs in progress
- **Pending Bids**: Jobs awaiting selection
- **Completed**: Past jobs
- **Cancelled**: Cancelled jobs

Each job shows:
- Status badge
- Number of bids
- Actions (View, Cancel, Approve Work)

### 6. My Bids Dashboard (Freelancers)
Tabs:
- **Active**: Accepted bids in progress
- **Pending**: Awaiting client decision
- **Won**: Completed successfully
- **Lost**: Rejected bids

Each bid shows:
- Job title
- Bid amount
- Status
- Actions (Submit Work, View Job)

### 7. Dispute Center
- Active disputes
- Dispute details
- Chat/messaging system
- Evidence upload
- Resolution history

### 8. Profile Page
- Username/address
- Reputation score
- Completed jobs count
- Total earned/spent
- Reviews/feedback
- Skills/categories

### 9. Admin Dashboard (Platform Owner)
- Total platform fees collected
- Active disputes
- Dispute resolution interface
- Platform statistics
- User management

---

## 🎨 Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── WalletConnect.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobDetails.tsx
│   │   ├── JobFilters.tsx
│   │   └── PostJobForm.tsx
│   │
│   ├── bids/
│   │   ├── BidCard.tsx
│   │   ├── BidList.tsx
│   │   ├── BidForm.tsx
│   │   └── BidStatus.tsx
│   │
│   ├── disputes/
│   │   ├── DisputeCard.tsx
│   │   ├── DisputeForm.tsx
│   │   └── DisputeResolution.tsx
│   │
│   └── profile/
│       ├── ProfileCard.tsx
│       ├── ReputationScore.tsx
│       └── ActivityTimeline.tsx
│
├── pages/
│   ├── LandingPage.tsx
│   ├── BrowseJobs.tsx
│   ├── JobDetailsPage.tsx
│   ├── PostJobPage.tsx
│   ├── ClientDashboard.tsx
│   ├── FreelancerDashboard.tsx
│   ├── DisputeCenter.tsx
│   ├── ProfilePage.tsx
│   └── AdminDashboard.tsx
│
├── context/
│   ├── WalletContext.tsx
│   ├── JobContext.tsx
│   └── UserContext.tsx
│
├── utils/
│   ├── contractUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
│
└── hooks/
    ├── useContractCall.ts
    ├── useContractRead.ts
    └── useJobStatus.ts
```

---

## 🔧 Technical Requirements

### Smart Contract Integration

**Initialize Contract:**
```typescript
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  callReadOnlyFunction,
  broadcastTransaction 
} from '@stacks/transactions';

const CONTRACT_ADDRESS = 'ST2Y455NJPETB2SRSD0VDZP3KJE50WNHY0BN3TWY5';
const CONTRACT_NAME = 'trustwork-marketplace';
const network = new StacksTestnet();
```

**Read Job Data:**
```typescript
async function getJob(jobId: number) {
  const result = await callReadOnlyFunction({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-job',
    functionArgs: [uintCV(jobId)],
    senderAddress: userAddress,
  });
  
  return cvToJSON(result);
}
```

**Post Job:**
```typescript
async function postJob(
  title: string,
  description: string,
  budget: number,
  deadline: number,
  category: string
) {
  const txOptions = {
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'post-job',
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(description),
      uintCV(budget),
      uintCV(deadline),
      stringUtf8CV(category)
    ],
    senderKey: userPrivateKey,
    postConditions: [
      makeStandardSTXPostCondition(
        userAddress,
        FungibleConditionCode.Equal,
        budget
      )
    ]
  };
  
  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
}
```

### Real-time Updates

**Listen for Events:**
```typescript
import { io } from 'socket.io-client';

// Connect to Stacks API websocket
const socket = io('https://api.testnet.hiro.so');

// Subscribe to contract events
socket.emit('subscribe', {
  event: 'mempool',
  contract_id: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`
});

// Listen for new jobs
socket.on('transaction', (tx) => {
  if (tx.contract_call?.function_name === 'post-job') {
    // Update UI with new job
    refreshJobList();
  }
});
```

### Data Indexing

**Option 1: Hiro API**
```typescript
async function getAllJobs() {
  const response = await fetch(
    `https://api.testnet.hiro.so/extended/v1/contract/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/events`
  );
  const data = await response.json();
  
  // Filter for job-posted events
  return data.events
    .filter(e => e.event_type === 'print' && e.event_payload.event === 'job-posted')
    .map(e => ({
      jobId: e.event_payload.job_id,
      creator: e.event_payload.creator,
      budget: e.event_payload.budget,
      // ... other fields
    }));
}
```

**Option 2: Local Database (Better for production)**
```typescript
// Use PostgreSQL + Prisma
// Index all contract events to local DB
// Provides fast queries and filtering

// Schema:
prisma.job.findMany({
  where: {
    status: JOB_OPEN,
    category: 'Design',
    budget: { gte: 50000000 }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

---

## 🗺️ User Journey Examples

### Journey 1: Client Posts Job

**Steps:**
1. Click "Post Job" in header
2. Fill form:
   - Title: "Mobile App UI Design"
   - Description: "Need modern UI for fitness app..."
   - Budget: 500 USDCx
   - Deadline: 14 days
   - Category: Design
3. Click "Post Job"
4. Wallet popup: Approve USDCx transfer
5. Transaction broadcast
6. Success: "Job posted! View your job →"
7. Redirect to job details page

**UI States:**
- Form validation (red borders on errors)
- Loading spinner during transaction
- Success toast notification
- Error handling if transaction fails

### Journey 2: Freelancer Bids on Job

**Steps:**
1. Browse jobs → Filter by "Design"
2. Click job card → View details
3. Read full description
4. Click "Submit Bid"
5. Fill bid form:
   - Bid amount: 450 USDCx (10% under budget)
   - Proposal: "I'm a UI/UX designer with 7 years..."
   - Portfolio link
6. Click "Submit Bid"
7. Wallet popup: Sign transaction (no USDCx transfer yet)
8. Success: "Bid submitted! Track in My Bids →"

**UI States:**
- Disable form if already bid on this job
- Show "bid amount must be ≤ budget"
- Character count for proposal (max 500)

### Journey 3: Work Submission & Auto-Release

**Steps (Freelancer):**
1. Dashboard → "Active Jobs" tab
2. Click job → See "In Progress" status
3. Complete work offline
4. Click "Submit Work"
5. Upload files to IPFS/Arweave
6. Fill work description with links
7. Submit → Wallet signs transaction
8. Success: "Work submitted! Client has 7 days to respond"

**Steps (Auto-Release - 7 days later):**
1. Dashboard shows "Auto-release available"
2. Click "Trigger Auto-Release"
3. Smart contract checks:
   - Work submitted? ✅
   - 7 days passed? ✅
4. Payment released automatically
5. Success notification: "Payment received! 450 USDCx"

**UI States:**
- Countdown timer: "Client has 6 days 4 hours to respond"
- Auto-release button appears when available
- Anyone can trigger (not just freelancer)

---

## 📱 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile-specific features:**
- Bottom navigation bar
- Swipe gestures for job cards
- Collapsible filters
- Simplified forms (one field per screen)
- Touch-friendly buttons (min 44px height)

---

## 🎨 Design System

**Colors:**
```css
--primary: #6366f1;      /* Indigo */
--primary-dark: #4f46e5;
--success: #10b981;       /* Green */
--warning: #f59e0b;       /* Amber */
--error: #ef4444;         /* Red */
--neutral-100: #f3f4f6;
--neutral-900: #111827;
```

**Typography:**
```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Components:**
- Use Tailwind CSS
- Consistent button styles
- Card shadows: `shadow-md hover:shadow-lg`
- Border radius: `rounded-lg` (8px)

---

## 🔒 Security Considerations

**1. Post-Conditions:**
```typescript
// Always add post-conditions for USDCx transfers
const postConditions = [
  makeFungiblePostCondition(
    userAddress,
    FungibleConditionCode.Equal,
    budget,
    createAssetInfo(
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'usdcx',
      'usdcx'
    )
  )
];
```

**2. Input Validation:**
```typescript
// Sanitize all user inputs
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script>/gi, '')
    .substring(0, MAX_LENGTH);
}
```

**3. Rate Limiting:**
```typescript
// Limit bid submissions per user
const RATE_LIMIT = 10; // Max 10 bids per hour
```

**4. IPFS/Arweave for File Storage:**
```typescript
// Never store files on-chain
// Upload to decentralized storage
async function uploadToIPFS(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData
  });
  
  const { IpfsHash } = await res.json();
  return `ipfs://${IpfsHash}`;
}
```

---

## 📊 Analytics & Tracking

**Track These Metrics:**
1. Total jobs posted
2. Total bids submitted
3. Average bid amount
4. Completion rate (completed / total jobs)
5. Average time to completion
6. Dispute rate
7. Platform fees collected
8. Active users (clients vs freelancers)

**Implementation:**
```typescript
// Event tracking with Plausible/Posthog
function trackEvent(event: string, properties: object) {
  window.plausible?.(event, { props: properties });
}

// Examples:
trackEvent('Job Posted', { category, budget });
trackEvent('Bid Submitted', { jobId, amount });
trackEvent('Work Approved', { jobId, payout });
```

---

## 🚀 Deployment Checklist

**Smart Contract:**
- [ ] Deploy to testnet
- [ ] Test all functions
- [ ] Get contract address
- [ ] Verify on explorer
- [ ] Deploy to mainnet (when ready)

**Frontend:**
- [ ] Configure environment variables
- [ ] Build production bundle
- [ ] Deploy to Vercel/Netlify
- [ ] Set up custom domain
- [ ] Configure CORS
- [ ] Enable analytics

**Backend (if using):**
- [ ] Set up PostgreSQL database
- [ ] Deploy indexer service
- [ ] Configure webhooks
- [ ] Set up monitoring (Sentry)

**Testing:**
- [ ] Unit tests for utils
- [ ] Integration tests for contract calls
- [ ] E2E tests for critical flows
- [ ] Manual QA on testnet

---

## 📚 Documentation for Other Developer

**Give them:**
1. ✅ This complete flow document
2. ✅ Updated smart contract (below)
3. ✅ Figma designs (if available)
4. ✅ Access to GitHub repo
5. ✅ Environment variables template
6. ✅ Deployment credentials

**They should start with:**
1. Read this entire document
2. Set up local development environment
3. Deploy contract to devnet
4. Build landing page
5. Implement wallet connection
6. Build job browsing
7. Build job posting flow
8. Build bidding system
9. Build work submission
10. Build dispute system
11. Testing & deployment

---

## 🎯 MVP Feature Priority

**Phase 1 (Week 1-2):**
- [x] Smart contract deployment
- [ ] Landing page
- [ ] Wallet connection
- [ ] Browse jobs
- [ ] Job details page

**Phase 2 (Week 3-4):**
- [ ] Post job functionality
- [ ] Submit bid functionality
- [ ] Accept bid functionality
- [ ] Client dashboard
- [ ] Freelancer dashboard

**Phase 3 (Week 5-6):**
- [ ] Work submission
- [ ] Work approval
- [ ] Auto-release mechanism
- [ ] Cancel job
- [ ] Withdraw bid

**Phase 4 (Week 7-8):**
- [ ] Dispute system
- [ ] Admin dashboard
- [ ] Reputation system
- [ ] Search & filters
- [ ] Mobile optimization

**Phase 5 (Production):**
- [ ] Mainnet deployment
- [ ] Marketing website
- [ ] Documentation
- [ ] User onboarding
- [ ] Customer support

---

## 💡 Future Enhancements

1. **Milestone Payments**: Split large jobs into multiple milestones
2. **Escrow Insurance**: Optional insurance for high-value jobs
3. **Multi-Token Support**: Accept STX, sBTC, other tokens
4. **NFT Certificates**: Mint NFTs for completed jobs
5. **DAO Governance**: Community votes on disputes
6. **Staking**: Stake tokens for reduced fees
7. **Referral Program**: Earn rewards for referrals
8. **Skills Verification**: On-chain skill badges
9. **Time Tracking**: Built-in time logging
10. **Video Calls**: Integrated client-freelancer calls

---

## 📞 Support & Resources

**Documentation:**
- Stacks Docs: https://docs.stacks.co
- Clarity Language: https://clarity-lang.org
- Stacks.js: https://stacks.js.org

**Community:**
- Discord: https://discord.gg/stacks
- Forum: https://forum.stacks.org
- Twitter: @Stacks

**Developer Support:**
- Hiro Platform: https://platform.hiro.so
- Block Explorer: https://explorer.hiro.so
- Testnet Faucet: https://explorer.hiro.so/sandbox/faucet

---

END OF DOCUMENTATION
