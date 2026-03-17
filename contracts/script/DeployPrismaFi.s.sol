// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {PrismaRouter} from "../src/PrismaRouter.sol";

/// @notice Deployment script for PrismaFi contracts on Moonbase Alpha
contract DeployPrismaFi is Script {
    // Pyth Oracle on Moonbase Alpha
    // See: https://docs.pyth.network/price-feeds/contract-addresses/evm
    address constant PYTH_MOONBASE = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;

    // Pyth Price Feed IDs (vs USD)
    // See: https://pyth.network/developers/price-feed-ids
    bytes32 constant EUR_USD_FEED = 0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b;
    bytes32 constant GBP_USD_FEED = 0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1;
    bytes32 constant JPY_USD_FEED = 0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52;
    bytes32 constant USD_USD_FEED = 0x0000000000000000000000000000000000000000000000000000000000000001; // Placeholder for stablecoins

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockERC20 tokens
        MockERC20 tUSD = new MockERC20("Tokenized USD", "tUSD", 6);
        MockERC20 tEUR = new MockERC20("Tokenized EUR", "tEUR", 6);
        MockERC20 tGBP = new MockERC20("Tokenized GBP", "tGBP", 6);
        MockERC20 tJPY = new MockERC20("Tokenized JPY", "tJPY", 6);
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);

        console2.log("tUSD deployed at:", address(tUSD));
        console2.log("tEUR deployed at:", address(tEUR));
        console2.log("tGBP deployed at:", address(tGBP));
        console2.log("tJPY deployed at:", address(tJPY));
        console2.log("USDC deployed at:", address(usdc));

        // Deploy PrismaRouter with Pyth oracle
        PrismaRouter router = new PrismaRouter(PYTH_MOONBASE);
        console2.log("PrismaRouter deployed at:", address(router));

        // Configure tokens with their Pyth price feed IDs
        // Note: For stablecoins (tUSD, USDC), we use a 1:1 USD peg
        // In production, you'd use a proper stablecoin price feed

        // For tUSD and USDC, we'll configure them with the same "USD" identity
        // The router will need special handling or we use a mock feed
        router.configureToken(address(tUSD), USD_USD_FEED, 6);
        router.configureToken(address(tEUR), EUR_USD_FEED, 6);
        router.configureToken(address(tGBP), GBP_USD_FEED, 6);
        router.configureToken(address(tJPY), JPY_USD_FEED, 6);
        router.configureToken(address(usdc), USD_USD_FEED, 6);

        // Mint initial supply to deployer for liquidity provisioning
        uint256 initialSupply = 1_000_000 * 1e6; // 1M tokens each
        address deployer = vm.addr(deployerPrivateKey);

        tUSD.mint(deployer, initialSupply);
        tEUR.mint(deployer, initialSupply);
        tGBP.mint(deployer, initialSupply);
        tJPY.mint(deployer, initialSupply * 100); // JPY has lower value per unit
        usdc.mint(deployer, initialSupply);

        console2.log("Initial supply minted to deployer");

        vm.stopBroadcast();

        // Output deployment info for frontend integration
        console2.log("\n=== Deployment Summary ===");
        console2.log("Network: Moonbase Alpha");
        console2.log("Pyth Oracle:", PYTH_MOONBASE);
        console2.log("Router:", address(router));
        console2.log("\nTokens:");
        console2.log("  tUSD:", address(tUSD));
        console2.log("  tEUR:", address(tEUR));
        console2.log("  tGBP:", address(tGBP));
        console2.log("  tJPY:", address(tJPY));
        console2.log("  USDC:", address(usdc));
    }
}
