import { useEffect, useState } from "react";

import { useEthers } from "@usedapp/core";

export type BattleCache = {
  hash: bigint;
  remainingCost: number;
  playfield: number[];
  salt: bigint;
};

export type PlayerCache = {
  [battleId: number]: BattleCache;
};

export const usePlayerCache = () => {
  const { account } = useEthers();
  const [playerCache, setPlayerCache] = useState<PlayerCache>({});

  const updatePlayerLocalStorageCache = () => {
    window.localStorage.setItem(account.toLowerCase(), JSON.stringify(playerCache));
  };

  useEffect(() => {
    const cacheString: string = window.localStorage.getItem(account.toLowerCase());
    if (cacheString) {
      const playerCache: PlayerCache = JSON.parse(cacheString);
      setPlayerCache(playerCache);
    }
  }, []);

  return { playerCache, setPlayerCache, updatePlayerLocalStorageCache };
};
