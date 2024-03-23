const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(from, to, amount){
        this.from = from;
        this.to = to;
        this.amount = amount;
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
}

class Blockchain {
    constructor() {
        this.difficulty = 5;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        let genesis = new Block("01/01/2024", "Genesis block", "0");
        genesis.mine(this.difficulty);
        return genesis
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.previousHash = this.getLatestBlock().hash;
        block.mine(this.difficulty);

        console.log('Block successfully mined!')
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const transaction of block.transactions){
                if(transaction.from == address) balance -= transaction.amount;
                if(transaction.to == address) balance += transaction.amount;
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            let currentBlock = this.chain[i];
            let previousBlock = this.chain[i - 1]
            if (currentBlock.calculateHash() != currentBlock.hash) {
                return false;
            }
            if (previousBlock.hash != currentBlock.previousHash) {
                return false;
            }
        }

        return true;
    }
}

let chain = new Blockchain();
chain.addTransaction(new Transaction('address1', 'address2', 100));
chain.addTransaction(new Transaction('address2', 'address1', 50));

console.log('\nStarting the miner...');
chain.minePendingTransactions('address3');

// in order for reward to appear in miner's wallet someone has to mine the reward transaction which is in pendings
chain.minePendingTransactions('address4');

console.log('\nBalance of address3 is', chain.getBalanceOfAddress('address3'));
console.log('\nIs chain valid?', chain.isChainValid());
