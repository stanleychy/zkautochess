// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title zkAutoChess
 * @dev On-chain auto chess battle game
 */
contract zkAutoChess is Ownable {
    /**
     * @dev Chess Piece structure and mapping defintion
     */
    struct ChessPiece {
        bytes32 name;
        uint256 health;
        uint256 attack;
        uint256 range;
    }

    mapping(uint256 => ChessPiece) public chessPieces;

    /**
     * @dev Battle structure and mapping defintion
     */
    struct Battle {
        address playerA;
        uint256[] playerAField;
        uint256 playerASalt;
        address playerB;
        uint256[] playerBField;
        uint256 playerBSalt;
        bool canJoin;
        bool canReveal;
        address winner;
    }

    uint256 lastBattleId;
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256[]) public playerBattleIds;

    constructor() {
        battles[0] = Battle(
            msg.sender,
            new uint256[](8),
            0,
            address(0),
            new uint256[](8),
            0,
            true,
            false,
            address(0)
        );
        playerBattleIds[msg.sender].push(0);
    }

    /**
     * @dev Set new or update chess piece
     * @param chessPieceId targeted chessPieceId
     * @param name chess piece name
     * @param health chess piece health
     * @param attack chess piece attack
     * @param range chess piece range
     */
    function setChessPiece(
        uint256 chessPieceId,
        bytes32 name,
        uint256 health,
        uint256 attack,
        uint256 range
    ) public onlyOwner {
        require(chessPieceId > 0, "chessPieceId must be larger than 0");
        chessPieces[chessPieceId] = ChessPiece(name, health, attack, range);
    }

    /**
     * @dev Create a new battle
     * @param battleId targeted battleId
     */
    function getBattleResult(uint256 battleId) public returns (bytes32) {
        require(battleId <= lastBattleId, "Battle does not exist");
        Battle memory battle = battles[battleId];
        require(battle.playerB != address(0), "PlayerB is missing");
        require(battle.canReveal, "Battle not ready for reveal");
        require(battle.playerASalt > 0, "PlayerA not yet reveal");
        require(battle.playerBSalt > 0, "PlayerB not yet reveal");
        return "Test";
    }

    /**
     * @dev Create a new battle
     */
    function createBattle() public returns (uint256) {
        lastBattleId++;
        playerBattleIds[msg.sender].push(lastBattleId);
        battles[lastBattleId] = Battle(
            msg.sender,
            new uint256[](8),
            0,
            address(0),
            new uint256[](8),
            0,
            true,
            false,
            address(0)
        );
        return lastBattleId;
    }

    /**
     * @dev Join a battle
     * @param battleId targeted battleId
     */
    function joinBattle(uint256 battleId) public {
        require(battleId <= lastBattleId, "Battle does not exist");
        require(battles[battleId].canJoin, "Battle is full");
        battles[battleId].canJoin = false;
        playerBattleIds[msg.sender].push(lastBattleId);
        battles[battleId].playerB = msg.sender;
    }

    /**
     * @dev Get lastBattleId
     */
    function getLastBattleId() public view returns (uint256) {
        return lastBattleId;
    }

    /**
     * @dev Get information of a battle
     * @param battleId targeted battleId
     */
    function getBattle(uint256 battleId) public view returns (Battle memory) {
        return battles[battleId];
    }

    /**
     * @dev Get information of a battle
     */
    function getPlayerBattles() public view returns (uint256[] memory) {
        return playerBattleIds[msg.sender];
    }
}
