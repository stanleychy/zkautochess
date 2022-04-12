pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../node_modules/circomlib/circuits/comparators.circom";
include "./zkAutoChessConstants.circom";

/*
    Each player has 8 purchase power for pieces
    Pieces Cost:
        Fighter - Cost: 1, HP: 4, Attack: 1, Range: 1
        Theft   - Cost: 2, HP: 2, Attack: 2, Range: 1
        Ranger  - Cost: 3, HP: 1, Attack: 2, Range: 2
*/

template CostSum() {
    signal input cost[8];
    signal output sum;

    sum <== cost[0] + cost[1] + cost[2] + cost[3] + cost[4] + cost[5] + cost[6] + cost[7];
}

template zkAutoChess(maxCost) {
    signal input playfield[8];
    signal input salt;
    signal output playfieldHash;

    component poseidonHash[2];

    poseidonHash[0] = Poseidon(8);
    component costSum = CostSum();
    for (var i=0; i < 8; i++) {
        costSum.cost[i] <-- PieceCost(playfield[i]);
        poseidonHash[0].inputs[i] <== playfield[i];
    }

    component lessEqThan = LessEqThan(4);
    lessEqThan.in[0] <== costSum.sum;
    lessEqThan.in[1] <== maxCost;
    
    lessEqThan.out === 1;

    poseidonHash[1] = Poseidon(2);
    poseidonHash[1].inputs[0] <== poseidonHash[0].out;
    poseidonHash[1].inputs[1] <== salt;

    playfieldHash <== poseidonHash[1].out;
}

component main {public [playfield, salt]} = zkAutoChess(8);