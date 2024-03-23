const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { Blockchain, Transaction } = require('./blockchain');

const keyPair = ec.keyFromPrivate('e3779dbd5e04dc6bc6b14b209aa8ddc767aa79c7558c8c5f2e2fd3d386ac04bf');
const walletAddress = keyPair.getPublic('hex');

let chain = new Blockchain();

const tx1 = new Transaction(walletAddress, 'some-public-key', 10);
tx1.sign(keyPair);
chain.addTransaction(tx1);

console.log('\nStarting the miner...');
chain.minePendingTransactions(walletAddress);

console.log('\nBalance of the wallet is', chain.getBalanceOfAddress(walletAddress));
console.log('\nIs chain valid?', chain.isValid());
