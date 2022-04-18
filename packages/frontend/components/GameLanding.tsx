import {
  Button,
  VStack,
  Text,
  Box,
  InputRightElement,
  Input,
  InputGroup,
  Heading,
} from "@chakra-ui/react";
import { useCall, useContractFunction, useEthers } from "@usedapp/core";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import zkAutoChessArtifact from "../contracts/zkAutoChess.json";

const GameLanding = () => {
  const { account } = useEthers();
  const [inputBattleId, setInputBattleId] = useState(1);
  const handleInputBattleIdChange = (e: any) =>
    setInputBattleId(e.target.value);

  const zkAutoChessAddress = process.env.NEXT_PUBLIC_ZKAUTOCHESS_CONTRACT;
  const zkAutoChessInterface = new ethers.utils.Interface(
    zkAutoChessArtifact.abi
  );
  const zkAutoChessContract = new Contract(
    zkAutoChessAddress,
    zkAutoChessInterface
  );

  const onCreateBattle = () => {
    // createBattleFunction.send();
  };

  const onJoinBattle = async () => {
    // getBattleFunction.send(1);
  };

  return (
    <VStack py={4}>
      {/* <Heading>{value}</Heading> */}
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
