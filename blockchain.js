const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, Amount){   
        this.fromAddress = fromAddress;
        this.toAddress= toAddress;
        this.Amount = Amount;
    }

    calculatehash(){
        return SHA256(this.fromAddress + this.toAddress + this.Amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error("You cannot sign transactions for other wallets!")
        }

        const hashtx = this.calculatehash();
        const sig = signingKey.sign(hashtx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null){
            return true;
        }
        
        if(!this.signature || this.signature === 0){
            throw new Error("No signature in this Transaction");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculatehash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ""){;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculatehash();
    }

    calculatehash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    MineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculatehash();
        }

        console.log("Block mined : "+ this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5 ;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block("12/04/2025", "Genesis Block", 0)
    }

    getlatestblock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getlatestblock().hash);
        block.MineBlock(this.difficulty);

        console.log("Block Successfully Mined!");
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transactions must include From and To Address");
        }

        if(!transaction.isValid()){
            throw new Error("Cannot add Invalid Transactions into the Chain");
        }

        this.pendingTransactions.push(transaction)
    }

    getBalanceofAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                
                if(trans.fromAddress == address)
                {
                    balance -= trans.Amount
                }

                if(trans.toAddress == address)
                {
                    balance += trans.Amount
                }
            }
        }

        return balance
    }

    ischainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculatehash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;