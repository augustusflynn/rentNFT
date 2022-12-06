// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error BingoGame__NotValidTarget();
error BingoGame__NotOwner();
error BingoGame__OverAllowanceUSDT();
error BingoGame__TransferError();
error BingoGame__TooFewPlayer();
error BingoGame__GameWasStarted();

contract BingoGame is VRFConsumerBase {
    bytes32 internal constant _keyHash =
        0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186;
    uint256 internal constant _fee = 0.1 * 10**18; // MAINNET CHANGE IT TO 0.2 LINK
    uint256 _randomResult;
    address public owner;
    IERC20 USDTAddress;

    /**
     * BNB Chain Testnet
     * VRF coordinator 0xa555fC018435bef5A13C6c6870a9d4C11DEC329C
     * LINK 0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06
     * keyHash 0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186
     * More information https://docs.chain.link/docs/vrf-contracts/v1/
     */

    constructor(IERC20 _USDTAddress)
        VRFConsumerBase(
            0xa555fC018435bef5A13C6c6870a9d4C11DEC329C, // Coordinator
            0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06 // link
        )
    {
        USDTAddress = _USDTAddress;
        owner = msg.sender;
    }

    struct Room {
        string roomId;
        address[] players;
        uint256 depositAmount;
        bool isStart;
    }

    mapping(string => Room) idToRoom;
    mapping(address => uint256) winnerToReward;
    event NewRoomCreated(
        string roomId,
        uint256 depositAmount,
        uint256 timestamp
    );

    event RoomStart(string roomId, uint256 players, uint256 depositAmount);

    event RoomEnd(
        string roomId,
        address winner,
        uint256 depositAmount,
        uint256 players
    );

    function getRandomNumber() internal returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= _fee,
            "Not enough fee LINK in contract"
        );
        return requestRandomness(_keyHash, _fee);
    }

    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        _randomResult = randomness;
    }

    function createRoom(string memory _roomId, uint256 _depositAmount)
        external
        onlyOwner
    {
        address[] memory newRoomPlayer = new address[](0);
        idToRoom[_roomId] = Room(_roomId, newRoomPlayer, _depositAmount, false);
        emit NewRoomCreated(_roomId, _depositAmount, block.timestamp);
    }

    function joinRoom(string memory _roomId) external {
        if (idToRoom[_roomId].isStart) revert BingoGame__GameWasStarted();
        uint256 allowance = USDTAddress.allowance(msg.sender, address(this));
        if (allowance < idToRoom[_roomId].depositAmount)
            revert BingoGame__OverAllowanceUSDT();

        bool isSuccess = USDTAddress.transfer(
            address(this),
            idToRoom[_roomId].depositAmount
        );
        if (!isSuccess) revert BingoGame__TransferError();

        idToRoom[_roomId].players.push(msg.sender);
    }

    function startRoom(string memory _roomId) external onlyOwner {
        Room storage currentRoom = idToRoom[_roomId];
        if (currentRoom.players.length < 2) revert BingoGame__TooFewPlayer();

        currentRoom.isStart = true;
        emit RoomStart(
            _roomId,
            currentRoom.players.length,
            currentRoom.depositAmount
        );
    }

    function generateRandomNum(uint256 more)
        external
        view
        onlyOwner
        returns (uint256)
    {
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.number,
                    _randomResult,
                    block.timestamp,
                    msg.sender,
                    more
                )
            )
        );
        return randomNumber % 99;
    }

    function payWinner(string memory _roomId, address _winner)
        external
        onlyOwner
    {
        Room memory currentRoom = idToRoom[_roomId];
        delete idToRoom[_roomId];
        winnerToReward[_winner]++;
        emit RoomEnd(
            _roomId,
            _winner,
            currentRoom.depositAmount,
            currentRoom.players.length
        );
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert BingoGame__NotOwner();
        _;
    }
}
