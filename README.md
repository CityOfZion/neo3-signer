> ### ⚠️ This repository has been moved to [@CityOfZion/neon-dappkit](https://github.com/CityOfZion/neon-dappkit)
> Which has the same classes and methods, making migration very easy.

---

<p align="center">
  <img
    src=".github/resources/images/coz.png"
    width="200px;">
</p>

<p align="center">
  Neo3-Signer - A declarative Signing Spec.
  <br/> Made with ❤ by <b>COZ.IO</b>
</p>

# Neo3-Signer
Neo3-Signer is a specification of how clients can interact with different signer libraries such Neon-JS or WalletConnect.
Taking advantage of the declarative nature of the specification, the same code can be used with different signer libraries.

### Install
```bash
npm i @cityofzion/neo3-signer
```

### Documentation
Checkout the auto-generated [Docs](https://htmlpreview.github.io/?https://raw.githubusercontent.com/CityOfZion/neo3-signer/master/packages/neo3-signer/docs/modules.html)
based on the [Code](packages/neo3-signer/src/index.ts).

## Neon-Signer
Neon-Signer is a library that implements the Neo3-Signer specification and uses Neon-JS as the signer library. It should be used when the dApp developer doesn't need a wallet input from the final user. 

[Checkout the Docs](packages/neon-signer/README.md)

## Other Implementations
Any library can implement the Neo3-Signer specification, if you have an implementation, please create a PR to update this list.

- [WalletConnectSDK](https://github.com/CityOfZion/wallet-connect-sdk)
