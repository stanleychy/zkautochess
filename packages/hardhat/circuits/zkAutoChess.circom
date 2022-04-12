pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "./zkAutoChessConstants.circom";

/*
    Each player has 8 purchase power for pieces
    Pieces Cost:
        Fighter - Cost: 1, HP: 4, Attack: 1, Range: 1
        Theft   - Cost: 2, HP: 2, Attack: 2, Range: 1
        Ranger  - Cost: 3, HP: 1, Attack: 2, Range: 2
*/

template zkAutoChess() {
    signal input playfield[8];
    signal input salt;
    signal output playfieldHash;

    component poseidonHash[2];

    poseidonHash[0] = Poseidon(8);
    for (var i=0; i < 8; i++) {
        poseidonHash[0].inputs[i] <== playfield[i];
    }

    poseidonHash[1] = Poseidon(2);
    poseidonHash[1].inputs[0] <== poseidonHash[0].out;
    poseidonHash[1].inputs[1] <== salt;

    playfieldHash <== poseidonHash[1].out;
}

component main {public [playfield, salt]} = zkAutoChess();