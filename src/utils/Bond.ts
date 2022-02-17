import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"

import { ERC20 } from "../../generated/OlympusProFactoryV1/ERC20"
import { UniswapV2Pair } from "../../generated/OlympusProFactoryV1/UniswapV2Pair"
import { Bond } from "../../generated/schema"
import { CustomBondV1, CustomBondV2 } from "../../generated/templates"
import { ZERO_ADDRESS } from "./Constants"

export function initBond(
  id: string,
  timestamp: BigInt,
  fees: BigDecimal,
  treasury: Address,
  payoutToken: Address,
  principleToken: Address,
  owner: Address
): void {
  let bond = new Bond(id)
  bond.createdAtTimestamp = timestamp
  bond.fees = fees
  bond.treasury = treasury
  bond.payoutToken = payoutToken
  bond.principleToken = principleToken
  bond.owner = owner

  log.debug("Detected bond {} with principle token {}", [id, principleToken.toHexString()])

  let pair = UniswapV2Pair.bind(principleToken)
  let tryPairError = pair.try_token0().reverted || pair.try_token1().reverted
  if (tryPairError == false) {
    bond.token0 = pair.token0()
    bond.token1 = pair.token1()

    let token0erc20 = ERC20.bind(pair.token0())
    let token1erc20 = ERC20.bind(pair.token1())
    bond.name = token0erc20.symbol() + "-" + token1erc20.symbol()
    bond.type = "LP"
    bond.save()

    return
  }

  let erc20 = ERC20.bind(principleToken)
  let tryERC20 = erc20.try_symbol().reverted
  if (tryERC20 == false) {
    bond.token0 = principleToken
    bond.token1 = Address.fromString(ZERO_ADDRESS)

    let token0erc20 = ERC20.bind(principleToken)
    bond.name = token0erc20.symbol()
    bond.type = "ERC20"
    bond.save()

    return
  }

  log.error("Error bond {} principle token {}", [id, principleToken.toHexString()])
}