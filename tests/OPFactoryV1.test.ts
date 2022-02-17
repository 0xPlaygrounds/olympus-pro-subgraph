import { Address, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { handleCreateBond, handleCreateBondAndTreasury } from '../src/OPFactoryV1'
import { CreateBondAndTreasuryCall, CreateBondCall } from '../generated/OlympusProFactoryV1/OlympusProFactoryV1'
import { 
  mockERC20_symbol, 
  mockLPCalls 
} from './utils'

// ================================================================
// Useful constants
// ================================================================
const BOND_ENTITY_TYPE = 'Bond'

// ================================================================
// Utility
// ================================================================
function handleCreateBonds(calls: CreateBondCall[]): void {
  calls.forEach(call => {
    handleCreateBond(call)
  })
}

function handleCreateBondAndTreasurys(calls: CreateBondAndTreasuryCall[]): void {
  calls.forEach(call => {
    handleCreateBondAndTreasury(call)
  })
}

function createCreateBondCall(
  input_payoutToken: string,
  input_principleToken: string,
  input_customTreasury: string,
  input_initialOwner: string,
  input_tierCeilings: Array<BigInt>,
  input_fees: Array<BigInt>,
  output_treasury: string,
  output_bond: string
): CreateBondCall {
  let newCreateBondCall: CreateBondCall = changetype<CreateBondCall>(newMockCall())
  
  // Push input values
  newCreateBondCall.inputValues = new Array()
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_payoutToken', ethereum.Value.fromAddress(Address.fromString(input_payoutToken))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_principleToken', ethereum.Value.fromAddress(Address.fromString(input_principleToken))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_customTreasury', ethereum.Value.fromAddress(Address.fromString(input_customTreasury))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_initialOwner', ethereum.Value.fromAddress(Address.fromString(input_initialOwner))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_tierCeilings', ethereum.Value.fromSignedBigIntArray(input_tierCeilings)))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_fees', ethereum.Value.fromSignedBigIntArray(input_fees)))

  // Push output values
  newCreateBondCall.outputValues = new Array()
  newCreateBondCall.outputValues.push(new ethereum.EventParam('_treasury', ethereum.Value.fromAddress(Address.fromString(output_treasury))))
  newCreateBondCall.outputValues.push(new ethereum.EventParam('_bond', ethereum.Value.fromAddress(Address.fromString(output_bond))))

  return newCreateBondCall
}

function createCreateBondAndTreasuryCall(
  input_payoutToken: string,
  input_principleToken: string,
  input_initialOwner: string,
  input_tierCeilings: Array<BigInt>,
  input_fees: Array<BigInt>,
  output_treasury: string,
  output_bond: string
): CreateBondAndTreasuryCall {
  let newCreateBondAndTreasuryCall: CreateBondAndTreasuryCall = changetype<CreateBondAndTreasuryCall>(newMockCall())

  // Push input values
  newCreateBondAndTreasuryCall.inputValues = new Array()
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_payoutToken', ethereum.Value.fromAddress(Address.fromString(input_payoutToken))))
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_principleToken', ethereum.Value.fromAddress(Address.fromString(input_principleToken))))
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_initialOwner', ethereum.Value.fromAddress(Address.fromString(input_initialOwner))))
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_tierCeilings', ethereum.Value.fromSignedBigIntArray(input_tierCeilings)))
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_fees', ethereum.Value.fromSignedBigIntArray(input_fees)))

  // Push output values
  newCreateBondAndTreasuryCall.outputValues = new Array()
  newCreateBondAndTreasuryCall.outputValues.push(new ethereum.EventParam('_treasury', ethereum.Value.fromAddress(Address.fromString(output_treasury))))
  newCreateBondAndTreasuryCall.outputValues.push(new ethereum.EventParam('_bond', ethereum.Value.fromAddress(Address.fromString(output_bond))))

  return newCreateBondAndTreasuryCall
}

// ================================================================
// Unit tests
// ================================================================
test('Test CreateBondAndTreasuryCall handler with ERC20 bond', () => {
  // Using bond 0x1c3d0e336e2bbfd209c81fa3700cf6d46c1ebbd2 as test subject
  let call = createCreateBondAndTreasuryCall(
    '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2',
    '0xd34d466233c5195193df712936049729140dbbd7',
    '0x9a67f1940164d0318612b497e8e6038f902a00a4',
    [BigInt.fromI32(100000)],
    [BigInt.fromI32(33300)],
    '0xa1c44dd91e21685a09ea30f9a9f06b2e40b99cec',
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5'
  )

  // Mock calls
  mockLPCalls('0xd34d466233c5195193df712936049729140dbbd7', '', '', true)
  mockERC20_symbol('0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2', 'MTA')
  mockERC20_symbol('0xd34d466233c5195193df712936049729140dbbd7', 'cvxmusd3CRV')

  handleCreateBondAndTreasurys([call])

  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'id', '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'createdAtTimestamp', '1')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'owner', '0x9a67f1940164d0318612b497e8e6038f902a00a4')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'name', 'cvxmusd3CRV')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'token0', '0xd34d466233c5195193df712936049729140dbbd7')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'token1', '0x0000000000000000000000000000000000000000')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'treasury', '0xa1c44dd91e21685a09ea30f9a9f06b2e40b99cec')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'principleToken', '0xd34d466233c5195193df712936049729140dbbd7')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'payoutToken', '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'fees', '3.33')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'type', 'ERC20')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'userBondCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'latestUserBond', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'userBonds', '[]')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'userRedemptionCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'latestUserRedemption', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'userRedemptions', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'dailyData', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5', 'hourlyData', '[]')
  clearStore()
})

test('Test CreateBondCall handler with LP bond (Visor managed UniV3 LP position)', () => {
  // Using bond 0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc as test subject
  let call = createCreateBondCall(
    '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
    '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153',
    '0x8d0aa0951854b7fd2fb0fcfad99565012f943389',
    '0x383df49ad1f0219759a46399fe33cb7a63cd051c',
    [BigInt.fromI32(100000)],
    [BigInt.fromI32(33300)],
    '0x8d0aa0951854b7fd2fb0fcfad99565012f943389',
    '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc'
  )

  // Mock calls
  mockLPCalls(
    '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153',
    '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    false
  )
  mockERC20_symbol('0xb05097849bca421a3f51b249ba6cca4af4b97cb9', 'FLOAT')
  mockERC20_symbol('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH')

  handleCreateBonds([call])

  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'id', '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'createdAtTimestamp', '1')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'owner', '0x383df49ad1f0219759a46399fe33cb7a63cd051c')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'name', 'FLOAT-WETH')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'token0', '0xb05097849bca421a3f51b249ba6cca4af4b97cb9')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'token1', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'treasury', '0x8d0aa0951854b7fd2fb0fcfad99565012f943389')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'principleToken', '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'payoutToken', '0xb05097849bca421a3f51b249ba6cca4af4b97cb9')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'fees', '3.33')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'type', 'LP')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'userBondCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'latestUserBond', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'userBonds', '[]')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'userRedemptionCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'latestUserRedemption', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'userRedemptions', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'dailyData', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc', 'hourlyData', '[]')
  clearStore()
})

