const ChainUtil = require('../chain-util');

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.output = [];
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.output.find(output => output.address === senderWallet.publicKey);
        
        if (amount > senderOutput.amount) {
            console.log(`Amount: ${amount} exceeds balance`);
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.output.push({ amount, address: recipient });
        Transaction.signTransaction(this, senderWallet);

        return this;
    }


    static newTransaction(senderWallet, recipient, amount) {
        const transaction = new this();

        if (amount > senderWallet.balance) { 
            console.log(`Amount: ${amount} exceeds balance`);
            return;
        }
        transaction.output.push(...[
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            { amount, address: recipient }
        ])
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.output))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.output)
        );
    }
}

module.exports = Transaction;