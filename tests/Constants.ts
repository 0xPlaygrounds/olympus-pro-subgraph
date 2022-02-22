import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from '@graphprotocol/graph-ts'

import { BIGINT_ONE } from '../src/utils/Constants';
import { Bond } from '../generated/schema';
import { createBondEntity } from './Utils';


export const TIMESTAMP_20220101_000000: BigInt = BigInt.fromU64(1640995200)

// ERC20 Bond V1
export const bond_cvxmusd3CRV: Bond = createBondEntity(
  '0xa8e5fa0072d292646d49999ef0d7f9354ec8e7a5',
  TIMESTAMP_20220101_000000,
  '0x9a67f1940164d0318612b497e8e6038f902a00a4',
  'cvxmusd3CRV',
  '0xd34d466233c5195193df712936049729140dbbd7',
  '0x0000000000000000000000000000000000000000',
  '0xa1c44dd91e21685a09ea30f9a9f06b2e40b99cec',
  '0xd34d466233c5195193df712936049729140dbbd7',
  '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2',
  BigDecimal.fromString('3.33'),
  'ERC20'
)

// LP Bond V1
export const bond_FRAX_WETH: Bond = createBondEntity(
  '0xd35509ab8fc94c81fdc8c26abe4fc581741c0c8a',
  TIMESTAMP_20220101_000000,
  '0xb1748c79709f4ba2dd82834b8c82d4a505003f27',
  'FRAX-WETH',
  '0x853d955acef822db058eb8505911ed77f175b99e',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x1933fb117b9b3e385b557c53b7cf8dec6064607f',
  '0xec8c342bc3e07f05b9a782bc34e7f04fb9b44502',
  '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
  BigDecimal.fromString('3.33'),
  'LP'
)

// LP Bond V1
export const bond_PREMIA_WETH: Bond = createBondEntity(
  '0x100d4127e19396b117ff6ad47d2186f76f7fa50a',
  TIMESTAMP_20220101_000000,
  '0xc22fae86443aeed038a4ed887bba8f5035fd12f0',
  'PREMIA-WETH',
  '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xc26ed42e03b32e7b3e0bc3a5b5066f058ea94529',
  '0x93e2f3a8277e0360081547d711446e4a1f83546d',
  '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70',
  BigDecimal.fromString('3.33'),
  'LP'
)

// LP Bond V1
export const bond_vFLOAT_ETH: Bond = createBondEntity(
  '0xa5c3f7a4ffb8a88bf0450d8fb847f7c6cb59d6dc',
  TIMESTAMP_20220101_000000,
  '0x383df49ad1f0219759a46399fe33cb7a63cd051c',
  'FLOAT-WETH',
  '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x8d0aa0951854b7fd2fb0fcfad99565012f943389',
  '0xc86b1e7fa86834cac1468937cdd53ba3ccbc1153',
  '0xb05097849bca421a3f51b249ba6cca4af4b97cb9',
  BigDecimal.fromString('3.33'),
  'LP'
)

// ERC20 Bond V2
export const bond_TOKE: Bond = createBondEntity(
  '0x836f5d135d3c1d3293dcdc473f82d4c6ceb95eec',
  TIMESTAMP_20220101_000000,
  '0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9',
  'TOKE',
  '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
  '0x0000000000000000000000000000000000000000',
  '0xfe349fb05ee6d5598efc7bb561f7f91934167c7c',
  '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
  '0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84',
  BigDecimal.fromString('3.33'),
  'ERC20'
)

// ERC20 Bond V2
export const bond_RUNE: Bond = createBondEntity(
  '0x3ea7ebdcf8ce93903420e5db4036d0899564ce5e',
  TIMESTAMP_20220101_000000,
  '0xa57dc1a7ead0601e20c72cd514a8338aced80202',
  'RUNE',
  '0x3155ba85d5f96b2d030a4966af206230e46849cb',
  '0x0000000000000000000000000000000000000000',
  '0x68619d4c962d3ee76277b5bc685e161917ee7561',
  '0x3155ba85d5f96b2d030a4966af206230e46849cb',
  '0xa5f2211b9b8170f694421f2046281775e8468044',
  BigDecimal.fromString('3.33'),
  'ERC20'
)

// LP Bond V2
export const bond_STRM_WETH: Bond = createBondEntity(
  '0xdcfd008628be285400cee4d869e712f5f72d67cc',
  TIMESTAMP_20220101_000000,
  '0x4f4f6b428af559db1dbe3cb32e1e3500deffa799',
  'STRM-WETH',
  '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x3791cc891382704a91c55b8e5ac2b05092f95fa2',
  '0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a',
  '0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8',
  BigDecimal.fromString('3.33'),
  'LP'
)

// Sorbet LP Bond V2
export const bond_GEL_ETH: Bond = createBondEntity(
  '0x718b87e5485a0e9e6ea710dbfb0930902fc61f2c',
  TIMESTAMP_20220101_000000,
  '0xed5cf41b0fd6a3c564c17ee34d9d26eafc30619b',
  'GEL-WETH',
  '0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x848c22f5daf522f627ce73da896fc2ecd71342c9',
  '0xae666f497e3b03415503785df36f795e6d91d4b3',
  '0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05',
  BigDecimal.fromString('3.33'),
  'LP'
)