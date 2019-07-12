'use strict';

//const Promise = require("promise");
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./local_fabric_wallet');

module.exports = async function login(param) {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {

    const identityLabel = 'admin';
    let connectionProfile = yaml.safeLoad(fs.readFileSync('./network.yaml', 'utf8'));

    let connectionOptions = {
      identity: identityLabel,
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }
    };

    // Connect to gateway using network.yaml file and our certificates in _idwallet directory
    await gateway.connect(connectionProfile, connectionOptions);

    console.log('Connected to Fabric gateway.');

    // Connect to our local fabric
    const network = await gateway.getNetwork('mychannel');

    console.log('Connected to mychannel. ');
    
    const contract = await network.getContract('TrabalhoBlockchain2019');

    const response = [await contract.evaluateTransaction(param["name"], param["senha"], param["cpf"], param["tipo"])];
   
    // process response
    console.log('Process buy transaction response.');
    
   return  JSON.parse(response);

  } catch (error) {

    console.log(`******************* Error processing transaction. ${error}`);
    return null;
   // console.log(error.stack);
  } finally {
    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.');
    gateway.disconnect();
  }
}
