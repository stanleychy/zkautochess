import IGamePiece from "./IGamePiece";

/**
 * Fighter - Cost: 1, HP: 4, Attack: 1, Range: 1
 * Theft   - Cost: 2, HP: 2, Attack: 2, Range: 1
 * Ranger  - Cost: 3, HP: 1, Attack: 2, Range: 2
 */
const gamePieceMapping: IGamePiece[] = [
  {
    pieceId: 1,
    pieceIcon: "🥊",
    pieceName: "Fighter",
    cost: 1,
    health: 4,
    attack: 1,
    range: 1,
  },
  {
    pieceId: 2,
    pieceIcon: "🗡️",
    pieceName: "Theft",
    cost: 2,
    health: 2,
    attack: 2,
    range: 1,
  },
  {
    pieceId: 3,
    pieceIcon: "🏹",
    pieceName: "Ranger",
    cost: 3,
    health: 1,
    attack: 2,
    range: 2,
  },
];

export default gamePieceMapping;
