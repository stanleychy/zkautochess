import { Center, Heading } from "@chakra-ui/react";
import GameContent from "../components/GameContent";
import { useEthers } from "@usedapp/core";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import GameLanding from "../components/GameLanding";

const IndexPage = () => {
  const { account } = useEthers();

  const [activeBattleId, setActiveBattleId] = useState<number>(0);

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
          <GameLanding
            handleBattleJoin={(battleId: number) => {
              setActiveBattleId(battleId);
            }}
          />
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
