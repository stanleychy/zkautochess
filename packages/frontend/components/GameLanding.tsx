import { BigNumber, Contract, utils } from "ethers";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import useContract from "../hooks/useContract";

type GameLandingProps = {
  handleBattleJoin: (battleId: number) => void;
};

const GameLanding = ({ handleBattleJoin }: GameLandingProps) => {
  const toast = useToast();
  const { account } = useEthers();
  const { zkAutoChessContract } = useContract();

  const [playerBattleIds, setPlayerBattleIds] = useState<number[]>([]);
  const [inputBattleId, setInputBattleId] = useState(1);

  const handleInputBattleIdChange = (e: any) =>
    setInputBattleId(e.target.value);

  const createBattleFunction = useContractFunction(
    zkAutoChessContract,
    "createBattle"
  );

  const joinBattleFunction = useContractFunction(
    zkAutoChessContract,
    "joinBattle"
  );

  const onCreateBattle = async () => {
    try {
      createBattleFunction.send();
    } catch (error) {
      console.log(error);
    }
  };

  const onJoinBattle = async () => {
    try {
      const battle = await zkAutoChessContract.getBattle(inputBattleId);
      await joinBattleFunction.send(inputBattleId);
    } catch (error) {
      console.log(error);
    }
  };

  const getPlayerBattles = async () => {
    try {
      const battleIds = await zkAutoChessContract.getPlayerBattles();
      setPlayerBattleIds(
        battleIds.map((battleId: BigNumber) => {
          return battleId.toNumber();
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    switch (createBattleFunction.state.status) {
      case "Success":
        toast({
          title: "Battle Created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        getPlayerBattles();
        break;
      case "Mining":
        toast({
          title: "Creating Battle...",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
        break;
      case "PendingSignature":
        console.log("createBattle PendingSignature");
        break;
      case "Exception":
      case "Fail":
        toast({
          title: "Create Battle Error",
          description: createBattleFunction.state.errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  }, [createBattleFunction.state]);

  useEffect(() => {
    switch (joinBattleFunction.state.status) {
      case "Success":
        toast({
          title: "Joined Battle",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleBattleJoin(inputBattleId);
        break;
      case "Mining":
        toast({
          title: "Joining Battle...",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
        break;
      case "PendingSignature":
        console.log("createBattle PendingSignature");
        break;
      case "Exception":
      case "Fail":
        toast({
          title: "Join Battle Error",
          description: joinBattleFunction.state.errorMessage,
          status: "error",
          duration: 1000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  }, [joinBattleFunction.state]);

  useEffect(() => {
    if (!account || !zkAutoChessContract) return;
    getPlayerBattles();
  }, [account, zkAutoChessContract]);

  return (
    <Flex direction={"column"} align={"center"} py={4}>
      {playerBattleIds.length > 0 && (
        <>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              View Joined Battles
            </MenuButton>
            <MenuList>
              {playerBattleIds.map((playerBattleId: number) => {
                return (
                  <MenuItem
                    key={playerBattleId}
                    onClick={() => {
                      handleBattleJoin(playerBattleId);
                    }}
                  >
                    {playerBattleId}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Text>OR</Text>
        </>
      )}

      <InputGroup>
        <Input
          value={inputBattleId}
          onChange={handleInputBattleIdChange}
          type="number"
          width="6rem"
          mr={2}
          placeholder="Enter Battle Id"
        />
        <Button minW={"9rem"} onClick={onJoinBattle}>
          Join A New Battle
        </Button>
      </InputGroup>
      <Text>OR</Text>
      <Button onClick={onCreateBattle} bgColor="yellow.500" minW={"9rem"}>
        Create New Battle
      </Button>
    </Flex>
  );
};

export default GameLanding;
