import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  VStack,
  Text,
  Box,
  InputRightElement,
  Input,
  InputGroup,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useCall, useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber, Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import zkAutoChessArtifact from "../contracts/zkAutoChess.json";

type GameLandingProps = {
  handleBattleJoin: (battleId: number) => void;
};

const GameLanding = ({ handleBattleJoin }: GameLandingProps) => {
  const { account, library, error } = useEthers();
  const [playerBattleIds, setPlayerBattleIds] = useState<number[]>([]);
  const [inputBattleId, setInputBattleId] = useState(1);
  const handleInputBattleIdChange = (e: any) =>
    setInputBattleId(e.target.value);

  const zkAutoChessAddress = process.env.NEXT_PUBLIC_ZKAUTOCHESS_CONTRACT;
  const zkAutoChessInterface = new ethers.utils.Interface(
    zkAutoChessArtifact.abi
  );
  const zkAutoChessContract = new Contract(
    zkAutoChessAddress,
    zkAutoChessInterface,
    library.getSigner()
  );

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
      console.log(error.errorArgs[0]);
    }
  };

  const onJoinBattle = async () => {
    try {
      const battle = await zkAutoChessContract.getBattle(inputBattleId);
      await joinBattleFunction.send(inputBattleId);
    } catch (error) {
      console.log(error.errorArgs[0]);
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
        break;
      case "Mining":
        break;
      case "PendingSignature":
        break;
      case "Exception":
        break;
      case "Fail":
        break;
      default:
        break;
    }
  }, [createBattleFunction.state]);

  useEffect(() => {
    switch (joinBattleFunction.state.status) {
      case "Success":
        handleBattleJoin(inputBattleId);
        break;
      case "Mining":
        break;
      case "PendingSignature":
        break;
      case "Exception":
        break;
      case "Fail":
        break;
      default:
        break;
    }
  }, [joinBattleFunction.state]);

  useEffect(() => {
    getPlayerBattles();
  }, []);

  return (
    <VStack py={4}>
      {playerBattleIds.length && (
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
    </VStack>
  );
};

export default GameLanding;
