const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;

        this.hash = this.calculateHash();
    }

    calculateHash() {
        // used for signing transaction
        return SHA256(this.from + this.to + this.amount).toString();
    }

    sign(keyPair) {
        if (keyPair.getPublic('hex') !== this.from) throw new Error('You cannot sign transaction for other wallet!');

        this.signature = keyPair.sign(this.hash, 'base64').toDER('hex');
    }

    isValid() {
        // checks if public key of sender address is the same as the transaction was signed with
        if (this.from === null) return true;

        if (!this.signature || this.signature.length == 0) throw new Error('Transaction has no signature!');

        const publicKey = ec.keyFromPublic(this.from, 'hex');
        return publicKey.verify(this.hash, this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // nonce is a random number used for generating a hash that satisfies the difficulty condition
    }

    calculateHash() {
        return SHA256(
            this.index
            + this.previousHash
            + this.timestamp
            + JSON.stringify(this.data)
            + this.nonce,
        ).toString();
    }

    mine(difficulty) {
        // proof-of-work implementation - basically, it's just a hash setter function with huge complexity
        // that stops people doing bad things with chain

        // proof of work is safety tool to avoid people adjusting the chain and creating too many blocks in the chain
        // difficulty in the example with bitcoin is the aim to create one block per minute,
        // it requires a hash of a block to begin with certain number of zeros in the beginning
        // for the case when compute is cheaper or better, difficulty will simply increase compensating for the fact
        while (this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")) {
            this.nonce += 1;
            this.hash = this.calculateHash();
        }
    }

    isValid() {
        // checks if hash of the transaction is correct and all transactions in the block are valid
        if (this.calculateHash() != this.hash) return false;

        for (const tx of this.transactions) {
            console.log(tx, typeof (tx));
            if (!tx.isValid()) return false;
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.difficulty = 5;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 50;
    }

    createGenesisBlock() {
        let genesis = new Block("01/01/2024", [], "0");
        genesis.mine(this.difficulty);
        return genesis
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx)

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mine(this.difficulty);

        console.log('Block successfully mined!')
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.from || !transaction.to) throw new Error('Transaction must have from and to addresses!')

        if (!transaction.isValid()) throw new Error('Transaction must be valid to add it to the chain!')

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.from == address) balance -= transaction.amount;
                if (transaction.to == address) balance += transaction.amount;
            }
        }

        return balance;
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1]

            if (previousBlock.hash != currentBlock.previousHash || !currentBlock.isValid()) return false;
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
