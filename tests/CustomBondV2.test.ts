import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { 
  assertBondDayDataEquals,
  assertBondHourDataEquals,
  assertUserBondEquals,
  createBondDayDataEntity,
  createBondHourDataEntity,
  createUserBondEntity,
  mockERC20_decimals,
  mockUniV2LPCalls, 
  mockSorbetLPCalls, 
  mockUniswapV2Router_getAmountsOut,
  mockUniV2LP_getReserves,
  createUserRedemptionEntity,
  assertUserRedemptionEquals
} from './Utils'
import {
  bond_cvxmusd3CRV, bond_FRAX_WETH, bond_GEL_ETH, bond_RUNE, bond_STRM_WETH, bond_TOKE,
} from './Constants'
import { 
  BondCreated, 
  BondRedeemed 
} from '../generated/templates/CustomBondV2/CustomBondV2'
import { Bond, BondDayData, BondHourData, UserBond, UserRedemption } from '../generated/schema'
import { 
  BIGDECIMAL_ZERO, 
  BIGINT_ONE, 
  BIGINT_ZERO, 
  NATIVE_TOKEN_ADDRESS, 
  NATIVE_TOKEN_DECIMALS, 
  ROUTERS, 
  STABLE_TOKEN_ADDRESS, 
  STABLE_TOKEN_DECIMALS 
} from '../src/utils/Constants'
import { handleBondCreated, handleBondRedeemed } from '../src/CustomBondV2'

// ================================================================
// Useful constants
// ================================================================
const BOND_ENTITY_TYPE = 'Bond'
const BONDDAYDATA_ENTITY_TYPE = 'BondDayData'
const BONDHOURDATA_ENTITY_TYPE = 'BondHourData'
const USERBOND_ENTITY_TYPE = 'UserBond'
const USERREDEMPTION_ENTITY_TYPE = 'UserRedemption'

// ================================================================
// Utility
// ================================================================
function createBondCreatedEvent(
  bond: string,
  sender: string,
  deposit: BigInt,
  payout: BigInt,
  expires: BigInt
): BondCreated {
  let newBondCreatedEvent: BondCreated = changetype<BondCreated>(newMockEvent())
  newBondCreatedEvent.address = Address.fromString(bond)
  newBondCreatedEvent.transaction.from = Address.fromString(sender)

  // Push params
  newBondCreatedEvent.parameters = new Array()
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('deposit', ethereum.Value.fromUnsignedBigInt(deposit)))
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('payout', ethereum.Value.fromUnsignedBigInt(payout)))
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('expires', ethereum.Value.fromUnsignedBigInt(expires)))

  return newBondCreatedEvent
}

function createBondRedeemedEvent(
  bond: string,
  sender: string,
  recipient: string,
  payout: BigInt,
  remaining: BigInt
): BondRedeemed {
  let newBondRedeemedEvent: BondRedeemed = changetype<BondRedeemed>(newMockEvent())
  newBondRedeemedEvent.address = Address.fromString(bond)
  newBondRedeemedEvent.transaction.from = Address.fromString(sender)

  // Push params
  newBondRedeemedEvent.parameters = new Array()
  newBondRedeemedEvent.parameters.push(new ethereum.EventParam('recipient', ethereum.Value.fromAddress(Address.fromString(recipient))))
  newBondRedeemedEvent.parameters.push(new ethereum.EventParam('payout', ethereum.Value.fromSignedBigInt(payout)))
  newBondRedeemedEvent.parameters.push(new ethereum.EventParam('remaining', ethereum.Value.fromSignedBigInt(remaining)))

  return newBondRedeemedEvent
}

// ================================================================
// Unit tests
// ================================================================
test('Test BondCreated handler with ERC20 bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_RUNE
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('1236115423200000000000'),
    BigInt.fromString('14987777168568863370946'),
    BigInt.fromString('14300719')
  )
  event.block.timestamp = BigInt.fromU64(1641049813) // 2022-01-01T15:10:13
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principalToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principalToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')], // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.principalToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('1369000000000000')],  // 1 RUNE = 0.001369 ETH
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('126000000000000')], // 1 THOR = 0.000126 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8-1',
    BigInt.fromU64(1641049813),
    '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('1236.1154232'),
    BigDecimal.fromString('5076.7260430824'),
    BigDecimal.fromString('14987.777168568863370946'),
    BigDecimal.fromString('5665.379769719030354217588'),
    BigInt.fromString('14300719'),
    BigDecimal.fromString('10.39036658730159814888143659999119'),
  )
  let userBond = <UserBond>UserBond.load('0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e-1640995200',
    BigInt.fromU64(1640995200),
    '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('1236.1154232'),
    BigDecimal.fromString('5076.7260430824'),
    BigDecimal.fromString('14987.777168568863370946'),
    BigDecimal.fromString('5665.379769719030354217588'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e-1641049200',
    BigInt.fromU64(1641049200),
    '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('1236.1154232'),
    BigDecimal.fromString('5076.7260430824'),
    BigDecimal.fromString('14987.777168568863370946'),
    BigDecimal.fromString('5665.379769719030354217588'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.08247489999999999001636916719065821'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
    BigDecimal.fromString('0.3387244142999999589972281696520333'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler Tokemak token (tALCX), no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_TOKE
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('272674618580983884936'),
    BigInt.fromString('67530854425807359939'),
    BigInt.fromString('14293348')
  )
  event.block.timestamp = BigInt.fromU64(1641049813) // 2022-01-01T15:10:13
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principalToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals('0xdbdb4d16eda451d0503b854cf79d55697f90c8df', 18)
  createMockedFunction(Address.fromString(bond.principalToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0xdbdb4d16eda451d0503b854cf79d55697f90c8df'))])
  
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')], // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.principalToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('11500000000000000')],  // 1 TOKE = 0.0115 ETH
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('11500000000000000')],  // 1 TOKE = 0.0115 ETH
    true
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    ['0xdbdb4d16eda451d0503b854cf79d55697f90c8df', NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('51000000000000000')], // 1 ALCX = 0.051 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8-1',
    BigInt.fromU64(1641049813),
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('272.674618580983884936'),
    BigDecimal.fromString('9407.274341043944030292'),
    BigDecimal.fromString('67.530854425807359939'),
    BigDecimal.fromString('10332.220727148526070667'),
    BigInt.fromString('14293348'),
    BigDecimal.fromString('8.95205794117648160916159484630794'),
  )
  let userBond = <UserBond>UserBond.load('0x65d085a9f690a6361e794c2eb872c152e3d9d84d523af02b276c4df6089f57c8-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec-1640995200',
    BigInt.fromU64(1640995200),
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('272.674618580983884936'),
    BigDecimal.fromString('9407.274341043944030292'),
    BigDecimal.fromString('67.530854425807359939'),
    BigDecimal.fromString('10332.220727148526070667'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec-1641049200',
    BigInt.fromU64(1641049200),
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('272.674618580983884936'),
    BigDecimal.fromString('9407.274341043944030292'),
    BigDecimal.fromString('67.530854425807359939'),
    BigDecimal.fromString('10332.220727148526070667'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('4.037778299999999511245877098120257'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
    BigDecimal.fromString('139.3033513499999831379827598851489'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler with LP bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_STRM_WETH
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('136833043723783405314'),
    BigInt.fromString('34417428607650049158065'),
    BigInt.fromString('14302762')
  )
  event.block.timestamp = BigInt.fromU64(1641049812) // 2022-01-01T15:10:12
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principalToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals((<Bytes>bond.token1).toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principalToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LPCalls(
    bond.principalToken.toHexString(),
    bond.token0.toHexString(),
    (<Bytes>bond.token1).toHexString(),
    18,
    BigInt.fromString('34770094856840480085461'),
    BigInt.fromString('3811589720283000748091169'),
    BigInt.fromString('322956475222346021625'),
    BigInt.fromString('1645542291'),
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')], // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.token0.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('84000000000000')], // 1 STRM = 0.000084 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283-1',
    BigInt.fromU64(1641049812),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigInt.fromString('14302762'),
    BigDecimal.fromString('12.45604112126439095126119730520878'),
  )
  let userBond = <UserBond>UserBond.load('0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0xdcfd008628be285400cee4d869e712f5f72d67cc-1640995200',
    BigInt.fromU64(1640995200),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xdcfd008628be285400cee4d869e712f5f72d67cc-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xdcfd008628be285400cee4d869e712f5f72d67cc-1641049200',
    BigInt.fromU64(1641049200),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xdcfd008628be285400cee4d869e712f5f72d67cc-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler with Sorbet LP bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_GEL_ETH
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('136833043723783405314'),
    BigInt.fromString('34417428607650049158065'),
    BigInt.fromString('14302762')
  )
  event.block.timestamp = BigInt.fromU64(1641049812) // 2022-01-01T15:10:12
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principalToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals((<Bytes>bond.token1).toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principalToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LP_getReserves(bond.principalToken.toHexString(), BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO, true)
  mockSorbetLPCalls(
    bond.principalToken.toHexString(),
    bond.token0.toHexString(),
    (<Bytes>bond.token1).toHexString(),
    18,
    BigInt.fromString('34770094856840480085461'),
    BigInt.fromString('3811589720283000748091169'),
    BigInt.fromString('322956475222346021625'),
    BigInt.fromString('1645542291'),
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')], // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.token0.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('84000000000000')], // 1 GEL = 0.000084 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283-1',
    BigInt.fromU64(1641049812),
    '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigInt.fromString('14302762'),
    BigDecimal.fromString('12.45604112126439095126119730520878'),
  )
  let userBond = <UserBond>UserBond.load('0x51d9ca4a200f422989cdec28c12bb95d664bab68a969f5ad176df23677c14283-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c-1640995200',
    BigInt.fromU64(1640995200),
    '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c-1641049200',
    BigInt.fromU64(1641049200),
    '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondRedemption handler with LP bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_STRM_WETH
  bond.save()

  let purchase = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('136833043723783405314'),
    BigInt.fromString('34417428607650049158065'),
    BigInt.fromString('14302762')
  )
  purchase.block.timestamp = BigInt.fromU64(1640908800) // 2022-01-01T15:10:12
  purchase.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principalToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals((<Bytes>bond.token1).toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principalToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LPCalls(
    bond.principalToken.toHexString(),
    bond.token0.toHexString(),
    (<Bytes>bond.token1).toHexString(),
    18,
    BigInt.fromString('34770094856840480085461'),
    BigInt.fromString('3811589720283000748091169'),
    BigInt.fromString('322956475222346021625'),
    BigInt.fromString('1645542291'),
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')], // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.token0.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('84000000000000')], // 1 STRM = 0.000084 ETH
    false
  )

  handleBondCreated(purchase)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1640908800),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('136.833043723783405314'),
    BigDecimal.fromString('7592.855645944634868498603572865909'),
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigInt.fromString('14302762'),
    BigDecimal.fromString('12.45604112126439095126119730520878'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let redemption = createBondRedeemedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('34417428607650049158065'),
    BigInt.fromString('0'),
  )
  redemption.block.timestamp = BigInt.fromU64(1641049818) // 2022-01-01T15:10:18
  redemption.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  handleBondRedeemed(redemption)

  let expectedUserRedemption = createUserRedemptionEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049818),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigDecimal.fromString('0.0'),
    BigDecimal.fromString('0.0'),
  )
  let userRedemption = <UserRedemption>UserRedemption.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserRedemptionEquals(expectedUserRedemption, userRedemption)

  let expectedBondDayData = createBondDayDataEntity(
    '0xdcfd008628be285400cee4d869e712f5f72d67cc-1640995200',
    BigInt.fromU64(1640995200),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    BIGINT_ZERO,
    BIGINT_ONE,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xdcfd008628be285400cee4d869e712f5f72d67cc-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xdcfd008628be285400cee4d869e712f5f72d67cc-1641049200',
    BigInt.fromU64(1641049200),
    '0xdcfd008628be285400cee4d869e712f5f72d67cc',
    BIGINT_ZERO,
    BIGINT_ONE,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('34417.428607650049158065'),
    BigDecimal.fromString('8673.19200912781238783238'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.003975690493431260509740671362197776'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
    BigDecimal.fromString('0.2206107763744137348028217827908739'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xdcfd008628be285400cee4d869e712f5f72d67cc-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})