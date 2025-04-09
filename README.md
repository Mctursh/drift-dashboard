<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->


# Drift Dashboard (TypeScript)

A modern, responsive web application for viewing and managing Drift Protocol user subaccounts, balances, and positions on Solana, built with TypeScript.

## Features

- **Solana Wallet Integration**: Connect your wallet using the Solana Wallet Adapter
- **Subaccount Management**: View all subaccounts associated with your wallet
- **Balance Tracking**: See token balances for each subaccount
- **Position Monitoring**: Track your perpetual positions and their performance
- **Order Management**: View and cancel open orders
- **Trading Functionality**: Place market and limit orders
- **Advanced Trading Features**:
  - Take Profit/Stop Loss orders
  - Scaled Orders (ladder orders)
- **Wallet Lookup**: View information for any Solana wallet address

## Technologies Used

- **Next.js**: React framework with App Router
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Zustand**: State management
- **Framer Motion**: Animations and transitions
- **Solana Wallet Adapter**: Wallet connection
- **Drift SDK**: Integration with Drift Protocol

## Project Structure

The project follows Next.js 13+ App Router structure:

```
src/
├── app/             # Next.js App Router
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/      # React components
├── store/           # Zustand state management
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── lib/             # Shared libraries and constants
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/drift-subaccount-dashboard.git
   cd drift-subaccount-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Type Safety

This project leverages TypeScript for comprehensive type safety:

- **API Types**: Strong typing for the Drift SDK API
- **Component Props**: Well-defined prop types for React components
- **State Management**: Typed Zustand stores
- **UI Interfaces**: Shared types for consistent UI behavior

## Mobile Responsiveness

The application is fully responsive and works well on:
- Desktop screens
- Tablets
- Mobile devices

## Styling

The UI features a modern web3 aesthetic with:
- Dark mode design
- Gradient accents
- Subtle animations and transitions
- Responsive cards and components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Drift Protocol](https://www.drift.trade/)
- [Solana](https://solana.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)