import { Button } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";

const WalletConnectButton = () => {
  const { activateBrowserWallet, account } = useEthers();

  return (
    <Button
      onClick={() => {
        activateBrowserWallet();
      }}
      bgColor="green.600"
    >
      {account ? account : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnectButton;
