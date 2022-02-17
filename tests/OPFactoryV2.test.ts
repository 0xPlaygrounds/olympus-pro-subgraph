import { Address, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { handleCreateBond, handleCreateBondAndTreasury } from '../src/OPFactoryV2'
import { CreateBondAndTreasuryCall, CreateBondCall } from '../generated/OlympusProFactoryV2/OlympusProFactoryV2'
import { 
  mockCustomTreasury_payoutToken, 
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

  // Mock calls
  mockLPCalls('0x2e9d63788249371f1dfc918a52f8d799f4a38c94', '', '', true)
  mockERC20_symbol('0x2e9d63788249371f1dfc918a52f8d799f4a38c94', 'TOKE')
  mockERC20_symbol('0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84', 'tALCX')

  handleCreateBondAndTreasurys([call])

  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'id', '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'createdAtTimestamp', '1')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'owner', '0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'name', 'TOKE')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'token0', '0x2e9d63788249371f1dfc918a52f8d799f4a38c94')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'token1', '0x0000000000000000000000000000000000000000')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'treasury', '0xfe349fb05ee6d5598efc7bb561f7f91934167c7c')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'principleToken', '0x2e9d63788249371f1dfc918a52f8d799f4a38c94')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'payoutToken', '0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'fees', '3.33')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'type', 'ERC20')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'userBondCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'latestUserBond', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'userBonds', '[]')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'userRedemptionCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'latestUserRedemption', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'userRedemptions', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'dailyData', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec', 'hourlyData', '[]')
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

  // Mock calls
  mockCustomTreasury_payoutToken(
    '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
    '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
    false
  )
  mockLPCalls(
    '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a',
    '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    false
  )
  mockERC20_symbol('0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8', 'STRM')
  mockERC20_symbol('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH')

  handleCreateBonds([call])

  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'id', '0xdcfd008628be285400cee4d869e712f5f72d67cc')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'createdAtTimestamp', '1')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'owner', '0x4f4f6b428af559db1dbe3cb32e1e3500deffa799')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'name', 'STRM-WETH')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'token0', '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'token1', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'treasury', '0x3791cc891382704a91c55b8e5ac2b05092f95fa2')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'principleToken', '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'payoutToken', '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'fees', '3.33')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'type', 'LP')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'userBondCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'latestUserBond', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'userBonds', '[]')
  assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'userRedemptionCount', '0')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'latestUserRedemption', 'null')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'userRedemptions', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'dailyData', '[]')
  // assert.fieldEquals(BOND_ENTITY_TYPE, '0xdcfd008628be285400cee4d869e712f5f72d67cc', 'hourlyData', '[]')
  clearStore()
})