import { 
  CreateBondAndTreasuryCall, 
  CreateBondCall 
} from "../generated/OlympusProFactoryV1/OlympusProFactoryV1"

import { toDecimal } from "./utils/Decimals"
import { initBond } from "./utils/Bond"
import { CustomBondV1 } from "../generated/templates"

export function handleCreateBond(call: CreateBondCall): void {
  initBond(
    call.outputs._bond.toHexString(),
    call.block.timestamp,
    toDecimal(call.inputs._fees.pop(), 4),
    call.inputs._customTreasury,
    call.inputs._payoutToken,
    call.inputs._principleToken,
    call.inputs._initialOwner
  )
  
  CustomBondV1.create(call.outputs._bond)
}

export function handleCreateBondAndTreasury(call: CreateBondAndTreasuryCall): void {
  initBond(
    call.outputs._bond.toHexString(),
    call.block.timestamp,
    toDecimal(call.inputs._fees.pop(), 4),
    call.outputs._treasury,
    call.inputs._payoutToken,
    call.inputs._principleToken,
    call.inputs._initialOwner
  )

  CustomBondV1.create(call.outputs._bond)
}

