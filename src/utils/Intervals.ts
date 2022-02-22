import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

import { Bond, BondDayData, BondHourData, UserBond } from "../../generated/schema";

export function updateBondDayData(event: ethereum.Event): BondDayData {
  let timestamp = event.block.timestamp.toI32()

  // Rounding
  let dayIndex = timestamp / 86400
  let dayStartTimestamp = dayIndex * 86400

  let dayBondID = event.address.toHexString() + "-" + dayStartTimestamp.toString()
  let bond = Bond.load(event.address.toHexString()) as Bond
  let bondDayData = BondDayData.load(dayBondID)
  if (!bondDayData) {
    bondDayData = new BondDayData(dayBondID)
    log.debug('updateBondDayData: Creating new BondDayData entity {}', [dayBondID])
    bondDayData.timestamp = BigInt.fromI32(dayStartTimestamp)
    bondDayData.bond = bond.id

    if (bond.latestUserBond) {
      let latestUserBond = UserBond.load(bond.latestUserBond as string) as UserBond
      let price = latestUserBond.deposit.div(latestUserBond.payout)
      bondDayData.bondPriceOpen = price
      bondDayData.bondPriceHigh = price
      bondDayData.bondPriceLow = price
      bondDayData.bondPriceClose = price
  
      let priceUSD = latestUserBond.depositUSD.div(latestUserBond.payout)
      bondDayData.bondPriceUSDOpen = priceUSD
      bondDayData.bondPriceUSDHigh = priceUSD
      bondDayData.bondPriceUSDLow = priceUSD
      bondDayData.bondPriceUSDClose = priceUSD
    }
  }

  return bondDayData as BondDayData
}

export function updateBondHourData(event: ethereum.Event): BondHourData {
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

    if (bond.latestUserBond) {
      let latestUserBond = UserBond.load(bond.latestUserBond as string) as UserBond
      let price = latestUserBond.deposit.div(latestUserBond.payout)
      bondHourData.bondPriceOpen = price
      bondHourData.bondPriceHigh = price
      bondHourData.bondPriceLow = price
      bondHourData.bondPriceClose = price
  
      let priceUSD = latestUserBond.depositUSD.div(latestUserBond.payout)
      bondHourData.bondPriceUSDOpen = priceUSD
      bondHourData.bondPriceUSDHigh = priceUSD
      bondHourData.bondPriceUSDLow = priceUSD
      bondHourData.bondPriceUSDClose = priceUSD
    }
  }

  return bondHourData as BondHourData
}