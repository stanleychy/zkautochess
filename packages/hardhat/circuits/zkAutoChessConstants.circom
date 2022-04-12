pragma circom 2.0.0;

/*
    Pieces Cost:
        Fighter - Cost: 1, HP: 4, Attack: 1, Range: 1
        Theft   - Cost: 2, HP: 2, Attack: 2, Range: 1
        Ranger  - Cost: 3, HP: 1, Attack: 2, Range: 2
*/
function PieceCost(id) {
    if (id == 0) {
        return 0;
    } else if (id == 1) {
        return 1;
    } else if (id == 2) {
        return 2;
    } else if (id == 3) {
        return 3;
    } else {
        assert(id < 4 && id>=0);
        return 0;
    }
}