/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class createPrescription {

    @Property()

    public idReceita: string;
    public nome_medico: string;
    public nome_paciente: string;
    public cpf_paciente: string;
    public nome_medicamento: string;
    public validacao_medico: string;
    public marca_uso: string;
    public description: string;
    public data_validade: string;

}

export class createMedicine {
    @Property()

    public codigo_barras: string;
    public nome_medicamento: string;
    public nome_fabrica: string;
    public data_fabricacao: string;
    public numero_lote: string;
    public data_validade: string;
}

export class SignUp {
    @Property()
    
    public nome: string;
    public email: string;
    public senha: string;
    public cpf: string;
    public tipo: string;
}

