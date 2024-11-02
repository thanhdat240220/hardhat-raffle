pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2PlusInternal.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

error Raffle_NotEnoughETH();
error Raffle_TransferFail();
error Raffle_Closed();
error Raffle_NoNeededUpgrade();

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    IVRFCoordinatorV2PlusInternal private immutable i_vrfCoordinator;
    RaffleState private s_state;
    address private s_recentWinner;
    address payable[] private s_players;
    bytes32 private immutable i_gasLane;

    uint256 private immutable i_entraceFee;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint16 private constant NUM_WORDS = 2;
    uint256 private s_lastTimeStamp;
    uint256 private immutable s_interval;

    event RaffleEnter(address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event WinnerChoose(address indexed winner);

    constructor(
        address vfrCoordinator2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        RaffleState state,
        uint256 interval
    ) VRFConsumerBaseV2Plus(vfrCoordinator2) {
        i_entraceFee = entranceFee;
        i_vrfCoordinator = IVRFCoordinatorV2PlusInternal(vfrCoordinator2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_state = state;
        s_lastTimeStamp = block.timestamp;
        s_interval = interval;
    }

    function enterRaffle() public payable {
        if (s_state != RaffleState.OPEN) {
            revert Raffle_Closed();
        }

        if (msg.value < i_entraceFee) {
            revert Raffle_NotEnoughETH();
        }

        s_players.push(payable(msg.sender));
        //
        emit RaffleEnter(msg.sender);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");

        if (!upkeepNeeded) {
            revert Raffle_NoNeededUpgrade();
        }

        s_state = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATION,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        //
        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /** requestId */,
        uint256[] calldata randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");

        // open again
        s_state = RaffleState.OPEN;

        if (!success) {
            revert Raffle_TransferFail();
        }
        emit WinnerChoose(recentWinner);
    }

    function checkUpkeep(
        bytes memory /** checkData */
    ) public override returns (
        bool upKeepNeeded,
        bytes memory 
    ) {
        bool isOpen = (RaffleState.OPEN == s_state);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > s_interval;
        bool hasPlayer = (s_players.length > 0);

        upKeepNeeded = isOpen && timePassed && hasPlayer;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entraceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_state;
    }

    function getInterval() public view returns (uint256) {
        return s_interval;
    }
}
