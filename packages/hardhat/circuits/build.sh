# Compile the circom template file
circom zkAutoChess.circom --r1cs --wasm --sym

# Powers of Tau
# Use snarkjs to start a "powers of tau" ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Contribute to the ceremony
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Phase 2
# Start the generation of phase 2
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Start a new .zkey file that will contain the proving and verification keys together with all phase 2 contributions
snarkjs groth16 setup zkAutoChess.r1cs pot12_final.ptau zkAutoChess_0000.zkey

# Contribute to the phase 2 of the ceremony
snarkjs zkey contribute zkAutoChess_0000.zkey zkAutoChess_0001.zkey --name="Contributor One" -v

# Export the verification key
snarkjs zkey export verificationkey zkAutoChess_0001.zkey verification_key.json

# Generate the Solidity code that allows verifying proofs on Ethereum blockchain
snarkjs zkey export solidityverifier zkAutoChess_0001.zkey ../contracts/zkAutoChessVerifier.sol

# Use snarkjs to generate the parameters of the verifyProof call to Verifier smart contract
snarkjs generatecall
