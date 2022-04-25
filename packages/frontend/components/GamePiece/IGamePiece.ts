interface IGamePiece {
  pieceId: number;
  pieceIcon: any;
  pieceName: string;
  cost: number;
  health: number;
  attack: number;
  range: number;
}

export default IGamePiece;
