import React, { FC } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import HorizontalRule from "./ui/HorizontalRule";
import { Wallet } from "@hermis/solana-headless-react";
import { WalletName } from "@solana/wallet-adapter-base";

interface SelectWalletProp {
  wallets: Wallet[];
  handleWalletSelect: (value: WalletName) => Promise<void>;
}

const SelectWallet: FC<SelectWalletProp> = ({
  wallets,
  handleWalletSelect,
}) => {
  return (
    <DialogContent id="select-wallet-modal" className="px-0 max-w-[567px] w-[calc(100%-2rem)] lg:w-[50%] bg-[#111827] border border-neutral-3 shadow-sm rounded-lg">
      <DialogHeader className="px-6">
        <DialogTitle className="text-neutral-12 font-bold">
          Connect wallet
        </DialogTitle>
        <DialogDescription className="text-neutral-11 Select a wallet to connect to">
          Select a wallet to connect to
        </DialogDescription>
      </DialogHeader>

      <HorizontalRule />

      <div className="flex w-full py-">
        <div className="flex flex-col gap-y-6 justify-start w-full max-h-[300px] overflow-y-auto ">
          {wallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              variant={"ghost"}
              className="hover:bg-transparent hover:text-white p-6 text-[20px] text-white flex w-full justify-center items-center "
            >
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                  <div className="flex">
                    <Image
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      height={30}
                      width={30}
                    />
                  </div>
                  <div className="text-neutral-12 font-semibold text-base">
                    {wallet.adapter.name}
                  </div>
                </div>
                {wallet.readyState === "Installed" && (
                  <p className="text-sm font-medium text-neutral-11">
                    Detected
                  </p>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </DialogContent>
  );
};

export default SelectWallet;
