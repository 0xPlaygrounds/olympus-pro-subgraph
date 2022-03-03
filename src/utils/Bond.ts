import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"

import { ERC20 } from "../../generated/OlympusProFactoryV1/ERC20"
import { UniswapV2Pair } from "../../generated/OlympusProFactoryV1/UniswapV2Pair"
import { Bond, UserBond, UserRedemption } from "../../generated/schema"
import { CustomBondV1, CustomBondV2 } from "../../generated/templates"
import { BIGINT_ONE, ZERO_ADDRESS } from "./Constants"

export function initBond(
  id: string,
  timestamp: BigInt,
  fees: BigDecimal,
  treasury: Address,
  payoutToken: Address,
  principalToken: Address,
  owner: Address
): void {
  let bond = new Bond(id)
  bond.createdAtTimestamp = timestamp
  bond.fees = fees
  bond.treasury = treasury
  bond.payoutToken = payoutToken
  bond.principalToken = principalToken
  bond.owner = owner

  log.debug("Detected bond {} with principle token {}", [id, principalToken.toHexString()])

  let pair = UniswapV2Pair.bind(principalToken)
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

  let erc20 = ERC20.bind(principalToken)
  let tryERC20 = erc20.try_symbol().reverted
  if (tryERC20 == false) {
    bond.token0 = principalToken
    bond.token1 = null

    let token0erc20 = ERC20.bind(principalToken)
    bond.name = token0erc20.symbol()
    bond.type = "ERC20"
    bond.save()

    return
  }

  log.error("Error bond {} principle token {}", [id, principalToken.toHexString()])
}

export function updateBondOnPurchase(
  bond: Bond,
  latestUserBond: UserBond
): void {
  // Update bond info
  bond.latestUserBond = latestUserBond.id
  bond.userBondCount = bond.userBondCount.plus(BIGINT_ONE)
  bond.save()
}

export function updateBondOnRedemption(
  bond: Bond,
  latestUserRedemption: UserRedemption
): void {
  // Update bond info
  bond.latestUserRedemption = latestUserRedemption.id
  bond.userRedemptionCount = bond.userRedemptionCount.plus(BIGINT_ONE)
  bond.save()
}