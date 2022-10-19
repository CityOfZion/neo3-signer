import { Neo3Signer, SignMessagePayload, SignedMessage } from '@cityofzion/neo3-signer';
import { wallet } from '@cityofzion/neon-core';
export declare class NeonSigner implements Neo3Signer {
    account?: wallet.Account;
    constructor(account?: wallet.Account);
    signMessage(message: SignMessagePayload): Promise<SignedMessage>;
    signMessageLegacy(message: string): SignedMessage;
    signMessageNew(message: string): SignedMessage;
    verifyMessage(verifyArgs: SignedMessage): Promise<boolean>;
    /**
     * returns the address of the account
     */
    getAccountAddress(): string | null;
}
