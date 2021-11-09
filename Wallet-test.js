const { WalletServer, Seed, AddressWallet, AssetWallet, TokenWallet } = require('cardano-wallet-js');
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
    let abc= await walletServer.getShelleyWallet(walletID);

    console.log(abc);
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

async function getWalletAddress(walletNumber, addressIndex) {
    let wallets = await walletServer.wallets();
    let walletID = wallets[walletNumber].id;
    let wallet = await walletServer.getShelleyWallet(walletID);
    let address = (await wallet.getAddresses())[addressIndex];

    return address;
}

async function createNativeToken() {
    let address = await getWalletAddress(0, 0);

    let keyPair= Seed.generateKeyPair();
    let policyVKey = keyPair.publicKey;

    let keyHash = Seed.getKeyHash(policyVKey);
    let script = Seed.buildSingleIssuerScript(keyHash);

    //generate policy id
    let scriptHash = Seed.getScriptHash(script);
    let policyId = Seed.getPolicyId(scriptHash);

    let data = {};
    let tokenData = {}
    tokenData[policyId] = {
        Freak: {
            arweaveId: "arweave-id",
            ipfsId: "ipfs-id",
            name: "Freak",
            description: "Freak crypto coin",
            type: "Coin"
    }
    };
    data[0] = tokenData;

    // asset
    let asset = new AssetWallet(policyId, "Freak", 1000000);

    // token
    let tokens = [new TokenWallet(asset, script, [keyPair])];

    //scripts
    let scripts = tokens.map(t => t.script);

    // get min ada for address holding tokens
    let minAda = Seed.getMinUtxoValueWithAssets([asset], config);
    let amounts = [minAda];

    // get ttl info
    let info = await walletServer.getNetworkInformation();
    let ttl = info.node_tip.absolute_slot_number * 12000;

    // get coin selection structure (without the assets)
    let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);

    // add signing keys
    let rootKey = Seed.deriveRootKey(payeer.mnemonic_sentence); 
    let signingKeys = coinSelection.inputs.map(i => {
        let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
        return privateKey;
    });

    // add policy signing keys
    tokens.filter(t => t.scriptKeyPairs).forEach(t => signingKeys.push(...t.scriptKeyPairs.map(k => k.privateKey.to_raw_key())));

    let metadata = Seed.buildTransactionMetadata(data);

    // the wallet currently doesn't support including tokens not previuosly minted
    // so we need to include it manually.
    coinSelection.outputs = coinSelection.outputs.map(output => {
        if (output.address === addresses[0].address) {
            output.assets = tokens.map(t => {
                let asset = WalletsAssetsAvailable = {
                    policy_id: t.asset.policy_id,
                    asset_name: Buffer.from(t.asset.asset_name).toString('hex'),
                    quantity: t.asset.quantity
                };
                return asset;
            });
        }
        return output;
    });

    // we need to sing the tx and calculate the actual fee and the build again 
    // since the coin selection doesnt calculate the fee with the asset tokens included
    let txBody = Seed.buildTransactionWithToken(coinSelection, ttl, tokens, signingKeys, {data: data, config: config});
    let tx = Seed.sign(txBody, signingKeys, metadata, scripts);

    // submit the tx    
    let signed = Buffer.from(tx.to_bytes()).toString('hex');
    let txId = await walletServer.submitTx(signed);

    console.log(txId);
}
// deleteWallet(5);
// createWallet('cardanoexpert', 'Adi');
// seeAllWallets();
// getNetworkInfo();
// getRecoveryPhrase();
// getNetworkParameters()
// seeWalletAddresses(0);
// getWalletAddress(0, 2);
// getWalletBalance(0);
getWallet(0);
// createNativeToken();


// sendPayment(0,'addr_test1qpptryt4jruzxekfnuf9h4syykl9z0u8sre2lssu099yghsfh5y0dmlysk2sa68n02ex349vmlh9sgwugqjgn76hv8kqaz4tf8', 1_000_000)
// getWalletTransactions(0);