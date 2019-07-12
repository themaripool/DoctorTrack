'use strict';

//const Promise = require("promise");
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./local_fabric_wallet');

module.exports = async function mainQuery(param) {

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

    //readPrescription: idReceita, cpf_paciente,validacao_medico,data_validade

    const response = [await contract.evaluateTransaction(param["name"], param["idReceita"], param["cpf_paciente"])];
   
    // process response
    console.log('Process buy transaction response.');
    
   // console.log( JSON.parse(response) );
   // return response;
   return  JSON.parse(response)

    // Promise.all(response).then(result => {

    //   return JSON.parse(result);

    // }).catch(error => {

    //   console.log(error);
    //   return null;

    // });


  // let resposta;
  
  // (response) ?  resposta = JSON.parse(response) : resposta = null;
  // return resposta;


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

// invoke the main function, can catch any error that might escape
// main().then(() => {
//   console.log('done');
// }).catch((e) => {
//   console.log('Final error checking.......');
//   console.log(e);
//   console.log(e.stack);
//   process.exit(-1);
// });
