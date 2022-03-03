import { Address, log, BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/OlympusProFactoryV2/ERC20"
import { Bond, UserBond, UserRedemption } from "../generated/schema"
import { BondCreated, BondRedeemed } from "../generated/templates/CustomBondV2/CustomBondV2"
import { updateBondOnPurchase, updateBondOnRedemption } from "./utils/Bond"
import { 
  BIGDECIMAL_ONE, 
  BIGDECIMAL_ZERO,
  BIGINT_ONE, 
  BIGINT_ZERO, 
  NATIVE_TOKEN_ADDRESS, 
  NATIVE_TOKEN_DECIMALS, 
  SECONDS_PER_BLOCK
} from "./utils/Constants"
import { toDecimal } from "./utils/Decimals"
import { 
  initOrLoadBondDayData,
  initOrLoadBondHourData,
  updateBondDayDataOnPurchase,
  updateBondHourDataOnPurchase,
  updateBondDayDataOnRedemption,
  updateBondHourDataOnRedemption
} from "./utils/Intervals"
import { 
  getStablePrice1Inch,
  getLPStablePrice
} from "./utils/Price"
import { initUserBond } from "./utils/UserBond"
import { initUserRedemption } from "./utils/UserRedemption"

export function handleBondCreated(event: BondCreated): void {
  let bond = Bond.load(event.address.toHexString()) as Bond
  log.debug("handleBondCreated: deposit = {}, payout = {}, expires = {}", [
    event.params.deposit.toString(),
    event.params.payout.toString(),
    event.params.expires.toString()
  ])

  // Get tokens price info
  let principalTokenERC20 = ERC20.bind(Address.fromString(bond.principalToken.toHexString()))
  let principalTokenDecimals = principalTokenERC20.decimals()

  let payoutTokenERC20 = ERC20.bind(Address.fromString(bond.payoutToken.toHexString()))
  let payoutTokenDecimals = payoutTokenERC20.decimals()

  let principalTokenPriceUSD: BigDecimal | null = null
  if (bond.type == "LP") {
    // Get token0 decimals
    let token0Decimals = 0
    if (bond.token0 == bond.payoutToken) token0Decimals = payoutTokenDecimals
    else {
      let token0ERC20 = ERC20.bind(Address.fromString(bond.token0.toHexString()))
      token0Decimals = token0ERC20.decimals()
    }

    // Get token1 decimals
    let token1ERC20 = ERC20.bind(Address.fromString((<Bytes>bond.token1).toHexString()))
    let token1Decimals = token1ERC20.decimals()

    principalTokenPriceUSD = getLPStablePrice(
      bond.principalToken.toHexString(),
      bond.token0.toHexString(),
      (<Bytes>bond.token1).toHexString(),
      token0Decimals,
      token1Decimals
    )
  }
  else {
    principalTokenPriceUSD = getStablePrice1Inch(bond.principalToken.toHexString())
  }
  if (principalTokenPriceUSD) log.debug("handleBondCreated: principalTokenPriceUSD = {}", [(<BigDecimal>principalTokenPriceUSD).toString()])
  else log.warning("handleBondCreated: unable to get principalTokenPriceUSD", [])

  let payoutTokenPriceUSD: BigDecimal | null = getStablePrice1Inch(bond.payoutToken.toHexString())
  if (payoutTokenPriceUSD) log.debug("handleBondCreated: payoutTokenPriceUSD = {}", [(<BigDecimal>payoutTokenPriceUSD).toString()])
  else log.warning("handleBondCreated: unable to get principalTokenPriceUSD", [])

  // Calculate amounts
  let depositAmount = toDecimal(event.params.deposit, principalTokenDecimals)
  let payoutAmount = toDecimal(event.params.payout, payoutTokenDecimals)

  // Create new UserBond entity
  let userBond = initUserBond(
    event,
    bond,
    depositAmount,
    principalTokenPriceUSD,
    payoutAmount,
    payoutTokenPriceUSD,
    event.params.expires
  )

  // Update bond
  updateBondOnPurchase(bond, userBond)

  // Update current day's data
  let bondDayData = initOrLoadBondDayData(event)
  updateBondDayDataOnPurchase(bondDayData, userBond)
  bondDayData.save()

  // Update current Hour's data
  let bondHourData = initOrLoadBondHourData(event)
  updateBondHourDataOnPurchase(bondHourData, userBond)
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

  let payoutTokenPriceUSD: BigDecimal | null = getStablePrice1Inch(bond.payoutToken.toHexString())
  if (payoutTokenPriceUSD) log.debug("handleBondRedeemed: payoutTokenPriceUSD = {}", [(<BigDecimal>payoutTokenPriceUSD).toString()])
  else log.warning("handleBondRedeemed: unable to get payoutTokenPriceUSD", [])

  // Calculate amounts
  let payoutAmount = toDecimal(event.params.payout, payoutTokenDecimals)
  let remainingAmount = toDecimal(event.params.remaining, payoutTokenDecimals)

  // Create new UserRedemption entity
  let userRedemption = initUserRedemption(
    event,
    bond,
    payoutAmount,
    remainingAmount,
    payoutTokenPriceUSD,
    event.params.recipient
  )

  // Update bond info
  updateBondOnRedemption(bond, userRedemption)
  
  // Update current day's data
  let bondDayData = initOrLoadBondDayData(event)
  updateBondDayDataOnRedemption(bondDayData, userRedemption)
  bondDayData.save()

  // Update current hour's data
  let bondHourData = initOrLoadBondHourData(event)
  updateBondHourDataOnRedemption(bondHourData, userRedemption)
  bondHourData.save()
}