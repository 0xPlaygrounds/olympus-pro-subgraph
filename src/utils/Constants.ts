import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"

export const BIGINT_ZERO = BigInt.fromI32(0)
export const BIGINT_ONE = BigInt.fromI32(1)
export const BIGDECIMAL_ZERO = BigDecimal.fromString('0')
export const BIGDECIMAL_ONE = BigDecimal.fromString('1')

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// WETH
export const NATIVE_TOKEN_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
export const NATIVE_TOKEN_DECIMALS = 18

// USDT
export const STABLE_TOKEN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7"
export const STABLE_TOKEN_DECIMALS = 6

export const ROUTERS : string[] = '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f'.split(",")
//0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f sushi
//0x7a250d5630b4cf539739df2c5dacb4c659f2488d uni