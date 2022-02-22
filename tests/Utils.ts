import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction } from "matchstick-as";
import { Bond, BondDayData, BondHourData, UserBond, UserRedemption } from '../generated/schema';
import { BIGINT_ONE } from '../src/utils/Constants';

// ================================================================
// LP mock call helpers
// ================================================================
export function mockUniV2LP_token0(lp: string, token0: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token0))])
  }
}

export function mockUniV2LP_token1(lp: string, token1: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token1))])
  }
}

export function mockUniV2LP_decimals(lp: string, decimals: u32, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'decimals', 'decimals():(uint8)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromI32(decimals)])
  }
}

export function mockUniV2LP_totalSupply(lp: string, totalSupply: BigInt, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'totalSupply', 'totalSupply():(uint256)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(totalSupply)])
  }
}

export function mockUniV2LP_getReserves(lp: string, reserve0: BigInt, reserve1: BigInt, timestamp: BigInt, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'getReserves', 'getReserves():(uint112,uint112,uint32)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'getReserves', 'getReserves():(uint112,uint112,uint32)')
      .returns([
        ethereum.Value.fromUnsignedBigInt(reserve0),
        ethereum.Value.fromUnsignedBigInt(reserve1),
        ethereum.Value.fromUnsignedBigInt(timestamp),
      ])
  }
}

export function mockUniV2LPCalls(
  lp: string,
  token0: string,
  token1: string,
  decimals: i32,
  totalSupply: BigInt,
  reserve0: BigInt,
  reserve1: BigInt,
  timestamp: BigInt,
  revert: boolean
): void {
  mockUniV2LP_token0(lp, token0, revert)
  mockUniV2LP_token1(lp, token1, revert)
  mockUniV2LP_decimals(lp, decimals, revert)
  mockUniV2LP_totalSupply(lp, totalSupply, revert)
  mockUniV2LP_getReserves(lp, reserve0, reserve1, timestamp, revert)
}

export function mockSorbetLP_token0(lp: string, token0: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token0))])
  }
}

export function mockSorbetLP_token1(lp: string, token1: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token1))])
  }
}

export function mockSorbetLP_decimals(lp: string, decimals: u32, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'decimals', 'decimals():(uint8)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromI32(decimals)])
  }
}

export function mockSorbetLP_totalSupply(lp: string, totalSupply: BigInt, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'totalSupply', 'totalSupply():(uint256)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(totalSupply)])
  }
}

export function mockSorbetLP_getUnderlyingBalances(lp: string, reserve0: BigInt, reserve1: BigInt, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'getUnderlyingBalances', 'getUnderlyingBalances():(uint256,uint256)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'getUnderlyingBalances', 'getUnderlyingBalances():(uint256,uint256)')
      .returns([
        ethereum.Value.fromUnsignedBigInt(reserve0),
        ethereum.Value.fromUnsignedBigInt(reserve1),
      ])
  }
}

export function mockSorbetLPCalls(
  lp: string,
  token0: string,
  token1: string,
  decimals: i32,
  totalSupply: BigInt,
  reserve0: BigInt,
  reserve1: BigInt,
  timestamp: BigInt,
  revert: boolean
): void {
  mockSorbetLP_token0(lp, token0, revert)
  mockSorbetLP_token1(lp, token1, revert)
  mockSorbetLP_decimals(lp, decimals, revert)
  mockSorbetLP_totalSupply(lp, totalSupply, revert)
  mockSorbetLP_getUnderlyingBalances(lp, reserve0, reserve1, revert)
}

export function mockVisorLP_getTotalAmounts(lp: string, reserve0: BigInt, reserve1: BigInt, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'getTotalAmounts', 'getTotalAmounts():(uint256,uint256)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'getTotalAmounts', 'getTotalAmounts():(uint256,uint256)')
      .returns([
        ethereum.Value.fromUnsignedBigInt(reserve0),
        ethereum.Value.fromUnsignedBigInt(reserve1),
      ])
  }
}

// ================================================================
// UniswapV2Router mock call helpers
// ================================================================
export function mockUniswapV2Router_getAmountsOut(
  router: string,
  amountIn: BigInt,
  path: string[],
  amounts: BigInt[],
  revert: boolean
): void {
  if (revert) {
    createMockedFunction(Address.fromString(router), 'getAmountsOut', 'getAmountsOut(uint256,address[]):(uint256[])')
      .withArgs([
        ethereum.Value.fromUnsignedBigInt(amountIn),
        ethereum.Value.fromAddressArray(path.map<Address>(addr => Address.fromString(addr)))
      ])
      .reverts()
  } else {
    createMockedFunction(Address.fromString(router), 'getAmountsOut', 'getAmountsOut(uint256,address[]):(uint256[])')
      .withArgs([
        ethereum.Value.fromUnsignedBigInt(amountIn),
        ethereum.Value.fromAddressArray(path.map<Address>(addr => Address.fromString(addr)))
      ])
      .returns([
        ethereum.Value.fromUnsignedBigIntArray(amounts),
      ])
  }
}

// ================================================================
// ERC20 mock call helpers
// ================================================================
export function mockERC20_symbol(erc20: string, symbol: string): void {
  createMockedFunction(Address.fromString(erc20), 'symbol', 'symbol():(string)')
    .withArgs([])
    .returns([ethereum.Value.fromString(symbol)])
}

export function mockERC20_name(erc20: string, name: string): void {
  createMockedFunction(Address.fromString(erc20), 'name', 'name():(string)')
    .withArgs([])
    .returns([ethereum.Value.fromString(name)])
}

export function mockERC20_decimals(erc20: string, decimals: i32): void {
  createMockedFunction(Address.fromString(erc20), 'decimals', 'decimals():(uint8)')
    .withArgs([])
    .returns([ethereum.Value.fromI32(decimals)])
}

export function mockERC20Calls(
  erc20: string,
  symbol: string,
  name: string,
  decimals: i32
): void {
  mockERC20_symbol(erc20, symbol)
  mockERC20_name(erc20, name)
  mockERC20_decimals(erc20, decimals)
}

// ================================================================
// CustomTreasury mock call helpers
// ================================================================
export function mockCustomTreasury_payoutToken(contract: string, payoutToken: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(contract), 'payoutToken', 'payoutToken():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(contract), 'payoutToken', 'payoutToken():(address)')
      .withArgs([])
      .returns([ethereum.Value.fromAddress(Address.fromString(payoutToken))])
  }
}


// ================================================================
// Bond related helpers
// ================================================================
export function assertBondEquals(bond: Bond, expected: Bond): void {
  assert.stringEquals(bond.id, expected.id)
  assert.bigIntEquals(bond.createdAtTimestamp, expected.createdAtTimestamp)
  assert.bytesEquals(bond.owner, expected.owner)
  assert.stringEquals(bond.name, expected.name)
  assert.bytesEquals(bond.token0, expected.token0)
  assert.bytesEquals(bond.token1, expected.token1)
  assert.bytesEquals(bond.treasury, expected.treasury)
  assert.bytesEquals(bond.principleToken, expected.principleToken)
  assert.bytesEquals(bond.payoutToken, expected.payoutToken)
  assert.stringEquals(bond.fees.toString(), expected.fees.toString())
  assert.stringEquals(bond.type, expected.type)
  assert.bigIntEquals(bond.userBondCount, expected.userBondCount)
  if (expected.latestUserBond) {
    assert.stringEquals(bond.latestUserBond as string, expected.latestUserBond as string)
  } else {
    assert.assertNull(bond.latestUserBond)
  }
  // assert.arrayEquals(bond.userBonds, expected.userBonds)
  assert.bigIntEquals(bond.userRedemptionCount, expected.userRedemptionCount)
  if (expected.latestUserRedemption) {
    assert.stringEquals(bond.latestUserRedemption as string, expected.latestUserRedemption as string)
  } else {
    assert.assertNull(bond.latestUserRedemption)
  }
  // assert.arrayEquals(bond.userRedemptions, expected.userRedemptions)
  // assert.arrayEquals(bond.bondDayData, expected.bondDayData)
  // assert.arrayEquals(bond.bondHourData, expected.bondHourData)
}

export function createBondEntity(
  id: string,
  timestamp: BigInt,
  owner: string,
  name: string,
  token0: string,
  token1: string,
  treasury: string,
  principleToken: string,
  payoutToken: string,
  fees: BigDecimal,
  type: string
): Bond {
  let bond = new Bond(id)
  bond.createdAtTimestamp = timestamp
  bond.owner = Address.fromString(owner)
  bond.name = name
  bond.token0 = Address.fromString(token0)
  bond.token1 = Address.fromString(token1)
  bond.treasury = Address.fromString(treasury)
  bond.principleToken = Address.fromString(principleToken)
  bond.payoutToken = Address.fromString(payoutToken)
  bond.fees = fees
  bond.type = type
  return bond
}

// ================================================================
// BondDayData and BondHourData helpers
// ================================================================
export function createBondDayDataEntity(
  id: string,
  timestamp: BigInt,
  bond: string,
  userBondCount: BigInt,
  userRedemptionCount: BigInt,
  principalVolume: BigDecimal,
  principalVolumeUSD: BigDecimal,
  payoutVolume: BigDecimal,
  payoutVolumeUSD: BigDecimal,
  redemptionVolume: BigDecimal,
  redemptionVolumeUSD: BigDecimal,
  bondPriceOpen: BigDecimal,
  bondPriceHigh: BigDecimal,
  bondPriceLow: BigDecimal,
  bondPriceClose: BigDecimal,
  bondPriceUSDOpen: BigDecimal,
  bondPriceUSDHigh: BigDecimal,
  bondPriceUSDLow: BigDecimal,
  bondPriceUSDClose: BigDecimal,
): BondDayData {
  let bondDayData = new BondDayData(id)
  bondDayData.timestamp = timestamp
  bondDayData.bond = bond
  bondDayData.userBondCount = userBondCount
  bondDayData.userRedemptionCount = userRedemptionCount
  bondDayData.principalVolume = principalVolume
  bondDayData.principalVolumeUSD = principalVolumeUSD
  bondDayData.payoutVolume = payoutVolume
  bondDayData.payoutVolumeUSD = payoutVolumeUSD
  bondDayData.redemptionVolume = redemptionVolume
  bondDayData.redemptionVolumeUSD = redemptionVolumeUSD
  bondDayData.bondPriceOpen = bondPriceOpen
  bondDayData.bondPriceHigh = bondPriceHigh
  bondDayData.bondPriceLow = bondPriceLow
  bondDayData.bondPriceClose = bondPriceClose
  bondDayData.bondPriceUSDOpen = bondPriceUSDOpen
  bondDayData.bondPriceUSDHigh = bondPriceUSDHigh
  bondDayData.bondPriceUSDLow = bondPriceUSDLow
  bondDayData.bondPriceUSDClose = bondPriceUSDClose
  return bondDayData
}

export function assertBondDayDataEquals(expected: BondDayData, bondDayData: BondDayData): void {
  assert.stringEquals(expected.id, bondDayData.id)
  assert.bigIntEquals(expected.timestamp, bondDayData.timestamp)
  assert.stringEquals(expected.bond, bondDayData.bond)
  assert.bigIntEquals(expected.userBondCount, bondDayData.userBondCount)
  assert.bigIntEquals(expected.userRedemptionCount, bondDayData.userRedemptionCount)

  assert.stringEquals(expected.principalVolume.toString(), bondDayData.principalVolume.toString())
  assert.stringEquals(expected.principalVolumeUSD.toString(), bondDayData.principalVolumeUSD.toString())
  assert.stringEquals(expected.payoutVolume.toString(), bondDayData.payoutVolume.toString())
  assert.stringEquals(expected.payoutVolumeUSD.toString(), bondDayData.payoutVolumeUSD.toString())
  assert.stringEquals(expected.redemptionVolume.toString(), bondDayData.redemptionVolume.toString())
  assert.stringEquals(expected.redemptionVolumeUSD.toString(), bondDayData.redemptionVolumeUSD.toString())

  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceOpen', expected.bondPriceOpen.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceHigh', expected.bondPriceHigh.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceLow', expected.bondPriceLow.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceClose', expected.bondPriceClose.toString())

  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceUSDOpen', expected.bondPriceUSDOpen.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceUSDHigh', expected.bondPriceUSDHigh.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceUSDLow', expected.bondPriceUSDLow.toString())
  assert.fieldEquals('BondDayData', bondDayData.id, 'bondPriceUSDClose', expected.bondPriceUSDClose.toString())
}

export function createBondHourDataEntity(
  id: string,
  timestamp: BigInt,
  bond: string,
  userBondCount: BigInt,
  userRedemptionCount: BigInt,
  principalVolume: BigDecimal,
  principalVolumeUSD: BigDecimal,
  payoutVolume: BigDecimal,
  payoutVolumeUSD: BigDecimal,
  redemptionVolume: BigDecimal,
  redemptionVolumeUSD: BigDecimal,
  bondPriceOpen: BigDecimal,
  bondPriceHigh: BigDecimal,
  bondPriceLow: BigDecimal,
  bondPriceClose: BigDecimal,
  bondPriceUSDOpen: BigDecimal,
  bondPriceUSDHigh: BigDecimal,
  bondPriceUSDLow: BigDecimal,
  bondPriceUSDClose: BigDecimal,
): BondHourData {
  let bondHourData = new BondHourData(id)
  bondHourData.timestamp = timestamp
  bondHourData.bond = bond
  bondHourData.userBondCount = userBondCount
  bondHourData.userRedemptionCount = userRedemptionCount
  bondHourData.principalVolume = principalVolume
  bondHourData.principalVolumeUSD = principalVolumeUSD
  bondHourData.payoutVolume = payoutVolume
  bondHourData.payoutVolumeUSD = payoutVolumeUSD
  bondHourData.redemptionVolume = redemptionVolume
  bondHourData.redemptionVolumeUSD = redemptionVolumeUSD
  bondHourData.bondPriceOpen = bondPriceOpen
  bondHourData.bondPriceHigh = bondPriceHigh
  bondHourData.bondPriceLow = bondPriceLow
  bondHourData.bondPriceClose = bondPriceClose
  bondHourData.bondPriceUSDOpen = bondPriceUSDOpen
  bondHourData.bondPriceUSDHigh = bondPriceUSDHigh
  bondHourData.bondPriceUSDLow = bondPriceUSDLow
  bondHourData.bondPriceUSDClose = bondPriceUSDClose
  return bondHourData
}

export function assertBondHourDataEquals(expected: BondHourData, bondHourData: BondHourData): void {
  assert.stringEquals(expected.id, bondHourData.id)
  assert.bigIntEquals(expected.timestamp, bondHourData.timestamp)
  assert.stringEquals(expected.bond, bondHourData.bond)
  assert.bigIntEquals(expected.userBondCount, bondHourData.userBondCount)
  assert.bigIntEquals(expected.userRedemptionCount, bondHourData.userRedemptionCount)

  assert.stringEquals(expected.principalVolume.toString(), bondHourData.principalVolume.toString())
  assert.stringEquals(expected.principalVolumeUSD.toString(), bondHourData.principalVolumeUSD.toString())
  assert.stringEquals(expected.payoutVolume.toString(), bondHourData.payoutVolume.toString())
  assert.stringEquals(expected.payoutVolumeUSD.toString(), bondHourData.payoutVolumeUSD.toString())
  assert.stringEquals(expected.redemptionVolume.toString(), bondHourData.redemptionVolume.toString())
  assert.stringEquals(expected.redemptionVolumeUSD.toString(), bondHourData.redemptionVolumeUSD.toString())

  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceOpen', expected.bondPriceOpen.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceHigh', expected.bondPriceHigh.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceLow', expected.bondPriceLow.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceClose', expected.bondPriceClose.toString())

  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceUSDOpen', expected.bondPriceUSDOpen.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceUSDHigh', expected.bondPriceUSDHigh.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceUSDLow', expected.bondPriceUSDLow.toString())
  assert.fieldEquals('BondHourData', bondHourData.id, 'bondPriceUSDClose', expected.bondPriceUSDClose.toString())
}

// ================================================================
// UserBond and UserRedemptions helpers
// ================================================================
export function createUserBondEntity(
  id: string,
  timestamp: BigInt,
  bond: string,
  user: string,
  deposit: BigDecimal,
  depositUSD: BigDecimal,
  payout: BigDecimal,
  payoutUSD: BigDecimal,
  expires: BigInt,
  discount: BigDecimal,
): UserBond {
  let userBond = new UserBond(id)
  userBond.id = id
  userBond.timestamp = timestamp
  userBond.bond = bond
  userBond.user = Bytes.fromByteArray(Bytes.fromHexString(user))
  userBond.deposit = deposit
  userBond.depositUSD = depositUSD
  userBond.payout = payout
  userBond.payoutUSD = payoutUSD
  userBond.expires = expires
  userBond.discount = discount
  return userBond
}

export function assertUserBondEquals(expected: UserBond, userBond: UserBond): void {
  assert.stringEquals(expected.id, userBond.id)
  assert.bigIntEquals(expected.timestamp, userBond.timestamp)
  assert.stringEquals(expected.bond, userBond.bond)
  assert.bytesEquals(expected.user, userBond.user)
  assert.stringEquals(expected.deposit.toString(), userBond.deposit.toString())
  assert.stringEquals(expected.depositUSD.toString(), userBond.depositUSD.toString())
  assert.stringEquals(expected.payout.toString(), userBond.payout.toString())
  assert.stringEquals(expected.payoutUSD.toString(), userBond.payoutUSD.toString())
  assert.bigIntEquals(expected.expires, userBond.expires)
  assert.stringEquals(expected.discount.toString(), userBond.discount.toString())
}

export function createUserRedemptionEntity(
  id: string,
  timestamp: BigInt,
  bond: string,
  user: string,
  recipient: string,
  payout: BigDecimal,
  payoutUSD: BigDecimal,
  remaining: BigDecimal,
  remainingUSD: BigDecimal,
): UserRedemption {
  let userRedemption = new UserRedemption(id)
  userRedemption.id = id
  userRedemption.timestamp = timestamp
  userRedemption.bond = bond
  userRedemption.user = Bytes.fromByteArray(Bytes.fromHexString(user))
  userRedemption.recipient = Bytes.fromByteArray(Bytes.fromHexString(recipient))
  userRedemption.payout = payout
  userRedemption.payoutUSD = payoutUSD
  userRedemption.remaining = remaining
  userRedemption.remainingUSD = remainingUSD
  return userRedemption
}

export function assertUserRedemptionEquals(expected: UserRedemption, userRedemption: UserRedemption): void {
  assert.fieldEquals('UserRedemption', userRedemption.id, 'id', expected.id)
  assert.fieldEquals('UserRedemption', userRedemption.id, 'timestamp', expected.timestamp.toString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'bond', expected.bond)
  assert.fieldEquals('UserRedemption', userRedemption.id, 'user', expected.user.toHexString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'recipient', expected.recipient.toHexString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'payout', expected.payout.toString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'payoutUSD', expected.payoutUSD.toString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'remaining', expected.remaining.toString())
  assert.fieldEquals('UserRedemption', userRedemption.id, 'remainingUSD', expected.remainingUSD.toString())
}