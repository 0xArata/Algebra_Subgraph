import { test, assert, newMockEvent, log, logStore } from 'matchstick-as'
import { distributeFeesToLPs } from '../src/utils/fees'
import { Pool, PoolFeeAccruedHourData, PoolPositionIndex, Position, UserFeeHourData } from '../src/types/schema'
import { Address, BigDecimal, Bytes, ethereum, Value } from '@graphprotocol/graph-ts'
import { Swap } from '../src/types/templates/Pool/Pool'
import { BigInt } from '@graphprotocol/graph-ts'
import { Token } from '../src/types/schema'
import { Tick } from '../src/types/schema'
import { Transaction } from '../src/types/schema'

export function createSwapEvent(
    sender: Address,
    recipient: Address,
    amount0: BigInt,
    amount1: BigInt,
    sqrtPriceX96: BigInt,
    liquidity: BigInt,
    tick: BigInt,
) : Swap {
    const mockEvent = newMockEvent()
    log.info("mockEvent.block: {}", [mockEvent.block.author.toHexString()])
    log.info("mockEvent.block.timestamp: {}", [mockEvent.block.timestamp.toString()])
    const swapEvent = new Swap(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt,
    )
    mockEvent.block.timestamp = BigInt.fromI64(1752571650)
    log.info("mockEvent.block.timestamp: {}", [mockEvent.block.timestamp.toString()])
    swapEvent.parameters = [
        new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)),
        new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient)),
        new ethereum.EventParam("amount0", ethereum.Value.fromSignedBigInt(amount0)),
        new ethereum.EventParam("amount1", ethereum.Value.fromSignedBigInt(amount1)),
        new ethereum.EventParam("sqrtPriceX96", ethereum.Value.fromSignedBigInt(sqrtPriceX96)),
        new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(liquidity)),
        new ethereum.EventParam("tick", ethereum.Value.fromUnsignedBigInt(tick)),
    ]
    return swapEvent
}

function createMockToken0(): Token {
  const token0 = new Token("0x1111111111111111111111111111111111111111")
  token0.symbol = "TK0"
  token0.name = "Token0"
  token0.decimals = BigInt.fromI32(18)
  token0.totalSupply = BigInt.fromI32(1000000)
  token0.volume = BigDecimal.fromString("0")
  token0.volumeUSD = BigDecimal.fromString("0")
  token0.untrackedVolumeUSD = BigDecimal.fromString("0")
  token0.feesUSD = BigDecimal.fromString("0")
  token0.txCount = BigInt.fromI32(0)
  token0.poolCount = BigInt.fromI32(0)
  token0.totalValueLocked = BigDecimal.fromString("0")
  token0.totalValueLockedUSD = BigDecimal.fromString("0")
  token0.totalValueLockedUSDUntracked = BigDecimal.fromString("0")
  token0.derivedMatic = BigDecimal.fromString("0")
  token0.whitelistPools = []
  token0.save()
  return token0;
}

function createMockToken1(): Token {
  const token1 = new Token("0x2222222222222222222222222222222222222222")
  token1.symbol = "TK1"
  token1.name = "Token1"
  token1.decimals = BigInt.fromI32(18)
  token1.totalSupply = BigInt.fromI32(1000000)
  token1.volume = BigDecimal.fromString("0")
  token1.volumeUSD = BigDecimal.fromString("0")
  token1.untrackedVolumeUSD = BigDecimal.fromString("0")
  token1.feesUSD = BigDecimal.fromString("0")
  token1.txCount = BigInt.fromI32(0)
  token1.poolCount = BigInt.fromI32(0)
  token1.totalValueLocked = BigDecimal.fromString("0")
  token1.totalValueLockedUSD = BigDecimal.fromString("0")
  token1.totalValueLockedUSDUntracked = BigDecimal.fromString("0")
  token1.derivedMatic = BigDecimal.fromString("0")
  token1.whitelistPools = []
  token1.save()
  return token1;
}

function createMockPool(token0: Token, token1: Token): Pool {
  const pool = new Pool("1")
  pool.createdAtTimestamp = BigInt.fromI64(1715702400)
  pool.createdAtBlockNumber = BigInt.fromI64(1000000000000000000)
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.deployer = Bytes.fromHexString("0x1111111111111111111111111111111111111112")
  pool.plugin = Bytes.fromHexString("0x1111111111111111111111111111111111111113")
  pool.pluginConfig = 0
  pool.tickSpacing = BigInt.fromI32(1)
  pool.fee = BigInt.fromI64(10000)
  pool.communityFee = BigInt.fromI64(10000)
  pool.liquidity = BigInt.fromString("2000000000000000000")
  pool.sqrtPrice = BigInt.fromString("79228162514264337593543950336")
  pool.feeGrowthGlobal0X128 = BigInt.fromString("1000000000000000000000000000000000000000")
  pool.feeGrowthGlobal1X128 = BigInt.fromString("1000000000000000000000000000000000000000")
  pool.token0Price = BigDecimal.fromString("1.0")
  pool.token1Price = BigDecimal.fromString("1.0")
  pool.tick = BigInt.fromI64(0)
  pool.observationIndex = BigInt.fromI64(0)
  pool.volumeToken0 = BigDecimal.fromString("1000000000000000000000000")
  pool.volumeToken1 = BigDecimal.fromString("1000000000000000000000000")
  pool.volumeUSD = BigDecimal.fromString("1000000000000000000000000")
  pool.untrackedVolumeUSD = BigDecimal.fromString("1000000000000000000000000")
  pool.feesUSD = BigDecimal.fromString("10.0")
  pool.feesToken0 = BigDecimal.fromString("1.0")
  pool.feesToken1 = BigDecimal.fromString("0.99")
  pool.untrackedFeesUSD = BigDecimal.fromString("10.0")
  pool.txCount = BigInt.fromI64(0)
  pool.collectedFeesToken0 = BigDecimal.fromString("1.0")
  pool.collectedFeesToken1 = BigDecimal.fromString("0.99")
  pool.collectedFeesUSD = BigDecimal.fromString("10.0")
  pool.totalValueLockedMatic = BigDecimal.fromString("1000000000000000000000000")
  pool.totalValueLockedUSD = BigDecimal.fromString("1000000000000000000000000")
  pool.totalValueLockedToken0 = BigDecimal.fromString("1000000000000000000000000")
  pool.totalValueLockedToken1 = BigDecimal.fromString("1000000000000000000000000")
  pool.totalValueLockedUSDUntracked = BigDecimal.fromString("1000000000000000000000000")
  pool.liquidityProviderCount = BigInt.fromI64(0)
  pool.save()
  return pool;
}

function createMockTick(id: string, pool: Pool, tickIdx: number): Tick {
  const tick = new Tick(id)
  tick.poolAddress = pool.id
  tick.tickIdx = BigInt.fromI64(tickIdx as i64)
  tick.pool = pool.id
  tick.liquidityGross = BigInt.fromI32(0)
  tick.liquidityNet = BigInt.fromI32(0)
  tick.price0 = BigDecimal.fromString("0")
  tick.price1 = BigDecimal.fromString("0")
  tick.volumeToken0 = BigDecimal.fromString("0")
  tick.volumeToken1 = BigDecimal.fromString("0")
  tick.volumeUSD = BigDecimal.fromString("0")
  tick.untrackedVolumeUSD = BigDecimal.fromString("0")
  tick.feesUSD = BigDecimal.fromString("0")
  tick.collectedFeesToken0 = BigDecimal.fromString("0")
  tick.collectedFeesToken1 = BigDecimal.fromString("0")
  tick.collectedFeesUSD = BigDecimal.fromString("0")
  tick.createdAtTimestamp = BigInt.fromI64(1715702400)
  tick.createdAtBlockNumber = BigInt.fromI64(1000000000000000000)
  tick.liquidityProviderCount = BigInt.fromI32(0)
  tick.feeGrowthOutside0X128 = BigInt.fromI32(0)
  tick.feeGrowthOutside1X128 = BigInt.fromI32(0)
  tick.save()
  return tick;
}

function createMockTransaction(): Transaction {
  const transaction = new Transaction("test-tx")
  transaction.blockNumber = BigInt.fromI32(1)
  transaction.timestamp = BigInt.fromI32(1)
  transaction.gasLimit = BigInt.fromI32(1)
  transaction.gasPrice = BigInt.fromI32(1)
  transaction.save()
  return transaction;
}

test("distributeFeesToLPs distributes fees correctly same liquidity share", () => {
  const token0 = createMockToken0();
  const token1 = createMockToken1();
  const pool = createMockPool(token0, token1);
  const tickLower = createMockTick("1#-100", pool, -100);
  const tickUpper = createMockTick("1#100", pool, 100);
  const transaction = createMockTransaction();
  const user1 = Address.fromString("0x1111111111111111111111111111111111111111")
  const user2 = Address.fromString("0x1111111111111111111111111111111111111112")
  // Arrange: create mock Pool, Positions, and event
    // Act: call distributeFeesToLPs
    // Assert: check that the correct entities were updated
    // 1. Create a pool with 2000000000000000000 liquidity
    // 2. Create 2 positions with 1000000000000000000 liquidity each
    // 3. Create a swap event with 10.0 USD fees, 1.0 token0 in fees, and 0.99 token1 in fees
    // 4. Call distributeFeesToLPs
    // 5. Check that the correct entities were updated
    // 6. Check that the fees were distributed correctly
    // 7. Check that the user fee hour data was created correctly
    // 1. Create a pool with 2000000000000000000 liquidity
    const position1 = new Position("1")
    position1.owner = user1
    position1.pool = pool.id
    position1.token0 = token0.id
    position1.token1 = token1.id
    position1.tickLower = tickLower.id
    position1.tickUpper = tickUpper.id
    position1.liquidity = BigInt.fromString("1000000000000000000")
    position1.depositedToken0 = BigDecimal.fromString("0.0")
    position1.depositedToken1 = BigDecimal.fromString("0.0")
    position1.withdrawnToken0 = BigDecimal.fromString("0.0")
    position1.withdrawnToken1 = BigDecimal.fromString("0.0")
    position1.collectedToken0 = BigDecimal.fromString("0.0")
    position1.collectedToken1 = BigDecimal.fromString("0.0")
    position1.collectedFeesToken0 = BigDecimal.fromString("0.0")
    position1.collectedFeesToken1 = BigDecimal.fromString("0.0")
    position1.transaction = transaction.id
    position1.feeGrowthInside0LastX128 = BigInt.fromI32(0)
    position1.feeGrowthInside1LastX128 = BigInt.fromI32(0)
    position1.save()

    const position2 = new Position("2")
    position2.owner = user2
    position2.pool = pool.id
    position2.token0 = token0.id
    position2.token1 = token1.id
    position2.tickLower = tickLower.id
    position2.tickUpper = tickUpper.id
    position2.liquidity = BigInt.fromString("1000000000000000000")
    position2.depositedToken0 = BigDecimal.fromString("0.0")
    position2.depositedToken1 = BigDecimal.fromString("0.0")
    position2.withdrawnToken0 = BigDecimal.fromString("0.0")
    position2.withdrawnToken1 = BigDecimal.fromString("0.0")
    position2.collectedToken0 = BigDecimal.fromString("0.0")
    position2.collectedToken1 = BigDecimal.fromString("0.0")
    position2.collectedFeesToken0 = BigDecimal.fromString("0.0")
    position2.collectedFeesToken1 = BigDecimal.fromString("0.0")
    position2.transaction = transaction.id
    position2.feeGrowthInside0LastX128 = BigInt.fromI32(0)
    position2.feeGrowthInside1LastX128 = BigInt.fromI32(0)
    position2.save()

    const event = createSwapEvent(
        Address.fromString("0x1111111111111111111111111111111111111111"), // sender
        Address.fromString("0x2222222222222222222222222222222222222222"), // recipient
        BigInt.fromI64(-1000000000000000000), // amount0: -1 token0 (sent in)
        BigInt.fromI64(990000000000000000),   // amount1: +0.99 token1 (received)
        BigInt.fromString("79228162514264337593543950336"), // sqrtPriceX96: price = 1.0
        BigInt.fromString("1000000000000000000000000"),     // liquidity: 1,000,000 tokens
        BigInt.fromI32(0) // tick: 0 (price = 1)
    )

    const poolPositionIndex = new PoolPositionIndex(pool.id)
    poolPositionIndex.positionIds = ["1", "2"]
    poolPositionIndex.pool = pool.id
    poolPositionIndex.save()

    assert.entityCount("PoolPositionIndex", 1)
    assert.stringEquals(poolPositionIndex.positionIds[0], "1")
    assert.stringEquals(poolPositionIndex.positionIds[1], "2")

    const totalFeesUSD = BigDecimal.fromString("10.0")         // $10 in fees
    const totalFeesToken0 = BigDecimal.fromString("1.0")       // 1 token0 in fees
    const totalFeesToken1 = BigDecimal.fromString("0.99")      // 0.99 token1 in fees

    distributeFeesToLPs(
        pool,
        totalFeesUSD,
        totalFeesToken0,
        totalFeesToken1,
        event
    )

    const hour = event.block.timestamp.toI32() / 3600
    log.info("event.block.timestamp: {}", [event.block.timestamp.toString()])
    log.info("hour: {}", [hour.toString()])
    const hourStartUnix = hour * 3600
    log.info("hourStartUnix: {}", [hourStartUnix.toString()])
    const userFeeHourDataID1 = user1.toHexString().concat('-').concat(hourStartUnix.toString())
    const userFeeHourDataID2 = user2.toHexString().concat('-').concat(hourStartUnix.toString())
    const userFeeHourData1 = UserFeeHourData.load(userFeeHourDataID1)
    const userFeeHourData2 = UserFeeHourData.load(userFeeHourDataID2)
    logStore() 
    const poolFeeAccruedHourDataID = pool.id.toString().concat('-').concat(hourStartUnix.toString())
    const poolFeeAccruedHourData = PoolFeeAccruedHourData.load(poolFeeAccruedHourDataID)
    assert.entityCount("PoolFeeAccruedHourData", 1)
    log.info("poolFeeAccruedHourDataID: {}", [poolFeeAccruedHourDataID])
    log.info("poolFeeAccruedHourData: {}", [poolFeeAccruedHourData!.id])
    assert.assertNotNull(poolFeeAccruedHourData)
    assert.stringEquals(poolFeeAccruedHourData!.feesUSD.toString(), "10")
    assert.stringEquals(poolFeeAccruedHourData!.feesToken0.toString(), "1")
    assert.stringEquals(poolFeeAccruedHourData!.feesToken1.toString(), "0.99")
    assert.entityCount("UserFeeHourData", 2)

    assert.assertNotNull(userFeeHourData1)
    assert.stringEquals(userFeeHourData1!.feesUSD.toString(), "5")
    
    assert.assertNotNull(userFeeHourData2)
    assert.stringEquals(userFeeHourData2!.feesUSD.toString(), "5")

  })