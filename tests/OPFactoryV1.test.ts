import { Address, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { handleCreateBond, handleCreateBondAndTreasury } from '../src/OPFactoryV1'
import { CreateBondAndTreasuryCall, CreateBondCall } from '../generated/OlympusProFactoryV1/OlympusProFactoryV1'
import { 
  assertBondEquals,
  mockERC20_symbol, 
  mockUniV2LPCalls, 
} from './Utils'
import {
  bond_cvxmusd3CRV,
  bond_vFLOAT_ETH,
  TIMESTAMP_20220101_000000
} from './Constants'
import { Bond } from '../generated/schema'
import { BIGINT_ONE } from '../src/utils/Constants'

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
  let call = createCreateBondAndTreasuryCall(
    '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2',
    '0xd34d466233c5195193df712936049729140dbbd7',
    '0x9a67f1940164d0318612b497e8e6038f902a00a4',
    [BigInt.fromI32(100000)],
    [BigInt.fromI32(33300)],
    '0xa1c44dd91e21685a09ea30f9a9f06b2e40b99cec',
    '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5'
  )
  call.block.timestamp = TIMESTAMP_20220101_000000

  // Mock calls
  mockUniV2LPCalls('0xd34d466233c5195193df712936049729140dbbd7', '', '', 8, BIGINT_ONE, BIGINT_ONE, BIGINT_ONE, BIGINT_ONE, true)
  mockERC20_symbol('0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2', 'MTA')
  mockERC20_symbol('0xd34d466233c5195193df712936049729140dbbd7', 'cvxmusd3CRV')

  handleCreateBondAndTreasury(call)

  let bond = Bond.load('0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5') as Bond
  assertBondEquals(bond, bond_cvxmusd3CRV)
  clearStore()
})

test('Test CreateBondCall handler with LP bond (Visor managed UniV3 LP position)', () => {
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
  call.block.timestamp = TIMESTAMP_20220101_000000

  // Mock calls
  mockUniV2LPCalls(
    '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153',
    '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    8,
    BIGINT_ONE,
    BIGINT_ONE,
    BIGINT_ONE,
    BIGINT_ONE,
    false
  )
  mockERC20_symbol('0xb05097849bca421a3f51b249ba6cca4af4b97cb9', 'FLOAT')
  mockERC20_symbol('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH')

  handleCreateBond(call)

  let bond = Bond.load('0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc') as Bond
  assertBondEquals(bond, bond_vFLOAT_ETH)
  clearStore()
})

