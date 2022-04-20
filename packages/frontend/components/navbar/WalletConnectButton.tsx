import { Button } from "@chakra-ui/react";
import { shortenAddress, useEthers } from "@usedapp/core";

const WalletConnectButton = () => {
  const { activateBrowserWallet, account } = useEthers();

  return (
    <Button
      onClick={() => {
        activateBrowserWallet();
      }}
      bgColor="green.500"
      minW={"9rem"}
    >
      {account ? shortenAddress(account) : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnectButton;
