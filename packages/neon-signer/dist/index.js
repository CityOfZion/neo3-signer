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
exports.NeonSigner = void 0;
const neon_core_1 = require("@cityofzion/neon-core");
const randomBytes = require("randombytes");
class NeonSigner {
    constructor(account) {
        this.account = account;
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.version === 1) {
                return this.signMessageLegacy(message.message);
            }
            else {
                return this.signMessageNew(message.message);
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
    signMessageNew(message) {
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
}
exports.NeonSigner = NeonSigner;
