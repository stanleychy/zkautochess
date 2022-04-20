import { ethers } from "ethers";
import zkAutoChessArtifact from "./zkAutoChess.json";
const snarkjs = require("snarkjs");

let zkAutoChess: ethers.Contract;

export async function connectContract(zkAutoChessAddress: string) {
  const { ethereum } = window;

  let provider = new ethers.providers.Web3Provider(ethereum);
  let signer = provider.getSigner();
  console.log("signer: ", await signer.getAddress());

  zkAutoChess = new ethers.Contract(
    zkAutoChessAddress,
    zkAutoChessArtifact.abi,
    signer
  );

  console.log("Connect to zkPhoto Contract:", zkAutoChess);
  return zkAutoChess;
}

export async function deploy(
  contract: ethers.Contract,
  battleId: number,
  input: any
) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "../snark/zkAutoChess.wasm",
    "../snark/zkAutoChess_0001.zkey"
  );
  const tx = await contract.deploy(battleId, publicSignals[0]);
  console.log("transaction: ", tx);
  return publicSignals[0];
}
