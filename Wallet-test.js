const { WalletServer, Seed } = require('cardano-wallet-js');
let walletServer = WalletServer.init('http://192.168.0.246:8090/v2');

async function getNetworkInfo() {
    let information = await walletServer.getNetworkInformation();
    console.log(information);
}

async function getNetworkParameters() {
    let parameters = await walletServer.getNetworkParameters();
    console.log(parameters);
}

function getRecoveryPhrase() {
    let recoveryPhrase = Seed.generateRecoveryPhrase();
    let words = Seed.toMnemonicList(recoveryPhrase);
    console.log(words);
}

async function createWallet(passphrase, name) {
    let recoveryPhrase = Seed.generateRecoveryPhrase();
    let mnemonic_sentence = Seed.toMnemonicList(recoveryPhrase);
    let walletName = `${name}s-wallet`;
        
    await walletServer.createOrRestoreShelleyWallet(walletName, mnemonic_sentence, passphrase);
    console.log(`${walletName} was created. Insert the following Recovery phrase '${recoveryPhrase}' into the .env File!`);
}

async function seeAllWallets() {
    console.log(await walletServer.wallets());
}

async function deleteWallet(walletNumber) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    console.log(walletID);
    let wallet = await walletServer.getShelleyWallet(walletID);
    console.log(wallet);
    wallet.delete;
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


createWallet('cardanoexpert', 'Edi');
// deleteWallet(0);
//seeAllWallets();
// getNetworkInfo();
// getNetworkParameters()
//seeWalletAddresses(0);
//getWalletBalance(0);

