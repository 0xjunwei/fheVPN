```
vpn-extension/
│
├── src/
│   ├── background.ts        # Handles VPN connection, proxy setup
│   ├── popup.ts             # Manages MetaMask connection and payment
│   ├── vpn.ts               # Contains VPN connection logic
│   ├── styles.css           # Optional: Styling for popup UI
│   ├── popup.html           # Popup UI for the extension
│   └── manifest.json        # Extension metadata and permissions
├── package.json             # Dependencies and build scripts
├── tsconfig.json            # TypeScript configuration
└── webpack.config.js        # Webpack config to bundle the project
```


pnpm i 
pnpm run build