import {Neo3Signer, SignMessagePayload, SignedMessage, Version} from '@cityofzion/neo3-signer'
import { wallet, u } from '@cityofzion/neon-core'
import * as randomBytes from 'randombytes'

export { Version }

export class NeonSigner implements Neo3Signer {
  public constructor (public account?: wallet.Account) {
  }

  async signMessage(message: SignMessagePayload): Promise<SignedMessage> {
    if (message.version === Version.LEGACY) {
      return this.signMessageLegacy(message.message)
    } else if(message.version === Version.WITHOUT_SALT) {
      return this.signMessageWithoutSalt(message.message)
    } else {
      return this.signMessageDefault(message.message)
    }
  }

  signMessageLegacy(message: string): SignedMessage {
    if (!this.account) {
      throw new Error('No account provided')
    }

    const salt = randomBytes(16).toString('hex')
    const parameterHexString = u.str2hexstring(salt + message)
    const lengthHex = u.num2VarInt(parameterHexString.length / 2)
    const messageHex = `010001f0${lengthHex}${parameterHexString}0000`

    return {
      publicKey: this.account.publicKey,
      data: wallet.sign(messageHex, this.account.privateKey),
      salt,
      messageHex
    }
  }

  signMessageDefault (message: string): SignedMessage {
    if (!this.account) {
      throw new Error('No account provided')
    }

    const salt = randomBytes(16).toString('hex')
    const messageHex = u.str2hexstring(message)

    return {
      publicKey: this.account.publicKey,
      data: wallet.sign(messageHex, this.account.privateKey, salt),
      salt,
      messageHex
    }
  }

  signMessageWithoutSalt (message: string): SignedMessage {
    if (!this.account) {
      throw new Error('No account provided')
    }
    const messageHex = u.str2hexstring(message)

    return {
      publicKey: this.account.publicKey,
      data: wallet.sign(messageHex, this.account.privateKey),
      messageHex
    }
  }

  async verifyMessage (verifyArgs: SignedMessage): Promise<boolean> {
    return wallet.verify(verifyArgs.messageHex, verifyArgs.data, verifyArgs.publicKey)
  }

  /**
   * returns the address of the account
   */
  getAccountAddress (): string | null {
    return this.account?.address ?? null
  }
}
