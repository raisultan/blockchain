const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
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
    }

    createGenesisBlock() {
        let genesis = new Block(0, "01/01/2024", "Genesis block", "0");
        genesis.mine(this.difficulty);
        return genesis
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        // after we have set previousHash for a new block we must recalculate hash, cause the data in it is changed
        newBlock.mine(this.difficulty); // mine is used to set hash for a block
        this.chain.push(newBlock);
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

let bchain = new Blockchain();
console.log('Mining block 1...')
bchain.addBlock(new Block(1, "21/03/2024", { amount: 5 }));
console.log('Mining block 2...')
bchain.addBlock(new Block(2, "22/03/2024", { amount: 10 }));

console.log('Is blockchain valid?', bchain.isChainValid())
console.log(JSON.stringify(bchain, null, 4));

bchain.chain[1].data = { amount: 300 };
bchain.chain[1].hash = bchain.chain[2].calculateHash();
console.log('Is blockchain valid?', bchain.isChainValid())

// proof of work is safety tool to avoid people adjusting the chain and creating too many blocks in the chain
// difficulty in the example with bitcoin is the aim to create one block per minute,
// it requires a hash of a block to begin with certain number of zeros in the beginning
// for the case when compute is cheaper or better, difficulty will simply increase compensating for the fact
