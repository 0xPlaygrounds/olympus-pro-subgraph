import { Address, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { handleCreateBond, handleCreateBondAndTreasury } from '../src/OPFactoryV2'
import { CreateBondAndTreasuryCall, CreateBondCall } from '../generated/OlympusProFactoryV2/OlympusProFactoryV2'
import { 
  assertBondEquals,
  mockCustomTreasury_payoutToken, 
  mockERC20_symbol, 
  mockUniV2LPCalls, 
} from './Utils'
import {
  bond_STRM_WETH,
  bond_TOKE,
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
  input_principleToken: string,
  input_customTreasury: string,
  input_initialOwner: string,
  input_tierCeilings: Array<BigInt>,
  input_fees: Array<BigInt>,
  input_feeInPayout: boolean,
  output_treasury: string,
  output_bond: string
): CreateBondCall {
  let newCreateBondCall: CreateBondCall = changetype<CreateBondCall>(newMockCall())
  
  // Push input values
  newCreateBondCall.inputValues = new Array()
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_principleToken', ethereum.Value.fromAddress(Address.fromString(input_principleToken))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_customTreasury', ethereum.Value.fromAddress(Address.fromString(input_customTreasury))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_initialOwner', ethereum.Value.fromAddress(Address.fromString(input_initialOwner))))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_tierCeilings', ethereum.Value.fromSignedBigIntArray(input_tierCeilings)))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_fees', ethereum.Value.fromSignedBigIntArray(input_fees)))
  newCreateBondCall.inputValues.push(new ethereum.EventParam('_feeInPayout', ethereum.Value.fromBoolean(input_feeInPayout)))

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
  input_feeInPayout: boolean,
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
  newCreateBondAndTreasuryCall.inputValues.push(new ethereum.EventParam('_feeInPayout', ethereum.Value.fromBoolean(input_feeInPayout)))

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
    '0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84',
    '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
    '0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9',
    [BigInt.fromI32(100000)],
    [BigInt.fromI32(33300)],
    false,
    '0xfe349fb05ee6d5598efc7bb561f7f91934167c7c',
    '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec'
  )
  call.block.timestamp = TIMESTAMP_20220101_000000

  // Mock calls
  mockUniV2LPCalls('0x2e9d63788249371f1dfc918a52f8d799f4a38c94', '', '', 8, BIGINT_ONE, BIGINT_ONE, BIGINT_ONE, BIGINT_ONE, true)
  mockERC20_symbol('0x2e9d63788249371f1dfc918a52f8d799f4a38c94', 'TOKE')
  mockERC20_symbol('0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84', 'tALCX')

  handleCreateBondAndTreasury(call)

  let bond = Bond.load('0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec') as Bond
  assertBondEquals(bond, bond_TOKE)
  clearStore()
})

test('Test CreateBondCall handler with LP bond', () => {
  let call = createCreateBondCall(
    '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a',
    '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
    '0x4f4f6b428af559db1dbe3cb32e1e3500deffa799',
    [BigInt.fromI32(100000)],
    [BigInt.fromI32(33300)],
    false,
    '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
    '0xdcfd008628be285400cee4d869e712f5f72d67cc'
  )
  call.block.timestamp = TIMESTAMP_20220101_000000

  // Mock calls
  mockCustomTreasury_payoutToken(
    '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
    '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
    false
  )
  mockUniV2LPCalls(
    '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a',
    '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    8,
    BIGINT_ONE,
    BIGINT_ONE,
    BIGINT_ONE,
    BIGINT_ONE,
    false
  )
  mockERC20_symbol('0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8', 'STRM')
  mockERC20_symbol('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH')

  handleCreateBond(call)

  let bond = Bond.load('0xdcfd008628be285400cee4d869e712f5f72d67cc') as Bond
  assertBondEquals(bond, bond_STRM_WETH)
  clearStore()
})