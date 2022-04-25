import { Chain } from "@usedapp/core";

export const HarmonyTestnet: Chain = {
  chainId: 1666700000,
  chainName: "HarmonyTestnet",
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: "0xFE4980f62D708c2A84D3929859Ea226340759320",
  getExplorerAddressLink: (address: string) =>
    `https://explorer.testnet.harmony.one/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://explorer.testnet.harmony.one/tx/${transactionHash}`,
};
