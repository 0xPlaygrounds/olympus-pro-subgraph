import { 
  CreateBondAndTreasuryCall, 
  CreateBondCall 
} from "../generated/OlympusProFactoryV2/OlympusProFactoryV2"
import { CustomTreasuryV2 } from "../generated/OlympusProFactoryV2/CustomTreasuryV2"

import { toDecimal } from "./utils/Decimals"
import { initBond } from "./utils/Bond"
import { CustomBondV2 } from "../generated/templates"

export function handleCreateBond(call: CreateBondCall): void {
  let customTreasury = CustomTreasuryV2.bind(call.inputs._customTreasury)

  initBond(
    call.outputs._bond.toHexString(),
    call.block.timestamp,
    toDecimal(call.inputs._fees.pop(), 4),
    call.inputs._customTreasury,
    customTreasury.payoutToken(),
    call.inputs._principalToken,
    call.inputs._initialOwner,
  )

  CustomBondV2.create(call.outputs._bond)
}

export function handleCreateBondAndTreasury(call: CreateBondAndTreasuryCall): void {
  initBond(
    call.outputs._bond.toHexString(),
    call.block.timestamp,
    toDecimal(call.inputs._fees.pop(), 4),
    call.outputs._treasury,
    call.inputs._payoutToken,
    call.inputs._principalToken,
    call.inputs._initialOwner,
  )

  CustomBondV2.create(call.outputs._bond)
}