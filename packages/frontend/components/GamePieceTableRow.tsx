import { Button, Td, Tr } from "@chakra-ui/react";

const GamePieceTableRow = ({
  gamePiece,
  activeGridIndex,
  remainingCost,
  handlePieceSelect,
}) => {
  const onPieceSelect = () => {
    handlePieceSelect(gamePiece);
  };

  return (
    <Tr>
      <Td>
        {gamePiece.pieceIcon} {gamePiece.pieceName}
      </Td>
      <Td isNumeric>{gamePiece.health}</Td>
      <Td isNumeric>{gamePiece.attack}</Td>
      <Td isNumeric>{gamePiece.range}</Td>
      <Td isNumeric>{gamePiece.cost}</Td>
      <Td w={"110px"} h={"75px"}>
        {remainingCost >= gamePiece.cost && (
          <Button size="md" colorScheme={"blue"} onClick={onPieceSelect}>
            Select
          </Button>
        )}
      </Td>
    </Tr>
  );
};

export default GamePieceTableRow;
