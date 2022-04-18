import Head from "next/head";
import { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  Mainnet,
  Harmony,
  DAppProvider,
  Config,
  DEFAULT_SUPPORTED_CHAINS,
} from "@usedapp/core";
import { getDefaultProvider } from "ethers";
import { HarmonyTestnet } from "../scripts/harmonyTestnet";

type LayoutProps = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "zkAutoChess" }: LayoutProps) => {
  const config: Config = {
    readOnlyChainId: HarmonyTestnet.chainId,
    readOnlyUrls: {
      // [Mainnet.chainId]: getDefaultProvider("mainnet"),
      [HarmonyTestnet.chainId]: "https://api.s0.b.hmny.io",
    },
    networks: [...DEFAULT_SUPPORTED_CHAINS, HarmonyTestnet],
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
      <main style={{ minHeight: "90vh", overflow: "hidden" }}>{children}</main>
      <Footer />
    </DAppProvider>
  );
};

export default Layout;
