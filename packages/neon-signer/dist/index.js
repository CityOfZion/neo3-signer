"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonSigner = exports.Version = void 0;
const neo3_signer_1 = require("@cityofzion/neo3-signer");
Object.defineProperty(exports, "Version", { enumerable: true, get: function () { return neo3_signer_1.Version; } });
const neon_core_1 = require("@cityofzion/neon-core");
const randomBytes = require("randombytes");
const elliptic = require("elliptic");
const crypto = require("crypto");
class NeonSigner {
    constructor(account) {
        this.account = account;
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.version === neo3_signer_1.Version.LEGACY) {
                return this.signMessageLegacy(message.message);
            }
            else if (message.version === neo3_signer_1.Version.WITHOUT_SALT) {
                return this.signMessageWithoutSalt(message.message);
            }
            else {
                return this.signMessageDefault(message.message);
            }
        });
    }
    signMessageLegacy(message) {
        if (!this.account) {
            throw new Error('No account provided');
        }
        const salt = randomBytes(16).toString('hex');
        const parameterHexString = neon_core_1.u.str2hexstring(salt + message);
        const lengthHex = neon_core_1.u.num2VarInt(parameterHexString.length / 2);
        const messageHex = `010001f0${lengthHex}${parameterHexString}0000`;
        return {
            publicKey: this.account.publicKey,
            data: neon_core_1.wallet.sign(messageHex, this.account.privateKey),
            salt,
            messageHex
        };
    }
    signMessageDefault(message) {
        if (!this.account) {
            throw new Error('No account provided');
        }
        const salt = randomBytes(16).toString('hex');
        const messageHex = neon_core_1.u.str2hexstring(message);
        return {
            publicKey: this.account.publicKey,
            data: neon_core_1.wallet.sign(messageHex, this.account.privateKey, salt),
            salt,
            messageHex
        };
    }
    signMessageWithoutSalt(message) {
        if (!this.account) {
            throw new Error('No account provided');
        }
        const messageHex = neon_core_1.u.str2hexstring(message);
        return {
            publicKey: this.account.publicKey,
            data: neon_core_1.wallet.sign(messageHex, this.account.privateKey),
            messageHex
        };
    }
    verifyMessage(verifyArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            return neon_core_1.wallet.verify(verifyArgs.messageHex, verifyArgs.data, verifyArgs.publicKey);
        });
    }
    /**
     * returns the address of the account
     */
    getAccountAddress() {
        var _a, _b;
        return (_b = (_a = this.account) === null || _a === void 0 ? void 0 : _a.address) !== null && _b !== void 0 ? _b : null;
    }
    encrypt(message, publicKeys) {
        const curve = new elliptic.ec('p256');
        const messageBuffer = new TextEncoder().encode(message);
        return publicKeys.map((publicKey) => {
            const pub = curve.keyFromPublic(publicKey, 'hex').getPublic();
            const ephem = curve.genKeyPair();
            const ephemPublicKey = ephem.getPublic(true, 'hex');
            // create the shared ECHD secret
            const px = ephem.derive(pub);
            // hash the secret
            const hash = crypto.createHash('sha512').update(px.toString('hex')).digest();
            // define the initiation vector
            const iv = crypto.randomBytes(16);
            const encryptionKey = hash.subarray(0, 32);
            const macKey = hash.subarray(32);
            const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
            const firstChunk = cipher.update(messageBuffer);
            const secondChunk = cipher.final();
            const ciphertext = Buffer.concat([firstChunk, secondChunk]);
            const dataToMac = Buffer.concat([iv, Buffer.from(ephemPublicKey, 'hex'), ciphertext]);
            const hmacSha = crypto.createHmac('sha256', macKey).update(dataToMac).digest();
            const mac = Buffer.from(hmacSha);
            return {
                randomVector: iv.toString('hex'),
                cipherText: ciphertext.toString('hex'),
                dataTag: mac.toString('hex'),
                ephemPublicKey
            };
        });
    }
    decrypt(payload) {
        if (!this.account) {
            throw new Error('No account provided');
        }
        const curve = new elliptic.ec('p256');
        const ephemPublicKey = curve.keyFromPublic(payload.ephemPublicKey, 'hex');
        const privKey = curve.keyFromPrivate(this.account.privateKey, 'hex');
        const px = privKey.derive(ephemPublicKey.getPublic());
        const hash = crypto.createHash('sha512').update(px.toString('hex')).digest();
        const encryptionKey = hash.subarray(0, 32);
        // verify the hmac
        const macKey = hash.subarray(32);
        const dataToMac = Buffer.concat([Buffer.from(payload.randomVector, 'hex'), Buffer.from(payload.ephemPublicKey, 'hex'), Buffer.from(payload.cipherText, 'hex')]);
        const realMac = crypto.createHmac('sha256', macKey).update(dataToMac).digest();
        if (payload.dataTag !== realMac.toString('hex')) {
            throw new Error('invalid payload: hmac misalignment');
        }
        const cipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(payload.randomVector, 'hex'));
        const firstChunk = cipher.update(Buffer.from(payload.cipherText, 'hex'));
        const secondChunk = cipher.final();
        return new TextDecoder().decode(Buffer.concat([firstChunk, secondChunk]));
    }
    decryptFromArray(payloads) {
        for (let [index, payload] of payloads.entries()) {
            try {
                const message = this.decrypt(payload);
                return { message, keyIndex: index };
            }
            catch (e) {
                // do nothing
            }
        }
        throw new Error('Could not decrypt message from array');
    }
}
exports.NeonSigner = NeonSigner;
