# **Fhenix VPN Frontend**

This project is a decentralized frontend application built to interact with Fhenix smart contracts. It allows users to manage and interact with VPN server nodes, mint tokens, and pay for VPN access using their wallets. The frontend connects to the **Fhenix Helium** network, utilizing Web3 and Fully Homomorphic Encryption (FHE).

## **Features**

- **Wallet Connection**: Connect to a Web3 wallet (e.g., MetaMask) and display the user's account details and token balance.
- **Mint Tokens**: Mint tokens using the `MintableERC` smart contract.
- **Manage VPN Servers**: Add new VPN servers to the Fhenix network.
- **View and Pay for VPN Access**: View the list of available servers and pay for access to a VPN server based on user-selected options.

## **Tech Stack**

- **React**: JavaScript library for building user interfaces.
- **Ethers.js**: Ethereum library for interacting with the blockchain and smart contracts.
- **Fhenix Helium RPC**: Custom RPC URL to connect with the Fhenix Helium network.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## **Table of Contents**

1. [Installation](#installation)
2. [Usage](#usage)
3. [Project Structure](#project-structure)
4. [Available Scripts](#available-scripts)
5. [Smart Contracts](#smart-contracts)
6. [Contributing](#contributing)

---

## **Installation**

To run this project locally, follow these steps:

### 1. **Clone the repository**

```bash
cd test
```

### 2. **Install dependencies**

Make sure you have Node.js installed. Then run:

```bash
npm install
# or
yarn install
```

### 3. **Set up environment variables**

Create a `.env.local` file in the root of the project, and configure the following variables:

```bash
NEXT_PUBLIC_RPC_URL="https://api.helium.fhenix.zone" # Replace with your RPC URL if different
NEXT_PUBLIC_MINTABLE_ERC_ADDRESS="0x1234567890123456789012345678901234567890"
NEXT_PUBLIC_PROXY_LOCATION_ADDRESS="0x0987654321098765432109876543210987654321"
NEXT_PUBLIC_CHAIN_ID="8008135" # Chain ID for Fhenix Helium
```

### 4. **Run the application**

```bash
npm run dev
# or
yarn dev
```

Navigate to `http://localhost:3000` to interact with the frontend.

---

## **Usage**

1. **Connect your wallet**:
   - Upon loading the page, connect your Web3 wallet (e.g., MetaMask).
   
2. **Mint Tokens**:
   - In the "Mint Tokens" section, enter the amount of tokens to mint and click **Mint**.

3. **Add a VPN Server**:
   - In the "Proxy Location" section, you can add a new VPN server with default settings by clicking **Add Server**.

4. **View Available Servers and Pay for Access**:
   - The **Server List** section displays all the available VPN servers. You can pay for VPN access by clicking **Pay for Access**.

---

## **Project Structure**

```bash
.
├── components/    # Reusable UI components (buttons, inputs, cards, etc.)
├── pages/         # Main pages for the frontend app
├── public/        # Static assets (images, icons, etc.)
├── styles/        # Global and component-specific styles
└── utils/         # Helper functions and utilities (e.g., formatting, Web3 utils)
```

---

## **Available Scripts**

In the project directory, you can run:

- `npm run dev` or `yarn dev`: Starts the development server.
- `npm run build` or `yarn build`: Builds the production version of the app.
- `npm run start` or `yarn start`: Runs the production build.

---

## **Smart Contracts**

This frontend interacts with two smart contracts:

1. **MintableERC.sol**: 
   - Handles the minting of tokens and querying balances.
   - **Address**: `0x1234567890123456789012345678901234567890`

2. **ProxyLocation.sol**: 
   - Manages VPN server nodes and allows clients to pay for access.
   - **Address**: `0x0987654321098765432109876543210987654321`

**Note**: The contract ABIs are defined within the frontend code for simplicity but can be updated to fetch dynamically or imported from a centralized source.

---

## **Contributing**

Contributions are welcome! If you’d like to contribute, please fork the repository and make your changes in a new branch. Afterward, open a pull request describing your changes.

Steps to contribute:
1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License.
