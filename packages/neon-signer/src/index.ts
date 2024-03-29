import {Neo3Signer, SignMessagePayload, SignedMessage, Version, EncryptedPayload} from '@cityofzion/neo3-signer'
import { wallet, u } from '@cityofzion/neon-core'
import * as randomBytes from 'randombytes'
import * as elliptic from 'elliptic'
import * as crypto from 'crypto'

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

  encrypt(message: string, publicKeys: string[]) : EncryptedPayload[]{
    const curve = new elliptic.ec('p256')

    const messageBuffer = new TextEncoder().encode(message)

    return publicKeys.map((publicKey) => {
      const pub = curve.keyFromPublic(publicKey, 'hex').getPublic()
  
      const ephem = curve.genKeyPair()
      const ephemPublicKey = ephem.getPublic(true, 'hex')
  
      // create the shared ECHD secret
      const px = ephem.derive(pub)
  
      // hash the secret
      const hash = crypto.createHash('sha512').update(px.toString('hex')).digest()
    
      // define the initiation vector
      const iv = crypto.randomBytes(16)
      const encryptionKey = hash.subarray(0, 32)
      const macKey = hash.subarray(32)
  
      const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
      const firstChunk = cipher.update(messageBuffer)
      const secondChunk = cipher.final()
      const ciphertext = Buffer.concat([firstChunk, secondChunk])
  
      const dataToMac = Buffer.concat([iv, Buffer.from(ephemPublicKey, 'hex'), ciphertext])
  
      const hmacSha = crypto.createHmac('sha256', macKey).update(dataToMac).digest()
      const mac = Buffer.from(hmacSha)

      return {
        randomVector: iv.toString('hex'),
        cipherText: ciphertext.toString('hex'),
        dataTag: mac.toString('hex'),  
        ephemPublicKey
      }
    })
  }
  
  decrypt(payload: EncryptedPayload) : string {
    if (!this.account) {
      throw new Error('No account provided')
    }

    const curve = new elliptic.ec('p256')

    const ephemPublicKey = curve.keyFromPublic(payload.ephemPublicKey, 'hex')
    const privKey = curve.keyFromPrivate(this.account.privateKey, 'hex')

    const px = privKey.derive(ephemPublicKey.getPublic())
    const hash = crypto.createHash('sha512').update(px.toString('hex')).digest()
    const encryptionKey = hash.subarray(0, 32)

    // verify the hmac
    const macKey = hash.subarray(32)
    const dataToMac = Buffer.concat([Buffer.from(payload.randomVector, 'hex'), Buffer.from(payload.ephemPublicKey, 'hex'), Buffer.from(payload.cipherText, 'hex')])
    const realMac = crypto.createHmac('sha256', macKey).update(dataToMac).digest()

    if (payload.dataTag !== realMac.toString('hex')) {
      throw new Error('invalid payload: hmac misalignment')
    }

    const cipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(payload.randomVector, 'hex'))
    const firstChunk = cipher.update(Buffer.from(payload.cipherText, 'hex'))
    const secondChunk = cipher.final()
    return new TextDecoder().decode(Buffer.concat([firstChunk, secondChunk]))
  }

  decryptFromArray(payloads: EncryptedPayload[]) : { message: string, keyIndex: number } {    
    for (let [index, payload] of payloads.entries()) {
      try {
        const message = this.decrypt(payload)
        return { message, keyIndex: index }
      } catch (e) {
        // do nothing
      }
    }

    throw new Error('Could not decrypt message from array')
  }
}
