import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

import { Bond, BondDayData, BondHourData, UserBond, UserRedemption } from "../../generated/schema";
import { BIGINT_ONE } from "./Constants";

// ================================================================
// BondDayData
// ================================================================
// `initOrLoadBondDayData(event)` returns the `BondDayData` entity whose
// period emcompasses the event `event`. If the `BondDayData` does not yet exist,
// it is created.
export function initOrLoadBondDayData(event: ethereum.Event): BondDayData {
  let timestamp = event.block.timestamp.toI32()

  // Rounding
  let dayIndex = timestamp / 86400
  let dayStartTimestamp = dayIndex * 86400

  let dayBondID = event.address.toHexString() + "-" + dayStartTimestamp.toString()
  let bond = <Bond>Bond.load(event.address.toHexString())
  let bondDayData = BondDayData.load(dayBondID)

  if (!bondDayData) {
    bondDayData = new BondDayData(dayBondID)
    log.debug('updateBondDayData: Creating new BondDayData entity {}', [dayBondID])
    bondDayData.timestamp = BigInt.fromI32(dayStartTimestamp)
    bondDayData.bond = bond.id
  }

  return <BondDayData>bondDayData
}

// `updateBondDayDataOnPurchase(bondDayData, userBond)` updates the `bondDayData` entity
// with the data contained in the `userBond` entity. The price OHLC values and the USD price 
// OHLC values (if USD price is available) of `bondDayData` are set using the data contained
//  in `userBond`. The user bond count and volume information for the period are also updated.
export function updateBondDayDataOnPurchase(
  bondDayData: BondDayData,
  userBond: UserBond
): void {
  let price = userBond.deposit.div(userBond.payout)
  let priceUSD: BigDecimal | null = null
  if (userBond.depositUSD) priceUSD = (<BigDecimal>userBond.depositUSD).div(userBond.payout)

  // Update price OHLC
  if (!bondDayData.bondPriceOpen) bondDayData.bondPriceOpen = price
  if (!bondDayData.bondPriceHigh || price > (<BigDecimal>bondDayData.bondPriceHigh)) {
    bondDayData.bondPriceHigh = price
  }
  if (!bondDayData.bondPriceLow || price < (<BigDecimal>bondDayData.bondPriceLow)) {
    bondDayData.bondPriceLow = price
  }
  bondDayData.bondPriceClose = price

  // Update USD price OHLC
  if (priceUSD) {
    if (!bondDayData.bondPriceUSDOpen) {
      bondDayData.bondPriceUSDOpen = <BigDecimal>priceUSD
    }
    if (!bondDayData.bondPriceUSDHigh || <BigDecimal>priceUSD > (<BigDecimal>bondDayData.bondPriceUSDHigh)) {
      bondDayData.bondPriceUSDHigh = <BigDecimal>priceUSD
    }
    if (!bondDayData.bondPriceUSDLow || <BigDecimal>priceUSD < (<BigDecimal>bondDayData.bondPriceUSDLow)) {
      bondDayData.bondPriceUSDLow = <BigDecimal>priceUSD
    }
    bondDayData.bondPriceUSDClose = <BigDecimal>priceUSD
  }

  // Update count stat
  bondDayData.userBondCount = bondDayData.userBondCount.plus(BIGINT_ONE)

  // Update volume stats
  bondDayData.principalVolume = bondDayData.principalVolume.plus(userBond.deposit)
  if (userBond.depositUSD) {
    if (bondDayData.principalVolumeUSD) {
      bondDayData.principalVolumeUSD = (<BigDecimal>bondDayData.principalVolumeUSD).plus(<BigDecimal>userBond.depositUSD)
    } else {
      bondDayData.principalVolumeUSD = <BigDecimal>userBond.depositUSD
    }
  }

  bondDayData.payoutVolume = bondDayData.payoutVolume.plus(userBond.payout)
  if (userBond.payoutUSD) {
    if (bondDayData.payoutVolumeUSD) {
      bondDayData.payoutVolumeUSD = (<BigDecimal>bondDayData.payoutVolumeUSD).plus(<BigDecimal>userBond.payoutUSD)
    } else {
      bondDayData.payoutVolumeUSD = <BigDecimal>userBond.payoutUSD
    }
  }

  bondDayData.save()
}

// `updateBondDayDataOnRedemption(bondDayData, userRedemption)` updates the `bondDayData` entity
// with the data contained in the `userRedemption` entity. The user redemption count and volume 
// information for the period are updated.
export function updateBondDayDataOnRedemption(
  bondDayData: BondDayData,
  userRedemption: UserRedemption
): void {
  // Update count stat
  bondDayData.userRedemptionCount = bondDayData.userRedemptionCount.plus(BIGINT_ONE)

  // Update volume stats
  bondDayData.redemptionVolume = bondDayData.redemptionVolume.plus(userRedemption.payout)

  if (userRedemption.payoutUSD) {
    if (bondDayData.redemptionVolumeUSD) {
      bondDayData.redemptionVolumeUSD = (<BigDecimal>bondDayData.redemptionVolumeUSD).plus(<BigDecimal>userRedemption.payoutUSD)
    } else {
      bondDayData.redemptionVolumeUSD = <BigDecimal>userRedemption.payoutUSD
    }
  }
  
  bondDayData.save()
}

// ================================================================
// BondHourData
// ================================================================
// `initOrLoadBondHourData(event)` returns the `BondHourData` entity whose
// period emcompasses the event `event`. If the `BondHourData` does not yet exist,
// it is created.
export function initOrLoadBondHourData(
  event: ethereum.Event
): BondHourData {
  let timestamp = event.block.timestamp.toI32()
  
  // Rounding
  let hourIndex = timestamp / 3600
  let hourStartTimestamp = hourIndex * 3600

  let hourBondID = event.address.toHexString() + "-" + hourStartTimestamp.toString()
  let bond = Bond.load(event.address.toHexString()) as Bond
  let bondHourData = BondHourData.load(hourBondID)

  if (!bondHourData) {
    bondHourData = new BondHourData(hourBondID)
    log.debug('updateBondHourData: Creating new BondHourData entity {}', [hourBondID])
    bondHourData.timestamp = BigInt.fromI32(hourStartTimestamp)
    bondHourData.bond = bond.id
  }

  return <BondHourData>bondHourData
}

// `updateBondHourDataOnPurchase(bondHourData, userBond)` updates the `bondHourData` entity
// with the data contained in the `userBond` entity. The price OHLC values and the USD price 
// OHLC values (if USD price is available) of `bondHourData` are set using the data contained
//  in `userBond`. The user bond count and volume information for the period are also updated.
export function updateBondHourDataOnPurchase(
  bondHourData: BondHourData,
  userBond: UserBond
): void {
  let price = userBond.deposit.div(userBond.payout)
  let priceUSD: BigDecimal | null = null
  if (userBond.depositUSD) priceUSD = (<BigDecimal>userBond.depositUSD).div(userBond.payout)

  // Update price OHLC
  if (!bondHourData.bondPriceOpen) bondHourData.bondPriceOpen = price
  if (!bondHourData.bondPriceHigh || price > (<BigDecimal>bondHourData.bondPriceHigh)) {
    bondHourData.bondPriceHigh = price
  }
  if (!bondHourData.bondPriceLow || price < (<BigDecimal>bondHourData.bondPriceLow)) {
    bondHourData.bondPriceLow = price
  }
  bondHourData.bondPriceClose = price

  // Update USD price OHLC
  if (priceUSD) {
    if (!bondHourData.bondPriceUSDOpen) {
      bondHourData.bondPriceUSDOpen = <BigDecimal>priceUSD
    }
    if (!bondHourData.bondPriceUSDHigh || <BigDecimal>priceUSD > (<BigDecimal>bondHourData.bondPriceUSDHigh)) {
      bondHourData.bondPriceUSDHigh = <BigDecimal>priceUSD
    }
    if (!bondHourData.bondPriceUSDLow || <BigDecimal>priceUSD < (<BigDecimal>bondHourData.bondPriceUSDLow)) {
      bondHourData.bondPriceUSDLow = <BigDecimal>priceUSD
    }
    bondHourData.bondPriceUSDClose = <BigDecimal>priceUSD
  }

  // Update count stat
  bondHourData.userBondCount = bondHourData.userBondCount.plus(BIGINT_ONE)

  // Update volume stats
  bondHourData.principalVolume = bondHourData.principalVolume.plus(userBond.deposit)
  if (userBond.depositUSD) {
    if (bondHourData.principalVolumeUSD) {
      bondHourData.principalVolumeUSD = (<BigDecimal>bondHourData.principalVolumeUSD).plus(<BigDecimal>userBond.depositUSD)
    } else {
      bondHourData.principalVolumeUSD = <BigDecimal>userBond.depositUSD
    }
  }

  bondHourData.payoutVolume = bondHourData.payoutVolume.plus(userBond.payout)
  if (userBond.payoutUSD) {
    if (bondHourData.payoutVolumeUSD) {
      bondHourData.payoutVolumeUSD = (<BigDecimal>bondHourData.payoutVolumeUSD).plus(<BigDecimal>userBond.payoutUSD)
    } else {
      bondHourData.payoutVolumeUSD = <BigDecimal>userBond.payoutUSD
    }
  }

  bondHourData.save()
}

// `updateBondHourDataOnRedemption(bondHourData, userRedemption)` updates the `bondHourData` entity
// with the data contained in the `userRedemption` entity. The user redemption count and volume 
// information for the period are updated.
export function updateBondHourDataOnRedemption(
  bondHourData: BondHourData,
  userRedemption: UserRedemption
): void {
  // Update count stat
  bondHourData.userRedemptionCount = bondHourData.userRedemptionCount.plus(BIGINT_ONE)

  // Update volume stats
  bondHourData.redemptionVolume = bondHourData.redemptionVolume.plus(userRedemption.payout)
  if (userRedemption.payoutUSD) {
    if (bondHourData.redemptionVolumeUSD) {
      bondHourData.redemptionVolumeUSD = (<BigDecimal>bondHourData.redemptionVolumeUSD).plus(<BigDecimal>userRedemption.payoutUSD)
    } else {
      bondHourData.redemptionVolumeUSD = <BigDecimal>userRedemption.payoutUSD
    }
  }
  
  bondHourData.save()
}