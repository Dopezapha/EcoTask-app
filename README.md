<div align="center">

# 📱 ecotask-app

**The EcoTask mobile dApp — browse tasks, submit proof, and earn rewards.**

*A React Native application that puts climate-action income in the hands of communities across the developing world.*

[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?logo=react)](https://reactnative.dev)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7B68EE?logo=stellar)](https://stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-v0.2.0--alpha-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md)

</div>

## Table of Contents

- [🌍 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [📦 Data Model](#-data-model)
- [🧠 State Management](#-state-management)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Getting Started](#-getting-started)
- [🧪 Testing](#-testing)
- [📲 App Flow & Key Workflows](#-app-flow--key-workflows)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📬 Contact](#-contact)
- [📄 License](#-license)

---

## 🌍 Overview

`ecotask-app` is the primary user-facing interface of the EcoTask platform. Built with React Native for cross-platform support (iOS & Android), it enables users in developing regions to:

- 🗺️ Discover available climate-action tasks nearby or globally
- 📸 Submit photo and GPS-based proof of completed work
- 💰 Receive ECO tokens or USDC stablecoins directly to their Stellar wallet
- 📊 Track their environmental impact and earnings over time

The app is designed with **low-bandwidth environments** in mind — optimized for 3G connections, older Android devices, and users who may be first-time smartphone owners.

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 **Wallet Integration** | ✅ | Connect via Freighter, create a testnet wallet, or import an existing one |
| 🗂️ **Task Browser** | ✅ | Filter tasks by type, view difficulty and estimated time, sorted by distance |
| 📸 **Proof Submission** | ✅ | Real camera capture with GPS metadata via Vision Camera |
| 🔑 **Wallet Authentication** | ✅ | Sign challenges with your Stellar wallet (Freighter or in-app) to authenticate |
| 💸 **Instant Rewards** | ✅ | Receive ECO tokens after task verification |
| 📈 **Impact Dashboard** | ✅ | Track trees planted, plastic collected, CO₂ offset per task type |
| 💰 **Transaction History** | ✅ | View recent Stellar payments on the wallet screen |
| 👤 **Profile Management** | ✅ | Edit name and bio, view impact stats |
| 🌐 **Multi-language** | 🔜 | Designed for localisation (English, Swahili, French, Portuguese) |
| 📶 **Offline-first** | ✅ | Queue submissions when offline, sync when connected, cache the task feed |
| 🔔 **Push Notifications** | ✅ | Task reminders, reward confirmations, streak nudges |
| 🗄️ **Decentralized Storage** | ✅ | IPFS pinning of proof photos and metadata, wired into submissions |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React Native 0.73 | Cross-platform iOS & Android from one codebase |
| Language | TypeScript 5.3 (strict) | Type safety across the entire codebase |
| Wallet | Stellar SDK | Direct blockchain interaction via Horizon API |
| State | Zustand + MMKV | Lightweight state with persistent local storage |
| Navigation | React Navigation v6 | Bottom tabs + nested stack navigators |
| Camera | React Native Vision Camera 3 | High-quality photo capture with GPS metadata |
| API | Axios | REST client with auth interceptors |
| Styling | NativeWind (Tailwind) | Consistent, responsive UI |
| Testing | Jest + React Test Renderer | Unit, component, and integration tests |

---

## 📁 Folder Structure

```
ecotask-app/
├── src/
│   ├── screens/                  # App screens (9 screens)
│   │   ├── HomeScreen.tsx        # Dashboard with impact stats & greeting
│   │   ├── TaskListScreen.tsx    # Browse & filter tasks by type
│   │   ├── TaskDetailScreen.tsx  # Task info with difficulty & time
│   │   ├── SubmitProofScreen.tsx # Real camera + GPS proof submission
│   │   ├── WalletScreen.tsx      # Balance, history & disconnect
│   │   ├── OnboardingScreen.tsx  # Wallet connection & auth
│   │   ├── ProfileScreen.tsx     # User stats & settings
│   │   ├── EditProfileScreen.tsx # Edit name and bio
│   │   └── SubmitPlaceholderScreen.tsx
│   │
│   ├── components/               # Reusable UI (10 components)
│   │   ├── TaskCard.tsx          # Task card with difficulty badge
│   │   ├── RewardBadge.tsx       # Tiered reward badge (5 tiers)
│   │   ├── ImpactStats.tsx       # Trees, plastic, CO₂ metrics
│   │   ├── TransactionHistory.tsx # Stellar payment history
│   │   ├── ErrorBoundary.tsx     # Class-based error boundary
│   │   ├── LoadingSkeleton.tsx   # Animated skeleton loaders
│   │   ├── OfflineBanner.tsx     # Yellow offline warning
│   │   ├── EmptyState.tsx        # Generic empty state
│   │   ├── WalletBalance.tsx     # Inline balance display
│   │   └── TabBarIcon.tsx        # Emoji-based tab icons
│   │
│   ├── navigation/               # App routing
│   │   ├── RootNavigator.tsx     # Auth gate + all root routes
│   │   ├── MainTabNavigator.tsx  # Bottom tabs (Home/Tasks/Submit/Wallet)
│   │   └── TaskStackNavigator.tsx # Tasks tab stack navigation
│   │
│   ├── hooks/                    # Custom React hooks (6 hooks)
│   │   ├── useStellarWallet.ts   # Wallet connect, import, balance refresh
│   │   ├── useAuth.ts            # Wallet-based authentication
│   │   ├── useTaskFeed.ts        # Paginated, location-aware task fetching
│   │   ├── useProofSubmit.ts     # Proof upload + IPFS pinning + offline queue
│   │   ├── useLocation.ts        # GPS permission & position
│   │   └── useNetworkStatus.ts   # Online/offline detection
│   │
│   ├── services/                 # External integrations (6 services)
│   │   ├── api.ts                # Axios client with auth + endpoints
│   │   ├── stellar.ts            # Stellar SDK: balance, tokens, signing
│   │   ├── ipfs.ts               # IPFS pinning via Pinata API
│   │   ├── notifications.ts      # Push notification registration
│   │   ├── proofQueue.ts         # Persistent offline proof queue
│   │   └── walletVault.ts        # Per-account in-app secret key storage
│   │
│   ├── store/                    # Zustand global state (4 stores)
│   │   ├── walletStore.ts        # Wallet state (MMKV persisted)
│   │   ├── taskStore.ts          # Task list & pagination (MMKV cached)
│   │   ├── userStore.ts          # Profile & auth (MMKV persisted)
│   │   └── activityStore.ts      # Recent activity feed (MMKV persisted)
│   │
│   ├── types/                    # Shared TypeScript types
│   │   └── index.ts              # Task, UserProfile, Activity, impact config
│   │
│   ├── utils/                    # Helper functions (6 utilities)
│   │   ├── theme.ts              # Dark color palette & spacing
│   │   ├── formatTokens.ts       # Token amount formatting
│   │   ├── geoUtils.ts           # Haversine distance, radius checks, sort
│   │   ├── validation.ts         # Public key & email validation
│   │   ├── impact.ts             # Per-task-type environmental impact
│   │   └── proofMetadata.ts      # IPFS proof metadata builder
│   │
│   └── __tests__/                # Tests (86 tests across 10 files)
│       ├── stores.test.ts        # Wallet, task, user, activity store tests
│       ├── components.test.tsx   # Component rendering tests
│       ├── formatTokens.test.ts  # Token formatting tests
│       ├── geoUtils.test.ts      # Geolocation & distance sorting tests
│       ├── validation.test.ts    # Validation utility tests
│       ├── proofQueue.test.ts    # Offline proof queue tests
│       ├── proofMetadata.test.ts # IPFS metadata builder tests
│       ├── impact.test.ts        # Impact calculation tests
│       ├── walletVault.test.ts   # Secret key vault tests
│       └── signChallenge.test.ts # Stellar challenge signing tests
│
├── .github/                      # CI/CD & templates
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- A Stellar testnet account (get one free at [laboratory.stellar.org](https://laboratory.stellar.org))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/ecotask-network/ecotask-app.git
cd ecotask-app

# 2. Install dependencies
npm install

# 3. Install iOS pods (Mac only)
cd ios && pod install && cd ..

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 5. Start Metro bundler
npm start

# 6. Run on device/emulator
npm run android   # Android
npm run ios       # iOS (Mac only)
```

### Environment Variables

```env
STELLAR_NETWORK=testnet
BACKEND_URL=http://localhost:3000

# IPFS (Pinata or compatible pinning service)
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET=your_pinata_secret
IPFS_GATEWAY=https://ipfs.io/ipfs/

# ECO Token
ECO_TOKEN_ASSET_CODE=ECO
ECO_TOKEN_ISSUER=YOUR_ISSUER_PUBLIC_KEY

# Push Notifications
FCM_SERVER_KEY=your_fcm_key
```

---

## 🧪 Testing

```bash
# Run unit tests (86 tests)
npm test

# Run with coverage
npm test -- --coverage

# Run integration tests (requires running backend)
npm run test:integration
```

### Test Coverage

| Category | Tests | Files |
|----------|-------|-------|
| Store logic | 19 | walletStore, taskStore, userStore, activityStore |
| Component rendering | 19 | TaskCard, ImpactStats, RewardBadge, EmptyState |
| Utility functions | 34 | formatTokens, geoUtils, validation, impact, proofMetadata |
| Service logic | 14 | proofQueue, walletVault, signChallenge |

---

## 📲 App Flow

```
Launch
  │
  ├── New User ──▶ Connect Freighter / Create Test Wallet ──▶ Authenticate
  │                                                              │
  │                                                              ▼
  └── Returning ──▶ Auto-authenticate from persisted token ──▶ Home
                                                                 │
                                                ┌───────────────┼────────────────┐
                                                ▼               ▼                ▼
                                            Browse Tasks    My Wallet        My Profile
                                                │               │                │
                                                ▼               ▼                ▼
                                            Task Detail    Balance + TXN     Edit Profile
                                                │            History
                                                ▼
                                           Start Task ──▶ Capture Photo + GPS
                                                                │
                                                                ▼
                                                         Submit Proof
                                                                │
                                                                ▼
                                                   Pending Verification ──▶ ✅ Reward
```

---

## 🗺️ Roadmap

EcoTask is in early alpha. Here's what we're building and in what order:

### Now (v0.2 — current)
- ✅ Wallet connection (Freighter + in-app testnet wallets)
- ✅ Wallet-based authentication
- ✅ In-app wallet import, secret key backup & challenge signing
- ✅ Real camera proof capture with GPS
- ✅ Task browsing, filtering, and detail view
- ✅ Location-aware task discovery sorted by distance
- ✅ Offline proof queue & sync
- ✅ Offline task feed caching
- ✅ IPFS proof pinning in the submission flow
- ✅ Persistent activity feed & impact dashboard
- ✅ Transaction history (Stellar Horizon)

### Next (v0.3)
- 🔜 **Backend verification engine** — photo + GPS proof validation
- 🔜 **ECO reward payouts** via Stellar smart contracts
- 🔜 **Lobstr & xBull wallet support**
- 🔜 **Push notifications** for reward confirmations & new tasks

### Later (v0.4+)
- 🔜 **Map-based task discovery** (React Native Maps)
- 🔜 **Multi-language support** (English, Swahili, French, Portuguese)
- 🔜 **USDC payout option**
- 🔜 **Withdraw flow & transaction signing**
- 🔜 **Leaderboards, streaks & community challenges**

> Milestones are tracked in the [GitHub issues](https://github.com/ecotask-network/EcoTask-app/issues) — check the `roadmap` label for current priorities.

---

## 🤝 Contributing

We welcome contributions from everyone!

- 📖 Read our [Contributing Guidelines](CONTRIBUTING.md)
- ⚖️ Review our [Code of Conduct](CODE_OF_CONDUCT.md)
- 🐛 Report bugs via [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 Suggest features via [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔒 Report vulnerabilities in [SECURITY.md](SECURITY.md)

Good first issues are tagged [`good first issue`](https://github.com/ecotask-network/ecotask-app/issues?q=label%3A%22good+first+issue%22) in the issue tracker.

---

## 📬 Contact

Questions, feedback, or partnership ideas? We'd love to hear from you.

| Channel | Where |
|---------|-------|
| 📧 **Email** | [solapromise112@gmail.com](mailto:solapromise112@gmail.com) |
| 🐙 **GitHub Organization** | [github.com/ecotask-network](https://github.com/ecotask-network) |
| 💬 **GitHub Discussions** | [EcoTask-app discussions](https://github.com/ecotask-network/EcoTask-app/discussions) |
| 🐛 **Bug Reports** | [Open an issue](https://github.com/ecotask-network/EcoTask-app/issues/new?template=bug_report.md) |

**Preferred channel:** For project questions and feature discussions, use GitHub Discussions. For direct or time-sensitive inquiries, email the maintainers.

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

## Ecosystem

This is part of the [EcoTask Network](https://github.com/ecotask-network):

| Repo | Description |
|------|-------------|
| [EcoTask-app](https://github.com/ecotask-network/EcoTask-app) | Mobile dApp (this repo) |
| [EcoTask-backend](https://github.com/ecotask-network/EcoTask-backend) | Node.js API & verification engine |
| [EcoTask-contracts](https://github.com/ecotask-network/EcoTask-contract) | Stellar Soroban smart contracts |
| [EcoTask-docs](https://github.com/ecotask-network/EcoTask-docs) | Documentation hub |

---

<div align="center">

*Part of the [EcoTask Network](https://github.com/ecotask-network) — Because the environment deserves an economy.*

</div>
