import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'

import { ERC20 } from '../../generated/OlympusProFactoryV1/ERC20';
import { UniswapRouter } from '../../generated/OlympusProFactoryV1/UniswapRouter';
import { UniswapV2Pair } from '../../generated/OlympusProFactoryV1/UniswapV2Pair';
import { GUniPool } from '../../generated/templates/CustomBondV2/GUniPool';
import { TAsset } from '../../generated/templates/CustomBondV2/TAsset';
import { Hypervisor } from '../../generated/templates/CustomBondV1/Hypervisor';
import { OffchainOracle } from '../../generated/templates/CustomBondV1/OffchainOracle';

import {
  NATIVE_TOKEN_ADDRESS,
  STABLE_TOKEN_ADDRESS,
  STABLE_TOKEN2_ADDRESS,
  ROUTERS,
  NATIVE_TOKEN_DECIMALS,
  STABLE_TOKEN_DECIMALS,
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  ONE_INCH_ROUTER_ADDRESS,
  STABLE_TOKEN2_DECIMALS,
} from './Constants'
import { toDecimal } from './Decimals'

// Addresses of special case tokens
const xSDT_ADDRESS  = '0xac14864ce5a98af3248ffbf549441b04421247d3'
const SDT_ADDRESS   = '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f'

// `getSwapPrice1Inch(tokenIn, tokenOut, tokenOutDecimals)` returns the price of 
// the token with address `tokenIn` in terms of the token with address `tokenOut`
// formatted to `tokenOutDecimals` decimals. Uses the 1Inch DEX aggregator contract
// to get the price information. Returns `null` if the token price is unavailable.
export function getSwapPrice1Inch(
  tokenIn: string,
  tokenOut: string,
  tokenOutDecimals: u32
): BigDecimal | null {
  // Check if tokens are the same
  if (tokenIn == tokenOut) {
    return BigDecimal.fromString('1')
  }

  // SPECIAL CASES
  // Check if tokenIn is Tokemak tAsset
  let tAsset = TAsset.bind(Address.fromString(tokenIn))
  let maybe_underlyer = tAsset.try_underlyer()
  if (!maybe_underlyer.reverted) {
    tokenIn = maybe_underlyer.value.toHexString()
  }

  // Check if tokenIn is Staked SDT
  if (tokenIn == xSDT_ADDRESS) tokenIn = SDT_ADDRESS

  let router = OffchainOracle.bind(ONE_INCH_ROUTER_ADDRESS)
  let swapPrice = router.try_getRate(
    Address.fromString(tokenIn),
    Address.fromString(tokenOut),
    false
  )

  // Only return price if available and not 0, otherwise return `null`
  if (swapPrice.reverted) {
    return null
  } else {
    if (swapPrice.value == BIGINT_ZERO) {
      return null
    } else {
      return toDecimal(swapPrice.value, tokenOutDecimals)
    }
  }
}

export function getNativePrice1Inch(token: string): BigDecimal | null {
  return getSwapPrice1Inch(token, NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_DECIMALS)
}

export function getStablePrice1Inch(token: string): BigDecimal | null {
  return getSwapPrice1Inch(token, STABLE_TOKEN2_ADDRESS, STABLE_TOKEN2_DECIMALS)
}

// `getLPReserves(pairAddress)` returns the amount of tokens deposited in the 
// LP token with address `pairAddress` as an array. Handles (in order):
// - UniswapV2 LP tokens
// - Visor LP tokens
// - Sorbet finance LP tokens
function getLPReserves(
  pairAddress: string
): BigInt[] | null {
  // Uniswap V2 and clones
  {
    let pair = UniswapV2Pair.bind(Address.fromString(pairAddress))
    let maybe_reserves = pair.try_getReserves()
    if (!maybe_reserves.reverted) {
      return [
        maybe_reserves.value.value0,
        maybe_reserves.value.value1
      ]
    }
  }

  // Visor LP
  {
    let pair = Hypervisor.bind(Address.fromString(pairAddress))
    let maybe_reserves = pair.try_getTotalAmounts()
    if (!maybe_reserves.reverted) {
      return [
        maybe_reserves.value.value0,
        maybe_reserves.value.value1
      ]
    }
  }

  // Sorbet finance LP
  {
    let pair = GUniPool.bind(Address.fromString(pairAddress))
    let maybe_reserves = pair.try_getUnderlyingBalances()
    if (!maybe_reserves.reverted) {
      return [
        maybe_reserves.value.value0, 
        maybe_reserves.value.value1
      ]
    }
  }

  return null
}

// `getLPStablePrice(pairAddr, token0Addr, token1Addr, token0Dec, token1Dec)` 
// returns the price in USD stablecoin (USDC) of the LP token with address `pairAddr`,
// using the USD stablecoin price of the tokens with addresses `token0Addr` 
// and `token1Addr`. `token0Dec` and `token1Dec` is used to format the token 
// values to the correct number of decimals. `null` is returned if the USD 
// stablecoin price is unavailable or the LP token is an unhandled type.
export function getLPStablePrice(
  pairAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: u32,
  token1Decimals: u32,
  ): BigDecimal | null {
  // Get token reserves
  let reserves = getLPReserves(pairAddress)
  if (!reserves) return null

  let token0Reserve = reserves[0]
  let token1Reserve = reserves[1]

  let pair = UniswapV2Pair.bind(Address.fromString(pairAddress))

  // Get total supply
  let decimals = 18
  let maybe_decimals = pair.try_decimals()
  if (maybe_decimals.reverted) return null
  else decimals = maybe_decimals.value

  // Get total supply
  let totalSupply = BIGDECIMAL_ZERO
  let maybe_totalSupply = pair.try_totalSupply()
  if (maybe_totalSupply.reverted) return null
  else totalSupply = toDecimal(maybe_totalSupply.value, decimals)

  // Get value of token0 reserve in stable token
  let token0StablePrice = getStablePrice1Inch(token0Address)
  if (!token0StablePrice) return null
  let reserve0StableValue = toDecimal(token0Reserve, token0Decimals).times(token0StablePrice)

  // Get value of token1 reserve in native token
  let token1StablePrice = getStablePrice1Inch(token1Address)
  if (!token1StablePrice) return null
  let reserve1StableValue = toDecimal(token1Reserve, token1Decimals).times(token1StablePrice)
  
  let totalReservesNativeValue = reserve0StableValue.plus(reserve1StableValue)
  
  return totalReservesNativeValue.div(totalSupply)
}
