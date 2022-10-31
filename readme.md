# Voting contract tests

This project contains a simple Voting.sol contract and tests.
Test are separated in two parts :
- Unit test that verify most edge cases (Ownership, current workflow checks, ...)
- Integration tests that verify a full classical workflow.

More tests are verifying that :
- Data are well modified
- Revert are done when needed
- Event are emitted

## Unit tests

- Ownership (Verify that only owner is able to do some actions)
>√ Only owner should be able to endProposalsRegistering (712ms)

>√ Only owner should be able to startVotingSession
>√ Only owner should be able to endVotingSession
>√ Only owner should be able to tallyVotes
>√ Only owner should be able to startProposalsRegistering
>√ Only owner should be able to addVoter
- Voters rights (Verify that only voter are able to do some actions)
>√ Only voters should be able to make proposals
>√ Only voters should be able to setVote
- Workflow (Verify that the workflow follow specific order)
>√ endProposalsRegistering should be forbidden when workflow is not RegisteringVoters
>√ startVotingSession should be forbidden when workflow is not ProposalsRegistrationEnded
>√ endVotingSession should be forbidden when workflow is not VotingSessionStarted
>√ tallyVotes should be forbidden when workflow is not VotingSessionEnded
>√ startProposalsRegistering should be forbidden when workflow is not RegisteringVoters (83ms)

## Integration tests
- Full Workflow
>√ Owner should add voter (55ms)
>√ Owner should startProposalsRegistering (76ms)
>√ Voter should make a proposal (71ms)
>√ Owner should endProposalsRegistering (57ms)
>√ Owner should startVotingSession (75ms)
>√ Voter should add a vote (125ms)
>√ Owner should endVotingSession (60ms)
>√ Owner should tallyVotes (68ms)
>√ Voter should see the winner (52ms)