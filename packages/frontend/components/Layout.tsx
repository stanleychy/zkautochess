import {
  Config,
  DAppProvider,
  Harmony,
} from "@usedapp/core";

import Footer from "./Footer";
import { HarmonyTestnet } from "../scripts/harmonyTestnet";
import Head from "next/head";
import Navbar from "./navbar/Navbar";
import { ReactNode } from "react";\

type LayoutProps = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "zkAutoChess" }: LayoutProps) => {
  const config: Config = {
    readOnlyChainId: process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? HarmonyTestnet.chainId : Harmony.chainId,
    readOnlyUrls: {
      [Harmony.chainId]: "https://api.harmony.one",
      [HarmonyTestnet.chainId]: "https://api.s0.b.hmny.io",
    },
    networks: [Harmony, HarmonyTestnet],
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
