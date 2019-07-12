/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { createPrescription, createMedicine, SignUp } from './doctor-track';

var receitas: Array<createPrescription> = [];
var remedios: Array<createMedicine> = [];
var users: Array<SignUp> = [];


function forForRead(cpf: string) {
    return new Promise((resolve, reject) => {
        var returnIt = [];
        for (var rec in receitas) {
            if (rec['cpf_paciente'] == cpf) {
                returnIt.push(rec);
            }
        }
        var newRet = JSON.stringify(returnIt);
        
        resolve(newRet);
        return newRet;
    });
}


@Info({ title: 'DoctorTrackContract', description: 'My Smart Contract' })
export class DoctorTrackContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async createPrescriptionExists(ctx: Context, idReceita: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(idReceita);
        return (!!buffer && buffer.length > 0);
    }

    public async clientPrescritpionExists(ctx: Context, cpf: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(cpf);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(false)
    @Returns('boolean')
    public async createMedicineExists(ctx: Context, codigo_barras: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(codigo_barras);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(false)
    @Returns('boolean')
    public async userExists(ctx: Context, cpf: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(cpf);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction() // altera o conteudo do ledger -- Criacao da receita
    public async createPrescription(
        ctx: Context,
        idReceita: string,
        nome_medico: string,
        nome_paciente: string,
        cpf_paciente: string,
        nome_medicamento: string,
        validacao_medico: string,
        marca_uso: string,
        description: string,
        data_validade: string
    ): Promise<void> {
        const exists = await this.createPrescriptionExists(ctx, idReceita);
        if (exists) {
            throw new Error(`The prescription ${idReceita} already exists`);
        }
        const prescription = new createPrescription();

        prescription.idReceita = idReceita;
        prescription.nome_medico = nome_medico;
        prescription.nome_paciente = nome_paciente;
        prescription.cpf_paciente = cpf_paciente;
        prescription.nome_medicamento = nome_medicamento;
        prescription.validacao_medico = validacao_medico;
        prescription.marca_uso = marca_uso;
        prescription.description = description;
        prescription.data_validade = data_validade;
        receitas.push(prescription);

        const buffer = Buffer.from(JSON.stringify(prescription));
        await ctx.stub.putState(idReceita, buffer);
    }

    @Transaction() // altera o conteudo do ledger -- Criacao do remedio
    public async createMedicine(
        ctx: Context,
        codigo_barras: string,
        nome_medicamento: string,
        nome_fabrica: string,
        data_fabricacao: string,
        numero_lote: string,
        data_validade: string
    ): Promise<void> {
        const exists = await this.createMedicineExists(ctx, codigo_barras);
        if (exists) {
            throw new Error(`The medicine ${codigo_barras} already exists`);
        }
        const medicine = new createMedicine();

        medicine.codigo_barras = codigo_barras;
        medicine.nome_medicamento = nome_medicamento;
        medicine.nome_fabrica = nome_fabrica;
        medicine.data_fabricacao = data_fabricacao;
        medicine.numero_lote = numero_lote;
        medicine.data_validade = data_validade;

        remedios.push(medicine);

        const buffer = Buffer.from(JSON.stringify(medicine));
        await ctx.stub.putState(codigo_barras, buffer);
    }

    @Transaction(false) // nao altera o conteudo do ledger -- Leitura da receita
    @Returns("createPrescription")
    public async readPrescription(
        ctx: Context,
        idReceita: string,
        cpf_paciente: string,
        validacao_medico: string,
        data_validade: string
    ): Promise<createPrescription> {
        const exists = await this.createPrescriptionExists(ctx, idReceita);
        if (!exists) {
            throw new Error(`The prescription ${idReceita} does not exist`);
        }
        for (var rec of receitas) {
            if (rec.idReceita == idReceita) {
                if (
                    rec.cpf_paciente != cpf_paciente ||
                    rec.validacao_medico != validacao_medico ||
                    rec.data_validade != data_validade
                ) {
                    throw new Error(
                        `The medicine ${idReceita} is incompatible with the system data`
                    );
                }
            }
        }
        const buffer = await ctx.stub.getState(idReceita);
        const receita = JSON.parse(buffer.toString()) as createPrescription;
        return receita;
    }

    @Transaction(false) // nao altera o conteudo do ledger -- Leitura da receita
    @Returns("createPrescription")
    public async readPrescriptionCliente(
        ctx: Context,
        idReceita: string,
        cpf_paciente: string
    ): Promise<createPrescription> {

        const exists = await this.createPrescriptionExists(ctx, idReceita);
        if (!exists) {
            throw new Error(`The prescription ${idReceita} does not exist`);
        }

        for (var rec of receitas) {
            if (rec.idReceita == idReceita) {
                if (
                    rec.cpf_paciente != cpf_paciente 
                ) {
                    throw new Error(
                        `The medicine ${idReceita} is incompatible with the system data`
                    );
                }
            }
        }
        const buffer = await ctx.stub.getState(idReceita);
        const receita = JSON.parse(buffer.toString()) as createPrescription;
        return receita;
    }

    @Transaction()
    public async SignUp(
        ctx: Context,
        nome: string,
        email: string,
        senha: string,
        cpf: string,
        tipo: string
    ): Promise<void> {

        const exists = await this.userExists(ctx, cpf);
        if (exists) {
            throw new Error(`The user with cpf = ${cpf} already exists`);
        }
        const user = new SignUp();

        user.nome = nome;
        user.email = email;
        user.senha = senha;
        user.cpf = cpf;
        user.tipo = tipo;


        users.push(user);

        const buffer = Buffer.from(JSON.stringify(user));
        await ctx.stub.putState(cpf, buffer);
    }

    @Transaction(false) 
    @Returns("SignUp")
    public async checkUser(
        ctx: Context,
        senha: string,
        cpf: string,
        tipo: string
    ): Promise<SignUp> {
        const exists = await this.userExists(ctx, cpf);
        if (!exists) {
            throw new Error(`The user with cpf = ${cpf} does not exist`);
        }
        for (var user of users) {
            if (user.cpf == cpf) {
                if (
                    user.senha != senha ||
                    user.tipo != tipo
                ) {
                    throw new Error(
                        `The user with cpf = ${cpf} is incompatible with the system data`
                    );
                }
            }

        }
        console.log("The medicine is compatible with the system data");
        const buffer = await ctx.stub.getState(cpf);
        const person = JSON.parse(buffer.toString()) as SignUp;
        return person;
    }

    @Transaction(false) 
    @Returns("createMedicine")
    public async checkMedicine(
        ctx: Context,
        codigo_barras: string,
        nome_medicamento: string,
        nome_fabrica: string,
        data_fabricacao: string,
        numero_lote: string,
        data_validade: string
    ): Promise<createMedicine> {
        const exists = await this.createMedicineExists(ctx, codigo_barras);
        if (!exists) {
            throw new Error(`The medicine ${codigo_barras} does not exist`);
        }
        for (var rec of remedios) {
            if (rec.codigo_barras == codigo_barras) {
                if (
                    rec.nome_medicamento != nome_medicamento ||
                    rec.nome_fabrica != nome_fabrica ||
                    rec.data_fabricacao != data_fabricacao ||
                    rec.numero_lote != numero_lote ||
                    rec.codigo_barras != codigo_barras ||
                    rec.data_validade != data_validade
                ) {
                    throw new Error(
                        `The medicine ${codigo_barras} is incompatible with the system data`
                    );
                }
            }
        }
        console.log("The medicine is compatible with the system data");
        const buffer = await ctx.stub.getState(codigo_barras);
        const medicine = JSON.parse(buffer.toString()) as createMedicine;
        return medicine;
    }
}
