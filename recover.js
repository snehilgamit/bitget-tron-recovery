/**
 * Bitget Wallet — Tron Address Recovery Script
 *
 * Root cause: Old Bitget Wallet used `bitcore-mnemonic` for Tron key derivation.
 * New versions use `bip39` + `ethereumjs-wallet`, which produces a different
 * private key from the same seed phrase — even on the same derivation path.
 *
 * Usage:
 *   npm install
 *   node recover.js
 */

import readline from 'readline';
import Mnemonic from 'bitcore-mnemonic';
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

function deriveAddress(mnemonic, index = 0) {
  const mn = new Mnemonic(mnemonic.trim());
  const path = `m/44'/195'/0'/0/${index}`;
  const privateKey = mn.toHDPrivateKey().derive(path).privateKey.toString('hex');
  const address = tronWeb.address.fromPrivateKey(privateKey);
  return { address, privateKey, path };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║      Bitget Wallet — Tron Recovery Tool          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log('⚠️  Run this script OFFLINE for maximum security.\n');

  const mnemonic = await ask('Enter your seed phrase (12 or 24 words):\n> ');
  const targetInput = await ask('\nEnter your old Tron address (press Enter to preview first 5):\n> ');
  const target = targetInput.trim();

  console.log('\nDeriving addresses...\n');

  if (target) {
    let found = false;
    for (let i = 0; i < 20; i++) {
      const { address, privateKey, path } = deriveAddress(mnemonic, i);
      if (address === target) {
        console.log(`✅ FOUND at index ${i} (${path})`);
        console.log(`   Address:     ${address}`);
        console.log(`   Private Key: ${privateKey}`);
        console.log('\nImport this private key into TronLink to access your funds.');
        found = true;
        break;
      }
    }
    if (!found) {
      console.log('❌ Address not found in first 20 indexes.');
    }
  } else {
    console.log('First 5 derived Tron addresses:\n');
    for (let i = 0; i < 5; i++) {
      const { address, path } = deriveAddress(mnemonic, i);
      console.log(`  [${i}] ${address}  (${path})`);
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});