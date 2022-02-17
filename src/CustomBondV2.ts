import { Address, log, BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/OlympusProFactoryV2/ERC20"
import { Bond, UserBond, UserRedemption } from "../generated/schema"
import { BondCreated, BondRedeemed } from "../generated/templates/CustomBondV2/CustomBondV2"
import { BIGDECIMAL_ZERO, BIGINT_ONE, BIGINT_ZERO, NATIVE_TOKEN } from "./utils/Constants"
import { toDecimal } from "./utils/Decimals"
import { updateBondDayData, updateBondHourData } from "./utils/Intervals"
import { getPairUSD, getSwap } from "./utils/Price"

export function handleBondCreated(event: BondCreated): void {
    log.debug("BondCreated", [])

    let bond = Bond.load(event.address.toHexString()) as Bond

    // Get tokens price info
    let principleTokenERC20 = ERC20.bind(Address.fromString(bond.principleToken.toHexString()))
    let payoutTokenERC20 = ERC20.bind(Address.fromString(bond.principleToken.toHexString()))

    let principleTokenPriceUSD = BIGDECIMAL_ZERO
    if (bond.type == "LP"){
        principleTokenPriceUSD = getPairUSD(event.params.deposit, bond.principleToken.toHexString())
    }
    else {
        principleTokenPriceUSD = getSwap(bond.payoutToken.toHexString(), NATIVE_TOKEN, true)
    }

    let payoutTokenPriceUSD = getSwap(bond.payoutToken.toHexString(), NATIVE_TOKEN, true)

    // Calculate amounts
    let depositAmount = toDecimal(event.params.deposit, principleTokenERC20.decimals())
    let payoutAmount = toDecimal(event.params.payout, payoutTokenERC20.decimals())

    let depositUSDValue = principleTokenPriceUSD.times(depositAmount)
    let payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)

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
    userBond.save()

    // Update bond info
    bond.latestUserBond = userBond.id
    bond.userBondCount = bond.userBondCount.plus(BIGINT_ONE)
    bond.save()

    let price = userBond.deposit.div(userBond.payout)
    let priceUSD = userBond.depositUSD.div(userBond.payoutUSD)
    // TODO: discount can be calculated here: 1 - priceUSD / payoutTokenPriceUSD

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

    log.debug("Deposit in bond: {} Principle amount: {} USD Value: {}", [
        event.transaction.hash.toHexString(),
        depositAmount.toString(),
        depositUSDValue.toString()
    ])
    log.debug("Payout in bond: {} Principle amount: {} USD Value: {}", [
        event.transaction.hash.toHexString(),
        payoutAmount.toString(),
        payoutUSDValue.toString()
    ])
}

export function handleBondRedeemed(event: BondRedeemed): void {
    let bond = Bond.load(event.address.toHexString()) as Bond

    // Get tokens price info
    let payoutTokenERC20 = ERC20.bind(Address.fromString(bond.principleToken.toHexString()))

    let payoutTokenPriceUSD = getSwap(bond.payoutToken.toHexString(), NATIVE_TOKEN, true)

    // Calculate amounts
    let payoutAmount = toDecimal(event.params.payout, payoutTokenERC20.decimals())
    let remainingAmount = toDecimal(event.params.remaining, payoutTokenERC20.decimals())

    let payoutUSDValue = payoutTokenPriceUSD.times(payoutAmount)
    let remainingUSDValue = payoutTokenPriceUSD.times(remainingAmount)

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

    // Update current hour's data
    let bondHourData = updateBondHourData(event)
    bondHourData.userRedemptionCount = bondHourData.userRedemptionCount.plus(BIGINT_ONE)
    bondHourData.redemptionVolume = bondHourData.redemptionVolume.plus(userRedemption.payout)
    bondHourData.redemptionVolumeUSD = bondHourData.redemptionVolumeUSD.plus(userRedemption.payoutUSD)

    log.debug("Payout in bond: {} Principle amount: {} USD Value: {}", [
        event.transaction.hash.toHexString(),
        payoutAmount.toString(),
        payoutUSDValue.toString()
    ])
}