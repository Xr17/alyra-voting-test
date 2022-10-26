const SimpleStorage = artifacts.require("../contracts/Voting.sol");

const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

contract('SimpleStorage2', accounts => {

    const owner = accounts[0];

    let simpleStorageInstance;

    describe("test complet", function () {

        beforeEach(async function () {

            simpleStorageInstance = await SimpleStorage.new({from:owner});

        });

        it("...should store the value 89.", async () => {

            await simpleStorageInstance.set(89, { from: owner });

            const storedData = await simpleStorageInstance.get.call();

            expect(storedData).to.be.bignumber.equal(new BN(89));

        });

        it("should revert on value 0", async () => {

            await expectRevert(simpleStorageInstance.set(new BN(0), {from:owner}), 'Input cannot be null.');

        });

        it("should emit event on set", async () => {

            expectEvent(await simpleStorageInstance.set(new BN(12), { from: accounts[0] }), "dataStored" ,{_data: new BN(12), _addr: owner})

        });

    });

});