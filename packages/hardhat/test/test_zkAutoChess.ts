import { expect } from "chai";
import {
  Contract,
  ContractFactory,
  Signer,
  constants,
  BigNumber,
} from "ethers";
import { ethers } from "hardhat";

describe("zkAutoChess", function () {
  let zkAutoChessContract: ContractFactory;
  let zkAutoChess: Contract;

  let owner: Signer;
  let addr1: Signer;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    zkAutoChessContract = await ethers.getContractFactory("zkAutoChess");
    zkAutoChess = await zkAutoChessContract.deploy();
    await zkAutoChess.deployed();

    expect(await zkAutoChess.getLastBattleId()).to.equal(0);
  });

  describe("Chess Piece", function () {
    it("Should only allow owner update chess piece", async function () {
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

  describe("Create Battle", function () {
    it("Should create a battle when deployed", async function () {
      const battle_0 = await zkAutoChess.getBattle(0);

      expect(battle_0["playerA"]).to.equal(await owner.getAddress());
      expect(battle_0["playerB"]).to.equal(constants.AddressZero);
      expect(battle_0["canJoin"]).to.equal(true);
    });

    it("Should be able to create battle by other address", async function () {
      const newBattleId = await zkAutoChess.connect(addr1).createBattle();

      const newBattle = await zkAutoChess.getBattle(
        BigNumber.from(newBattleId).toNumber()
      );
      expect(newBattle["playerA"]).to.equal(await addr1.getAddress());
      expect(newBattle["playerB"]).to.equal(constants.AddressZero);
      expect(newBattle["canJoin"]).to.equal(true);
    });
  });

  describe("Join Battle", function () {
    it("Should be able to join battle from other address", async function () {
      await zkAutoChess.connect(addr1).joinBattle(0);

      const battle_0 = await zkAutoChess.getBattle(0);
      expect(battle_0["canJoin"]).to.equal(false);
    });
  });
});
