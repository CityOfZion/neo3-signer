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
To use NeonSigner you should pass an account to the `NeonSigner` constructor. You can use the `Account` class from `@cityofzion/neon-js` to create an account.
```ts
import { NeonSigner } from '@cityofzion/neon-signer'
import {default as Neon} from '@cityofzion/neon-js'

const acct = Neon.create.account('NKuyBkoGdZZSLyPbJEetheRhMjeznFZszf')

const neonSigner: Neo3Signer = new NeonSigner(acct)
```

## Usage
The usage of NeonSigner is documented in the [Neo3-Signer Docs](https://htmlpreview.github.io/?https://raw.githubusercontent.com/CityOfZion/neo3-signer/master/packages/neo3-signer/docs/modules.html).
