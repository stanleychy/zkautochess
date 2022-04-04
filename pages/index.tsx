import type { ReactElement } from "react";
// import NestedLayout from "../components/nested-layout";
import GameContent from "../components/GameContent";
import Layout from "../components/Layout";

const IndexPage = () => {
  return (
    <>
      <GameContent />
    </>
  );
};

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default IndexPage;
