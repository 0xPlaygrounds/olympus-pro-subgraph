import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'

import { ERC20 } from '../../generated/OlympusProFactoryV1/ERC20';
import { UniswapRouter } from '../../generated/OlympusProFactoryV1/UniswapRouter';
import { UniswapV2Pair } from '../../generated/OlympusProFactoryV1/UniswapV2Pair';
import { GUniPool } from '../../generated/templates/CustomBondV2/GUniPool';
import { TAsset } from '../../generated/templates/CustomBondV2/TAsset';
import { Hypervisor } from '../../generated/templates/CustomBondV1/Hypervisor';

import {
  NATIVE_TOKEN_ADDRESS,
  STABLE_TOKEN_ADDRESS,
  ROUTERS,
  NATIVE_TOKEN_DECIMALS,
  STABLE_TOKEN_DECIMALS,
  BIGINT_ZERO,
  BIGDECIMAL_ZERO
} from './Constants'
import { toDecimal } from './Decimals'

function removeDuplicatePath(path: Address[]): Address[] {
  return path.filter(function(item, pos, arr){
    return pos === 0 || item !== arr[pos-1];
  });
}

export function getSwap(tokenIn: string, tokenOut: string, usdOut: boolean): BigDecimal{
  log.debug("Swap Rate {} {}", [tokenIn, tokenOut])

  for (let i = 0; i < ROUTERS.length; i++) {
    let routerAdress = ROUTERS[i]

    log.debug("Using Router {}", [routerAdress])

    let router = UniswapRouter.bind(Address.fromString(routerAdress))
    let tokenInERC20 = ERC20.bind(Address.fromString(tokenIn))
    let tokenOutERC20 = ERC20.bind(Address.fromString(tokenOut))

    let path: Address[] = [Address.fromString(tokenIn), Address.fromString(tokenOut)];

    if (tokenIn == NATIVE_TOKEN_ADDRESS && tokenOut == NATIVE_TOKEN_ADDRESS) {
      return BigDecimal.fromString("1")
    }

    let rateQuery = router.try_getAmountsOut(
      BigInt.fromI32(10).pow(<u8>tokenInERC20.decimals()), 
      path
    )

    if (rateQuery.reverted == false){
      let swapRate = toDecimal(rateQuery.value.pop(), tokenOutERC20.decimals())
      log.debug("Rate Result {}", [swapRate.toString()])
      if(usdOut){
        swapRate = swapRate.times(getNativeUSDRate())
        log.debug("USD Rate Result {}", [swapRate.toString()])
      }
      log.debug("Swap Rate {} {} rate {}", [tokenIn, tokenOut, swapRate.toString()])
      return swapRate
    }
    else {
      log.error("Issue getting rate {} {}", [tokenIn, tokenOut])
    }
  }
  return BigDecimal.fromString("1")
}

export function getNativeUSDRate(): BigDecimal {
  return getSwap(NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS, false)
}

export function getPairUSD(lp_amount: BigInt, pair_adress: string): BigDecimal{
  let pair = UniswapV2Pair.bind(Address.fromString(pair_adress))
  let total_lp = pair.totalSupply()
  
  let isV2Pair = pair.try_getReserves()
  if(isV2Pair.reverted){
    log.error("V3 LP valuation not supported",[])
    return BigDecimal.fromString("0")
  }
  let lp_token_reserves = pair.getReserves().value0
  let token = pair.token0()

  let lpDecimal = toDecimal(lp_amount, pair.decimals())
  log.debug("LPPAIR lpDecimal {}", [lpDecimal.toString()])

  let ownedLP = lpDecimal.div(toDecimal(total_lp, pair.decimals()))
  log.debug("LPPAIR ownedLP {}", [ownedLP.toString()])

  let tokenERC20 = ERC20.bind(token)

  let token_price = getSwap(token.toHexString(), NATIVE_TOKEN_ADDRESS, true)
  log.debug("LPPAIR token_price {}", [token_price.toString()])
  let token_value_in_lp = toDecimal(lp_token_reserves, tokenERC20.decimals()).times(token_price)
  log.debug("LPPAIR token_value_in_lp {}", [token_value_in_lp.toString()])
  let total_lp_usd = token_value_in_lp.times(BigDecimal.fromString("2")).times(ownedLP)
  log.debug("LPPAIR total_lp_usd {}", [total_lp_usd.toString()])

  return total_lp_usd
}

// ================================================================
// New optimized implementations of USD price functions
// ================================================================
// These functions replicate the above functionality, except that they 
// are designed to make the fewest possible calls to smart contracts,
// which has a major impact on indexing speed. Hence all the arguments
// (e.g.: addresses, decimals...) which might seem superfluous at first glance
export function getNativeStableSwapPrice(): BigDecimal | null {
  let path: Address[] = [
    Address.fromString(NATIVE_TOKEN_ADDRESS),
    Address.fromString(STABLE_TOKEN_ADDRESS)
  ];

  for (let i = 0; i < ROUTERS.length; i++) {
    let routerAdress = ROUTERS[i]
    let routerContract = UniswapRouter.bind(Address.fromString(routerAdress))

    let priceUSD = routerContract.try_getAmountsOut(
      BigInt.fromI32(10).pow(<u8>NATIVE_TOKEN_DECIMALS),
      path
    )

    if (!priceUSD.reverted) {
      return toDecimal(priceUSD.value.pop(), STABLE_TOKEN_DECIMALS)
    }
  }

  log.error("getNativeStableSwapPrice: Issue getting native token ({}) price in stable token ({})", [
    NATIVE_TOKEN_ADDRESS,
    STABLE_TOKEN_ADDRESS
  ])

  return null
}

export function getSwapPrice(
  tokenIn: string,
  tokenOut: string,
  tokenInDecimals: u32,
  tokenOutDecimals: u32
): BigDecimal | null {
  // Check if tokens are the same
  if (tokenIn == tokenOut) {
    return BigDecimal.fromString('1')
  }

  let path: Address[] = [
    Address.fromString(tokenIn),
    Address.fromString(tokenOut)
  ];

  for (let i = 0; i < ROUTERS.length; i++) {
    let routerAdress = ROUTERS[i]
    let routerContract = UniswapRouter.bind(Address.fromString(routerAdress))

    let swapPrice = routerContract.try_getAmountsOut(
      BigInt.fromI32(10).pow(<u8>tokenInDecimals),
      path
    )

    if (!swapPrice.reverted) {
      return toDecimal(swapPrice.value.pop(), tokenOutDecimals)
    }
  }

  log.error("nativePriceStable: Issue getting swap price of token ({}) in token ({})", [
    tokenIn,
    tokenOut
  ])

  // Check if either token is Tokemak tAsset
  let tAsset = TAsset.bind(Address.fromString(tokenIn))
  let maybe_underlyer = tAsset.try_underlyer()
  if (!maybe_underlyer.reverted) {
    return getSwapPrice(maybe_underlyer.value.toHexString(), tokenOut, tokenInDecimals, tokenOutDecimals)
  }

  return null
}

// Gamma protocol
// function getGammaLPNativeValue(
//   amount: BigInt,
//   addr: string
// ): BigDecimal | null {

// }

function getVisorLPNativePrice(
  pairAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: u32,
  token1Decimals: u32,
): BigDecimal | null {
  let pair = Hypervisor.bind(Address.fromString(pairAddress))

  // Get token reserves
  let token0Reserve = BIGINT_ZERO
  let token1Reserve = BIGINT_ZERO
  let maybe_reserves = pair.try_getTotalAmounts()
  if (maybe_reserves.reverted) return null
  else {
    token0Reserve = maybe_reserves.value.value0
    token1Reserve = maybe_reserves.value.value1
  }

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

  // Get value of token0 reserve in native token
  let token0NativePrice = getSwapPrice(token0Address, NATIVE_TOKEN_ADDRESS, token0Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token0NativePrice) return null
  let reserve0NativeValue = toDecimal(token0Reserve, token0Decimals).times(token0NativePrice)

  // Get value of token1 reserve in native token
  let token1NativePrice = getSwapPrice(token1Address, NATIVE_TOKEN_ADDRESS, token1Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token1NativePrice) return null
  let reserve1NativeValue = toDecimal(token1Reserve, token1Decimals).times(token1NativePrice)
  
  let totalReservesNativeValue = reserve0NativeValue.plus(reserve1NativeValue)
  
  return totalReservesNativeValue.div(totalSupply)
}

// Sorbet finance
function getSorbetLPNativePrice(
  pairAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: u32,
  token1Decimals: u32,
): BigDecimal | null {
  let pair = GUniPool.bind(Address.fromString(pairAddress))

  // Get token reserves
  let token0Reserve = BIGINT_ZERO
  let token1Reserve = BIGINT_ZERO
  let maybe_reserves = pair.try_getUnderlyingBalances()
  if (maybe_reserves.reverted) return null
  else {
    token0Reserve = maybe_reserves.value.value0
    token1Reserve = maybe_reserves.value.value1
  }

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

  // Get value of token0 reserve in native token
  let token0NativePrice = getSwapPrice(token0Address, NATIVE_TOKEN_ADDRESS, token0Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token0NativePrice) return null
  let reserve0NativeValue = toDecimal(token0Reserve, token0Decimals).times(token0NativePrice)

  // Get value of token1 reserve in native token
  let token1NativePrice = getSwapPrice(token1Address, NATIVE_TOKEN_ADDRESS, token1Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token1NativePrice) return null
  let reserve1NativeValue = toDecimal(token1Reserve, token1Decimals).times(token1NativePrice)
  
  let totalReservesNativeValue = reserve0NativeValue.plus(reserve1NativeValue)
  
  return totalReservesNativeValue.div(totalSupply)
}

// Uniswap V2 and clones
function getUniV2LPNativePrice(
  pairAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: u32,
  token1Decimals: u32,
): BigDecimal | null {
  let pair = UniswapV2Pair.bind(Address.fromString(pairAddress))

  // Get token reserves
  let token0Reserve = BIGINT_ZERO
  let token1Reserve = BIGINT_ZERO
  let maybe_reserves = pair.try_getReserves()
  if (maybe_reserves.reverted) return null
  else {
    token0Reserve = maybe_reserves.value.value0
    token1Reserve = maybe_reserves.value.value1
  }

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

  // Get value of token0 reserve in native token
  let token0NativePrice = getSwapPrice(token0Address, NATIVE_TOKEN_ADDRESS, token0Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token0NativePrice) return null
  let reserve0NativeValue = toDecimal(token0Reserve, token0Decimals).times(token0NativePrice)

  // Get value of token1 reserve in native token
  let token1NativePrice = getSwapPrice(token1Address, NATIVE_TOKEN_ADDRESS, token1Decimals, NATIVE_TOKEN_DECIMALS)
  if (!token1NativePrice) return null
  let reserve1NativeValue = toDecimal(token1Reserve, token1Decimals).times(token1NativePrice)
  
  let totalReservesNativeValue = reserve0NativeValue.plus(reserve1NativeValue)
  
  return totalReservesNativeValue.div(totalSupply)
}

// Gets unit price of LP token
export function getLPNativePrice(
  pairAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: u32,
  token1Decimals: u32,
): BigDecimal | null {
  let price = getUniV2LPNativePrice(
    pairAddress,
    token0Address,
    token1Address,
    token0Decimals,
    token1Decimals,
  )
  if (price) {
    return price
  }

  price = getSorbetLPNativePrice(
    pairAddress,
    token0Address,
    token1Address,
    token0Decimals,
    token1Decimals,    
  )
  if (price) {
    return price
  }

  price = getVisorLPNativePrice(
    pairAddress,
    token0Address,
    token1Address,
    token0Decimals,
    token1Decimals,    
  )
  if (price) {
    return price
  }

  return null
}

// export function getPairUSDValue(
//   lp_amount: BigInt,
//   pair_adress: string
// ): BigDecimal {
//   let pair = UniswapV2Pair.bind(Address.fromString(pair_adress))
//   let total_lp = pair.totalSupply()
  
//   let isV2Pair = pair.try_getReserves()
//   if(isV2Pair.reverted) {
//     log.error("V3 LP valuation not supported", [])
//     return BigDecimal.fromString("0")
//   }
//   let lp_token_reserves = pair.getReserves().value0
//   let token = pair.token0()

//   let lpDecimal = toDecimal(lp_amount, pair.decimals())
//   log.debug("LPPAIR lpDecimal {}", [lpDecimal.toString()])

//   let ownedLP = lpDecimal.div(toDecimal(total_lp, pair.decimals()))
//   log.debug("LPPAIR ownedLP {}", [ownedLP.toString()])

//   let tokenERC20 = ERC20.bind(token)

//   let token_price = getSwap(token.toHexString(), NATIVE_TOKEN_ADDRESS, true)
//   log.debug("LPPAIR token_price {}", [token_price.toString()])
  
//   let token_value_in_lp = toDecimal(lp_token_reserves, tokenERC20.decimals()).times(token_price)
//   log.debug("LPPAIR token_value_in_lp {}", [token_value_in_lp.toString()])

//   let total_lp_usd = token_value_in_lp.times(BigDecimal.fromString("2")).times(ownedLP)
//   log.debug("LPPAIR total_lp_usd {}", [total_lp_usd.toString()])

//   return total_lp_usd
// }
