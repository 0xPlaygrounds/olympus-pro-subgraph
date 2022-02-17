import { Address, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'
import { createMockedFunction } from "matchstick-as";

// ================================================================
// LP mock call helpers
// ================================================================
export function mockLP_token0(lp: string, token0: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token0))])
  }
}

export function mockLP_token1(lp: string, token1: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(lp), 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(Address.fromString(token1))])
  }
}

export function mockLPCalls(lp: string, token0: string, token1: string, revert: boolean): void {
  mockLP_token0(lp, token0, revert)
  mockLP_token1(lp, token1, revert)
}

// ================================================================
// ERC20 mock call helpers
// ================================================================
export function mockERC20_symbol(erc20: string, symbol: string): void {
  createMockedFunction(Address.fromString(erc20), 'symbol', 'symbol():(string)')
    .withArgs([])
    .returns([ethereum.Value.fromString(symbol)])
}

export function mockERC20_name(erc20: string, name: string): void {
  createMockedFunction(Address.fromString(erc20), 'name', 'name():(string)')
    .withArgs([])
    .returns([ethereum.Value.fromString(name)])
}

export function mockERC20_decimals(erc20: string, decimals: i32): void {
  createMockedFunction(Address.fromString(erc20), 'decimals', 'decimals():(uint8)')
    .withArgs([])
    .returns([ethereum.Value.fromI32(decimals)])
}

export function mockERC20Calls(
  erc20: string,
  symbol: string,
  name: string,
  decimals: i32
): void {
  mockERC20_symbol(erc20, symbol)
  mockERC20_name(erc20, name)
  mockERC20_decimals(erc20, decimals)
}

// ================================================================
// ERC20 mock call helpers
// ================================================================
export function mockCustomTreasury_payoutToken(contract: string, payoutToken: string, revert: boolean): void {
  if (revert) {
    createMockedFunction(Address.fromString(contract), 'payoutToken', 'payoutToken():(address)')
      .reverts()
  } else {
    createMockedFunction(Address.fromString(contract), 'payoutToken', 'payoutToken():(address)')
      .withArgs([])
      .returns([ethereum.Value.fromAddress(Address.fromString(payoutToken))])
  }
}