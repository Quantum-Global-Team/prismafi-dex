// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {PrismaRouter} from "../src/PrismaRouter.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/// @notice Mock Pyth oracle for testing
contract MockPyth is IPyth {
    mapping(bytes32 => PythStructs.Price) public prices;

    function setPrice(bytes32 feedId, int64 price, int32 expo) external {
        prices[feedId] = PythStructs.Price({
            price: price,
            conf: 0,
            expo: expo,
            publishTime: block.timestamp
        });
    }

    function getUpdateFee(bytes[] calldata) external pure returns (uint256) {
        return 1; // 1 wei for testing
    }

    function updatePriceFeeds(bytes[] calldata) external payable {}

    function getPriceUnsafe(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }

    function getPriceNoOlderThan(bytes32 id, uint256) external view returns (PythStructs.Price memory) {
        return prices[id];
    }

    // Unused interface methods
    function getValidTimePeriod() external pure returns (uint256) { return 60; }
    function getPrice(bytes32) external pure returns (PythStructs.Price memory) { revert(); }
    function getEmaPrice(bytes32) external pure returns (PythStructs.Price memory) { revert(); }
    function getEmaPriceUnsafe(bytes32) external pure returns (PythStructs.Price memory) { revert(); }
    function getEmaPriceNoOlderThan(bytes32, uint256) external pure returns (PythStructs.Price memory) { revert(); }
    function updatePriceFeedsIfNecessary(bytes[] calldata, bytes32[] calldata, uint64[] calldata) external payable {}
    function parsePriceFeedUpdates(bytes[] calldata, bytes32[] calldata, uint64, uint64) external payable returns (PythStructs.PriceFeed[] memory) { revert(); }
    function parsePriceFeedUpdatesUnique(bytes[] calldata, bytes32[] calldata, uint64, uint64) external payable returns (PythStructs.PriceFeed[] memory) { revert(); }
}

contract PrismaRouterTest is Test {
    MockPyth public pyth;
    PrismaRouter public router;
    MockERC20 public tUSD;
    MockERC20 public tEUR;

    bytes32 constant USD_FEED = bytes32(uint256(1));
    bytes32 constant EUR_FEED = bytes32(uint256(2));

    address public owner;
    address public trader;

    function setUp() public {
        owner = address(this);
        trader = makeAddr("trader");

        // Deploy mock Pyth
        pyth = new MockPyth();

        // Deploy router
        router = new PrismaRouter(address(pyth));

        // Deploy tokens
        tUSD = new MockERC20("Tokenized USD", "tUSD", 6);
        tEUR = new MockERC20("Tokenized EUR", "tEUR", 6);

        // Configure tokens
        router.configureToken(address(tUSD), USD_FEED, 6);
        router.configureToken(address(tEUR), EUR_FEED, 6);

        // Set prices: USD = $1.00, EUR = $1.10
        pyth.setPrice(USD_FEED, 100000000, -8); // 1.00 * 10^8 with expo -8
        pyth.setPrice(EUR_FEED, 110000000, -8); // 1.10 * 10^8 with expo -8

        // Mint tokens
        tUSD.mint(owner, 1_000_000e6);
        tEUR.mint(owner, 1_000_000e6);
        tUSD.mint(trader, 100_000e6);

        // Give trader ETH for Pyth update fees
        vm.deal(trader, 1 ether);

        // Add liquidity
        tUSD.approve(address(router), type(uint256).max);
        tEUR.approve(address(router), type(uint256).max);
        router.addLiquidity(address(tUSD), 500_000e6);
        router.addLiquidity(address(tEUR), 500_000e6);
    }

    function test_GetQuote() public view {
        // Swap 1000 tUSD for tEUR
        // At EUR/USD = 1.10, 1000 USD = ~909.09 EUR (before 0.1% fee)
        (uint256 amountOut, uint256 fee) = router.getQuote(address(tUSD), address(tEUR), 1000e6);

        // Expected: 1000 / 1.10 = 909.09 EUR, minus 0.1% fee
        // ~908.18 EUR after fee
        assertGt(amountOut, 900e6);
        assertLt(amountOut, 920e6);
        assertGt(fee, 0);

        console2.log("Quote: 1000 tUSD -> %s tEUR (fee: %s)", amountOut, fee);
    }

    function test_ExecuteSwap() public {
        vm.startPrank(trader);
        tUSD.approve(address(router), type(uint256).max);

        uint256 amountIn = 1000e6;
        (uint256 expectedOut, ) = router.getQuote(address(tUSD), address(tEUR), amountIn);

        uint256 minOut = (expectedOut * 99) / 100; // 1% slippage tolerance

        bytes[] memory updateData = new bytes[](0);

        uint256 balanceBefore = tEUR.balanceOf(trader);
        router.executeSwap{value: 1}(updateData, address(tUSD), address(tEUR), amountIn, minOut);
        uint256 balanceAfter = tEUR.balanceOf(trader);

        uint256 received = balanceAfter - balanceBefore;
        assertGe(received, minOut);

        console2.log("Swap executed: 1000 tUSD -> %s tEUR", received);
        vm.stopPrank();
    }

    function test_SlippageProtection() public {
        vm.startPrank(trader);
        tUSD.approve(address(router), type(uint256).max);

        uint256 amountIn = 1000e6;
        uint256 unrealisticMinOut = 1000e6; // Expecting 1:1 which is impossible

        bytes[] memory updateData = new bytes[](0);

        vm.expectRevert();
        router.executeSwap{value: 1}(updateData, address(tUSD), address(tEUR), amountIn, unrealisticMinOut);
        vm.stopPrank();
    }

    function test_InsufficientLiquidity() public {
        vm.startPrank(trader);
        tUSD.approve(address(router), type(uint256).max);

        // Try to swap more than available liquidity
        uint256 hugeAmount = 1_000_000e6;

        bytes[] memory updateData = new bytes[](0);

        vm.expectRevert();
        router.executeSwap{value: 1}(updateData, address(tUSD), address(tEUR), hugeAmount, 0);
        vm.stopPrank();
    }

    function test_OnlyOwnerCanAddLiquidity() public {
        vm.startPrank(trader);
        tUSD.approve(address(router), type(uint256).max);

        vm.expectRevert();
        router.addLiquidity(address(tUSD), 1000e6);
        vm.stopPrank();
    }

    function test_CollectFees() public {
        // Execute a swap to generate fees
        vm.startPrank(trader);
        tUSD.approve(address(router), type(uint256).max);

        bytes[] memory updateData = new bytes[](0);
        router.executeSwap{value: 1}(updateData, address(tUSD), address(tEUR), 10_000e6, 0);
        vm.stopPrank();

        // Check fees accumulated
        uint256 fees = router.protocolFees(address(tEUR));
        assertGt(fees, 0);

        // Collect fees as owner
        uint256 balanceBefore = tEUR.balanceOf(owner);
        router.collectFees(address(tEUR));
        uint256 balanceAfter = tEUR.balanceOf(owner);

        assertEq(balanceAfter - balanceBefore, fees);
        assertEq(router.protocolFees(address(tEUR)), 0);
    }
}
