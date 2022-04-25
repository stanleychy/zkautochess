import { Button } from "@chakra-ui/react";
import IGameGrid from "./IGameGrid";

type GameGridProps = {
  gameGrid: IGameGrid;
  index: number;
  handleClick: any;
};

const GameGrid = ({ gameGrid, index, handleClick }: GameGridProps) => {
  const onGridClick = () => {
    handleClick(index);
  };
  return (
    <Button onClick={onGridClick} minW={"60px"} minH={"60px"}>
      {gameGrid.gamePiece ? gameGrid.gamePiece.pieceIcon : index}
    </Button>
  );
};

export default GameGrid;
