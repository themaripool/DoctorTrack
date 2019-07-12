'use strict';

const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./local_fabric_wallet');



module.exports = async function insertClient(param) {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();
  let response;

 
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

    response = await contract.submitTransaction(param["name"], param["nome"], param["email"], param["senha"], param["cpf"], param["tipo"]);

   

  } catch (error) {
    console.log(`******************* Error processing transaction. ${error}`);
    return null;
   // console.log(error.stack);
  } finally {
    // Disconnect from the gateway
    //console.log(typeof(response));
    return  response;
    console.log('Disconnect from Fabric gateway.');
    gateway.disconnect();
  }
}

