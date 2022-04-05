import { Box, Button, Divider, HStack, Text } from "@chakra-ui/react";
import ColorModeButton from "./ColorModeButton";
import WalletConnectButton from "./WalletConnectButton";

const Navbar = () => {
  return (
    <nav>
      <HStack justify="center" padding={"0.5rem 1rem"}>
        <Text fontSize="2xl">ZKAutoChess</Text>
        <Box width={"80%"}></Box>

        <ColorModeButton />
        <WalletConnectButton />
      </HStack>
      <Divider />
    </nav>
  );
};

export default Navbar;
