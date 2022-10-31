const Voting = artifacts.require("../contracts/Voting.sol");

const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

contract('Voting', accounts => {

    const owner = accounts[0];
    const user = accounts[1];

    let votingInstance;

    describe("Ownership", function () {

        beforeEach(async function () {
            votingInstance = await Voting.new({from:owner});
        });

        it("Only owner should be able to endProposalsRegistering", async () => {
            await expectRevert(votingInstance.endProposalsRegistering({ from: user }), "Ownable: caller is not the owner.");
        });

        it("Only owner should be able to startVotingSession", async () => {
            await expectRevert(votingInstance.startVotingSession({ from: user }), "Ownable: caller is not the owner.");
        });

        it("Only owner should be able to endVotingSession", async () => {
            await expectRevert(votingInstance.endVotingSession({ from: user }), "Ownable: caller is not the owner.");
        });

        it("Only owner should be able to tallyVotes", async () => {
            await expectRevert(votingInstance.tallyVotes({ from: user }), "Ownable: caller is not the owner.");
        });

        it("Only owner should be able to startProposalsRegistering", async () => {
            await expectRevert(votingInstance.startProposalsRegistering({ from: user }), "Ownable: caller is not the owner.");
        });

        it("Only owner should be able to addVoter", async () => {
            await expectRevert(votingInstance.addVoter(user,{ from: user }), "Ownable: caller is not the owner.");
        });

    });
    describe("Voters rights", function () {

        beforeEach(async function () {
            votingInstance = await Voting.new({from:owner});
        });

        it("Only voters should be able to make proposals", async () => {
            await expectRevert(votingInstance.addProposal("This is a proposal", { from: user }), "You're not a voter");
        });

        it("Only voters should be able to setVote", async () => {
            await expectRevert(votingInstance.setVote(user,{ from: user }), "You're not a voter");
        });

    });
    describe("Workflow", function () {

        beforeEach(async function () {
            votingInstance = await Voting.new({from:owner});
        });

        it("endProposalsRegistering should be forbidden when workflow is not RegisteringVoters", async () => {
            await expectRevert(votingInstance.endProposalsRegistering({ from: owner }), "Registering proposals havent started yet.");
        });

        it("startVotingSession should be forbidden when workflow is not ProposalsRegistrationEnded", async () => {
            await expectRevert(votingInstance.startVotingSession({ from: owner }), "Registering proposals phase is not finished.");
        });

        it("endVotingSession should be forbidden when workflow is not VotingSessionStarted", async () => {
            await expectRevert(votingInstance.endVotingSession({ from: owner }), "Voting session havent started yet.");
        });

        it("tallyVotes should be forbidden when workflow is not VotingSessionEnded", async () => {
            await expectRevert(votingInstance.tallyVotes({ from: owner }), "Current status is not voting session ended.");
        });

        it("startProposalsRegistering should be forbidden when workflow is not RegisteringVoters", async () => {
            await votingInstance.startProposalsRegistering({ from: owner });
            await votingInstance.endProposalsRegistering({ from: owner });
            await expectRevert(votingInstance.startProposalsRegistering({ from: owner }), "Registering proposals cant be started now.");
        });

    });

    describe("Full Workflow", function () {

        it("Owner should add voter", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.addVoter(user,{ from: owner });

            expectEvent(result, 'VoterRegistered', {
                voterAddress:user
            });
        });

        it("Owner should startProposalsRegistering", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.startProposalsRegistering({ from: owner });

            expectEvent(result, 'WorkflowStatusChange', {
                previousStatus:Voting.WorkflowStatus.RegisteringVoters.toString(),
                newStatus:Voting.WorkflowStatus.ProposalsRegistrationStarted.toString()
            });

            expect((await votingInstance.workflowStatus()).toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationStarted.toString());
        });

        it("Voter should make a proposal", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.addProposal("This is a proposal", { from: user });

            expectEvent(result, 'ProposalRegistered', {
                proposalId:new BN(1)
            });

            let p = await votingInstance.getOneProposal(new BN(1), { from: user });

            expect(p.description).to.equal("This is a proposal");

        });

        it("Owner should endProposalsRegistering", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.endProposalsRegistering({ from: owner });

            expectEvent(result, 'WorkflowStatusChange', {
                previousStatus:Voting.WorkflowStatus.ProposalsRegistrationStarted.toString(),
                newStatus:Voting.WorkflowStatus.ProposalsRegistrationEnded.toString()
            });

            expect((await votingInstance.workflowStatus()).toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationEnded.toString());
        });

        it("Owner should startVotingSession", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.startVotingSession({ from: owner });

            expectEvent(result, 'WorkflowStatusChange', {
                previousStatus:Voting.WorkflowStatus.ProposalsRegistrationEnded.toString(),
                newStatus:Voting.WorkflowStatus.VotingSessionStarted.toString()
            });

            expect((await votingInstance.workflowStatus()).toString()).to.equal(Voting.WorkflowStatus.VotingSessionStarted.toString());
        });

        it("Voter should add a vote", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.setVote(new BN(1), { from: user });

            expectEvent(result, 'Voted', {
                voter:user,
                proposalId:new BN(1)
            });

            let p = await votingInstance.getOneProposal(new BN(1), { from: user });
            expect(p.voteCount).to.be.bignumber.equal(new BN(1));
        });

        it("Owner should endVotingSession", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.endVotingSession({ from: owner });

            expectEvent(result, 'WorkflowStatusChange', {
                previousStatus:Voting.WorkflowStatus.VotingSessionStarted.toString(),
                newStatus:Voting.WorkflowStatus.VotingSessionEnded.toString()
            });

            expect((await votingInstance.workflowStatus()).toString()).to.equal(Voting.WorkflowStatus.VotingSessionEnded.toString());
        });

        it("Owner should tallyVotes", async () => {
            const votingInstance = await Voting.deployed();
            let result = await votingInstance.tallyVotes({ from: owner });

            expectEvent(result, 'WorkflowStatusChange', {
                previousStatus:Voting.WorkflowStatus.VotingSessionEnded.toString(),
                newStatus:Voting.WorkflowStatus.VotesTallied.toString()
            });

            expect((await votingInstance.workflowStatus()).toString()).to.equal(Voting.WorkflowStatus.VotesTallied.toString());
        });

        it("Voter should see the winner", async () => {
            const votingInstance = await Voting.deployed();

            let winner = await votingInstance.winningProposalID();
            let p = await votingInstance.getOneProposal(winner, { from: user });

            expect(p.description).to.equal("This is a proposal");
        });
    });

});