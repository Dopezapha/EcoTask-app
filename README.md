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
| 🔐 **Wallet Integration** | ✅ | Connect via Freighter or create a testnet wallet in-app |
| 🗂️ **Task Browser** | ✅ | Filter tasks by type, view difficulty and estimated time |
| 📸 **Proof Submission** | ✅ | Real camera capture with GPS metadata via Vision Camera |
| 🔑 **Wallet Authentication** | ✅ | Sign challenges with your Stellar wallet to authenticate |
| 💸 **Instant Rewards** | ✅ | Receive ECO tokens after task verification |
| 📈 **Impact Dashboard** | ✅ | See trees planted, plastic collected, CO₂ offset |
| 💰 **Transaction History** | ✅ | View recent Stellar payments on the wallet screen |
| 👤 **Profile Management** | ✅ | Edit name and bio, view impact stats |
| 🌐 **Multi-language** | 🔜 | Designed for localisation (English, Swahili, French, Portuguese) |
| 📶 **Offline-first** | ✅ | Queue submissions when offline, sync when connected |
| 🔔 **Push Notifications** | ✅ | Task reminders, reward confirmations, streak nudges |
| 🗄️ **Decentralized Storage** | ✅ | IPFS pinning for proof photos and metadata |

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
│   │   ├── useStellarWallet.ts   # Wallet connect & balance refresh
│   │   ├── useAuth.ts            # Wallet-based authentication
│   │   ├── useTaskFeed.ts        # Paginated task fetching
│   │   ├── useProofSubmit.ts     # Proof upload + offline queue
│   │   ├── useLocation.ts        # GPS permission & position
│   │   └── useNetworkStatus.ts   # Online/offline detection
│   │
│   ├── services/                 # External integrations (4 services)
│   │   ├── api.ts                # Axios client with auth + endpoints
│   │   ├── stellar.ts            # Stellar SDK: balance, tokens, accounts
│   │   ├── ipfs.ts               # IPFS pinning via Pinata API
│   │   └── notifications.ts      # Push notification registration
│   │
│   ├── store/                    # Zustand global state (4 stores)
│   │   ├── walletStore.ts        # Wallet state (MMKV persisted)
│   │   ├── taskStore.ts          # Task list & pagination
│   │   ├── userStore.ts          # Profile & auth (MMKV persisted)
│   │   └── activityStore.ts      # Recent activity feed
│   │
│   ├── types/                    # Shared TypeScript types
│   │   └── index.ts              # Task, UserProfile, Activity, etc.
│   │
│   ├── utils/                    # Helper functions
│   │   ├── theme.ts              # Dark color palette & spacing
│   │   ├── formatTokens.ts       # Token amount formatting
│   │   ├── geoUtils.ts           # Haversine distance, radius checks
│   │   └── validation.ts         # Public key & email validation
│   │
│   └── __tests__/                # Tests (54 tests across 5 files)
│       ├── stores.test.ts        # Wallet, task, user store tests
│       ├── components.test.tsx   # Component rendering tests
│       ├── formatTokens.test.ts  # Token formatting tests
│       ├── geoUtils.test.ts      # Geolocation utility tests
│       └── validation.test.ts    # Validation utility tests
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
# Run unit tests (54 tests)
npm test

# Run with coverage
npm test -- --coverage

# Run integration tests (requires running backend)
npm run test:integration
```

### Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Store logic | 14 | walletStore, taskStore, userStore |
| Component rendering | 19 | TaskCard, ImpactStats, RewardBadge, EmptyState |
| Utility functions | 21 | formatTokens, geoUtils, validation |

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

## 🤝 Contributing

We welcome contributions from everyone!

- 📖 Read our [Contributing Guidelines](CONTRIBUTING.md)
- ⚖️ Review our [Code of Conduct](CODE_OF_CONDUCT.md)
- 🐛 Report bugs via [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 Suggest features via [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔒 Report vulnerabilities in [SECURITY.md](SECURITY.md)

Good first issues are tagged [`good first issue`](https://github.com/ecotask-network/ecotask-app/issues?q=label%3A%22good+first+issue%22) in the issue tracker.

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
