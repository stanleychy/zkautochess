import { Center, Heading } from "@chakra-ui/react";
import GameContent from "../components/GameContent";
import { useEthers } from "@usedapp/core";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { useState } from "react";
import GameLanding from "../components/GameLanding";

const IndexPage = () => {
  const { account } = useEthers();

  const [activeBattleId, setActiveBattleId] = useState<number>(0);
  const [battleIds, setBattleIds] = useState<number[]>([]);

  return (
    <Center>
      {account ? (
        activeBattleId > 0 ? (
          <GameContent
            battleId={activeBattleId}
            handleBackButtonClick={() => {
              setActiveBattleId(0);
            }}
          />
        ) : (
          <GameLanding />
        )
      ) : (
        <Heading p={4}>
          Connect Your Wallet To Start
          <ArrowUpIcon />
        </Heading>
      )}
    </Center>
  );
};

export default IndexPage;
