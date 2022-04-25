import { Box, Divider, HStack, Icon, Heading, Link } from "@chakra-ui/react";
import { GoMarkGithub } from "react-icons/go";
import ColorModeButton from "./ColorModeButton";
import WalletConnectButton from "./WalletConnectButton";

const Navbar = () => {
  return (
    <nav>
      <HStack justify="center" padding={"0.5rem 1rem"}>
        <Heading fontSize="2xl">ZKAutoChess</Heading>
        <Box width={"80%"}></Box>
        <Link
          href={"https://github.com/HKerStanley/zkautochess"}
          isExternal
          alignItems={"center"}
        >
          <Icon as={GoMarkGithub} w={8} h={8} pos={"relative"} bottom={-0.5} />
        </Link>
        <ColorModeButton />
        <WalletConnectButton />
      </HStack>
      <Divider />
    </nav>
  );
};

export default Navbar;
