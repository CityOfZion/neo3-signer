/**
 * A version enum that indicates how a message should be signed
 */
export enum Version {
  LEGACY = 1,
  DEFAULT,
  WITHOUT_SALT
}

/**
 * A simple type that defines the SignMessage payload, where Version.LEGACY is deprecated and Version.DEFAULT is NeoFS compatible and uses SALT, and Version.WITHOUT_SALT is NeoFS compatible and does not use SALT
 */
export type SignMessagePayload = {
  message: string,
  version?: Version
}

/**
 * A simple type that defines the Signed Message format
 */
export type SignedMessage = {
  /**
   * signer's public key
   */
  publicKey: string

  /**
   * encrypted message
   */
  data: string

  /**
   * salt used to encrypt
   */
  salt?: string

  /**
   * message hex
   */
  messageHex: string
}

/**
 * A simple interface that defines the Signing and Verifying methods
 */
export interface Neo3Signer {
  /**
   * Signs a message
   * @param params the params to send the request
   * @return the signed message object
   */
  signMessage(params: SignMessagePayload): Promise<SignedMessage>

  /**
   * Checks if the signedMessage is true
   * @param params an object that represents a signed message
   * @return true if the signedMessage is acknowledged by the account
   */
  verifyMessage (params: SignedMessage): Promise<boolean>

  /**
   * returns the address of the account, not as safe as using signMessage and getting the publicKey
   */
  getAccountAddress (): string | null
}
