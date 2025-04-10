// "use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { BellIcon } from "lucide-react";
import SelectWallet from "./SelectWallet";
import { ellipsify, generateMessage, verifySignedMessage } from "@/utils"; // move to hermis lib
import {
  useAnchorWallet,
  useConnection,
  // useSolanaBalance,
  useWallet
} from "@hermis/solana-headless-react";
import { PublicKey } from "@hermis/solana-headless-core";
import { WalletName } from "@solana/wallet-adapter-base";
import useWalletStore from '@/store/walletStore';
import { initializeDriftClient } from '@/utils/driftUtils';
import useDriftStore from '@/store/driftStore';
import useSubaccountStore from '@/store/subaccountStore';

//handle wallet balance fixed to 2 decimal numbers without rounding
export function toFixed(num: number, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)![0];
}

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

  // const { balance } = useSolanaBalance(publicKey)
  const [open, setOpen] = useState<boolean>(false);
  // const [balance, setBalance] = useState<number | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState<string>("");

  useEffect(() => {
    console.log(wallets);

    if (!connection || !publicKey) {
      return;
    }

  }, [publicKey, connection]);
  const {
    setPublicKey,
    setConnected,
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

  // Sync wallet state with our store
  useEffect(() => {
    if (publicKey) {
      // setPublicKey(publicKey);
      // setConnected(connected);

      // Initialize Drift client when wallet connects
      if (connected && wallet) {
        // initDriftClient();
        // initializeDriftClient(publicKey).then(client => {
        //   setDriftClient(client.driftClient);
        // }).catch(error => {
        //   console.error('Failed to initialize Drift client:', error);
        // });
      }
    }
  }, [publicKey, connected, setPublicKey, setConnected, setDriftClient, wallet]);


  const handleWalletSelect = async (walletName: WalletName) => {
    await select(walletName);
    const connectedAdapter = await connect();
    const selectedAdapterPublickey = connectedAdapter.publicKey
    // const isConnected = connectedAdapter.connected
    // console.log("COnnected Status", isConnected);
    // console.log("Sign Message", signMessage);
    // console.log("public Key", publicKey);
    // console.log("hook connected", connected);

    if (!signMessage || !selectedAdapterPublickey) return
    const message = generateMessage()
    const messageBytes = new TextEncoder().encode(message);
    const signature = await signMessage(messageBytes);
    const signatureMatched = verifySignedMessage(message, signature, selectedAdapterPublickey.toBase58())
    console.log('is True', signatureMatched);
    if (signatureMatched) {
      setPublicKey(new PublicKey('arbJEWqPDYfgTFf3CdACQpZrk56tB6z7hPFc6K9KLUi'));
      // setPublicKey(selectedAdapterPublickey);
      setConnected(true);
      await initDriftClient();
      // initializeDriftClient(selectedAdapterPublickey).then(client => {
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
    
    console.log('wallet', wallet);
    
    // if (!wallet) return;
    initializeDriftClient(
      // connection, 
      // wallet
      new PublicKey('arbJEWqPDYfgTFf3CdACQpZrk56tB6z7hPFc6K9KLUi')
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

  const handleOpenModal = () => {
    setOpen(true);
  }


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
                {/* <Button className="bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px] md:h-[60px] border-2 border-white font-slackey z-50">
                </Button> */}
              </DialogTrigger>
            </>
          ) : (
            <>
              {/* <Button className="bg-neutral-3 hover:bg-neutral-3 w-[37px] h-[37px] text-black hidden lg:flex">
                <BellIcon size={32} />
              </Button> */}

              {/* user Dropdown */}
              <Button onClick={handleDisconnect} className="bg-accent-9 text-white">
                {ellipsify(publicKey?.toBase58())}
              </Button>
              {/* <div className="relative w-[50px] z-[1000]">
                <div className="lg:w-[399px] w-[calc(100vw-32px)] max-w-[399px]  h-[20px] lg:right-0 right-[-50px]">
                </div>
              </div> */}
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