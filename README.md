# DevGon - Web3 Developer Marketplace

A comprehensive platform for connecting Polygon blockchain developers and creatives to employers in the Web3 space.

## Features

- **Dual Dashboard System**: Separate interfaces for developers and employers
- **Blockchain Payments**: Smart contract-based posting fees on Polygon testnet
- **Real-time Chat**: In-app messaging system for direct communication
- **Profile Management**: Comprehensive profiles with skills, portfolio, and verification
- **Job Feed**: Browse and filter developer portfolios and offerings
- **Customer Support**: Built-in support ticket system with FAQ
- **Email Verification**: Firebase-powered authentication with email confirmation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Blockchain**: Polygon Mumbai Testnet, ethers.js
- **Smart Contracts**: Solidity

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or Web3 wallet
- Firebase project
- Polygon Mumbai testnet MATIC (from faucet)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables in Vercel or `.env.local`:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

### Smart Contract Deployment

1. Install Hardhat:
   \`\`\`bash
   npm install --save-dev hardhat
   \`\`\`

2. Initialize Hardhat and configure for Polygon Mumbai

3. Deploy the contract:
   \`\`\`bash
   npx hardhat run scripts/deploy.js --network mumbai
   \`\`\`

4. Add the deployed contract address to your environment variables

## Usage

### For Developers

1. Sign up and select "Developer" role
2. Complete your profile with skills and wallet address
3. Connect your MetaMask wallet
4. Post your work (requires MATIC payment)
5. Respond to employer messages

### For Employers

1. Sign up and select "Employer" role
2. Browse the developer feed
3. Filter by skills and search
4. View detailed developer profiles
5. Message developers directly

## Firebase Collections

- `users`: User profiles and authentication data
- `jobPostings`: Developer portfolio posts
- `chats`: Chat conversations
- `chats/{chatId}/messages`: Individual messages
- `supportTickets`: Customer support tickets

## Smart Contract

The DevGonPayment contract handles:
- Job posting fees
- Payment verification
- Transaction recording
- Platform fee management

## Support

For issues or questions, visit the Support page in the app or contact support@devgon.io

## License

MIT License
