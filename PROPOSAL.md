## Proposal Overview

Auto Chess was originated from a custom map created by Drodo Games for Dota 2. The game consist of 2 players deploying pieces on the board, and when both done the deployment chess pieces will battle automatically. The simple gamplay is getting popular while famous game studios making their own version, for example Teamfight Tatics in League of Legends or Clash Mini developed by Supercell.

This project is trying to implement the game fully on-chain. Players' move will be verified, sealed and committed on-chain so no centralized judge is needed while no player can cheat.

## Use Case

1. Game is great at onboarding new users and testing new technology. With auto chess as a simple but flexible gamplay, a zero knowledge version of the game can introduce zero knowledge proof to wider audience while auto chess is a trending game.

2. The game can also introduce game NFT as those playable pieces so it will be a good demostration of zero knowledge NFT too.

## Competitive Landscape

We are not able to find a lot of existing zero knowledge games at the moment. While Dark Forest proves the potential of zero knowledge on chain game there are a lot to be explored in this field. Major competitors are as mentioned, Teamfight Tactics and Clash Mini that are attracting huge number of players with great performance and graphic. ZkAutoChess needs to be carefully designed and keep evolving to remain competitive and attractive to players who are used to tranditional games by well-known studio.

## Proposal Ask

ZkAutoChess on Harmony will be established to be community-driven and self-funded by the DAO (to be created) in a bid to bring a ZK powered space conquest game to the Harmony Blockchain. To get this up and running, we will be requesting the $15k/year stable basic income to take care of initial development, welfare and operations costs.

This ask will be in line with the laid down milestones as detailed below

1. launching a feature-complete product on our testnet
2. forming a DAO with 5-out-of-9 multisig with our DAOs
3. launching on our mainnet with audit
4. attracting 1k daily active users (with launch video, full PR promotion)
5. attracting 10k daily active users (with a detailed roadmap, governance process)

## Roadmap

| Objective              | Date       | Status |
| ---------------------- | ---------- | ------ |
| Testnet launch         | April 25th | Done   |
| Beta Testing and Fixes | May 9th    | Done   |
| Mainnet Launch         | May 9th    | Pending   |

The first version of the game covered on-chain match-making, gamepiece deploying and revealing. Battle logic is done off-chain for now but the rule should be simple and deterministic, so that from the given committed move of both players the battle result should be always the same.

- [ ] Battle logic optimization and bug fixing
- [ ] Visual display for battle and result
- [ ] Battle logic on-chain
- [ ] Make gamepiece NFT
- [ ] System design of game, e.g. game balancing, fee, prize, etc.
- [ ] More features...

### External links

- [Mono Repo](https://github.com/HKerStanley/zkautochess)
- [zkAutoChess Client](https://zkautochess.vercel.app/)
- [zkAutoChess Contract (Testnet)](https://explorer.testnet.harmony.one/address/0x391ffc9f5fad80edf40fdd73387052ba4a000270)
- [Verifier Contract (Testnet)](https://explorer.testnet.harmony.one/address/0x3a06f30c2e9a364838881114aaf724a8d5004098)
- [zkAutoChess Contract (Mainnet)]()
- [Verifier Contract (Mainnet)]()
