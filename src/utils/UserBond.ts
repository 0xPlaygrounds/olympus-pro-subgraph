import { BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Bond, UserBond } from "../../generated/schema";
import { SECONDS_PER_BLOCK } from "./Constants";

// `initUserBond(...)` returns a new `UserBond` entity initialized using the 
// values provided as argument. The USD values (depositUSD and payoutUSD) 
// default to `null` in case where the USD price for the principal or payout 
// tokens (respsectively) is unavailable. If any of the aforementioned USD values
// is `null`, then the discount value is also `null`
export function initUserBond(
  event: ethereum.Event,
  bond: Bond,
  depositAmount: BigDecimal,
  principalTokenPriceUSD: BigDecimal | null,
  payoutAmount: BigDecimal,
  payoutTokenPriceUSD: BigDecimal | null,
  expires: BigInt
): UserBond {
  let depositUSDValue: BigDecimal | null = null 
  if (principalTokenPriceUSD) {
    depositUSDValue = principalTokenPriceUSD.times(depositAmount)
    log.debug("initUserBond: depositAmount (USD value) = {} ({})", [
      depositAmount.toString(),
      depositUSDValue.toString()
    ])
  } else {
    log.debug("initUserBond: depositAmount (USD value) = {} (NULL)", [
      depositAmount.toString(),
    ])
  }


  let payoutUSDValue: BigDecimal | null = null
  if (payoutTokenPriceUSD) {
    payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)
    log.debug("initUserBond: payoutAmount (USD value) = {} ({})", [
      payoutAmount.toString(),
      payoutUSDValue.toString()
    ])
  } else {
    log.debug("initUserBond: payoutAmount (USD value) = {} (NULL)", [
      payoutAmount.toString(),
    ])
  }

  // Create new UserBond entity
  let userBond = new UserBond(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  userBond.timestamp = event.block.timestamp
  userBond.bond = bond.id
  userBond.user = event.transaction.from
  userBond.deposit = depositAmount
  userBond.depositUSD = depositUSDValue
  userBond.payout = payoutAmount
  userBond.payoutUSD = payoutUSDValue
  userBond.expires = expires
  userBond.expiresTimestamp = expires.minus(event.block.number)
                                .times(SECONDS_PER_BLOCK)
                                .plus(event.block.timestamp)

  if (depositUSDValue && payoutUSDValue) {
    userBond.discount = depositUSDValue
      .div(payoutUSDValue)
      .times(BigDecimal.fromString('100.0'))
      .minus(BigDecimal.fromString('100.0'))
      .neg()
  } else {
    userBond.discount = null
  }
  userBond.save()

  return userBond
}