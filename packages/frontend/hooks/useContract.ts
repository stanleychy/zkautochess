import { Contract, utils } from "ethers";
import { useEffect, useState } from "react";

import { useEthers } from "@usedapp/core";
import zkAutoChessArtifact from "../contracts/zkAutoChess.json";

const useContract = () => {
  const { account, library } = useEthers();
  const [zkAutoChessContract, setzkAutoChessContract] = useState(null);

  useEffect(() => {
    const zkAutoChessAddress = process.env.NEXT_PUBLIC_ZKAUTOCHESS_CONTRACT;
    if (!zkAutoChessAddress || !account || !library) return
    const zkAutoChessInterface = new utils.Interface(zkAutoChessArtifact.abi);
    const zkAutoChessContract = new Contract(
      zkAutoChessAddress,
      zkAutoChessInterface,
      library.getSigner()
    );
    setzkAutoChessContract(zkAutoChessContract);
  }, [account]);

  return {zkAutoChessContract};
};

export default useContract;
