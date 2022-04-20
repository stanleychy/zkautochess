import { useEthers } from "@usedapp/core";
import { useState, useEffect } from "react";

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

  const updatePlayerCache = (newPlayerCache: PlayerCache) => {
    setPlayerCache(newPlayerCache);
    window.localStorage.setItem(account, JSON.stringify(newPlayerCache));
  };

  useEffect(() => {
    const cacheString: string = window.localStorage.getItem(account);
    if (cacheString) {
      const playerCache: PlayerCache = JSON.parse(cacheString);
      setPlayerCache(playerCache);
    }
  }, []);

  return { playerCache, updatePlayerCache };
};
