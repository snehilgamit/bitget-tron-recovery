# Bitget Wallet — Tron Address Recovery

> Recover Tron (TRX/USDT-TRC20) addresses lost after updating Bitget Wallet.

## What Happened?

After updating Bitget Wallet, your Tron address changed — but ETH and BNB stayed the same. Even with the correct seed phrase, the old address couldn't be found.

**Root cause:** Old Bitget Wallet used `bitcore-mnemonic` for Tron key derivation. The new version uses `bip39` + `ethereumjs-wallet`. These two libraries produce completely different private keys from the same seed phrase and derivation path (`m/44'/195'/0'/0/0`).

This was discovered by decompiling the old Bitget Wallet APK and finding this code in the JS bundle:

```js
// Old Bitget Wallet — bitcore-mnemonic
new Mnemonic(mnemonic).toHDPrivateKey().derive("m/44'/195'/0'/0/0").privateKey.toString('hex')
```

Standard recovery tools use `bip39`, so they generate a different key — which is why scanning 10,000+ indexes across multiple paths finds nothing.

---

## Recovery Options

### Option 1: Browser Tool (Easiest)

Open `index.html` in your browser.

> **For security:** Download the file, disconnect your internet, then open it locally. Your seed phrase never leaves your device.

### Option 2: Node.js Script

```bash
git clone https://github.com/your-username/bitget-tron-recovery
cd bitget-tron-recovery
npm install
node recover.js
```

The script will prompt you for your seed phrase and optionally your old Tron address. It will derive addresses using `bitcore-mnemonic` and output the matching private key.

---

## After Recovery

Once you have the private key:

1. Install [TronLink](https://www.tronlink.org/)
2. Import Wallet → Private Key
3. Confirm your old address appears
4. Transfer funds to your new Bitget Wallet Tron address
5. Store the private key securely offline

---

## Security

- The Node.js script runs fully offline
- The browser tool is 100% client-side — no server, no requests
- Never share your seed phrase or private key with anyone
- Delete any files containing your seed phrase after recovery

---

## Who This Affects

Any user who:
- Created a Tron wallet in an older version of Bitget Wallet (before the `bip39` migration)
- Updated the app
- Can no longer see or transact from their original TRX/USDT-TRC20 address

---

## Technical Details

| | Old Bitget Wallet | New Bitget Wallet |
|---|---|---|
| Library | `bitcore-mnemonic` | `bip39` + `ethereumjs-wallet` |
| Derivation Path | `m/44'/195'/0'/0/0` | `m/44'/195'/0'/0/0` |
| Result | Different address ❌ | Current address ✅ |

Same path string, different underlying seed derivation — silent breaking change with no migration tool or documentation.

---

## Disclaimer

This tool is provided for personal wallet recovery only. Always verify addresses before transferring funds. The author is not responsible for any loss of funds.