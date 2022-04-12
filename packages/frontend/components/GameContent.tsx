import {
  Box,
  Center,
  Heading,
  HStack,
  SimpleGrid,
  VStack,
} from "@chakra-ui/layout";
import {
  Button,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import GameGrid from "./Playfield/GameGrid";
import gamePieceMapping from "./GamePiece/GamePieceMapping";
import { useState } from "react";
import GamePieceTableRow from "./GamePieceTableRow";
import IGamePiece from "./GamePiece/IGamePiece";
import IGameGrid from "./Playfield/IGameGrid";
import { useEthers } from "@usedapp/core";

const EMPTY_GAME_FIELD: IGameGrid[] = [
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
  {
    gamePiece: undefined,
  },
];

const COST = 8;

const GameContent = () => {
  const { account } = useEthers();

  const [gameField, setGameField] = useState<IGameGrid[]>(EMPTY_GAME_FIELD);
  const [remainingCost, setRemainingCost] = useState(COST);
  const [activeGridIndex, setActiveGridIndex] = useState(-1);
  const [isGameFieldEmpty, setIsGameFieldEmpty] = useState(true);

  const handlePieceSelect = (gamePiece: IGamePiece) => {
    if (gamePiece.cost > remainingCost) return;
    const newGameFields = gameField.map((gameGrid, index) => {
      if (index === activeGridIndex) {
        setRemainingCost(remainingCost - gamePiece.cost);
        return {
          gamePiece: gamePiece,
        };
      }
      return gameGrid;
    });
    setGameField(newGameFields);
    setIsGameFieldEmpty(false);
    setActiveGridIndex(-1);
  };

  const handleGridClick = (gridIndex: number) => {
    if (remainingCost <= 0) return;
    if (gridIndex !== activeGridIndex) {
      setActiveGridIndex(gridIndex);
    } else {
      setActiveGridIndex(-1);
    }
  };

  const onResetClick = () => {
    setRemainingCost(COST);
    setActiveGridIndex(-1);
    setGameField(EMPTY_GAME_FIELD);
  };

  const onSubmitClick = () => {
    if (!account) return;
    console.log("Success");
  };

  return (
    <Center p={"10px"}>
      <VStack>
        <Heading>Your Playfield</Heading>
        <Text my={"10px"}>Press the grid and select the piece below</Text>
        <SimpleGrid
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={2}
          border={"1px"}
          p={"5px"}
        >
          {gameField.map((gameGrid, index) => {
            return (
              <GameGrid
                key={`gameGrid_${index}`}
                gameGrid={gameGrid}
                index={index}
                handleClick={handleGridClick}
              />
            );
          })}
        </SimpleGrid>
        {!isGameFieldEmpty && (
          <Box my={"20px"}>
            <HStack>
              <Button colorScheme={"red"} onClick={onResetClick} minW={"100px"}>
                Reset
              </Button>
              <Button
                colorScheme={"green"}
                onClick={onSubmitClick}
                minW={"100px"}
              >
                Submit
              </Button>
            </HStack>
          </Box>
        )}
        <Heading mt={"15px"}>Remaining Cost: {remainingCost}</Heading>
        <TableContainer>
          <Table size={"sm"}>
            <Thead>
              <Tr>
                <Th>Piece</Th>
                <Th isNumeric>Health</Th>
                <Th isNumeric>Attack</Th>
                <Th isNumeric>Range</Th>
                <Th isNumeric>Cost</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {gamePieceMapping.map((gamePiece, index) => {
                return (
                  <GamePieceTableRow
                    key={index}
                    gamePiece={gamePiece}
                    activeGridIndex={activeGridIndex}
                    remainingCost={remainingCost}
                    handlePieceSelect={handlePieceSelect}
                  />
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Center>
  );
};

export default GameContent;
