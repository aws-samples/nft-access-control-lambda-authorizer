// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


library StringsUtils { 
    function contains(string memory what, string memory where) internal pure returns (bool) {
        bytes memory whatBytes = bytes (what);
        bytes memory whereBytes = bytes (where);

        require(whereBytes.length >= whatBytes.length);

        bool found = false;
        for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
            bool flag = true;
            for (uint j = 0; j < whatBytes.length; j++)
                if (whereBytes [i + j] != whatBytes [j]) {
                    flag = false;
                    break;
                }
            if (flag) {
                found = true;
                break;
            }
        }

        return found;
    }

    modifier contains_string (string memory what, string memory where) {
        bool found = contains(what, where);
        require (found);
        _;
    }
}


