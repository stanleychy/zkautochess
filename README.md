<h1 align="center">
  <a href="https://zkautochess.vercel.app/">
  zkAutoChess
  </a>
  <p>An on-chain auto chess battle game secured by zero-knowledge proof</p>
</h1>


<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
  - [Use Cases](#use-cases)
  - [Competitive Analysis](#competitive-analysis)
  - [Deployments](#deployments)
- [Roadmap](#roadmap)
- [License](#license)

</details>

---

## About

Auto Chess was originated from a custom map created by Drodo Games for Dota 2. The game consist of 2 players deploying pieces on the board, and when both done the deployment chess pieces will battle automatically. The simple gamplay is getting popular while famous game studios making their own version, for example Teamfight Tatics in League of Legends or Clash Mini developed by Supercell. 

This project is trying to implement the game fully on-chain. Players' move will be verified, sealed and committed on-chain so no centralized judge is needed while no player can cheat.

### Use Cases

1. Game is great at onboarding new users and testing new technology. With auto chess as a simple but flexible gamplay, a zero knowledge version of the game can introduce zero knowledge proof to wider audience while auto chess is a trending game.

2. The game also introduce game NFT as those playable pieces so it will be a good demostration of zero knowledge NFT too.

### Competitive Analysis

We are not able to find a lot of existing zero knowledge games at the moment. While Dark Forest proves the potential of zero knowledge on chain game there are a lot to be explored in this field. Major competitors are as mentioned, Teamfight Tactics and Clash Mini that are attracting huge number of players with great performance and graphic. ZkAutoChess needs to be carefully designed and keep evolving to remain competitive and attractive to players who are used to tranditional games by well-known studio.

### Deployments

| Network         | ChainId    | zkAutoChess                                  | Verifier                                     |
| --------------- | ---------- | -------------------------------------------- | -------------------------------------------- |
| Harmony Testnet | 1666700000 | `0x391FfC9F5fAd80EDF40fdd73387052BA4A000270` | `0x3A06F30C2E9a364838881114AaF724a8D5004098` |
| Harmony Mainnet | 1666600000 | TODO                                         | TODO                                         |

## Roadmap

The first version of the game covered on-chain match-making, gamepiece deploying and revealing. Battle logic is done off-chain for now but the rule should be simple and deterministic, so that from the given committed move of both players the battle result should be always the same.

- [ ] Battle logic optimization and bug fixing
- [ ] Visual display for battle and result
- [ ] Battle logic on-chain
- [ ] Make gamepiece NFT
- [ ] System design of game, e.g. game balancing, fee, prize, etc.
- [ ] More features...
## License

This project is licensed under the **GNU General Public License v3.0**.

See [LICENSE](LICENSE) for more information.
