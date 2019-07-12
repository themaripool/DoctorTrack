/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { DoctorTrackContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('DoctorTrackContract', () => {

    let contract: DoctorTrackContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new DoctorTrackContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"doctor track 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"doctor track 1002 value"}'));
    });

    describe('#doctorTrackExists', () => {

        it('should return true for a doctor track', async () => {
            await contract.doctorTrackExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a doctor track that does not exist', async () => {
            await contract.doctorTrackExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createDoctorTrack', () => {

        it('should create a doctor track', async () => {
            await contract.createDoctorTrack(ctx, '1003', 'doctor track 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"doctor track 1003 value"}'));
        });

        it('should throw an error for a doctor track that already exists', async () => {
            await contract.createDoctorTrack(ctx, '1001', 'myvalue').should.be.rejectedWith(/The doctor track 1001 already exists/);
        });

    });

    describe('#readDoctorTrack', () => {

        it('should return a doctor track', async () => {
            await contract.readDoctorTrack(ctx, '1001').should.eventually.deep.equal({ value: 'doctor track 1001 value' });
        });

        it('should throw an error for a doctor track that does not exist', async () => {
            await contract.readDoctorTrack(ctx, '1003').should.be.rejectedWith(/The doctor track 1003 does not exist/);
        });

    });

    describe('#updateDoctorTrack', () => {

        it('should update a doctor track', async () => {
            await contract.updateDoctorTrack(ctx, '1001', 'doctor track 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"doctor track 1001 new value"}'));
        });

        it('should throw an error for a doctor track that does not exist', async () => {
            await contract.updateDoctorTrack(ctx, '1003', 'doctor track 1003 new value').should.be.rejectedWith(/The doctor track 1003 does not exist/);
        });

    });

    describe('#deleteDoctorTrack', () => {

        it('should delete a doctor track', async () => {
            await contract.deleteDoctorTrack(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a doctor track that does not exist', async () => {
            await contract.deleteDoctorTrack(ctx, '1003').should.be.rejectedWith(/The doctor track 1003 does not exist/);
        });

    });

});
