// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Bond extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("createdAtTimestamp", Value.fromBigInt(BigInt.zero()));
    this.set("owner", Value.fromBytes(Bytes.empty()));
    this.set("name", Value.fromString(""));
    this.set("token0", Value.fromBytes(Bytes.empty()));
    this.set("token1", Value.fromBytes(Bytes.empty()));
    this.set("treasury", Value.fromBytes(Bytes.empty()));
    this.set("principleToken", Value.fromBytes(Bytes.empty()));
    this.set("payoutToken", Value.fromBytes(Bytes.empty()));
    this.set("fees", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("type", Value.fromString(""));
    this.set("userBondCount", Value.fromBigInt(BigInt.zero()));
    this.set("userRedemptionCount", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Bond entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Bond entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Bond", id.toString(), this);
    }
  }

  static load(id: string): Bond | null {
    return changetype<Bond | null>(store.get("Bond", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get createdAtTimestamp(): BigInt {
    let value = this.get("createdAtTimestamp");
    return value!.toBigInt();
  }

  set createdAtTimestamp(value: BigInt) {
    this.set("createdAtTimestamp", Value.fromBigInt(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value!.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get token0(): Bytes {
    let value = this.get("token0");
    return value!.toBytes();
  }

  set token0(value: Bytes) {
    this.set("token0", Value.fromBytes(value));
  }

  get token1(): Bytes {
    let value = this.get("token1");
    return value!.toBytes();
  }

  set token1(value: Bytes) {
    this.set("token1", Value.fromBytes(value));
  }

  get treasury(): Bytes {
    let value = this.get("treasury");
    return value!.toBytes();
  }

  set treasury(value: Bytes) {
    this.set("treasury", Value.fromBytes(value));
  }

  get principleToken(): Bytes {
    let value = this.get("principleToken");
    return value!.toBytes();
  }

  set principleToken(value: Bytes) {
    this.set("principleToken", Value.fromBytes(value));
  }

  get payoutToken(): Bytes {
    let value = this.get("payoutToken");
    return value!.toBytes();
  }

  set payoutToken(value: Bytes) {
    this.set("payoutToken", Value.fromBytes(value));
  }

  get fees(): BigDecimal {
    let value = this.get("fees");
    return value!.toBigDecimal();
  }

  set fees(value: BigDecimal) {
    this.set("fees", Value.fromBigDecimal(value));
  }

  get type(): string {
    let value = this.get("type");
    return value!.toString();
  }

  set type(value: string) {
    this.set("type", Value.fromString(value));
  }

  get userBondCount(): BigInt {
    let value = this.get("userBondCount");
    return value!.toBigInt();
  }

  set userBondCount(value: BigInt) {
    this.set("userBondCount", Value.fromBigInt(value));
  }

  get latestUserBond(): string | null {
    let value = this.get("latestUserBond");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestUserBond(value: string | null) {
    if (!value) {
      this.unset("latestUserBond");
    } else {
      this.set("latestUserBond", Value.fromString(<string>value));
    }
  }

  get userBonds(): Array<string> {
    let value = this.get("userBonds");
    return value!.toStringArray();
  }

  set userBonds(value: Array<string>) {
    this.set("userBonds", Value.fromStringArray(value));
  }

  get userRedemptionCount(): BigInt {
    let value = this.get("userRedemptionCount");
    return value!.toBigInt();
  }

  set userRedemptionCount(value: BigInt) {
    this.set("userRedemptionCount", Value.fromBigInt(value));
  }

  get latestUserRedemption(): string | null {
    let value = this.get("latestUserRedemption");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestUserRedemption(value: string | null) {
    if (!value) {
      this.unset("latestUserRedemption");
    } else {
      this.set("latestUserRedemption", Value.fromString(<string>value));
    }
  }

  get userRedemptions(): Array<string> {
    let value = this.get("userRedemptions");
    return value!.toStringArray();
  }

  set userRedemptions(value: Array<string>) {
    this.set("userRedemptions", Value.fromStringArray(value));
  }

  get dailyData(): Array<string> {
    let value = this.get("dailyData");
    return value!.toStringArray();
  }

  set dailyData(value: Array<string>) {
    this.set("dailyData", Value.fromStringArray(value));
  }

  get hourlyData(): Array<string> {
    let value = this.get("hourlyData");
    return value!.toStringArray();
  }

  set hourlyData(value: Array<string>) {
    this.set("hourlyData", Value.fromStringArray(value));
  }
}

export class BondDayData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("bond", Value.fromString(""));
    this.set("userBondCount", Value.fromBigInt(BigInt.zero()));
    this.set("userRedemptionCount", Value.fromBigInt(BigInt.zero()));
    this.set("principalVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("principalVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("redemptionVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("redemptionVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceOpen", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceHigh", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceLow", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceClose", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDOpen", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDHigh", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDLow", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDClose", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save BondDayData entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BondDayData entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BondDayData", id.toString(), this);
    }
  }

  static load(id: string): BondDayData | null {
    return changetype<BondDayData | null>(store.get("BondDayData", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get bond(): string {
    let value = this.get("bond");
    return value!.toString();
  }

  set bond(value: string) {
    this.set("bond", Value.fromString(value));
  }

  get userBondCount(): BigInt {
    let value = this.get("userBondCount");
    return value!.toBigInt();
  }

  set userBondCount(value: BigInt) {
    this.set("userBondCount", Value.fromBigInt(value));
  }

  get userRedemptionCount(): BigInt {
    let value = this.get("userRedemptionCount");
    return value!.toBigInt();
  }

  set userRedemptionCount(value: BigInt) {
    this.set("userRedemptionCount", Value.fromBigInt(value));
  }

  get principalVolume(): BigDecimal {
    let value = this.get("principalVolume");
    return value!.toBigDecimal();
  }

  set principalVolume(value: BigDecimal) {
    this.set("principalVolume", Value.fromBigDecimal(value));
  }

  get principalVolumeUSD(): BigDecimal {
    let value = this.get("principalVolumeUSD");
    return value!.toBigDecimal();
  }

  set principalVolumeUSD(value: BigDecimal) {
    this.set("principalVolumeUSD", Value.fromBigDecimal(value));
  }

  get payoutVolume(): BigDecimal {
    let value = this.get("payoutVolume");
    return value!.toBigDecimal();
  }

  set payoutVolume(value: BigDecimal) {
    this.set("payoutVolume", Value.fromBigDecimal(value));
  }

  get payoutVolumeUSD(): BigDecimal {
    let value = this.get("payoutVolumeUSD");
    return value!.toBigDecimal();
  }

  set payoutVolumeUSD(value: BigDecimal) {
    this.set("payoutVolumeUSD", Value.fromBigDecimal(value));
  }

  get redemptionVolume(): BigDecimal {
    let value = this.get("redemptionVolume");
    return value!.toBigDecimal();
  }

  set redemptionVolume(value: BigDecimal) {
    this.set("redemptionVolume", Value.fromBigDecimal(value));
  }

  get redemptionVolumeUSD(): BigDecimal {
    let value = this.get("redemptionVolumeUSD");
    return value!.toBigDecimal();
  }

  set redemptionVolumeUSD(value: BigDecimal) {
    this.set("redemptionVolumeUSD", Value.fromBigDecimal(value));
  }

  get bondPriceOpen(): BigDecimal {
    let value = this.get("bondPriceOpen");
    return value!.toBigDecimal();
  }

  set bondPriceOpen(value: BigDecimal) {
    this.set("bondPriceOpen", Value.fromBigDecimal(value));
  }

  get bondPriceHigh(): BigDecimal {
    let value = this.get("bondPriceHigh");
    return value!.toBigDecimal();
  }

  set bondPriceHigh(value: BigDecimal) {
    this.set("bondPriceHigh", Value.fromBigDecimal(value));
  }

  get bondPriceLow(): BigDecimal {
    let value = this.get("bondPriceLow");
    return value!.toBigDecimal();
  }

  set bondPriceLow(value: BigDecimal) {
    this.set("bondPriceLow", Value.fromBigDecimal(value));
  }

  get bondPriceClose(): BigDecimal {
    let value = this.get("bondPriceClose");
    return value!.toBigDecimal();
  }

  set bondPriceClose(value: BigDecimal) {
    this.set("bondPriceClose", Value.fromBigDecimal(value));
  }

  get bondPriceUSDOpen(): BigDecimal {
    let value = this.get("bondPriceUSDOpen");
    return value!.toBigDecimal();
  }

  set bondPriceUSDOpen(value: BigDecimal) {
    this.set("bondPriceUSDOpen", Value.fromBigDecimal(value));
  }

  get bondPriceUSDHigh(): BigDecimal {
    let value = this.get("bondPriceUSDHigh");
    return value!.toBigDecimal();
  }

  set bondPriceUSDHigh(value: BigDecimal) {
    this.set("bondPriceUSDHigh", Value.fromBigDecimal(value));
  }

  get bondPriceUSDLow(): BigDecimal {
    let value = this.get("bondPriceUSDLow");
    return value!.toBigDecimal();
  }

  set bondPriceUSDLow(value: BigDecimal) {
    this.set("bondPriceUSDLow", Value.fromBigDecimal(value));
  }

  get bondPriceUSDClose(): BigDecimal {
    let value = this.get("bondPriceUSDClose");
    return value!.toBigDecimal();
  }

  set bondPriceUSDClose(value: BigDecimal) {
    this.set("bondPriceUSDClose", Value.fromBigDecimal(value));
  }
}

export class BondHourData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("bond", Value.fromString(""));
    this.set("userBondCount", Value.fromBigInt(BigInt.zero()));
    this.set("userRedemptionCount", Value.fromBigInt(BigInt.zero()));
    this.set("principalVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("principalVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("redemptionVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("redemptionVolumeUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceOpen", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceHigh", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceLow", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceClose", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDOpen", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDHigh", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDLow", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPriceUSDClose", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save BondHourData entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BondHourData entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BondHourData", id.toString(), this);
    }
  }

  static load(id: string): BondHourData | null {
    return changetype<BondHourData | null>(store.get("BondHourData", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get bond(): string {
    let value = this.get("bond");
    return value!.toString();
  }

  set bond(value: string) {
    this.set("bond", Value.fromString(value));
  }

  get userBondCount(): BigInt {
    let value = this.get("userBondCount");
    return value!.toBigInt();
  }

  set userBondCount(value: BigInt) {
    this.set("userBondCount", Value.fromBigInt(value));
  }

  get userRedemptionCount(): BigInt {
    let value = this.get("userRedemptionCount");
    return value!.toBigInt();
  }

  set userRedemptionCount(value: BigInt) {
    this.set("userRedemptionCount", Value.fromBigInt(value));
  }

  get principalVolume(): BigDecimal {
    let value = this.get("principalVolume");
    return value!.toBigDecimal();
  }

  set principalVolume(value: BigDecimal) {
    this.set("principalVolume", Value.fromBigDecimal(value));
  }

  get principalVolumeUSD(): BigDecimal {
    let value = this.get("principalVolumeUSD");
    return value!.toBigDecimal();
  }

  set principalVolumeUSD(value: BigDecimal) {
    this.set("principalVolumeUSD", Value.fromBigDecimal(value));
  }

  get payoutVolume(): BigDecimal {
    let value = this.get("payoutVolume");
    return value!.toBigDecimal();
  }

  set payoutVolume(value: BigDecimal) {
    this.set("payoutVolume", Value.fromBigDecimal(value));
  }

  get payoutVolumeUSD(): BigDecimal {
    let value = this.get("payoutVolumeUSD");
    return value!.toBigDecimal();
  }

  set payoutVolumeUSD(value: BigDecimal) {
    this.set("payoutVolumeUSD", Value.fromBigDecimal(value));
  }

  get redemptionVolume(): BigDecimal {
    let value = this.get("redemptionVolume");
    return value!.toBigDecimal();
  }

  set redemptionVolume(value: BigDecimal) {
    this.set("redemptionVolume", Value.fromBigDecimal(value));
  }

  get redemptionVolumeUSD(): BigDecimal {
    let value = this.get("redemptionVolumeUSD");
    return value!.toBigDecimal();
  }

  set redemptionVolumeUSD(value: BigDecimal) {
    this.set("redemptionVolumeUSD", Value.fromBigDecimal(value));
  }

  get bondPriceOpen(): BigDecimal {
    let value = this.get("bondPriceOpen");
    return value!.toBigDecimal();
  }

  set bondPriceOpen(value: BigDecimal) {
    this.set("bondPriceOpen", Value.fromBigDecimal(value));
  }

  get bondPriceHigh(): BigDecimal {
    let value = this.get("bondPriceHigh");
    return value!.toBigDecimal();
  }

  set bondPriceHigh(value: BigDecimal) {
    this.set("bondPriceHigh", Value.fromBigDecimal(value));
  }

  get bondPriceLow(): BigDecimal {
    let value = this.get("bondPriceLow");
    return value!.toBigDecimal();
  }

  set bondPriceLow(value: BigDecimal) {
    this.set("bondPriceLow", Value.fromBigDecimal(value));
  }

  get bondPriceClose(): BigDecimal {
    let value = this.get("bondPriceClose");
    return value!.toBigDecimal();
  }

  set bondPriceClose(value: BigDecimal) {
    this.set("bondPriceClose", Value.fromBigDecimal(value));
  }

  get bondPriceUSDOpen(): BigDecimal {
    let value = this.get("bondPriceUSDOpen");
    return value!.toBigDecimal();
  }

  set bondPriceUSDOpen(value: BigDecimal) {
    this.set("bondPriceUSDOpen", Value.fromBigDecimal(value));
  }

  get bondPriceUSDHigh(): BigDecimal {
    let value = this.get("bondPriceUSDHigh");
    return value!.toBigDecimal();
  }

  set bondPriceUSDHigh(value: BigDecimal) {
    this.set("bondPriceUSDHigh", Value.fromBigDecimal(value));
  }

  get bondPriceUSDLow(): BigDecimal {
    let value = this.get("bondPriceUSDLow");
    return value!.toBigDecimal();
  }

  set bondPriceUSDLow(value: BigDecimal) {
    this.set("bondPriceUSDLow", Value.fromBigDecimal(value));
  }

  get bondPriceUSDClose(): BigDecimal {
    let value = this.get("bondPriceUSDClose");
    return value!.toBigDecimal();
  }

  set bondPriceUSDClose(value: BigDecimal) {
    this.set("bondPriceUSDClose", Value.fromBigDecimal(value));
  }
}

export class UserBond extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("bond", Value.fromString(""));
    this.set("user", Value.fromBytes(Bytes.empty()));
    this.set("deposit", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("depositUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payout", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("expires", Value.fromBigInt(BigInt.zero()));
    this.set("discount", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserBond entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save UserBond entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("UserBond", id.toString(), this);
    }
  }

  static load(id: string): UserBond | null {
    return changetype<UserBond | null>(store.get("UserBond", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get bond(): string {
    let value = this.get("bond");
    return value!.toString();
  }

  set bond(value: string) {
    this.set("bond", Value.fromString(value));
  }

  get user(): Bytes {
    let value = this.get("user");
    return value!.toBytes();
  }

  set user(value: Bytes) {
    this.set("user", Value.fromBytes(value));
  }

  get deposit(): BigDecimal {
    let value = this.get("deposit");
    return value!.toBigDecimal();
  }

  set deposit(value: BigDecimal) {
    this.set("deposit", Value.fromBigDecimal(value));
  }

  get depositUSD(): BigDecimal {
    let value = this.get("depositUSD");
    return value!.toBigDecimal();
  }

  set depositUSD(value: BigDecimal) {
    this.set("depositUSD", Value.fromBigDecimal(value));
  }

  get payout(): BigDecimal {
    let value = this.get("payout");
    return value!.toBigDecimal();
  }

  set payout(value: BigDecimal) {
    this.set("payout", Value.fromBigDecimal(value));
  }

  get payoutUSD(): BigDecimal {
    let value = this.get("payoutUSD");
    return value!.toBigDecimal();
  }

  set payoutUSD(value: BigDecimal) {
    this.set("payoutUSD", Value.fromBigDecimal(value));
  }

  get expires(): BigInt {
    let value = this.get("expires");
    return value!.toBigInt();
  }

  set expires(value: BigInt) {
    this.set("expires", Value.fromBigInt(value));
  }

  get discount(): BigDecimal {
    let value = this.get("discount");
    return value!.toBigDecimal();
  }

  set discount(value: BigDecimal) {
    this.set("discount", Value.fromBigDecimal(value));
  }
}

export class UserRedemption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("bond", Value.fromString(""));
    this.set("user", Value.fromBytes(Bytes.empty()));
    this.set("recipient", Value.fromBytes(Bytes.empty()));
    this.set("payout", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutUSD", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("remaining", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("remainingUSD", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserRedemption entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save UserRedemption entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("UserRedemption", id.toString(), this);
    }
  }

  static load(id: string): UserRedemption | null {
    return changetype<UserRedemption | null>(store.get("UserRedemption", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get bond(): string {
    let value = this.get("bond");
    return value!.toString();
  }

  set bond(value: string) {
    this.set("bond", Value.fromString(value));
  }

  get user(): Bytes {
    let value = this.get("user");
    return value!.toBytes();
  }

  set user(value: Bytes) {
    this.set("user", Value.fromBytes(value));
  }

  get recipient(): Bytes {
    let value = this.get("recipient");
    return value!.toBytes();
  }

  set recipient(value: Bytes) {
    this.set("recipient", Value.fromBytes(value));
  }

  get payout(): BigDecimal {
    let value = this.get("payout");
    return value!.toBigDecimal();
  }

  set payout(value: BigDecimal) {
    this.set("payout", Value.fromBigDecimal(value));
  }

  get payoutUSD(): BigDecimal {
    let value = this.get("payoutUSD");
    return value!.toBigDecimal();
  }

  set payoutUSD(value: BigDecimal) {
    this.set("payoutUSD", Value.fromBigDecimal(value));
  }

  get remaining(): BigDecimal {
    let value = this.get("remaining");
    return value!.toBigDecimal();
  }

  set remaining(value: BigDecimal) {
    this.set("remaining", Value.fromBigDecimal(value));
  }

  get remainingUSD(): BigDecimal {
    let value = this.get("remainingUSD");
    return value!.toBigDecimal();
  }

  set remainingUSD(value: BigDecimal) {
    this.set("remainingUSD", Value.fromBigDecimal(value));
  }
}
