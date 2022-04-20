import { useEthers } from "@usedapp/core";
import { Contract, utils } from "ethers";
import { useState, useEffect } from "react";
import zkAutoChessArtifact from "../contracts/zkAutoChess.json";

const useContract = () => {
  const { library } = useEthers();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const zkAutoChessAddress = process.env.NEXT_PUBLIC_ZKAUTOCHESS_CONTRACT;
    const zkAutoChessInterface = new utils.Interface(zkAutoChessArtifact.abi);
    const zkAutoChessContract = new Contract(
      zkAutoChessAddress,
      zkAutoChessInterface,
      library.getSigner()
    );
    setContract(zkAutoChessContract);
  });

  return contract;
};

export default useContract;
