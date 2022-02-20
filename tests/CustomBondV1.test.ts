import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall } from 'matchstick-as/assembly/index'

import { handleCreateBond, handleCreateBondAndTreasury } from '../src/OPFactoryV1'
import { 
  bond_cvxmusd3CRV,
  mockERC20_symbol, 
  mockLPCalls 
} from './Utils'
import { 
  BondCreated, 
  BondRedeemed 
} from '../generated/templates/CustomBondV1/CustomBondV1'
import { Bond } from '../generated/schema'
import { BIGINT_ONE } from '../src/utils/Constants'
import { handleBondCreated } from '../src/CustomBondV1'

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
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('deposit', ethereum.Value.fromSignedBigInt(deposit)))
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('payout', ethereum.Value.fromSignedBigInt(payout)))
  newBondCreatedEvent.parameters.push(new ethereum.EventParam('expires', ethereum.Value.fromSignedBigInt(expires)))

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
// test('Test BondCreated handler with ERC20 bond, no BondDayData, no BondHourData', () => {
//   // Initialize
//   let bond = bond_cvxmusd3CRV
//   bond.save()

//   let event = createBondCreatedEvent(
//     bond.id,
//     '0xe5dbff893e6120c0d013fb046cd755990e4be9a9',
//     BigInt.fromI64(5500000000000000000000),
//     BigInt.fromI64(8793006394434123940427),
//     BigInt.fromI64(13989758)
//   )

//   handleBondCreated(event)

  

//   clearStore()
// })
