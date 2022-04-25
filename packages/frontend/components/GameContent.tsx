import { ArrowBackIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  BattleCache,
  PlayerCache,
  usePlayerCache,
} from "../hooks/usePlayerCache";
import { BigNumber, Contract, ethers } from "ethers";
import {
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Heading,
  ListItem,
  SimpleGrid,
  Spacer,
  UnorderedList,
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
import { useContractFunction, useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";

import GameGrid from "./Playfield/GameGrid";
import GamePieceTableRow from "./GamePieceTableRow";
import IGameGrid from "./Playfield/IGameGrid";
import IGamePiece from "./GamePiece/IGamePiece";
import { floor } from "lodash";
import gamePieceMapping from "./GamePiece/GamePieceMapping";
import generateCalldata from "../scripts/generate_calldata";
import useContract from "../hooks/useContract";

type GameContentProps = {
  battleId: number;
  handleBackButtonClick: () => void;
};

interface BattleGamePiece extends IGamePiece {
  position: { x: number; y: number };
  target: number;
  isAlive: boolean
}

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
  const { zkAutoChessContract } = useContract();
  const { playerCache, setPlayerCache, updatePlayerLocalStorageCache } =
    usePlayerCache();

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

  const [winner, setWinner] = useState("");
  const [battleLog, setBattleLog] = useState([]);

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
      setPlayerCache(newPlayerCache);
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

  const onBattleClick = async () => {
    if (
      !account ||
      !zkAutoChessContract ||
      !isMoveRevealed ||
      !isOpponentRevealed
    )
      return;
    try {
      const battle = await zkAutoChessContract.getBattle(battleId);
      const playerAState = await zkAutoChessContract.getBattlePlayerState(
        battleId,
        battle["playerA"]
      );
      const playerBState = await zkAutoChessContract.getBattlePlayerState(
        battleId,
        battle["playerB"]
      );
      let teamA: Array<BattleGamePiece> = [];
      let teamB: Array<BattleGamePiece> = [];
      let isOccupied = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      for (let i = 0; i < 8; ++i) {
        const playerAGamePiece =
          gamePieceMapping[playerAState["field"][7 - i].toNumber() - 1];
        if (playerAGamePiece) {
          let x = i % 4;
          let y = floor(i / 4);
          isOccupied[y][x] = 1;
          const positionedGamePieceA = {
            position: { x: x, y: y },
            target: -1,
            isAlive: true,
            ...playerAGamePiece,
          };
          teamA.push(positionedGamePieceA);
        }

        const playerBGamePiece =
          gamePieceMapping[playerBState["field"][i].toNumber() - 1];
        if (playerBGamePiece) {
          let x = i % 4;
          let y = floor(2 + i / 4);
          isOccupied[y][x] = 1;
          const positionedGamePieceB = {
            position: { x: x, y: y },
            target: -1,
            isAlive: true,
            ...playerBGamePiece,
          };
          teamB.push(positionedGamePieceB);
        }
      }
      let battleLog: string[] = [];
      let teamARemaining = teamA.length;
      let teamBRemaining = teamB.length;
      while (teamARemaining > 0 && teamBRemaining > 0) {
        for (let i = 0; i < teamA.length; ++i) {
          if (teamA[i].isAlive && teamA[i].health <= 0) {
            isOccupied[teamA[i].position.y][teamA[i].position.x] = 0;
            teamA[i].isAlive = false;
            teamARemaining -= 1;
          } else {
            if (teamA[i].target < 0) {
              let minDistance = -1;
              for (let j = 0; j < teamB.length; ++j) {
                let distance = Math.sqrt(
                  Math.pow(teamB[j].position.x - teamA[i].position.x, 2) +
                    Math.pow(teamB[j].position.y - teamA[i].position.y, 2)
                );
                if (
                  distance <= teamA[i].range &&
                  (distance < minDistance || minDistance < 0)
                )
                  teamA[i].target = j;
              }
            }
            if (teamA[i].target >= 0) {
              // Attack
              teamB[teamA[i].target].health -= teamA[i].attack;
              battleLog.push(
                `${teamA[i].pieceName} A${i} deal ${
                  teamA[i].attack
                } damage to ${teamB[teamA[i].target].pieceName} B${
                  teamA[i].target
                }`
              );
              if (teamB[teamA[i].target].health <= 0) teamA[i].target = -1
            } else {
              // Move
              let x = teamA[i].position.x;
              let y = teamA[i].position.y;
              if (y + 1 < 4) {
                if (isOccupied[y + 1][x] <= 0) {
                  isOccupied[y][x] = 0;
                  isOccupied[y + 1][x] = 1;
                  teamA[i].position.y = y + 1;
                }
              } else {
                if (x - 1 >= 0) {
                  if (isOccupied[y][x - 1] <= 0) {
                    isOccupied[y][x] = 0;
                    isOccupied[y][x - 1] = 1;
                    teamA[i].position.x = x - 1;
                  }
                }
                if (x + 1 < 4) {
                  if (isOccupied[y][x + 1] <= 0) {
                    isOccupied[y][x] = 0;
                    isOccupied[y][x + 1] = 1;
                    teamA[i].position.x = x + 1;
                  }
                }
              }
              battleLog.push(
                `${teamA[i].pieceName} A${i} moved to (${teamA[i].position.x}, ${teamA[i].position.y})`
              );
            }
          }
        }
        for (let j = 0; j < teamB.length; ++j) {
          if (teamB[j].isAlive && teamB[j].health <= 0) {
            isOccupied[teamB[j].position.y][teamB[j].position.x] = 0;
            teamB[j].isAlive = false;
            teamBRemaining -= 1;
          } else {
            if (teamB[j].target < 0) {
              let minDistance = -1;
              for (let k = 0; k < teamA.length; ++k) {
                let distance = Math.sqrt(
                  Math.pow(teamA[k].position.x - teamB[j].position.x, 2) +
                    Math.pow(teamA[k].position.y - teamB[j].position.y, 2)
                );
                if (
                  distance <= teamB[j].range &&
                  (distance < minDistance || minDistance < 0)
                )
                  teamB[j].target = k;
              }
            }
            if (teamB[j].target >= 0) {
              // Attack
              teamA[teamB[j].target].health -= teamB[j].attack;
              battleLog.push(
                `${teamB[j].pieceName} B${j} deal ${
                  teamB[j].attack
                } damage to ${teamA[teamB[j].target].pieceName} A${
                  teamB[j].target
                }`
              );
              if (teamA[teamB[j].target].health <= 0) teamB[j].target = -1
            } else {
              // Move
              let x = teamB[j].position.x;
              let y = teamB[j].position.y;
              if (y - 1 >= 0) {
                if (isOccupied[y - 1][x] <= 0) {
                  isOccupied[y][x] = 0;
                  isOccupied[y - 1][x] = 1;
                  teamB[j].position.y = y - 1;
                }
              } else {
                if (x - 1 >= 0) {
                  if (isOccupied[y][x - 1] <= 0) {
                    isOccupied[y][x] = 0;
                    isOccupied[y][x - 1] = 1;
                    teamB[j].position.x = x - 1;
                  }
                }
                if (x + 1 < 4) {
                  if (isOccupied[y][x + 1] <= 0) {
                    isOccupied[y][x] = 0;
                    isOccupied[y][x + 1] = 1;
                    teamB[j].position.x = x + 1;
                  }
                }
              }
              battleLog.push(
                `${teamB[j].pieceName} B${j} moved to (${teamB[j].position.x}, ${teamB[j].position.y})`
              );
            }
          }
        }
      }

      setWinner(teamARemaining > 0 ? "Player A" : "Player B");
      setBattleLog(battleLog);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBattleRefresh = async () => {
    if (!account || !zkAutoChessContract) return;
    try {
      const battle = await zkAutoChessContract.getBattle(battleId);
      if (battle.canReveal) setIsRevealState(battle.canReveal);

      const opponentAddress =
        account == battle.playerA ? battle.playerB : battle.playerA;
      const opponentState = await zkAutoChessContract.getBattlePlayerState(
        battleId,
        opponentAddress
      );
      if (opponentState.fieldHash > BigNumber.from("0"))
        setIsOpponentDeployed(true);
      if (opponentState.field.length > 0) {
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
        setIsOpponentRevealed(true);
      }
      const playerState = await zkAutoChessContract.getBattlePlayerState(
        battleId,
        account
      );
      if (playerState.fieldHash > BigNumber.from("0")) setIsMoveDeployed(true);
      if (playerState.field.length > 0) {
        const playerPlayfield = playerState.field.map(
          (gamePieceId: BigNumber) => {
            const gamePiece =
              gamePieceMapping[gamePieceId.toNumber() - 1] ?? undefined;
            return {
              gamePiece: gamePiece,
            };
          }
        );
        setPlayfield(playerPlayfield);
        setIsMoveRevealed(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    switch (deployPlayfieldFunction.state.status) {
      case "Success":
        toast({
          title: "Playfield Deployed",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsMoveDeployed(true);
        updatePlayerLocalStorageCache();
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
        setIsMoveDeployed(false);
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
    handleBattleRefresh();
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
      setIsMoveDeployed(true);
    }
  }, [playerCache, account, battleId, zkAutoChessContract]);

  return (
    <Center p={"10px"}>
      <VStack w={"512px"}>
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
              isRevealState
                ? isMoveRevealed && isOpponentRevealed
                  ? "Battle"
                  : "Reveal"
                : "Deploy"
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
            {isMoveDeployed ? (
              isMoveRevealed && isOpponentRevealed ? (
                !winner && (
                  <Button
                    colorScheme={"green"}
                    onClick={onBattleClick}
                    minW={"100px"}
                  >
                    Battle
                  </Button>
                )
              ) : (
                !isMoveRevealed && (
                  <Button
                    colorScheme={"green"}
                    onClick={onRevealClick}
                    minW={"100px"}
                  >
                    Reveal
                  </Button>
                )
              )
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
        {isMoveDeployed ? (
          winner && (
            <>
              <Heading mt={"15px"}>Winner: {winner}</Heading>
              <UnorderedList>
                {battleLog.map((log: string, index: number) => {
                  return <ListItem key={`log_${index}`}>{log}</ListItem>;
                })}
              </UnorderedList>
            </>
          )
        ) : (
          <>
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
          </>
        )}
      </VStack>
    </Center>
  );
};

export default GameContent;
