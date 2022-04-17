import { expect } from "chai";
import {
  Contract,
  ContractFactory,
  Signer,
  constants,
  BigNumber,
  ContractTransaction,
  ContractReceipt,
} from "ethers";
import { ethers } from "hardhat";
const snarkjs = require("snarkjs");

describe("zkAutoChess", function () {
  let zkAutoChessContract: ContractFactory;
  let zkAutoChess: Contract;

  let verifierContract: ContractFactory;
  let verifier: Contract;

  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    let verifierContract = await ethers.getContractFactory("Verifier");
    let verifier = await verifierContract.deploy();
    await verifier.deployed();
    zkAutoChessContract = await ethers.getContractFactory("zkAutoChess");
    zkAutoChess = await zkAutoChessContract.deploy(verifier.address);
    await zkAutoChess.deployed();

    expect(await zkAutoChess.getLastBattleId()).to.equal(0);
  });

  describe("Chess Piece", function () {
    it("Should be able to add new chess piece", async () => {
      zkAutoChess.setChessPiece(
        1,
        ethers.utils.formatBytes32String("Fighter"),
        4,
        1,
        1
      );
      const newChessPiece = await zkAutoChess.getChessPiece(1);
      expect(ethers.utils.parseBytes32String(newChessPiece.name)).to.equal(
        "Fighter"
      );
    });

    it("Should only allow owner to set chess piece", async function () {
      await expect(
        zkAutoChess
          .connect(addr1)
          .setChessPiece(
            1,
            ethers.utils.formatBytes32String("Fighter"),
            4,
            1,
            1
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Create and Join Battle", function () {
    it("Should be able to create a battle", async function () {
      await zkAutoChess.createBattle();
      const battle = await zkAutoChess.getBattle(1);

      expect(battle["playerA"]).to.equal(await owner.getAddress());
      expect(battle["playerB"]).to.equal(constants.AddressZero);
      expect(battle["canJoin"]).to.equal(true);
    });

    it("Should be able to create battle by other address", async function () {
      await zkAutoChess.connect(addr1).createBattle();

      const battle = await zkAutoChess.getBattle(1);
      expect(battle["playerA"]).to.equal(await addr1.getAddress());
      expect(battle["playerB"]).to.equal(constants.AddressZero);
      expect(battle["canJoin"]).to.equal(true);
    });

    it("Should be able to join battle from other address", async function () {
      await zkAutoChess.createBattle();
      await zkAutoChess.connect(addr1).joinBattle(1);

      const battle = await zkAutoChess.getBattle(1);
      expect(battle["playerA"]).to.equal(await owner.getAddress());
      expect(battle["playerB"]).to.equal(await addr1.getAddress());
      expect(battle["canJoin"]).to.equal(false);
    });

    it("Should reject player to join if battle is full", async function () {
      await zkAutoChess.createBattle();
      await zkAutoChess.connect(addr1).joinBattle(1);
      await expect(zkAutoChess.connect(addr2).joinBattle(1)).to.be.revertedWith(
        "Battle is full"
      );
    });
  });

  describe("Core Game", function () {
    const valid_input_A = {
      playfield: [3, 0, 0, 0, 2, 0, 3, 0],
      salt: 185234789123,
    };

    const valid_input_B = {
      playfield: [2, 2, 2, 0, 2, 0, 0, 0],
      salt: 185234789123,
    };

    const invalid_input = {
      playfield: [0, 3, 0, 0, 2, 0, 3, 0],
      salt: 185234789123,
    };

    it("Player can deploy their move", async function () {
      await zkAutoChess.createBattle();
      await zkAutoChess.connect(addr1).joinBattle(1);
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        valid_input_A,
        "./circuits/zkAutoChess_js/zkAutoChess.wasm",
        "./circuits/zkAutoChess_0001.zkey"
      );
      let battle = await zkAutoChess.getBattle(1);

      await zkAutoChess.deploy(1, publicSignals[0]);
      expect(battle["canReveal"]).to.be.false;

      await zkAutoChess.connect(addr1).deploy(1, publicSignals[0]);
      battle = await zkAutoChess.getBattle(1);
      expect(battle["canReveal"]).to.be.true;
    });

    it("Player can reveal their move", async function () {
      await zkAutoChess.createBattle();
      await zkAutoChess.connect(addr1).joinBattle(1);

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        valid_input_A,
        "./circuits/zkAutoChess_js/zkAutoChess.wasm",
        "./circuits/zkAutoChess_0001.zkey"
      );

      await zkAutoChess.deploy(1, publicSignals[0]);
      await zkAutoChess.connect(addr1).deploy(1, publicSignals[0]);

      const argv = [
        proof["pi_a"][0],
        proof["pi_a"][1],
        proof["pi_b"][0][1],
        proof["pi_b"][0][0],
        proof["pi_b"][1][1],
        proof["pi_b"][1][0],
        proof["pi_c"][0],
        proof["pi_c"][1],
      ];

      const a = [argv[0], argv[1]];
      const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
      ];
      const c = [argv[6], argv[7]];
      const field = publicSignals.slice(1, 9);
      const salt = publicSignals[9];
      await zkAutoChess.reveal(1, field, salt, a, b, c);
      await zkAutoChess.connect(addr1).reveal(1, field, salt, a, b, c);
    });
  });
});
