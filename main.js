const{BlockChain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate("366a6ef8e77261241ff4a29c4db250989abebc7eca45f1dd6816aab247909487");
const myWalletAddress = myKey.getPublic('hex');

let Nakamacoin = new BlockChain();

const tx1 = new Transaction(myWalletAddress, "publicAddress2", 10);
tx1.signTransaction(myKey);
Nakamacoin.addTransaction(tx1)

console.log("\nStarting the Miner...");
Nakamacoin.minePendingTransactions(myWalletAddress);

console.log("The Nonce of the Block created : ", Nakamacoin.chain[1].nonce);
console.log("Is the Chain Valid? : ", Nakamacoin.ischainValid());
console.log("\nBalance of Miner is ", Nakamacoin.getBalanceofAddress(myWalletAddress));

console.log("\nStarting the Miner...");
Nakamacoin.minePendingTransactions(myWalletAddress);

console.log("The Nonce of the Block created : ", Nakamacoin.chain[2].nonce);
console.log("Is the Chain Valid? : ", Nakamacoin.ischainValid());
console.log("\nBalance of Miner is ", Nakamacoin.getBalanceofAddress(myWalletAddress));

