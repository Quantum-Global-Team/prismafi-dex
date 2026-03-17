// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/// @title PrismaRouter
/// @notice Core DEX router for PrismaFi - Institutional Tokenized Forex Exchange
/// @dev Uses Pyth Network oracles for real-time FX price feeds
contract PrismaRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Maximum age for price data (60 seconds)
    uint256 public constant MAX_PRICE_AGE = 60;

    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Protocol fee in basis points (0.1% = 10 bps)
    uint256 public constant PROTOCOL_FEE_BPS = 10;

    // ============ State Variables ============

    /// @notice Pyth oracle contract
    IPyth public immutable pyth;

    /// @notice Mapping from token address to Pyth price feed ID
    mapping(address => bytes32) public priceFeedIds;

    /// @notice Mapping from token address to token decimals
    mapping(address => uint8) public tokenDecimals;

    /// @notice Protocol liquidity per token
    mapping(address => uint256) public liquidity;

    /// @notice Accumulated protocol fees per token
    mapping(address => uint256) public protocolFees;

    /// @notice Whitelisted tokens for trading
    mapping(address => bool) public supportedTokens;

    // ============ Events ============

    event TokenConfigured(address indexed token, bytes32 priceFeedId, uint8 decimals);
    event LiquidityAdded(address indexed token, uint256 amount);
    event LiquidityRemoved(address indexed token, uint256 amount);
    event Swap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    event FeesCollected(address indexed token, uint256 amount);

    // ============ Errors ============

    error TokenNotSupported(address token);
    error InsufficientLiquidity(address token, uint256 requested, uint256 available);
    error SlippageExceeded(uint256 expected, uint256 actual);
    error InvalidAmount();
    error PriceStale(uint256 priceAge, uint256 maxAge);
    error InvalidPrice();
    error SameToken();

    // ============ Constructor ============

    /// @notice Initialize the router with Pyth oracle
    /// @param pythContract The address of the Pyth oracle contract
    constructor(address pythContract) Ownable(msg.sender) {
        pyth = IPyth(pythContract);
    }

    // ============ Admin Functions ============

    /// @notice Configure a token for trading
    /// @param token The token address
    /// @param priceFeedId The Pyth price feed ID for this token (vs USD)
    /// @param decimals The token decimals
    function configureToken(
        address token,
        bytes32 priceFeedId,
        uint8 decimals
    ) external onlyOwner {
        priceFeedIds[token] = priceFeedId;
        tokenDecimals[token] = decimals;
        supportedTokens[token] = true;
        emit TokenConfigured(token, priceFeedId, decimals);
    }

    /// @notice Add liquidity for a supported token
    /// @param token The token to add liquidity for
    /// @param amount The amount to add
    function addLiquidity(address token, uint256 amount) external onlyOwner {
        if (!supportedTokens[token]) revert TokenNotSupported(token);
        if (amount == 0) revert InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        liquidity[token] += amount;

        emit LiquidityAdded(token, amount);
    }

    /// @notice Remove liquidity for a supported token
    /// @param token The token to remove liquidity for
    /// @param amount The amount to remove
    function removeLiquidity(address token, uint256 amount) external onlyOwner {
        if (amount > liquidity[token]) {
            revert InsufficientLiquidity(token, amount, liquidity[token]);
        }

        liquidity[token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit LiquidityRemoved(token, amount);
    }

    /// @notice Collect accumulated protocol fees
    /// @param token The token to collect fees for
    function collectFees(address token) external onlyOwner {
        uint256 fees = protocolFees[token];
        if (fees == 0) revert InvalidAmount();

        protocolFees[token] = 0;
        IERC20(token).safeTransfer(msg.sender, fees);

        emit FeesCollected(token, fees);
    }

    // ============ Trading Functions ============

    /// @notice Get a quote for swapping tokens using current Pyth prices
    /// @param tokenIn The input token address
    /// @param tokenOut The output token address
    /// @param amountIn The input amount
    /// @return amountOut The estimated output amount (before fees)
    /// @return fee The protocol fee amount
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256 amountOut, uint256 fee) {
        if (!supportedTokens[tokenIn]) revert TokenNotSupported(tokenIn);
        if (!supportedTokens[tokenOut]) revert TokenNotSupported(tokenOut);
        if (tokenIn == tokenOut) revert SameToken();
        if (amountIn == 0) revert InvalidAmount();

        // Get USD prices for both tokens from Pyth
        (int64 priceIn, int32 expoIn) = _getPriceUnsafe(tokenIn);
        (int64 priceOut, int32 expoOut) = _getPriceUnsafe(tokenOut);

        // Calculate output amount
        // amountOut = amountIn * priceIn / priceOut (adjusted for decimals and exponents)
        amountOut = _calculateOutputAmount(
            amountIn,
            priceIn,
            expoIn,
            priceOut,
            expoOut,
            tokenDecimals[tokenIn],
            tokenDecimals[tokenOut]
        );

        // Calculate fee
        fee = (amountOut * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        amountOut = amountOut - fee;
    }

    /// @notice Execute a swap with Pyth price update
    /// @param pythPriceUpdateData The Pyth price update data
    /// @param tokenIn The input token address
    /// @param tokenOut The output token address
    /// @param amountIn The input amount
    /// @param minAmountOut The minimum acceptable output amount (slippage protection)
    /// @return amountOut The actual output amount
    function executeSwap(
        bytes[] calldata pythPriceUpdateData,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external payable nonReentrant returns (uint256 amountOut) {
        if (!supportedTokens[tokenIn]) revert TokenNotSupported(tokenIn);
        if (!supportedTokens[tokenOut]) revert TokenNotSupported(tokenOut);
        if (tokenIn == tokenOut) revert SameToken();
        if (amountIn == 0) revert InvalidAmount();

        // Update Pyth price feeds (requires payment)
        uint256 updateFee = pyth.getUpdateFee(pythPriceUpdateData);
        pyth.updatePriceFeeds{value: updateFee}(pythPriceUpdateData);

        // Refund excess ETH
        if (msg.value > updateFee) {
            (bool success, ) = msg.sender.call{value: msg.value - updateFee}("");
            require(success, "Refund failed");
        }

        // Get fresh prices with staleness check
        (int64 priceIn, int32 expoIn) = _getPriceNoOlderThan(tokenIn, MAX_PRICE_AGE);
        (int64 priceOut, int32 expoOut) = _getPriceNoOlderThan(tokenOut, MAX_PRICE_AGE);

        // Calculate output amount before fee
        uint256 grossAmountOut = _calculateOutputAmount(
            amountIn,
            priceIn,
            expoIn,
            priceOut,
            expoOut,
            tokenDecimals[tokenIn],
            tokenDecimals[tokenOut]
        );

        // Calculate and deduct fee
        uint256 fee = (grossAmountOut * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        amountOut = grossAmountOut - fee;

        // Slippage check
        if (amountOut < minAmountOut) {
            revert SlippageExceeded(minAmountOut, amountOut);
        }

        // Check liquidity
        if (amountOut > liquidity[tokenOut]) {
            revert InsufficientLiquidity(tokenOut, amountOut, liquidity[tokenOut]);
        }

        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        liquidity[tokenIn] += amountIn;

        liquidity[tokenOut] -= amountOut;
        protocolFees[tokenOut] += fee;
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, fee);
    }

    /// @notice Get the fee required to update Pyth price feeds
    /// @param pythPriceUpdateData The price update data
    /// @return The update fee in wei
    function getUpdateFee(bytes[] calldata pythPriceUpdateData) external view returns (uint256) {
        return pyth.getUpdateFee(pythPriceUpdateData);
    }

    // ============ Internal Functions ============

    /// @dev Get price from Pyth without staleness check (for quotes)
    function _getPriceUnsafe(address token) internal view returns (int64 price, int32 expo) {
        bytes32 feedId = priceFeedIds[token];
        PythStructs.Price memory priceData = pyth.getPriceUnsafe(feedId);

        if (priceData.price <= 0) revert InvalidPrice();

        return (priceData.price, priceData.expo);
    }

    /// @dev Get price from Pyth with staleness check (for swaps)
    function _getPriceNoOlderThan(
        address token,
        uint256 maxAge
    ) internal view returns (int64 price, int32 expo) {
        bytes32 feedId = priceFeedIds[token];
        PythStructs.Price memory priceData = pyth.getPriceNoOlderThan(feedId, maxAge);

        if (priceData.price <= 0) revert InvalidPrice();

        return (priceData.price, priceData.expo);
    }

    /// @dev Calculate output amount given prices and decimals
    /// @notice Handles Pyth's fixed-point price representation with exponents
    function _calculateOutputAmount(
        uint256 amountIn,
        int64 priceIn,
        int32 expoIn,
        int64 priceOut,
        int32 expoOut,
        uint8 decimalsIn,
        uint8 decimalsOut
    ) internal pure returns (uint256) {
        // Pyth prices are in the form: price * 10^expo
        // We need: amountOut = amountIn * (priceIn / priceOut) * (10^decimalsOut / 10^decimalsIn)

        // To avoid precision loss, we scale up first
        uint256 PRECISION = 1e18;

        // Convert prices to a common scale
        // priceIn * 10^expoIn gives the actual USD price
        // We need to handle negative exponents carefully

        uint256 scaledPriceIn = uint256(int256(priceIn));
        uint256 scaledPriceOut = uint256(int256(priceOut));

        // Adjust for exponent differences
        int32 expoDiff = expoIn - expoOut;

        uint256 numerator;
        uint256 denominator;

        if (expoDiff >= 0) {
            // priceIn has larger exponent (less negative), so scale it up
            numerator = amountIn * scaledPriceIn * (10 ** uint32(expoDiff)) * PRECISION;
            denominator = scaledPriceOut;
        } else {
            // priceOut has larger exponent, scale priceOut up
            numerator = amountIn * scaledPriceIn * PRECISION;
            denominator = scaledPriceOut * (10 ** uint32(-expoDiff));
        }

        uint256 rawAmount = numerator / denominator;

        // Adjust for token decimals difference
        if (decimalsOut >= decimalsIn) {
            rawAmount = rawAmount * (10 ** (decimalsOut - decimalsIn));
        } else {
            rawAmount = rawAmount / (10 ** (decimalsIn - decimalsOut));
        }

        // Remove the PRECISION scaling
        return rawAmount / PRECISION;
    }

    /// @notice Allow contract to receive ETH for Pyth fee refunds
    receive() external payable {}
}
