// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title zkAutoChess
 * @dev On-chain auto chess battle game
 */
interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[10] memory input
    ) external view returns (bool);
}

contract zkAutoChess is Ownable {
    address verifierContract;

    enum BattleEventType {
        Create,
        Join,
        Reveal,
        Result
    }

    event BattleLog(
        uint256 battleId,
        BattleEventType eventType,
        address account
    );

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

    struct BattlePlayerState {
        uint256 fieldHash;
        uint256[] field;
        uint256 salt;
    }

    struct Battle {
        address playerA;
        address playerB;
        bool canJoin;
        bool canReveal;
        address winner;
    }

    uint256 public lastBattleId;
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => mapping(address => BattlePlayerState))
        public battlePlayerState;
    mapping(address => uint256[]) public playerBattleIds;

    modifier battleReadyToStart(uint256 battleId) {
        require(battleId <= lastBattleId, "Battle does not exist");
        require(battles[battleId].playerB != address(0), "PlayerB is missing");
        _;
    }

    modifier onlyPlayersOfBattle(uint256 battleId) {
        require(
            msg.sender == battles[battleId].playerA ||
                msg.sender == battles[battleId].playerB,
            "Only players of battle allowed"
        );
        _;
    }

    constructor(address _verifier) {
        verifierContract = _verifier;
    }

    /**
     * @dev Set new chess piece
     * @dev Update if chessPieceId already exists
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
     * @dev Get information of chess piece
     * @param chessPieceId targeted chessPieceId
     * @return ChessPiece
     */
    function getChessPiece(uint256 chessPieceId)
        public
        view
        returns (ChessPiece memory)
    {
        return chessPieces[chessPieceId];
    }

    /**
     * @dev Call by player to deploy their move
     * @param battleId targeted battle
     * @param hash of player move
     */
    function deploy(uint256 battleId, uint256 hash)
        public
        battleReadyToStart(battleId)
        onlyPlayersOfBattle(battleId)
    {
        require(
            battlePlayerState[battleId][msg.sender].fieldHash == 0,
            "Player already deployed move"
        );
        battlePlayerState[battleId][msg.sender].fieldHash = hash;

        if (
            battlePlayerState[battleId][battles[battleId].playerA].fieldHash !=
            0 &&
            battlePlayerState[battleId][battles[battleId].playerB].fieldHash !=
            0
        ) {
            battles[battleId].canReveal = true;
        }
    }

    /**
     * @dev Call by player to reveal their move
     * @param battleId targeted battle
     * @param input player's input
     * @param salt player's salt
     */
    function reveal(
        uint256 battleId,
        uint256[8] calldata input,
        uint256 salt,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c
    ) public battleReadyToStart(battleId) onlyPlayersOfBattle(battleId) {
        require(battles[battleId].canReveal, "Battle not ready for reveal");
        uint256[10] memory verifierInput;
        verifierInput[0] = battlePlayerState[battleId][msg.sender].fieldHash;
        for (uint256 i = 0; i < input.length; i++) {
            verifierInput[i + 1] = input[i];
        }
        verifierInput[9] = salt;
        require(
            IVerifier(verifierContract).verifyProof(a, b, c, verifierInput),
            "Invalid proof"
        );
        battlePlayerState[battleId][msg.sender].field = input;
        battlePlayerState[battleId][msg.sender].salt = salt;
    }

    /**
     * @dev Create a new battle
     */
    function createBattle() public {
        lastBattleId++;
        battles[lastBattleId] = Battle(
            msg.sender,
            address(0),
            true,
            false,
            address(0)
        );
        playerBattleIds[msg.sender].push(lastBattleId);
        emit BattleLog(lastBattleId, BattleEventType.Create, msg.sender);
    }

    /**
     * @dev Join a battle
     * @param battleId targeted battleId
     */
    function joinBattle(uint256 battleId) public {
        require(battleId <= lastBattleId, "Battle does not exist");
        require(battles[battleId].canJoin, "Battle is full");
        require(
            msg.sender != battles[battleId].playerA,
            "Player already in this Battle"
        );
        battles[battleId].canJoin = false;
        playerBattleIds[msg.sender].push(lastBattleId);
        battles[battleId].playerB = msg.sender;
        emit BattleLog(lastBattleId, BattleEventType.Join, msg.sender);
    }

    /**
     * @dev Get information of a battle
     * @param battleId targeted battleId
     */
    function getBattle(uint256 battleId) public view returns (Battle memory) {
        require(battleId <= lastBattleId, "Battle does not exist");
        return battles[battleId];
    }

    /**
     * @dev Get player information of a battle
     * @param battleId targeted battleId
     * @param player targeted player
     */
    function getBattlePlayerState(uint256 battleId, address player)
        public
        view
        returns (BattlePlayerState memory)
    {
        require(battleId <= lastBattleId, "Battle does not exist");
        return battlePlayerState[battleId][player];
    }

    /**
     * @dev Get information of a battle
     */
    function getPlayerBattles() public view returns (uint256[] memory) {
        return playerBattleIds[msg.sender];
    }
}
