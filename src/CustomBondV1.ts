import { Address, log, BigInt, BigDecimal } from "@graphprotocol/graph-ts"

import { ERC20 } from "../generated/OlympusProFactoryV1/ERC20"
import { Bond, UserBond, UserRedemption } from "../generated/schema"
import { BondCreated, BondRedeemed } from "../generated/templates/CustomBondV1/CustomBondV1"

import { 
  BIGDECIMAL_ONE,
  BIGDECIMAL_ZERO, 
  BIGINT_ONE, 
  NATIVE_TOKEN_ADDRESS, 
  NATIVE_TOKEN_DECIMALS 
} from "./utils/Constants"
import { toDecimal } from "./utils/Decimals"
import { updateBondDayData, updateBondHourData } from "./utils/Intervals"
import { 
  getLPNativePrice,
  getNativeStableSwapPrice,
  getPairUSD,
  getSwap,
  getSwapPrice
} from "./utils/Price"

export function handleBondCreated(event: BondCreated): void {
  let bond = Bond.load(event.address.toHexString()) as Bond
  log.debug("handleBondCreated: deposit = {}, payout = {}, expires = {}", [
    event.params.deposit.toString(),
    event.params.payout.toString(),
    event.params.expires.toString()
  ])

  // Get tokens price info
  let principalTokenERC20 = ERC20.bind(Address.fromString(bond.principleToken.toHexString()))
  let principalTokenDecimals = principalTokenERC20.decimals()

  let payoutTokenERC20 = ERC20.bind(Address.fromString(bond.payoutToken.toHexString()))
  let payoutTokenDecimals = payoutTokenERC20.decimals()

  let nativeStablePrice = getNativeStableSwapPrice()
  if (!nativeStablePrice) nativeStablePrice = BIGDECIMAL_ONE
  log.debug("handleBondCreated: nativeStablePrice = {}", [nativeStablePrice.toString()])

  let principalTokenPriceNative: BigDecimal | null = BIGDECIMAL_ONE
  if (bond.type == "LP") {
    // Get token0 decimals
    let token0Decimals = 0
    if (bond.token0 == bond.payoutToken) token0Decimals = payoutTokenDecimals
    else {
      let token0ERC20 = ERC20.bind(Address.fromString(bond.token0.toHexString()))
      token0Decimals = token0ERC20.decimals()
    }

    // Get token1 decimals
    let token1ERC20 = ERC20.bind(Address.fromString(bond.token1.toHexString()))
    let token1Decimals = token1ERC20.decimals()

    principalTokenPriceNative = getLPNativePrice(
      bond.principleToken.toHexString(),
      bond.token0.toHexString(),
      bond.token1.toHexString(),
      token0Decimals,
      token1Decimals
    )
  }
  else {
    principalTokenPriceNative = getSwapPrice(
      bond.principleToken.toHexString(),
      NATIVE_TOKEN_ADDRESS,
      principalTokenDecimals,
      NATIVE_TOKEN_DECIMALS
    )
  }

  // If unable to get principal price, default to 1 USD
  let principleTokenPriceUSD = BIGDECIMAL_ONE
  if (principalTokenPriceNative) {
    principleTokenPriceUSD = principalTokenPriceNative.times(nativeStablePrice)
  } else {
    principalTokenPriceNative = BIGDECIMAL_ONE
  }
  log.debug("handleBondCreated: principalTokenPriceNative = {}", [principalTokenPriceNative.toString()])
  log.debug("handleBondCreated: principleTokenPriceUSD = {}", [principleTokenPriceUSD.toString()])

  let payoutTokenPriceNative: BigDecimal | null = getSwapPrice(
    bond.payoutToken.toHexString(),
    NATIVE_TOKEN_ADDRESS,
    payoutTokenDecimals,
    NATIVE_TOKEN_DECIMALS
  )

  let payoutTokenPriceUSD = BIGDECIMAL_ONE
  if (payoutTokenPriceNative) {
    payoutTokenPriceUSD = payoutTokenPriceNative.times(nativeStablePrice)
  } else {
    payoutTokenPriceNative = BIGDECIMAL_ONE
  }
  log.debug("handleBondCreated: payoutTokenPriceNative = {}", [payoutTokenPriceNative.toString()])
  log.debug("handleBondCreated: payoutTokenPriceUSD = {}", [payoutTokenPriceUSD.toString()])

  // Calculate amounts
  let depositAmount = toDecimal(event.params.deposit, principalTokenDecimals)
  let payoutAmount = toDecimal(event.params.payout, payoutTokenDecimals)

  let depositUSDValue = principleTokenPriceUSD.times(depositAmount)
  let payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)
  log.debug("handleBondCreated: depositAmount (USD value) = {} ({})", [depositAmount.toString(), depositUSDValue.toString()])
  log.debug("handleBondCreated: payoutAmount (USD value) = {} ({})", [payoutAmount.toString(), payoutUSDValue.toString()])

  // Create new UserBond entity
  let userBond = new UserBond(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  userBond.timestamp = event.block.timestamp
  userBond.bond = bond.id
  userBond.user = event.transaction.from
  userBond.deposit = depositAmount
  userBond.depositUSD = depositUSDValue
  userBond.payout = payoutAmount
  userBond.payoutUSD = payoutUSDValue
  userBond.expires = event.params.expires
  userBond.discount = depositUSDValue
                          .div(payoutUSDValue)
                          .times(BigDecimal.fromString('100.0'))
                          .minus(BigDecimal.fromString('100.0'))
                          .neg()
  userBond.save()

  // Update bond info
  bond.latestUserBond = userBond.id
  bond.userBondCount = bond.userBondCount.plus(BIGINT_ONE)
  bond.save()

  let price = userBond.deposit.div(userBond.payout)
  let priceUSD = userBond.depositUSD.div(userBond.payout)

  // Update current day's data
  let bondDayData = updateBondDayData(event)

  if (price > bondDayData.bondPriceHigh) bondDayData.bondPriceHigh = price
  if (price < bondDayData.bondPriceLow) bondDayData.bondPriceLow = price
  bondDayData.bondPriceClose = price

  if (priceUSD > bondDayData.bondPriceUSDHigh) bondDayData.bondPriceUSDHigh = priceUSD
  if (priceUSD < bondDayData.bondPriceUSDLow) bondDayData.bondPriceUSDLow = priceUSD
  bondDayData.bondPriceUSDClose = priceUSD

  bondDayData.userBondCount = bondDayData.userBondCount.plus(BIGINT_ONE)
  bondDayData.principalVolume = bondDayData.principalVolume.plus(userBond.deposit)
  bondDayData.principalVolumeUSD = bondDayData.principalVolumeUSD.plus(userBond.depositUSD)
  bondDayData.payoutVolume = bondDayData.payoutVolume.plus(userBond.payout)
  bondDayData.payoutVolumeUSD = bondDayData.payoutVolumeUSD.plus(userBond.payoutUSD)
  bondDayData.save()

  // Update current Hour's data
  let bondHourData = updateBondHourData(event)

  if (price > bondHourData.bondPriceHigh) bondHourData.bondPriceHigh = price
  if (price < bondHourData.bondPriceLow) bondHourData.bondPriceLow = price
  bondHourData.bondPriceClose = price

  if (priceUSD > bondHourData.bondPriceUSDHigh) bondHourData.bondPriceUSDHigh = priceUSD
  if (priceUSD < bondHourData.bondPriceUSDLow) bondHourData.bondPriceUSDLow = priceUSD
  bondHourData.bondPriceUSDClose = priceUSD

  bondHourData.userBondCount = bondHourData.userBondCount.plus(BIGINT_ONE)
  bondHourData.principalVolume = bondHourData.principalVolume.plus(userBond.deposit)
  bondHourData.principalVolumeUSD = bondHourData.principalVolumeUSD.plus(userBond.depositUSD)
  bondHourData.payoutVolume = bondHourData.payoutVolume.plus(userBond.payout)
  bondHourData.payoutVolumeUSD = bondHourData.payoutVolumeUSD.plus(userBond.payoutUSD)
  bondHourData.save()
}

export function handleBondRedeemed(event: BondRedeemed): void {
  let bond = Bond.load(event.address.toHexString()) as Bond
  log.debug("handleBondRedeemed: payout = {}, remaining = {}", [
    event.params.payout.toString(),
    event.params.remaining.toString()
  ])

  // Get tokens price info
  let payoutTokenERC20 = ERC20.bind(Address.fromString(bond.payoutToken.toHexString()))
  let payoutTokenDecimals = payoutTokenERC20.decimals()

  let nativeStablePrice = getNativeStableSwapPrice()
  if (!nativeStablePrice) nativeStablePrice = BIGDECIMAL_ONE
  log.debug("handleBondRedeemed: nativeStablePrice = {}", [nativeStablePrice.toString()])

  let payoutTokenPriceNative: BigDecimal | null = getSwapPrice(
    bond.payoutToken.toHexString(),
    NATIVE_TOKEN_ADDRESS,
    payoutTokenDecimals,
    NATIVE_TOKEN_DECIMALS
  )
  let payoutTokenPriceUSD = BIGDECIMAL_ONE
  if (payoutTokenPriceNative) {
    payoutTokenPriceUSD = payoutTokenPriceNative.times(nativeStablePrice)
  } else {
    payoutTokenPriceNative = BIGDECIMAL_ONE
  } 
  log.debug("handleBondRedeemed: payoutTokenPriceNative = {}", [payoutTokenPriceNative.toString()])
  log.debug("handleBondRedeemed: payoutTokenPriceUSD = {}", [payoutTokenPriceUSD.toString()])

  // Calculate amounts
  let payoutAmount = toDecimal(event.params.payout, payoutTokenDecimals)
  let remainingAmount = toDecimal(event.params.remaining, payoutTokenDecimals)

  let payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)
  let remainingUSDValue = payoutTokenPriceUSD.times(remainingAmount)
  log.debug("handleBondRedeemed: payoutAmount (USD value) = {} ({})", [payoutAmount.toString(), payoutUSDValue.toString()])
  log.debug("handleBondRedeemed: remainingAmount (USD value) = {} ({})", [remainingAmount.toString(), remainingUSDValue.toString()])

  // Create new UserRedemption entity
  let userRedemption = new UserRedemption(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  userRedemption.timestamp = event.block.timestamp
  userRedemption.bond = bond.id
  userRedemption.user = event.transaction.from
  userRedemption.recipient = event.params.recipient
  userRedemption.payout = payoutAmount
  userRedemption.payoutUSD = payoutUSDValue
  userRedemption.remaining = remainingAmount
  userRedemption.remainingUSD = remainingUSDValue
  userRedemption.save()

  // Update bond info
  bond.latestUserRedemption = userRedemption.id
  bond.userRedemptionCount = bond.userRedemptionCount.plus(BIGINT_ONE)
  bond.save()
  
  // Update current day's data
  let bondDayData = updateBondDayData(event)
  bondDayData.userRedemptionCount = bondDayData.userRedemptionCount.plus(BIGINT_ONE)
  bondDayData.redemptionVolume = bondDayData.redemptionVolume.plus(userRedemption.payout)
  bondDayData.redemptionVolumeUSD = bondDayData.redemptionVolumeUSD.plus(userRedemption.payoutUSD)
  bondDayData.save()

  // Update current hour's data
  let bondHourData = updateBondHourData(event)
  bondHourData.userRedemptionCount = bondHourData.userRedemptionCount.plus(BIGINT_ONE)
  bondHourData.redemptionVolume = bondHourData.redemptionVolume.plus(userRedemption.payout)
  bondHourData.redemptionVolumeUSD = bondHourData.redemptionVolumeUSD.plus(userRedemption.payoutUSD)
  bondHourData.save()
}