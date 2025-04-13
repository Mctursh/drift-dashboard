// "use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import SelectWallet from "./SelectWallet";
import { ellipsify, generateMessage, verifySignedMessage } from "@/utils"; // move to hermis lib
import {
  useAnchorWallet,
  useConnection,
  useWallet
} from "@hermis/solana-headless-react";

import { WalletName } from "@solana/wallet-adapter-base";
import useWalletStore from '@/store/walletStore';
import { initializeDriftClient } from '@/utils/driftUtils';
import useDriftStore from '@/store/driftStore';
import useSubaccountStore from '@/store/subaccountStore';

const WalletConnection = () => {
  const { connection } = useConnection();
  const {
    select,
    wallets,
    publicKey,
    disconnect,
    connected,
    connecting,
    signMessage,
    connect,

  } = useWallet();

  const [open, setOpen] = useState<boolean>(false);

  const {
    setPublicKey,
    setConnected,
    setWallet,
    disconnect: storeDisconnect
  } = useWalletStore();

  const {
    setDriftClient,
    resetDriftState,
    setUserMap,
    setMarkets
  } = useDriftStore();

  const wallet = useAnchorWallet();

  const { resetSubaccountState } = useSubaccountStore();

  useEffect(() => {
    if (wallet) {
      initDriftClient();
    }
  }, [wallet]);


  const handleWalletSelect = async (walletName: WalletName) => {
    await select(walletName);
    const connectedAdapter = await connect();
    const selectedAdapterPublickey = connectedAdapter.publicKey

    if (!signMessage || !selectedAdapterPublickey) return
    const message = generateMessage()
    const messageBytes = new TextEncoder().encode(message);
    const signature = await signMessage(messageBytes);
    const signatureMatched = verifySignedMessage(message, signature, selectedAdapterPublickey.toBase58())
    console.log('is True', signatureMatched);
    if (signatureMatched) {
      // setPublicKey(new PublicKey('arbJEWqPDYfgTFf3CdACQpZrk56tB6z7hPFc6K9KLUi'));
      setWallet(wallets.find(w => w.adapter.connected) || null);
      setPublicKey(selectedAdapterPublickey);
      setConnected(true);
    }




    let signatureBase64: string;
    try {
      signatureBase64 = btoa(String.fromCharCode.apply(null, Array.from(signature)));
    } catch (error) {
      signatureBase64 = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    console.log('Signed Message Signature', signatureBase64);
    setOpen(false);
  };

  const initDriftClient = async () => {
    if (!wallet) return;
    initializeDriftClient(
      connection, 
      wallet
      // new PublicKey('arbJEWqPDYfgTFf3CdACQpZrk56tB6z7hPFc6K9KLUi')
    ).then(client => {
      console.log('client', client);
      setDriftClient(client.driftClient);
      setUserMap(client?.userMap || null);
      setMarkets(client?.markets || null);
    })
    .catch(error => {
      console.error('Failed to initialize Drift client:', error);
    });
  }

  const handleDisconnect = async () => {
    await disconnect();
    storeDisconnect();
    resetDriftState();
    resetSubaccountState();
  };


  return (
    <div className="text-white">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2 items-center">
          {!publicKey || !connected ? (
            <>
              <DialogTrigger asChild>
                <Button className="bg-accent-9 text-white">
                  {connecting ? "connecting..." : "Connect Wallet"}
                </Button>
              </DialogTrigger>
            </>
          ) : (
            <>
              <Button onClick={handleDisconnect} className="bg-accent-9 text-white">
                {ellipsify(publicKey?.toBase58())}
              </Button>
            </>
          )}

          <SelectWallet
            wallets={wallets}
            handleWalletSelect={handleWalletSelect}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WalletConnection;