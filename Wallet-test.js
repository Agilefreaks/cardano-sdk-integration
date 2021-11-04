const { WalletServer, Seed, AddressWallet } = require('cardano-wallet-js');
require('dotenv').config()
let walletServer = WalletServer.init(process.env.CARDANO_API);
let recoveryPhrase = process.env.WALLET_RECOVERY_PHRASE;


async function getNetworkInfo() {
    let information = await walletServer.getNetworkInformation();
    console.log(information);
}

async function getNetworkParameters() {
    let parameters = await walletServer.getNetworkParameters();
    console.log(parameters);
}


async function createWallet(passphrase, name) {
    let mnemonic_sentence = Seed.toMnemonicList(recoveryPhrase);
    let walletName = `${name}s-wallet`;
        
    await walletServer.createOrRestoreShelleyWallet(walletName, mnemonic_sentence, passphrase);
    console.log(`${walletName} was created. Insert the following Recovery phrase '${recoveryPhrase}' into the .env File!`);
}

async function getWallet(walletIndex) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletIndex].id;
    return await walletServer.getShelleyWallet(walletID);
}

async function seeAllWallets() {
    allWallets = await walletServer.wallets()
    wallets = allWallets.map((w,i) => {
        return { index: i, id: w.id, name: w.name }
    });
    console.log(wallets);

}

async function deleteWallet(walletNumber) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    let wallet = await walletServer.getShelleyWallet(walletID);
    response = await wallet.delete();
    console.log(response);
}

function getRecoveryPhrase() {
    let recoveryPhrase = Seed.generateRecoveryPhrase();
    console.log(recoveryPhrase);
    let words = Seed.toMnemonicList(recoveryPhrase);
    console.log(words);
}

async function seeWalletAddresses(walletNumber) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    let wallet = await walletServer.getShelleyWallet(walletID);
    let addresses = await wallet.getAddresses();

    console.log(addresses);
}

async function getWalletBalance(walletNumber) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    let wallet = await walletServer.getShelleyWallet(walletID);
    let availableBalance = wallet.getAvailableBalance();
    
    console.log(availableBalance);
}

async function sendPayment(walletNumber, receiver, amount) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    let wallet = await walletServer.getShelleyWallet(walletID);
    let receiverAddress = [new AddressWallet(receiver)];
    response = await wallet.sendPayment('cardanoexpert', receiverAddress, [amount]);
    console.log(response);
    console.log(`Sent ${amount} ADA from ${wallet} to ${receiverAddress}`);
}

async function getWalletTransactions(walletIndex) {
    console.log(await (await getWallet(walletIndex)).getTransactions());
}


// deleteWallet(5);
// createWallet('cardanoexpert', 'Adi');
// seeAllWallets();
// getNetworkInfo();
// getRecoveryPhrase();
// getNetworkParameters()
//seeWalletAddresses(0);
// getWalletBalance(0);


// sendPayment(0,'addr_test1qpptryt4jruzxekfnuf9h4syykl9z0u8sre2lssu099yghsfh5y0dmlysk2sa68n02ex349vmlh9sgwugqjgn76hv8kqaz4tf8', 1_000_000)
getWalletTransactions(0);