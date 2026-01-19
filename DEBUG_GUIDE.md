# 🔧 TrustVault Dashboard Debug Guide

## 📸 What I See in Your Screenshots

### Screenshot 1 - Transaction History ✅
- **1 transaction found:** "Created Escrow - Escrow #1"
- **Date:** Jan 19, 2026, 01:04 PM
- **Status:** Confirmed
- **This proves:** Escrow creation is working!

### Screenshot 2 - Dashboard ❌
- **Connected Address:** `ST30TR...0C9A` (This is the CONTRACT address!)
- **All counters:** 0 (Total, Client, Freelancer, Active)
- **Message:** "No escrows found"
- **This proves:** Dashboard is not finding escrows for this address

---

## 🎯 Root Cause Identified

**The wallet is showing the CONTRACT address (`ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A`) instead of your personal wallet address!**

This is why:
- ✅ You can create escrows (transaction shows it worked)
- ❌ Dashboard shows 0 escrows (you're "logged in" as the contract)

---

## 🔍 Debugging Steps

### Step 1: Check Your Actual Wallet Address

1. Open your Stacks wallet (Leather or Xverse)
2. Copy your ACTUAL address (should start with `ST1...` or `ST2...` or similar)
3. Compare it to what's shown in TrustVault navbar
4. **They should match!** If they don't, there's a connection issue

### Step 2: Verify Escrow #1 Details

We need to check WHO created Escrow #1 and WHO it's for:

**Option A: Use Stacks Explorer**
1. Go to: https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=testnet
2. Look at the transaction details
3. Find the "Sender" address (this is the CLIENT)
4. Find the function arguments to see the FREELANCER address

**Option B: Use Debug Script**

Run this in your terminal:
```bash
cd d:\StackedTrust\usdcx-escrow
node debug-escrow.js
```

This will show you:
- Client address for Escrow #0
- Freelancer address for Escrow #0
- Amount, status, metadata

### Step 3: Check Console Logs

1. Open your deployed site: https://stacked-trust.vercel.app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Navigate to Dashboard
5. Look for logs like:
   ```
   [TrustVault] Fetched X escrows. User address: ST...
   - Escrow #0: Client=ST..., Freelancer=ST..., Match=true/false
   ```

**What to look for:**
- Does it say "Fetched 1 escrows" or "Fetched 0 escrows"?
- Does the User address match your wallet?
- Does Match=true for any escrow?

---

## 🛠️ Potential Fixes

### Fix 1: Reconnect Your Wallet

1. Click the wallet address in navbar
2. Click "Disconnect"
3. Click "Connect Wallet" again
4. Select your wallet (Leather/Xverse)
5. Approve the connection
6. **Verify the address shown is YOUR address, not the contract**

### Fix 2: Check Wallet Extension

1. Open your wallet extension
2. Make sure you're on the correct account
3. Make sure you're on Stacks Testnet (not mainnet)
4. Try switching accounts and back

### Fix 3: Clear Cache and Reconnect

1. Open DevTools (F12)
2. Go to Application tab
3. Clear all site data
4. Refresh page
5. Connect wallet again

---

## 📊 Expected Behavior

### If YOU created Escrow #1:
- Dashboard "As Client" tab should show: **1 escrow**
- The escrow should list the freelancer address
- You should see action buttons (Release, Refund, Dispute)

### If SOMEONE ELSE created Escrow #1 for YOU:
- Dashboard "As Freelancer" tab should show: **1 escrow**
- The escrow should list the client address
- You should see "Mark Work Complete" button

### If you're neither client nor freelancer:
- Dashboard should show: **0 escrows** (this is correct!)

---

## 🔬 Advanced Debugging

### Check the Smart Contract Directly

Use Stacks CLI or Explorer to call:
```clarity
(contract-call? 
  'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.usdcx-escrow 
  get-escrow 
  u0)
```

This will return the actual escrow data and show you:
- Who the client is
- Who the freelancer is
- Current status
- Amount

### Check getUserEscrows Function

Add this to your browser console on the dashboard:
```javascript
// Check what address the app thinks you are
console.log('Current address:', localStorage.getItem('stacks-session'));

// Force a refetch
window.location.reload();
```

---

## ✅ Quick Checklist

- [ ] Wallet shows MY address (not contract address)
- [ ] I know which address created Escrow #1
- [ ] I know which address is the freelancer for Escrow #1
- [ ] Console shows "[TrustVault] Fetched X escrows"
- [ ] Console shows my correct address
- [ ] Console shows Match=true for at least one escrow

---

## 🎯 Next Steps

1. **First:** Verify your wallet is showing YOUR address, not the contract
2. **Second:** Check console logs to see if escrows are being fetched
3. **Third:** Verify you're either the client OR freelancer for Escrow #1
4. **Fourth:** If still not working, share the console logs with me

---

## 💡 Most Likely Issue

Based on the screenshot showing `ST30TR...0C9A` (the contract address), I believe:

**The wallet connection is showing the wrong address.**

**Solution:**
1. Disconnect wallet completely
2. Refresh the page
3. Connect wallet again
4. Verify the address shown is YOUR personal address
5. Go to dashboard
6. Check if escrows appear

If the address is still showing as the contract address, there's a bug in the wallet connection logic that needs to be fixed.

---

*Generated: 2026-01-20 00:51 IST*
