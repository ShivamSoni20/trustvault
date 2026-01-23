## Project Summary
TrustWork is a decentralized freelance marketplace built on the Stacks blockchain. It allows clients to post jobs with escrow protection using USDCx stablecoins, and freelancers to bid on those jobs. The platform features automated payment releases, dispute resolution, and a transparent reputation system, all secured by Bitcoin's finality via the Stacks network.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide React / React Icons
- **State Management**: TanStack Query (React Query), Zustand (Wallet state)
- **Blockchain**: Stacks.js (@stacks/transactions, @stacks/connect, @stacks/network)
- **Smart Contracts**: Clarity (Stacks)
- **Styling**: Tailwind CSS with custom glassmorphism and high-end aesthetic components
- **Payments**: USDCx (Fungible Token on Stacks)

## Architecture
- **`/frontend/src/app`**: Next.js App Router pages and layouts.
- **`/frontend/src/hooks`**: Custom hooks for wallet management (`useWallet`), marketplace data (`useJobs`), and contract actions (`useMarketplaceActions`).
- **`/frontend/src/services`**: API service for interacting with the Stacks blockchain and Hiro API (`apiService`).
- **`/frontend/src/types`**: TypeScript interfaces for marketplace entities like `Job`, `Bid`, and `Dispute`.
- **`/frontend/src/utils`**: Formatting utilities and shared constants.

## User Preferences
- **Aesthetics**: High-end, distinctive design. Avoid "AI slop". Use creative typography, dark themes with sharp accents (Emerald/Indigo), and meaningful motion/animations.
- **Components**: Functional components with named exports.
- **Next.js**: Use App Router and minimize 'use client' directives where possible.

## Project Guidelines
- **Contract**: Always use `ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A.trustwork-marketplace-v2` for main operations.
- **Styling**: Consistent use of CSS variables and `glass-card` utility class.
- **Security**: Always implement post-conditions for token transfers to ensure trustless operations.
- **Documentation**: Keep `AGENTS.md` updated with major architecture or preference changes.

## Common Patterns
- **Contract Calls**: Use the `useMarketplaceActions` hook which wraps `@stacks/connect`'s `openContractCall`.
- **Data Fetching**: Use TanStack Query hooks in `useJobs.ts` for consistent state and caching.
- **Formatting**: Use `formatUSDCx` and `truncateAddress` for consistent UI display of blockchain data.
