import { BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { Bond, UserRedemption } from "../../generated/schema";

// `initUserRedemption(...)` returns a new `UserRedemption` entity initialized 
// using the values provided as argument. The USD values (payoutUSD and remainingUSD) 
// default to `null` in case where the USD price for the payout token is unavailable.
export function initUserRedemption(
  event: ethereum.Event,
  bond: Bond,
  payoutAmount: BigDecimal,
  remainingAmount: BigDecimal,
  payoutTokenPriceUSD: BigDecimal | null,
  recipient: Bytes
): UserRedemption {
  let payoutUSDValue: BigDecimal | null = null
  let remainingUSDValue: BigDecimal | null = null
  if (payoutTokenPriceUSD) {
    payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)
    remainingUSDValue = payoutTokenPriceUSD.times(remainingAmount)
    log.debug("initUserRedemption: payoutAmount (USD value) = {} ({})", [payoutAmount.toString(), payoutUSDValue.toString()])
    log.debug("initUserRedemption: remainingAmount (USD value) = {} ({})", [remainingAmount.toString(), remainingUSDValue.toString()])
  } else {
    log.debug("initUserRedemption: payoutAmount (USD value) = {} (NULL)", [payoutAmount.toString()])
    log.debug("initUserRedemption: remainingAmount (USD value) = {} (NULL)", [remainingAmount.toString()])
  }


  // Create new UserRedemption entity
  let userRedemption = new UserRedemption(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  userRedemption.timestamp = event.block.timestamp
  userRedemption.bond = bond.id
  userRedemption.user = event.transaction.from
  userRedemption.recipient = recipient
  userRedemption.payout = payoutAmount
  userRedemption.payoutUSD = payoutUSDValue
  userRedemption.remaining = remainingAmount
  userRedemption.remainingUSD = remainingUSDValue
  userRedemption.save()

  return userRedemption
}