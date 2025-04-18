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
    const nonce = new Date().getTime();
      const message = `Sign this message to verify ownership. Nonce: ${nonce}`;
      return message
  }

  export function ellipsify(str = "", len = 4) {
    if (str.length > 30) {
      return (
        str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
      );
    }
    return str;
  }

  export function formatLargeNumber(num: string | number): string {
    const str = num.toString();
    if (str.length <= 4) return str;
    
    const [whole, decimal] = str.split('.');
    const formattedWhole = whole.slice(0, 4) + '...';
    
    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  }