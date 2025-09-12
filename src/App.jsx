import React, { useState } from "react";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

const network = WalletAdapterNetwork.Mainnet;
const endpoint = clusterApiUrl(network);

function TokenCreator() {
  const { publicKey, signTransaction } = useWallet();
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [supply, setSupply] = useState(1000000);

  const handleCreate = async () => {
    if (!publicKey) {
      alert("⚠️ Connect Phantom wallet dulu!");
      return;
    }

    try {
      const connection = new Connection(endpoint, "confirmed");

      // buat mint baru
      const payer = Keypair.generate();
      const mint = await createMint(
        connection,
        payer,
        publicKey, // mint authority
        publicKey, // freeze authority
        decimals
      );

      // buat ATA (Associated Token Account)
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        publicKey
      );

      // mint supply ke wallet
      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        publicKey,
        supply * Math.pow(10, decimals)
      );

      alert(`🎉 Token Created!\nMint Address: ${mint.toBase58()}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">🚀 Solana Token Generator</h1>
      <input
        type="text"
        placeholder="Token Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="border p-2 rounded mb-2"
      />
      <input
        type="number"
        placeholder="Decimals (default 9)"
        value={decimals}
        onChange={(e) => setDecimals(Number(e.target.value))}
        className="border p-2 rounded mb-2"
      />
      <input
        type="number"
        placeholder="Total Supply"
        value={supply}
        onChange={(e) => setSupply(Number(e.target.value))}
        className="border p-2 rounded mb-2"
      />
      <button
        onClick={handleCreate}
        className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
      >
        Create Token
      </button>
    </div>
  );
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex justify-end p-4">
            <WalletMultiButton />
          </div>
          <TokenCreator />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
