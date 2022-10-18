<p align="center">
  <img
    src="../../.github/resources/images/coz.png"
    width="200px;">
</p>

<p align="center">
  Neon-Signer - A Neo3-Signer implementation using Neon-JS
  <br/> Made with ❤ by <b>COZ.IO</b>
</p>

# Neon-Signer

## Install

```bash
npm i @cityofzion/neon-signer
```

## Initialize NeonSigner
To use NeonSigner as a Neo3Signer you can simply call `NeonSigner.init` and pass the `NeonSigner` instance to the SDK that requires a `Neo3Signer`.

To sign the transactions you should pass an account to the `NeonSigner.init` method. You can use the `Account` class from `@cityofzion/neon-core` to create an account.
```ts
import { NeonSigner } from '@cityofzion/neon-signer'
import {default as Neon} from '@cityofzion/neon-js'

const acct = Neon.create.account('NKuyBkoGdZZSLyPbJEetheRhMjeznFZszf')

const neonSigner: Neo3Signer = await NeonSigner.init(NeonSigner.MAINNET, acct)
```

If you don't want to sign, simply don't pass an account.
```ts
import { NeonSigner } from '@cityofzion/neon-signer'

const neonSigner: Neo3Signer = await NeonSigner.init(NeonSigner.MAINNET)
```

You can also pass a custom RPC endpoint to the `NeonSigner.init` method.

Another example of initialization is:
```ts
const neonSigner: Neo3Signer = await NeonSigner.init('http://127.0.0.1:5001', acct)
```

## Usage
The usage of NeonSigner is documented in the [Neo3-Signer Docs](https://htmlpreview.github.io/?https://raw.githubusercontent.com/CityOfZion/neo3-signer/master/packages/neo3-signer/docs/modules.html).
