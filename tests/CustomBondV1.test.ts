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
  mockUniswapV2Router_getAmountsOut,
  createUserRedemptionEntity,
  assertUserRedemptionEquals,
  mockUniV2LP_getReserves,
  mockSorbetLP_getUnderlyingBalances,
  mockUniV2LP_token0,
  mockUniV2LP_token1,
  mockUniV2LP_decimals,
  mockUniV2LP_totalSupply,
  mockVisorLP_getTotalAmounts
} from './Utils'
import {
  bond_cvxmusd3CRV, bond_FRAX_WETH, bond_vFLOAT_ETH,
} from './Constants'
import { 
  BondCreated, 
  BondRedeemed 
} from '../generated/templates/CustomBondV1/CustomBondV1'
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
import { handleBondCreated, handleBondRedeemed } from '../src/CustomBondV1'

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
  let bond = bond_cvxmusd3CRV
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('5500000000000000000000'),
    BigInt.fromString('8793006394434123940427'),
    BigInt.fromString('13989758')
  )
  event.block.timestamp = BigInt.fromU64(1641049813) // 2022-01-01T15:10:13
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principleToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principleToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()

  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.principleToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [],
    true
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
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('200000000000000')], // 1 MTA = 0.0002 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049813),
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('8793.006394434123940427'),
    BigDecimal.fromString('5275.8038366604743642562'),
    BigInt.fromI64(13989758),
    BigDecimal.fromString('-4.2495166666666540472122313946776'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5-1640995200',
    BigInt.fromU64(1640995200),
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('8793.006394434123940427'),
    BigDecimal.fromString('5275.8038366604743642562'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5-1641049200',
    BigInt.fromU64(1641049200),
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('5500.0'),
    BigDecimal.fromString('8793.006394434123940427'),
    BigDecimal.fromString('5275.8038366604743642562'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
    BigDecimal.fromString('0.6254970999999999242832733883680653'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler with LP bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_FRAX_WETH
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('20000000000000000000'),
    BigInt.fromString('82026514250466330662'),
    BigInt.fromString('14035381')
  )
  event.block.timestamp = BigInt.fromU64(1641049812) // 2022-01-01T15:10:12
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principleToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals(bond.token1.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principleToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LPCalls(
    '0xeC8C342bc3E07F05B9a782bc34e7f04fB9B44502',
    '0x853d955acef822db058eb8505911ed77f175b99e',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    18,
    BigInt.fromString('47713220179037740672178'),
    BigInt.fromString('2722104478852355060737355'),
    BigInt.fromString('1046707455617311667523'),
    BigInt.fromString('1641049813'),
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')],      // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.token0.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('386000000000000')], // 1 FRAX = 0.000386 ETH
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('7169000000000000')], // 1 FXS = 0.007169 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049812),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('2637.558030982541369020671283226122'),
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigInt.fromString('14035381'),
    BigDecimal.fromString('-49.5092049851384888415128460010478'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200',
    BigInt.fromU64(1640995200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('2637.558030982541369020671283226122'),
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200',
    BigInt.fromU64(1641049200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('2637.558030982541369020671283226122'),
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler with Visor LP bond special case, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_vFLOAT_ETH
  bond.save()

  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('3355015930460747264'),
    BigInt.fromString('6906167003830275154645'),
    BigInt.fromString('14035381')
  )
  event.block.timestamp = BigInt.fromU64(1641049812) // 2022-01-01T15:10:12
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principleToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals(bond.token1.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principleToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  
  mockUniV2LP_getReserves(bond.principleToken.toHexString(), BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO, true)
  mockSorbetLP_getUnderlyingBalances(bond.principleToken.toHexString(), BIGINT_ZERO, BIGINT_ZERO, true)
  mockVisorLP_getTotalAmounts(
    bond.principleToken.toHexString(),
    BigInt.fromString('77649501981662641700186'),
    BigInt.fromString('93964363188639278404'),
    false
  )
  mockUniV2LP_token0(bond.principleToken.toHexString(), bond.token0.toHexString(), false)
  mockUniV2LP_token1(bond.principleToken.toHexString(), bond.token1.toHexString(), false)
  mockUniV2LP_decimals(bond.principleToken.toHexString(), 18, false)
  mockUniV2LP_totalSupply(bond.principleToken.toHexString(), BigInt.fromString('115180416638624466554'), false)
  
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [NATIVE_TOKEN_ADDRESS, STABLE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('3000000000')],      // 1 ETH = 3000 USDT
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.token0.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('586000000000000')], // 1 FLOAT = 0.000586 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049812),
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('3.355015930460747264'),
    BigDecimal.fromString('12187.32986841174283836251565247678'),
    BigDecimal.fromString('6906.167003830275154645'),
    BigDecimal.fromString('12141.04159273362372186591'),
    BigInt.fromString('14035381'),
    BigDecimal.fromString('-0.3812545680250573228155401026549'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc-1640995200',
    BigInt.fromU64(1640995200),
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('3.355015930460747264'),
    BigDecimal.fromString('12187.32986841174283836251565247678'),
    BigDecimal.fromString('6906.167003830275154645'),
    BigDecimal.fromString('12141.04159273362372186591'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc-1641049200',
    BigInt.fromU64(1641049200),
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('3.355015930460747264'),
    BigDecimal.fromString('12187.32986841174283836251565247678'),
    BigDecimal.fromString('6906.167003830275154645'),
    BigDecimal.fromString('12141.04159273362372186591'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('0.0004857999999999999411936402964545367'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
    BigDecimal.fromString('1.764702455305880507735097195004673'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondCreated handler with LP bond, existing BondDayData, existing BondHourData', () => {
  // Initialize
  let bond = bond_FRAX_WETH
  bond.save()

  let initialBondDayData = createBondDayDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200',
    BigInt.fromU64(1640995200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('10.0'),
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('100.0'),
    BigDecimal.fromString('200.0'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
  )
  initialBondDayData.save()

  let initialBondHourData = createBondHourDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200',
    BigInt.fromU64(1641049200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ONE,
    BIGINT_ZERO,
    BigDecimal.fromString('10.0'),
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('100.0'),
    BigDecimal.fromString('200.0'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('0.2'),
  )
  initialBondHourData.save()

  // Mock event
  let event = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('20000000000000000000'),
    BigInt.fromString('82026514250466330662'),
    BigInt.fromString('14035381')
  )
  event.block.timestamp = BigInt.fromU64(1641049812) // 2022-01-01T15:10:12
  event.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.principleToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals(bond.token1.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principleToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LPCalls(
    bond.principleToken.toHexString(),
    bond.token0.toHexString(),
    bond.token1.toHexString(),
    18,
    BigInt.fromString('47713220179037740672178'),
    BigInt.fromString('2722104478852355060737355'),
    BigInt.fromString('1046707455617311667523'),
    BigInt.fromString('1641049813'),
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
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('386000000000000')], // 1 FRAX = 0.000386 ETH
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('7169000000000000')], // 1 FXS = 0.007169 ETH
    false
  )

  handleBondCreated(event)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049812),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('2637.558030982541369020671283226122'),
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigInt.fromString('14035381'),
    BigDecimal.fromString('-49.5092049851384888415128460010478'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let expectedBondDayData = createBondDayDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200',
    BigInt.fromU64(1640995200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BigInt.fromString('2'),
    BIGINT_ZERO,
    BigDecimal.fromString('30.0'),
    BigDecimal.fromString('2657.558030982541369020671283226122'),
    BigDecimal.fromString('182.026514250466330662'),
    BigDecimal.fromString('1964.144241984779373547634'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200',
    BigInt.fromU64(1641049200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BigInt.fromString('2'),
    BIGINT_ZERO,
    BigDecimal.fromString('30.0'),
    BigDecimal.fromString('2657.558030982541369020671283226122'),
    BigDecimal.fromString('182.026514250466330662'),
    BigDecimal.fromString('1964.144241984779373547634'),
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.1'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('0.2'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})

test('Test BondRedemption handler with LP bond, no BondDayData, no BondHourData', () => {
  // Initialize
  let bond = bond_FRAX_WETH
  bond.save()

  let purchase = createBondCreatedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('20000000000000000000'),
    BigInt.fromString('82026514250466330662'),
    BigInt.fromString('14035381')
  )
  purchase.block.timestamp = BigInt.fromU64(1640908800) // 2022-01-01T15:10:12
  purchase.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  // Mock contract function calls
  mockERC20_decimals(bond.principleToken.toHexString(), 18)
  mockERC20_decimals(bond.payoutToken.toHexString(), 18)
  mockERC20_decimals(bond.token0.toHexString(), 18)
  mockERC20_decimals(bond.token1.toHexString(), 18)
  createMockedFunction(Address.fromString(bond.principleToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  createMockedFunction(Address.fromString(bond.payoutToken.toHexString()), 'underlyer', 'underlyer():(address)').reverts()
  mockUniV2LPCalls(
    bond.principleToken.toHexString(),
    bond.token0.toHexString(),
    bond.token1.toHexString(),
    18,
    BigInt.fromString('47713220179037740672178'),
    BigInt.fromString('2722104478852355060737355'),
    BigInt.fromString('1046707455617311667523'),
    BigInt.fromString('1641049813'),
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
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('386000000000000')], // 1 FRAX = 0.000386 ETH
    false
  )
  mockUniswapV2Router_getAmountsOut(
    ROUTERS[0],
    BigInt.fromString('1000000000000000000'),
    [bond.payoutToken.toHexString(), NATIVE_TOKEN_ADDRESS],
    [BigInt.fromString('1000000000000000000'), BigInt.fromString('7169000000000000')], // 1 FXS = 0.007169 ETH
    false
  )

  handleBondCreated(purchase)
  
  let expectedUserBond = createUserBondEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1640908800),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('2637.558030982541369020671283226122'),
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigInt.fromString('14035381'),
    BigDecimal.fromString('-49.5092049851384888415128460010478'),
  )
  let userBond = <UserBond>UserBond.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserBondEquals(expectedUserBond, userBond)

  let redemption = createBondRedeemedEvent(
    bond.id,
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigInt.fromString('82026514250466330662'),
    BigInt.fromString('20000000000000000000'),
  )
  redemption.block.timestamp = BigInt.fromU64(1641049818) // 2022-01-01T15:10:18
  redemption.transaction.hash = Bytes.fromByteArray(Bytes.fromHexString('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770'))  

  handleBondRedeemed(redemption)

  let expectedUserRedemption = createUserRedemptionEntity(
    '0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1',
    BigInt.fromU64(1641049818),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigDecimal.fromString('20.0'),
    BigDecimal.fromString('430.14'),
  )
  let userRedemption = <UserRedemption>UserRedemption.load('0xe4773bdd2e478c01e7b39bb3e2f731c863bee235be6bbbd9a0f5071da9f45770-1')
  assertUserRedemptionEquals(expectedUserRedemption, userRedemption)

  let expectedBondDayData = createBondDayDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200',
    BigInt.fromU64(1640995200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ZERO,
    BIGINT_ONE,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondDayData = <BondDayData>BondDayData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1640995200')
  assertBondDayDataEquals(expectedBondDayData, bondDayData)

  let expectedBondHourData = createBondHourDataEntity(
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200',
    BigInt.fromU64(1641049200),
    '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
    BIGINT_ZERO,
    BIGINT_ONE,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BIGDECIMAL_ZERO,
    BigDecimal.fromString('82.026514250466330662'),
    BigDecimal.fromString('1764.144241984779373547634'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('0.2438235999999999704876009261086276'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
    BigDecimal.fromString('32.15494471615373479514416778944535'),
  )
  let bondHourData = <BondHourData>BondHourData.load('0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a-1641049200')
  assertBondHourDataEquals(expectedBondHourData, bondHourData)

  clearStore()
})