import { Divider, HStack, Text } from "@chakra-ui/react";

const Navbar = () => {
  return (
    <nav>
      <HStack>
        <Text fontSize="2xl">ZKAutoChess</Text>
      </HStack>
      <Divider />
    </nav>
  );
};

export default Navbar;
