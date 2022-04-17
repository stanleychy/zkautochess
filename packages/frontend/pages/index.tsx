import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import GameContent from "../components/GameContent";
import { useEthers } from "@usedapp/core";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";

const IndexPage = () => {
  const { account } = useEthers();

  const [activeBattleId, setActiveBattleId] = useState<number>(0);
  const [battleIds, setBattleIds] = useState<number[]>([1, 2, 3]);
  return (
    <>
      {activeBattleId <= 0 ? (
        <>
          <Text>Select Battle To Start</Text>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {activeBattleId}
            </MenuButton>
            <MenuList>
              {battleIds.map((battleId) => {
                return (
                  <MenuItem onClick={() => setActiveBattleId(battleId)}>
                    {battleId}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </>
      ) : (
        <GameContent battleId={activeBattleId} />
      )}
    </>
  );
};

export default IndexPage;
