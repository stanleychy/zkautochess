import { Center } from "@chakra-ui/react";
import Head from "next/head";
import { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  Mainnet,
  Harmony,
  Hardhat,
  DAppProvider,
  useEtherBalance,
  useEthers,
  Config,
} from "@usedapp/core";
import { getDefaultProvider } from "ethers";

type LayoutProps = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "zkAutoChess" }: LayoutProps) => {
  const config: Config = {
    readOnlyChainId: Harmony.chainId,
    readOnlyUrls: {
      [Mainnet.chainId]: getDefaultProvider("mainnet"),
      // [Harmony.chainId]: getDefaultProvider("mainnet"),
      // [Hardhat.chainId]: getDefaultProvider("mainnet"),
    },
    autoConnect: false,
  };

  return (
    <DAppProvider config={config}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <Navbar />
      </header>
      <main style={{ minHeight: "90vh" }}>{children}</main>
      <Footer />
    </DAppProvider>
  );
};

export default Layout;
