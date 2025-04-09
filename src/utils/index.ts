import { PublicKey } from "@hermis/solana-headless-core";
import nacl from "tweetnacl";

export const verifySignedMessage = (
    message: string,
    signature: Uint8Array,
    publicKey: string
  ): boolean => {
    const messageUint8 = new TextEncoder().encode(message);
    const publicKeyUint8 = new PublicKey(publicKey).toBytes();
  
    return nacl.sign.detached.verify(messageUint8, signature, publicKeyUint8);
  };
  
  export const generateMessage = (): string => {
    const nonce = new Date().getTime(); // Unique timestamp-based nonce
      const message = `Sign this message to verify ownership. Nonce: ${nonce}`;
      return message
  }