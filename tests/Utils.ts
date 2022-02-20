import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction } from "matchstick-as";
import { Bond } from '../generated/schema';
import { BIGINT_ONE } from '../src/utils/Constants';

// ================================================================
// LP mock call helpers
// ================================================================
export function mockLP_token0(lp: string, token0: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token0))])
  }
}

export function mockLP_token1(lp: string, token1: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token1))])
  }
}

export function mockLPCalls(lp: string, token0: string, token1: string, revert: boolean): void {
  mockLP_token0(lp, token0, revert)
  mockLP_token1(lp, token1, revert)
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

export const TIMESTAMP_20220101_000000: BigInt = BigInt.fromU64(1640995200)

export const bond_cvxmusd3CRV: Bond = createBondEntity(
  '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5',
  TIMESTAMP_20220101_000000,
  '0x9a67f1940164d0318612b497e8e6038f902a00a4',
  'cvxmusd3CRV',
  '0xd34d466233c5195193df712936049729140dbbd7',
  '0x0000000000000000000000000000000000000000',
  '0xa1c44dd91e21685a09ea30f9a9f06b2e40b99cec',
  '0xd34d466233c5195193df712936049729140dbbd7',
  '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2',
  BigDecimal.fromString('3.33'),
  'ERC20'
)

export const bond_PREMIA_WETH: Bond = createBondEntity(
  '0x100d4127e19396b117ff6ad47d2186f76f7fa50a',
  TIMESTAMP_20220101_000000,
  '0xc22fae86443aeed038a4ed887bba8f5035fd12f0',
  'PREMIA-WETH',
  '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xc26ed42e03b32e7b3e0bc3a5b5066f058ea94529',
  '0x93e2f3a8277e0360081547d711446e4a1f83546d',
  '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70',
  BigDecimal.fromString('3.33'),
  'LP'
)

export const bond_vFLOAT_ETH: Bond = createBondEntity(
  '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc',
  TIMESTAMP_20220101_000000,
  '0x383df49ad1f0219759a46399fe33cb7a63cd051c',
  'FLOAT-WETH',
  '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x8d0aa0951854b7fd2fb0fcfad99565012f943389',
  '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153',
  '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
  BigDecimal.fromString('3.33'),
  'LP'
)

export const bond_TOKE: Bond = createBondEntity(
  '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec',
  TIMESTAMP_20220101_000000,
  '0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9',
  'TOKE',
  '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
  '0x0000000000000000000000000000000000000000',
  '0xfe349fb05ee6d5598efc7bb561f7f91934167c7c',
  '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
  '0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84',
  BigDecimal.fromString('3.33'),
  'ERC20'
)

export const bond_STRM_WETH: Bond = createBondEntity(
  '0xdcfd008628be285400cee4d869e712f5f72d67cc',
  TIMESTAMP_20220101_000000,
  '0x4f4f6b428af559db1dbe3cb32e1e3500deffa799',
  'STRM-WETH',
  '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
  '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a',
  '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
  BigDecimal.fromString('3.33'),
  'LP'
)