import wc from "./witness_calculator";

const generateWitness = async (input) => {
  const response = await fetch("zkAutoChess.wasm");
  const buffer = await response.arrayBuffer();
  let buff;

  await wc(buffer).then(async (witnessCalculator) => {
    buff = await witnessCalculator.calculateWTNSBin(input, 0);
  });
  return buff;
};

export default generateWitness;
