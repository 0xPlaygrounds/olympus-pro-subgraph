import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

import { Bond, BondDayData, BondHourData, UserBond, UserRedemption } from "../../generated/schema";
import { BIGINT_ONE } from "./Constants";

// ================================================================
// BondDayData
// ================================================================
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

// export function updateBondDayData(event: ethereum.Event): BondDayData {
//   let timestamp = event.block.timestamp.toI32()

//   // Rounding
//   let dayIndex = timestamp / 86400
//   let dayStartTimestamp = dayIndex * 86400

//   let dayBondID = event.address.toHexString() + "-" + dayStartTimestamp.toString()
//   let bond = Bond.load(event.address.toHexString()) as Bond
//   let bondDayData = BondDayData.load(dayBondID)
//   if (!bondDayData) {
//     bondDayData = new BondDayData(dayBondID)
//     log.debug('updateBondDayData: Creating new BondDayData entity {}', [dayBondID])
//     bondDayData.timestamp = BigInt.fromI32(dayStartTimestamp)
//     bondDayData.bond = bond.id

//     if (bond.latestUserBond) {
//       let latestUserBond = UserBond.load(bond.latestUserBond as string) as UserBond
//       let price = latestUserBond.deposit.div(latestUserBond.payout)
//       bondDayData.bondPriceOpen = price
//       bondDayData.bondPriceHigh = price
//       bondDayData.bondPriceLow = price
//       bondDayData.bondPriceClose = price
  
//       let priceUSD = latestUserBond.depositUSD.div(latestUserBond.payout)
//       bondDayData.bondPriceUSDOpen = priceUSD
//       bondDayData.bondPriceUSDHigh = priceUSD
//       bondDayData.bondPriceUSDLow = priceUSD
//       bondDayData.bondPriceUSDClose = priceUSD
//     }
//   }

//   return bondDayData as BondDayData
// }

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

// export function updateBondHourData(event: ethereum.Event): BondHourData {
//   let timestamp = event.block.timestamp.toI32()
  
//   // Rounding
//   let hourIndex = timestamp / 3600
//   let hourStartTimestamp = hourIndex * 3600

//   let hourBondID = event.address.toHexString() + "-" + hourStartTimestamp.toString()
//   let bond = Bond.load(event.address.toHexString()) as Bond
//   let bondHourData = BondHourData.load(hourBondID)
//   if (!bondHourData) {
//     bondHourData = new BondHourData(hourBondID)
//     log.debug('updateBondHourData: Creating new BondHourData entity {}', [hourBondID])
//     bondHourData.timestamp = BigInt.fromI32(hourStartTimestamp)
//     bondHourData.bond = bond.id

//     if (bond.latestUserBond) {
//       let latestUserBond = UserBond.load(bond.latestUserBond as string) as UserBond
//       let price = latestUserBond.deposit.div(latestUserBond.payout)
//       bondHourData.bondPriceOpen = price
//       bondHourData.bondPriceHigh = price
//       bondHourData.bondPriceLow = price
//       bondHourData.bondPriceClose = price
  
//       let priceUSD = latestUserBond.depositUSD.div(latestUserBond.payout)
//       bondHourData.bondPriceUSDOpen = priceUSD
//       bondHourData.bondPriceUSDHigh = priceUSD
//       bondHourData.bondPriceUSDLow = priceUSD
//       bondHourData.bondPriceUSDClose = priceUSD
//     }
//   }

//   return bondHourData as BondHourData
// }

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