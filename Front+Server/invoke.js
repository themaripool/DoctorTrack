'use strict';

const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./local_fabric_wallet');



module.exports = async function insertPrescription(param) {

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

//'createPrescription', "3034", "Marcos Castro", "Antonio Melo","12897276789", "Predicim", "false", "false", "Usar ate os sintomas desaparecerem", "20/02/2018"
    
    const contract = await network.getContract('TrabalhoBlockchain2019');

    response = await contract.submitTransaction(param["name"], param["idReceita"], param["nome_medico"], param["nome_paciente"], param["cpf_paciente"], param["nome_medicamento"], param["validacao"], param["uso"], param["descricao"], param["validade"]);

   // const response = await contract.submitTransaction('createPrescription', "3034", "Marcos Castro", "Antonio Melo","12897276789", "Predicim", "false", "false", "Usar ate os sintomas desaparecerem", "20/02/2018");

    // process response
   // console.log('Transação feita com sucesso');
    

    //return response;
   


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

// invoke the main function, can catch any error that might escape
// main().then(() => {
//   console.log('done');
// }).catch((e) => {
//   console.log('Final error checking.......');
//   console.log(e);
//   console.log(e.stack);
//   process.exit(-1);
// });
