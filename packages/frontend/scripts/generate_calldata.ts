const snarkjs = require("snarkjs");

type playfieldInputType = {
  playfield: number[];
  salt: bigint;
};

const generateCalldata = async (input: playfieldInputType) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "/snark/zkAutoChess.wasm",
    "/snark/zkAutoChess_0001.zkey"
  );

  const argv = [
    proof["pi_a"][0],
    proof["pi_a"][1],
    proof["pi_b"][0][1],
    proof["pi_b"][0][0],
    proof["pi_b"][1][1],
    proof["pi_b"][1][0],
    proof["pi_c"][0],
    proof["pi_c"][1],
  ];
  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const hash = publicSignals[0];
  const field = publicSignals.slice(1, 9);
  const salt = publicSignals[9];

  return { hash, field, salt, a, b, c };
};

export default generateCalldata;
