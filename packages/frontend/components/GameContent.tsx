import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  VStack,
} from "@chakra-ui/layout";
import {
  Button,
  IconButton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import GameGrid from "./Playfield/GameGrid";
import gamePieceMapping from "./GamePiece/GamePieceMapping";
import { useEffect, useState } from "react";
import GamePieceTableRow from "./GamePieceTableRow";
import IGamePiece from "./GamePiece/IGamePiece";
import IGameGrid from "./Playfield/IGameGrid";
import { useContractFunction, useEthers } from "@usedapp/core";
import { ArrowBackIcon, RepeatIcon } from "@chakra-ui/icons";
import { connectContract, deploy } from "../contracts/zkAutoChess";
import { BigNumber, Contract, ethers } from "ethers";
import generateCalldata from "../scripts/generate_calldata";
import useContract from "../hooks/useContract";
import {
  BattleCache,
  PlayerCache,
  usePlayerCache,
} from "../hooks/usePlayerCache";

type GameContentProps = {
  battleId: number;
  handleBackButtonClick: () => void;
};

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

const GameContent = ({ battleId, handleBackButtonClick }: GameContentProps) => {
  const { account } = useEthers();
  const toast = useToast();
  const zkAutoChessContract = useContract();
  const { playerCache, updatePlayerCache } = usePlayerCache();

  const [playfield, setPlayfield] = useState<IGameGrid[]>(EMPTY_GAME_FIELD);
  const [opponentPlayfield, setOpponentPlayfield] =
    useState<IGameGrid[]>(EMPTY_GAME_FIELD);

  const [remainingCost, setRemainingCost] = useState(COST);
  const [activeGridIndex, setActiveGridIndex] = useState(-1);

  const [isRevealState, setIsRevealState] = useState(false);
  const [isPlayfieldEmpty, setIsPlayfieldEmpty] = useState(true);
  const [isMoveDeployed, setIsMoveDeployed] = useState(false);
  const [isMoveRevealed, setIsMoveRevealed] = useState(false);
  const [isOpponentDeployed, setIsOpponentDeployed] = useState(false);
  const [isOpponentRevealed, setIsOpponentRevealed] = useState(false);

  const deployPlayfieldFunction = useContractFunction(
    zkAutoChessContract,
    "deploy"
  );

  const revealPlayfieldFunction = useContractFunction(
    zkAutoChessContract,
    "reveal"
  );

  const handlePieceSelect = (gamePiece: IGamePiece) => {
    if (gamePiece.cost > remainingCost) return;
    const newPlayfield = playfield.map((gameGrid, index) => {
      if (index === activeGridIndex) {
        setRemainingCost(remainingCost - gamePiece.cost);
        return {
          gamePiece: gamePiece,
        };
      }
      return gameGrid;
    });
    setPlayfield(newPlayfield);
    setIsPlayfieldEmpty(false);
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
    if (isPlayfieldEmpty) return;
    setRemainingCost(COST);
    setActiveGridIndex(-1);
    setPlayfield(EMPTY_GAME_FIELD);
  };

  const onSubmitClick = async () => {
    if (!account || !zkAutoChessContract || isPlayfieldEmpty) return;
    try {
      const input = {
        playfield: playfield.map((gameGrid) => {
          if (!gameGrid.gamePiece) return 0;
          return gameGrid.gamePiece.pieceId;
        }),
        salt: crypto.getRandomValues(new BigUint64Array(1))[0],
      };
      const { hash, field, salt } = await generateCalldata(input);
      deployPlayfieldFunction.send(battleId, hash);
      let newPlayerCache = { ...playerCache };
      newPlayerCache[battleId] = {
        hash: hash,
        remainingCost: remainingCost,
        playfield: field,
        salt: salt,
      };
      updatePlayerCache(newPlayerCache);
    } catch (error) {
      console.log(error);
    }
  };

  const onRevealClick = async () => {
    if (!account || !zkAutoChessContract || isPlayfieldEmpty) return;
    try {
      const battleCache: BattleCache = playerCache[battleId];
      const input = {
        playfield: battleCache.playfield,
        salt: battleCache.salt,
      };
      const { hash, field, salt, a, b, c } = await generateCalldata(input);
      revealPlayfieldFunction.send(battleId, field, salt, a, b, c);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBattleRefresh = async () => {
    if (!account || !zkAutoChessContract) return;
    try {
      const battle = await zkAutoChessContract.getBattle(battleId);
      setIsRevealState(battle.canReveal);
      if (battle.canReveal) {
        const opponentAddress =
          account == battle.playerA ? battle.playerB : battle.playerA;
        const opponentState = await zkAutoChessContract.getBattlePlayerState(
          battleId,
          opponentAddress
        );
        if (opponentState) {
          const opponentPlayfield = opponentState.field.map(
            (gamePieceId: BigNumber) => {
              const gamePiece =
                gamePieceMapping[gamePieceId.toNumber() - 1] ?? undefined;
              return {
                gamePiece: gamePiece,
              };
            }
          );
          setOpponentPlayfield(opponentPlayfield.reverse());
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    switch (deployPlayfieldFunction.state.status) {
      case "Success":
        setIsMoveDeployed(true);
        toast({
          title: "Playfield Deployed",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleBattleRefresh();
        break;
      case "Mining":
        toast({
          title: "Deploying Playfield...",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
        break;
      case "PendingSignature":
        console.log("deployPlayfield PendingSignature");
        break;
      case "Exception":
      case "Fail":
        toast({
          title: "Deploy Playfield Error",
          description: deployPlayfieldFunction.state.errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  }, [deployPlayfieldFunction.state]);

  useEffect(() => {
    switch (revealPlayfieldFunction.state.status) {
      case "Success":
        setIsMoveRevealed(true);
        toast({
          title: "Playfield Revealed",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        break;
      case "Mining":
        toast({
          title: "Revealing Playfield...",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
        break;
      case "PendingSignature":
        console.log("revealPlayfield PendingSignature");
        break;
      case "Exception":
      case "Fail":
        toast({
          title: "Reveal Playfield Error",
          description: revealPlayfieldFunction.state.errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  }, [revealPlayfieldFunction.state]);

  useEffect(() => {
    const battleCache: BattleCache = playerCache[battleId];
    if (battleCache) {
      const playfield: IGameGrid[] = battleCache.playfield.map(
        (gamePieceId: number) => {
          const gamePiece = gamePieceMapping[gamePieceId - 1] ?? undefined;
          if (gamePiece) {
            setIsPlayfieldEmpty(false);
          }
          return {
            gamePiece: gamePiece,
          };
        }
      );
      setRemainingCost(battleCache.remainingCost);
      setPlayfield(playfield);
    }
  }, [playerCache]);

  return (
    <Center p={"10px"}>
      <VStack>
        <Flex width={"100%"} justifyContent={"center"} p="2">
          <Box>
            <IconButton
              aria-label={"Back"}
              icon={<ArrowBackIcon />}
              onClick={handleBackButtonClick}
            />
          </Box>
          <Spacer />
          <Flex>
            <Text fontSize="xl" mr={2}>{`Battle ID: ${battleId} - ${
              isRevealState ? "Reveal" : "Deploy"
            } Phase`}</Text>
            <IconButton
              aria-label="refresh"
              size={"sm"}
              icon={<RepeatIcon />}
              onClick={handleBattleRefresh}
            />
          </Flex>
        </Flex>
        <Heading size={"md"}>Opponent Playfield</Heading>
        <SimpleGrid
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={2}
          border={"1px"}
          p={"5px"}
        >
          {opponentPlayfield.map((gameGrid, index) => {
            return (
              <Button
                key={`opponentGameGrid_${index}`}
                minW={"60px"}
                minH={"60px"}
              >
                {gameGrid.gamePiece ? gameGrid.gamePiece.pieceIcon : ""}
              </Button>
            );
          })}
        </SimpleGrid>
        <Heading size={"md"}>Your Playfield</Heading>
        <Text my={"10px"}>Press the grid and select the piece below</Text>
        <SimpleGrid
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={2}
          border={"1px"}
          p={"5px"}
        >
          {playfield.map((gameGrid, index) => {
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
        <Box my={"20px"}>
          <HStack>
            {isRevealState ? (
              <Button
                colorScheme={"green"}
                onClick={onRevealClick}
                minW={"100px"}
              >
                Reveal
              </Button>
            ) : (
              <>
                <Button
                  colorScheme={"red"}
                  onClick={onResetClick}
                  minW={"100px"}
                >
                  Reset
                </Button>
                <Button
                  colorScheme={"green"}
                  onClick={onSubmitClick}
                  minW={"100px"}
                >
                  Submit
                </Button>
              </>
            )}
          </HStack>
        </Box>
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
