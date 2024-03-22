const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2024", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        // after we have set previousHash for a new block we must recalculate hash, cause the data in it is changed
        newBlock.hash = newBlock.calculateHash();
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
bchain.addBlock(new Block(1, "21/03/2024", { amount: 5 }));
bchain.addBlock(new Block(2, "22/03/2024", { amount: 10 }));

console.log('Is blockchain valid?', bchain.isChainValid())
console.log(JSON.stringify(bchain, null, 4));

bchain.chain[1].data = {amount: 300};
bchain.chain[1].hash = bchain.chain[2].calculateHash();
console.log('Is blockchain valid?', bchain.isChainValid())
