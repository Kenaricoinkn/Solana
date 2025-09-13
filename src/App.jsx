import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";

function Content() {
  const [status, setStatus] = useState("");

  const createToken = async () => {
    try {
      setStatus("🔄 Membuat token...");

      const provider = window.solana;
      if (!provider || !provider.isPhantom) {
        setStatus("❌ Phantom wallet tidak ditemukan.");
        return;
      }

      // connect wallet
      const resp = await provider.connect();
      const owner = new PublicKey(resp.publicKey.toString());

      const connection = new window.solanaWeb3.Connection(
        clusterApiUrl("mainnet-beta"),
        "confirmed"
      );

      // Phantom tidak expose keypair langsung, jadi gunakan provider.signTransaction
      // => cara aman: buat backend untuk handle signing (lebih secure)
      // Untuk demo: hanya bisa mint token jika Phantom bisa approve transaksi SPL
      setStatus(
        `✅ Wallet ${owner.toBase58()} terhubung. Silakan lanjut buat token lewat SPL tools.`
      );
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Solana Token Generator</h1>
      <WalletMultiButton />
      <br />
      <button onClick={createToken} style={{ marginTop: "1rem" }}>
        🚀 Buat Token
      </button>
      <p>{status}</p>
    </div>
  );
}

function App() {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Content />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
