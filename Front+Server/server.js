
var mainQuery = require("./query.js");
var insertPrescription = require("./invoke.js");
var checkMed = require("./checkmedicine.js");
var login = require("./login.js");
var queryCli = require("./queryCliente.js");
var insertClient = require("./invokeCadastro.js");

let cpfOnline = 0;

var Promise = require("promise");

var express = require("express"),
  app = express(),
  port = process.env.PORT || 4000;

var bodyParser = require("body-parser");
app.listen(port);

var db = require("./bd/db.json");


var pathing = "Site_Blockchain/";

app.use(bodyParser.json({ type: "*/*", strict: false }));

app.route("/receitas/:cod").get((req, res) => {

  let codigo = req.params.cod;

  let codigos = [queryCli({ name: "readPrescriptionCliente", idReceita: `${codigo}`, cpf_paciente: `${cpfOnline}` })];
 
  Promise.all(codigos).then((results) => {
    console.log(results);
    res.json(results)
  }).catch((error) => {
    res.send('Something went wrong')
  })

});

app
  .route("/receitas")

  .get((req, res) => {
    if (Object.keys(req.query).length == 4) {

      let id = req.query['id'];
      let cpf = req.query['cpf'];
      let validacao = req.query['validacao'];
      let validade = req.query['validade'];

      let promise = [mainQuery({ name: "readPrescription", value1: `${id}`, value2: `${cpf}`, value3: `${validacao}`, value4: `${validade}` })];

      Promise.all(promise).then((results) => {
        console.log(results);

        if (results[0]["idReceita"] == id) {
          res.status(200).json({ response: "Esta receita é válida" });
        }
        else {
          res.status(200).json({ response: "Esta receita não é válida" });
        }

      }).catch(error => {
        console.log(error);
        res.status(200).json({ response: "Esta receita não é válida" });
      });
    } else if (Object.keys(req.query).length == 0) {

      let codigo = cpfOnline;

      let codigos = [queryCli({ name: "readPrescriptionCliente", value1: `${codigo}` })];
    
      Promise.all(codigos).then((results) => {
        res.json(results)
      }).catch((error) => {
        res.send('Something went wrong')
      })
    } else {

      res.status(200).json({ response: "Esta receita não é válida" });
    }
  })
  .post((req, res) => {

    var fs = require("fs");

    let idRec = req.body.idReceita;
    let nomeMed = req.body.nome_medico;
    let nomePac = req.body.nome_paciente;
    let nomeMedicamento = req.body.nome_medicamento;
    let cpfPac = req.body.cpf_paciente;
    let valMed = req.body.validacao_medico;
    let marcaUso = req.body.marca_uso;
    let desc = req.body.description;
    let dataVal = req.body.data_validade;

    if (
      idRec == "" ||
      nomeMed == "" ||
      nomePac == "" ||
      nomeMedicamento == "" ||
      cpfPac == "" ||
      valMed == "" ||
      marcaUso == "" ||
      desc == "" ||
      dataVal == ""
    ) {
      res.status(400);
      res.send(
        "You cannot acces this webpage directly or you need to fill all parameters"
      );
    }

    else {
      let promise = [insertPrescription({ name: "createPrescription", idReceita: `${idRec}`, nome_medico: `${nomeMed}`, nome_paciente: `${nomePac}`, cpf_paciente: `${cpfPac}`, nome_medicamento: `${nomeMedicamento}`, validacao: `${valMed}`, uso: `${marcaUso}`, descricao: `${desc}`, validade: `${dataVal}` })];

      Promise.all(promise).then((results) => {
      
        if (results == null) {
          res.status(200).json({ response: "Erro ao inserir receita" });
        } else {
          res.status(200).json({ response: "Receita inserida com sucesso" });
        }
      }).catch(error => {
        console.log(error);
        res.status(200).json({ response: "Erro ao inserir receita" });
      });
    }

  });

app
  .route("/medicamentos")
  .get((req, res) => {

    if (Object.keys(req.query).length == 6) {
 
      let nome = req.query["nome"];
      let codigo = req.query["codBarras"];
      let fabrica = req.query["nomeFab"];
      let dataFab = req.query["dataFab"]
      let numeroLote = req.query["numeroLote"]
      let dataVal = req.query["dataVal"]

      let promise = [checkMed({ name: "checkMedicine", codigo_barras: `${codigo}`, nome_medicamento: `${nome}`, nome_fabrica: `${fabrica}`, data_fabricacao: `${dataFab}`, numero_lote: `${numeroLote}`, data_validade: `${dataVal}` })];

      Promise.all(promise).then((results) => {
        console.log(results);

        if (results[0]["codigo_barras"] == codigo) {
          res.status(200).json({ response: "Este medicamento é válido" });
        }
        else {
          res.status(200).json({ response: "Este medicamento não é válido" });
        }

      }).catch(error => {
        console.log(error);
        res.status(200).json({ response: "Este medicamento não é válido" });
      });
    } else {
      console.log("entrou no primeiro else")
      res.status(200).json({ response: "Este medicamento não é válido" });
    }
  });
  
//------------------------ LOGIN ---------------------

app
  .route("/login")
  .get((req, res) => {

    if (Object.keys(req.query).length == 3) {

      let cpf = req.query["cpfpessoa"];
      let senha = req.query["senhapessoa"];
      let tipo = req.query["tipopessoa"];

      let promise = [login({ name: "checkUser", senha: `${senha}`, cpf: `${cpf}`, tipo: `${tipo}` })];

      Promise.all(promise).then((results) => {
        console.log(results);

        if (results[0]["cpf"] == cpf) {
          cpfOnline = cpf;
          console.log(cpfOnline);
          res.status(200).json({ response: "true" });
        }
        else {
          cpfOnline = 0;
          res.status(200).json({ response: "false" });
        }

      }).catch(error => {
        cpfOnline = 0;
        console.log(error);
        res.status(200).json({ response: "false" });
      });
    } else {
      cpfOnline = 0;
      res.status(400).json({ response: 'Este login não é válido' });
    }
  })
  .post((req, res) => {
    let nomep = req.body.nome;
    let emailp = req.body.email;
    let senhap = req.body.senha;
    let cpfp = req.body.cpf;
    let tipop = req.body.tipo;

    if (
      nomep == "" ||
      emailp == "" ||
      senhap == "" ||
      cpfp == "" ||
      tipop == "" 
    ) {
      res.status(400);
      res.send(
        "You cannot acces this webpage directly or you need to fill all parameters"
      );
    }

    else {
      let promise = [insertClient({ name: "SignUp", nome: `${nomep}`,email: `${emailp}`,senha: `${senhap}`,cpf: `${cpfp}`,tipo: `${tipop}` })];

      Promise.all(promise).then((results) => {
        //console.log(results);
        if (results == null) {
          res.status(200).json({ response: "Erro ao criar conta" });
        } else {
          res.status(200).json({ response: "Conta criada com sucesso" });
        }
      }).catch(error => {
        console.log(error);
        res.status(200).json({ response: "Erro ao criar conta" });
      });
    }
   
  });



// get medicamento especifico

app.route("/medicamentos/:cod").get((req, res) => {
  console.log("entrei no get");
  let codigos = db["medicamentos"];
  let codigo = req.params.cod;
  let resultados = [];

  codigos.map(entry => {
    if (entry["codigo_barras"] == codigo) {
      resultados.push(entry);
    }
  });
  res.json(resultados);
});

// get medico especifico
app.get("/medico/:nome", (req, res) => {
  let nomes = db["receitas"];
  let nome = req.params.nome;
  let resultados = [];

  nomes.map(entry => {
    if (entry["nome_medico"] == nome) {
      resultados.push(entry);
    }
  });
  res.json(resultados);
});

// pesquisa medicamento especifico pelo nome e codigo de barras
app.get("/medicamentos/:cod/:nome", (req, res) => {
  let medicamentos = db["medicamentos"];
  let codigo = req.params.cod;
  let nome = req.params.nome;

  let resultados = [];

  medicamentos.map(entry => {
    if (entry["codigo_barras"] == codigo && entry["nome_medicamento"] == nome) {
      resultados.push(entry);
    }
  });
  res.json(resultados);
});

app.get("/home.html", (req, res) => {
  cpfOnline = 0;
  res.sendFile(__dirname + "/Site_Blockchain/home.html");
});

app.get("/main.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/main.html");
});

app.get("/mainMedicos.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/mainMedicos.html");
});

app.get("/medicamentos.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/medicamentos.html");
});

app.get("/signIn.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/signIn.html");
});

app.get("/medicos.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/medicos.html");
});

app.get("/mainClientes.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/mainClientes.html");
});

app.get("/updateReceita.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/updateReceita.html");
});

app.get("/Site_Blockchain/home2.png", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/home2.png");
});

app.get("/mainFarmaceuticos.html", (req, res) => {
  res.sendFile(__dirname + "/Site_Blockchain/mainFarmaceuticos.html");
});

app.get('/myconfig.css',(req,res)=>{
  res.sendFile(__dirname+"/Site_Blockchain/myconfig.css");
})

app.route("*").get((req, res) => {
  res.status(404);
  res.send("404 not found.");
});



console.log("blockchain server started on: " + port);
