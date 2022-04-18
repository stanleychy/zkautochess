import { Chain } from "@usedapp/core";

export const HarmonyTestnet: Chain = {
  chainId: 1666700000,
  chainName: "HarmonyTestnet",
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: "0x0000000000000000000000000000000000000000",
  getExplorerAddressLink: (address: string) =>
    `https://explorer.pops.one/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://explorer.pops.one/tx/${transactionHash}`,
};
